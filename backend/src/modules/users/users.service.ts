import { Injectable, NotFoundException, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from '../../common/providers/redis.service';
import { User, VipLevel } from './entities/user.entity';
import { GenerationsService } from '../generations/generations.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly cachePrefix = 'user';
  private readonly cacheTTL = 3600;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly redisService: RedisService,
    @Inject(forwardRef(() => GenerationsService))
    private readonly generationsService: GenerationsService,
  ) {}

  async findById(id: number): Promise<User> {
    const cacheKey = `${this.cachePrefix}:${id}`;
    const cached = await this.redisService.getJson<User>(cacheKey);

    if (cached) {
      return cached;
    }

    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.redisService.setexJson(cacheKey, this.cacheTTL, user);

    return user;
  }

  async findByOpenid(openid: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { openid } });
  }

  async create(openid: string, nickName?: string, avatarUrl?: string): Promise<User> {
    const user = this.userRepository.create({
      openid,
      nickName,
      avatarUrl,
      vipLevel: VipLevel.NORMAL,
      pointsBalance: 0,
    });

    return await this.userRepository.save(user);
  }

  async updateVipLevel(userId: number, vipLevel: VipLevel, expireAt?: Date): Promise<User> {
    const user = await this.findById(userId);

    user.vipLevel = vipLevel;
    user.vipExpireAt = expireAt;

    await this.userRepository.save(user);
    await this.invalidateUserCache(userId);

    this.logger.log(`Updated VIP level for user ${userId} to ${vipLevel}`);

    return user;
  }

  async updateUser(userId: number, updates: Partial<User>): Promise<User> {
    const user = await this.findById(userId);

    Object.assign(user, updates);

    await this.userRepository.save(user);
    await this.invalidateUserCache(userId);

    return user;
  }

  async getUserStats(userId: number): Promise<any> {
    // 获取用户基本信息
    const user = await this.findById(userId);

    // 获取订单和收藏统计
    const basicStats = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.orders', 'orders')
      .leftJoin('user.favorites', 'favorites')
      .select([
        'user.id',
        'COUNT(DISTINCT orders.id) as "totalOrders"',
        'COUNT(DISTINCT favorites.id) as "totalFavorites"',
      ])
      .where('user.id = :userId', { userId })
      .groupBy('user.id')
      .getRawOne();

    // 获取生成统计
    const generationStats = await this.generationsService.getUserGenerationStats(
      userId,
      user.vipLevel,
    );

    return {
      totalFavorites: parseInt(basicStats?.totalFavorites || '0', 10),
      totalOrders: parseInt(basicStats?.totalOrders || '0', 10),
      // 生成相关统计
      totalGenerations: generationStats.totalGenerations,
      todayGenerations: generationStats.todayGenerations,
      todayRemaining: generationStats.todayRemaining,
      dailyLimit: generationStats.dailyLimit,
    };
  }

  private async invalidateUserCache(userId: number): Promise<void> {
    const cacheKey = `${this.cachePrefix}:${userId}`;
    await this.redisService.del(cacheKey);
  }
}
