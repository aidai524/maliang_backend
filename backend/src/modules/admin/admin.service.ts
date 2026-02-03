import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Order } from '../orders/entities/order.entity';
import { VipLevel } from '../users/entities/user.entity';
import { UpdateUserVipDto, UpdateUserDto } from './dto/admin.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  // 获取用户列表（分页）
  async listUsers(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ users: User[]; total: number }> {
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (search) {
      queryBuilder.where(
        'user.nickName LIKE :search OR user.openid LIKE :search',
        { search: `%${search}%` },
      );
    }

    const [users, total] = await queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { users, total };
  }

  // 获取用户详情
  async getUserById(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    return user;
  }

  // 更新用户信息
  async updateUser(userId: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.getUserById(userId);

    if (dto.nickName !== undefined) user.nickName = dto.nickName;
    if (dto.avatarUrl !== undefined) user.avatarUrl = dto.avatarUrl;
    if (dto.pointsBalance !== undefined) user.pointsBalance = dto.pointsBalance;

    const saved = await this.userRepository.save(user);
    this.logger.log(`Admin updated user ${userId}`);

    return saved;
  }

  // 删除用户
  async deleteUser(userId: number): Promise<void> {
    const user = await this.getUserById(userId);
    await this.userRepository.remove(user);
    this.logger.log(`Admin deleted user ${userId}`);
  }

  // 设置用户 VIP
  async setUserVip(userId: number, dto: UpdateUserVipDto): Promise<User> {
    const user = await this.getUserById(userId);

    user.vipLevel = dto.vipLevel as VipLevel;

    // 计算到期时间
    if (dto.vipExpireAt) {
      user.vipExpireAt = new Date(dto.vipExpireAt);
    } else if (dto.days) {
      const now = new Date();
      // 如果当前有 VIP 且未过期，则在现有基础上延长
      const baseDate = user.vipExpireAt && user.vipExpireAt > now 
        ? user.vipExpireAt 
        : now;
      user.vipExpireAt = new Date(baseDate.getTime() + dto.days * 24 * 60 * 60 * 1000);
    }

    const saved = await this.userRepository.save(user);
    this.logger.log(`Admin set VIP for user ${userId}: level=${dto.vipLevel}, expires=${user.vipExpireAt}`);

    return saved;
  }

  // 取消用户 VIP
  async cancelUserVip(userId: number): Promise<User> {
    const user = await this.getUserById(userId);

    user.vipLevel = VipLevel.NORMAL;
    user.vipExpireAt = null;

    const saved = await this.userRepository.save(user);
    this.logger.log(`Admin cancelled VIP for user ${userId}`);

    return saved;
  }

  // 获取管理后台统计数据
  async getDashboardStats(): Promise<any> {
    const totalUsers = await this.userRepository.count();
    
    const vipUsers = await this.userRepository.count({
      where: [
        { vipLevel: VipLevel.VIP },
        { vipLevel: VipLevel.SVIP },
      ],
    });

    const totalOrders = await this.orderRepository.count();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayUsers = await this.userRepository
      .createQueryBuilder('user')
      .where('user.createdAt >= :todayStart', { todayStart })
      .getCount();

    return {
      totalUsers,
      vipUsers,
      freeUsers: totalUsers - vipUsers,
      totalOrders,
      todayNewUsers: todayUsers,
    };
  }
}
