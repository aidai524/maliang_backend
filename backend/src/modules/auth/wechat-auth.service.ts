import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import { User, VipLevel } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { WechatLoginDto } from './dto/wechat-login.dto';

interface WechatCode2SessionResponse {
  openid: string;
  session_key: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

interface WechatPhoneResponse {
  errcode: number;
  errmsg: string;
  phone_info?: {
    phoneNumber: string;
    purePhoneNumber: string;
    countryCode: string;
  };
}

interface WechatAccessTokenResponse {
  access_token: string;
  expires_in: number;
  errcode?: number;
  errmsg?: string;
}

@Injectable()
export class WechatAuthService {
  private readonly logger = new Logger(WechatAuthService.name);
  private readonly wechatApiUrl = 'https://api.weixin.qq.com';

  // 缓存 access_token
  private accessToken: string | null = null;
  private accessTokenExpireAt: number = 0;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly httpService: HttpService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: WechatLoginDto): Promise<{ token: string; expiresIn: string; user: User }> {
    const { code, userInfo, phoneCode, encryptedData, iv } = loginDto;

    this.logger.log(`WeChat login attempt for user: ${userInfo?.nickName || 'unknown'}`);

    // 1. 获取 openid 和 session_key
    const sessionData = await this.code2Session(code);

    if (sessionData.errcode && sessionData.errcode !== 0) {
      throw new UnauthorizedException(`WeChat code2session failed: ${sessionData.errmsg}`);
    }

    // 2. 获取手机号
    let phone: string | null = null;

    // 新版方式：使用 phoneCode 获取手机号（推荐）
    if (phoneCode) {
      phone = await this.getPhoneByCode(phoneCode);
    }
    // 旧版方式：使用 encryptedData 解密
    else if (encryptedData && iv && sessionData.session_key) {
      phone = this.decryptPhone(encryptedData, iv, sessionData.session_key);
    }

    // 3. 查找或创建用户
    let user = await this.userRepository.findOne({
      where: { openid: sessionData.openid },
    });

    if (!user) {
      user = this.userRepository.create({
        openid: sessionData.openid,
        unionid: sessionData.unionid,
        phone: phone,
        nickName: userInfo?.nickName,
        avatarUrl: userInfo?.avatarUrl,
        vipLevel: VipLevel.NORMAL,
        pointsBalance: 0,
      });

      await this.userRepository.save(user);
      this.logger.log(`Created new user with openid: ${sessionData.openid}, phone: ${phone ? '***' + phone.slice(-4) : 'N/A'}`);
    } else {
      // 更新用户信息
      let needUpdate = false;

      if (userInfo?.nickName && userInfo.nickName !== user.nickName) {
        user.nickName = userInfo.nickName;
        needUpdate = true;
      }
      if (userInfo?.avatarUrl && userInfo.avatarUrl !== user.avatarUrl) {
        user.avatarUrl = userInfo.avatarUrl;
        needUpdate = true;
      }
      if (phone && phone !== user.phone) {
        user.phone = phone;
        needUpdate = true;
      }
      if (sessionData.unionid && sessionData.unionid !== user.unionid) {
        user.unionid = sessionData.unionid;
        needUpdate = true;
      }

      if (needUpdate) {
        await this.userRepository.save(user);
        this.logger.log(`Updated user ${user.id} info`);
      }
    }

    const { token, expiresIn } = await this.authService.generateToken(user.id);

    return { token, expiresIn, user };
  }

  /**
   * 新版方式：通过 phoneCode 获取手机号
   * 需要调用 phonenumber.getPhoneNumber 接口
   */
  private async getPhoneByCode(phoneCode: string): Promise<string | null> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await firstValueFrom(
        this.httpService.post<WechatPhoneResponse>(
          `${this.wechatApiUrl}/wxa/business/getuserphonenumber?access_token=${accessToken}`,
          { code: phoneCode },
        ),
      );

      if (response.data.errcode === 0 && response.data.phone_info) {
        this.logger.log(`Got phone number via phoneCode`);
        return response.data.phone_info.purePhoneNumber;
      }

      this.logger.warn(`Failed to get phone by code: ${response.data.errmsg}`);
      return null;
    } catch (error) {
      this.logger.error(`Error getting phone by code: ${error.message}`);
      return null;
    }
  }

  /**
   * 旧版方式：解密手机号
   */
  private decryptPhone(encryptedData: string, iv: string, sessionKey: string): string | null {
    try {
      const sessionKeyBuffer = Buffer.from(sessionKey, 'base64');
      const encryptedDataBuffer = Buffer.from(encryptedData, 'base64');
      const ivBuffer = Buffer.from(iv, 'base64');

      const decipher = crypto.createDecipheriv('aes-128-cbc', sessionKeyBuffer, ivBuffer);
      decipher.setAutoPadding(true);

      let decoded = decipher.update(encryptedDataBuffer, undefined, 'utf8');
      decoded += decipher.final('utf8');

      const data = JSON.parse(decoded);
      this.logger.log(`Decrypted phone number successfully`);
      return data.purePhoneNumber || data.phoneNumber;
    } catch (error) {
      this.logger.error(`Failed to decrypt phone: ${error.message}`);
      return null;
    }
  }

  /**
   * 获取 access_token（带缓存）
   */
  private async getAccessToken(): Promise<string> {
    const now = Date.now();

    // 如果 token 还有效（提前5分钟刷新）
    if (this.accessToken && this.accessTokenExpireAt > now + 300000) {
      return this.accessToken;
    }

    const config = this.configService.get('app');

    const response = await firstValueFrom(
      this.httpService.get<WechatAccessTokenResponse>(
        `${this.wechatApiUrl}/cgi-bin/token`,
        {
          params: {
            grant_type: 'client_credential',
            appid: config.wechat.appid,
            secret: config.wechat.secret,
          },
        },
      ),
    );

    if (response.data.errcode) {
      throw new Error(`Failed to get access_token: ${response.data.errmsg}`);
    }

    this.accessToken = response.data.access_token;
    this.accessTokenExpireAt = now + response.data.expires_in * 1000;

    this.logger.log(`Refreshed access_token, expires in ${response.data.expires_in}s`);

    return this.accessToken;
  }

  private async code2Session(code: string): Promise<WechatCode2SessionResponse> {
    const config = this.configService.get('app');

    const response = await firstValueFrom(
      this.httpService.get<WechatCode2SessionResponse>(
        `${this.wechatApiUrl}/sns/jscode2session`,
        {
          params: {
            appid: config.wechat.appid,
            secret: config.wechat.secret,
            js_code: code,
            grant_type: 'authorization_code',
          },
        },
      ),
    );

    return response.data;
  }
}
