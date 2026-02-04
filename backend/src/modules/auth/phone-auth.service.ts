import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, VipLevel } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { SmsService } from './sms.service';
import { PhoneLoginDto, AccountConflictInfo } from './dto/phone-auth.dto';

export interface PhoneLoginResult {
  token: string;
  expiresIn: string;
  user: User;
  conflict?: AccountConflictInfo; // 存在账号冲突时返回
  pendingBindToken?: string; // 待绑定时的临时 token
}

@Injectable()
export class PhoneAuthService {
  private readonly logger = new Logger(PhoneAuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
    private readonly smsService: SmsService,
  ) {}

  /**
   * 手机号登录/注册
   */
  async login(dto: PhoneLoginDto): Promise<PhoneLoginResult> {
    const { phone, code, nickName, avatarUrl } = dto;

    // 1. 验证验证码
    const isValid = await this.smsService.verifyCode(phone, code);
    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }

    // 2. 查找用户
    let user = await this.userRepository.findOne({ where: { phone } });

    if (!user) {
      // 3. 新用户注册
      user = this.userRepository.create({
        phone,
        nickName: nickName || `用户${phone.slice(-4)}`,
        avatarUrl,
        vipLevel: VipLevel.NORMAL,
        pointsBalance: 0,
      });
      await this.userRepository.save(user);
      this.logger.log(`New user registered with phone: ${phone}`);
    } else {
      // 4. 更新用户信息（如果提供）
      let needUpdate = false;
      if (nickName && nickName !== user.nickName) {
        user.nickName = nickName;
        needUpdate = true;
      }
      if (avatarUrl && avatarUrl !== user.avatarUrl) {
        user.avatarUrl = avatarUrl;
        needUpdate = true;
      }
      if (needUpdate) {
        await this.userRepository.save(user);
      }
    }

    // 5. 生成 token
    const { token, expiresIn } = await this.authService.generateToken(user.id);

    return { token, expiresIn, user };
  }

  /**
   * 检查手机号是否已被其他微信用户绑定
   * 用于微信登录时检测冲突
   */
  async checkPhoneConflict(phone: string, currentOpenid: string): Promise<AccountConflictInfo | null> {
    const existingUser = await this.userRepository.findOne({ where: { phone } });

    if (!existingUser) {
      return null;
    }

    // 如果手机号属于同一个 openid 的用户，没有冲突
    if (existingUser.openid === currentOpenid) {
      return null;
    }

    // 存在冲突：手机号已被其他账号使用
    return {
      conflictType: 'phone_exists',
      existingAccount: {
        id: existingUser.id,
        nickName: existingUser.nickName,
        avatarUrl: existingUser.avatarUrl,
        vipLevel: existingUser.vipLevel,
        createdAt: existingUser.createdAt,
      },
      message: 'This phone number is already associated with another account',
    };
  }

  /**
   * 检查 openid 是否已存在（用于手机号注册时检测）
   */
  async checkOpenidConflictByPhone(phone: string): Promise<AccountConflictInfo | null> {
    // 查找是否有微信用户绑定了这个手机号
    const existingUser = await this.userRepository.findOne({ where: { phone } });

    if (!existingUser || !existingUser.openid) {
      return null;
    }

    return {
      conflictType: 'wechat_exists',
      existingAccount: {
        id: existingUser.id,
        nickName: existingUser.nickName,
        avatarUrl: existingUser.avatarUrl,
        vipLevel: existingUser.vipLevel,
        createdAt: existingUser.createdAt,
      },
      message: 'This phone number is already bound to a WeChat account',
    };
  }

  /**
   * 绑定手机号到微信账号
   * 将手机号账号的数据合并到微信账号
   */
  async bindPhoneToWechat(
    wechatUserId: number,
    phone: string,
    mergeData: boolean = true,
  ): Promise<User> {
    const wechatUser = await this.userRepository.findOne({ where: { id: wechatUserId } });
    if (!wechatUser) {
      throw new Error('WeChat user not found');
    }

    const phoneUser = await this.userRepository.findOne({ where: { phone } });

    if (phoneUser && phoneUser.id !== wechatUserId) {
      if (mergeData) {
        // 合并数据：将手机号用户的 VIP 和积分转移到微信用户
        await this.mergeAccounts(phoneUser, wechatUser);
      }
      // 删除手机号用户（或标记为已合并）
      await this.userRepository.remove(phoneUser);
      this.logger.log(`Merged phone user ${phoneUser.id} into wechat user ${wechatUser.id}`);
    }

    // 更新微信用户的手机号
    wechatUser.phone = phone;
    await this.userRepository.save(wechatUser);

    return wechatUser;
  }

  /**
   * 绑定微信到手机号账号
   * 将微信账号的数据合并到手机号账号
   */
  async bindWechatToPhone(
    phoneUserId: number,
    openid: string,
    unionid?: string,
    mergeData: boolean = true,
  ): Promise<User> {
    const phoneUser = await this.userRepository.findOne({ where: { id: phoneUserId } });
    if (!phoneUser) {
      throw new Error('Phone user not found');
    }

    const wechatUser = await this.userRepository.findOne({ where: { openid } });

    if (wechatUser && wechatUser.id !== phoneUserId) {
      if (mergeData) {
        // 合并数据
        await this.mergeAccounts(wechatUser, phoneUser);
      }
      // 删除微信用户
      await this.userRepository.remove(wechatUser);
      this.logger.log(`Merged wechat user ${wechatUser.id} into phone user ${phoneUser.id}`);
    }

    // 更新手机号用户的 openid
    phoneUser.openid = openid;
    if (unionid) {
      phoneUser.unionid = unionid;
    }
    await this.userRepository.save(phoneUser);

    return phoneUser;
  }

  /**
   * 合并账号数据
   * 将源账号的有价值数据转移到目标账号
   */
  private async mergeAccounts(source: User, target: User): Promise<void> {
    // 合并 VIP 等级（取较高的）
    const vipPriority = { NORMAL: 0, VIP: 1, SVIP: 2 };
    if (vipPriority[source.vipLevel] > vipPriority[target.vipLevel]) {
      target.vipLevel = source.vipLevel;
      target.vipExpireAt = source.vipExpireAt;
    } else if (source.vipLevel === target.vipLevel && source.vipExpireAt && target.vipExpireAt) {
      // 同等级取较晚的过期时间
      if (new Date(source.vipExpireAt) > new Date(target.vipExpireAt)) {
        target.vipExpireAt = source.vipExpireAt;
      }
    }

    // 合并积分（相加）
    target.pointsBalance = (target.pointsBalance || 0) + (source.pointsBalance || 0);

    // 如果目标没有昵称/头像，使用源的
    if (!target.nickName && source.nickName) {
      target.nickName = source.nickName;
    }
    if (!target.avatarUrl && source.avatarUrl) {
      target.avatarUrl = source.avatarUrl;
    }

    await this.userRepository.save(target);

    this.logger.log(`Merged account data from user ${source.id} to user ${target.id}`);

    // TODO: 合并其他关联数据（收藏、生成记录等）
    // 可以通过更新外键或复制记录来实现
  }
}
