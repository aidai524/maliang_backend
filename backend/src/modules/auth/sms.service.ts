import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../common/providers/redis.service';

// 阿里云 SMS SDK（需要时安装: npm install @alicloud/dysmsapi20170525）
// import Dysmsapi20170525 from '@alicloud/dysmsapi20170525';
// import * as OpenApi from '@alicloud/openapi-client';

export interface SendSmsResult {
  success: boolean;
  message: string;
  code?: string; // 模拟模式下返回验证码（仅开发环境）
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly codePrefix = 'sms:code:';
  private readonly codeTTL = 300; // 验证码有效期 5 分钟
  private readonly sendLimitPrefix = 'sms:limit:';
  private readonly sendLimitTTL = 60; // 发送间隔 60 秒

  // 阿里云配置
  private readonly aliyunAccessKeyId: string;
  private readonly aliyunAccessKeySecret: string;
  private readonly aliyunSignName: string;
  private readonly aliyunTemplateCode: string;
  private readonly smsMode: 'mock' | 'aliyun';

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    const config = this.configService.get('app.sms') || {};
    this.smsMode = config.mode || 'mock';
    this.aliyunAccessKeyId = config.aliyunAccessKeyId || '';
    this.aliyunAccessKeySecret = config.aliyunAccessKeySecret || '';
    this.aliyunSignName = config.aliyunSignName || '';
    this.aliyunTemplateCode = config.aliyunTemplateCode || '';

    this.logger.log(`SMS Service initialized in ${this.smsMode} mode`);
  }

  /**
   * 生成 6 位数字验证码
   */
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * 发送验证码
   */
  async sendVerificationCode(phone: string): Promise<SendSmsResult> {
    // 验证手机号格式
    if (!this.isValidPhone(phone)) {
      throw new BadRequestException('Invalid phone number format');
    }

    // 检查发送频率限制
    const limitKey = `${this.sendLimitPrefix}${phone}`;
    const isLimited = await this.redisService.get(limitKey);
    if (isLimited) {
      throw new BadRequestException('Please wait 60 seconds before requesting another code');
    }

    // 生成验证码
    const code = this.generateCode();

    // 存储验证码到 Redis
    const codeKey = `${this.codePrefix}${phone}`;
    await this.redisService.setex(codeKey, this.codeTTL, code);

    // 设置发送频率限制
    await this.redisService.setex(limitKey, this.sendLimitTTL, '1');

    // 根据模式发送短信
    if (this.smsMode === 'aliyun') {
      return await this.sendViaAliyun(phone, code);
    } else {
      return this.sendViaMock(phone, code);
    }
  }

  /**
   * 模拟发送（开发环境）
   */
  private sendViaMock(phone: string, code: string): SendSmsResult {
    this.logger.log(`[MOCK SMS] Sending code ${code} to ${phone}`);
    
    const isDev = this.configService.get('app.nodeEnv') === 'development';
    
    return {
      success: true,
      message: 'Verification code sent (mock mode)',
      code: isDev ? code : undefined, // 仅开发环境返回验证码
    };
  }

  /**
   * 通过阿里云发送短信
   */
  private async sendViaAliyun(phone: string, code: string): Promise<SendSmsResult> {
    try {
      // TODO: 实现阿里云短信发送
      // 需要安装 SDK: npm install @alicloud/dysmsapi20170525 @alicloud/openapi-client
      /*
      const config = new OpenApi.Config({
        accessKeyId: this.aliyunAccessKeyId,
        accessKeySecret: this.aliyunAccessKeySecret,
      });
      config.endpoint = 'dysmsapi.aliyuncs.com';
      
      const client = new Dysmsapi20170525(config);
      const request = new Dysmsapi20170525.SendSmsRequest({
        phoneNumbers: phone,
        signName: this.aliyunSignName,
        templateCode: this.aliyunTemplateCode,
        templateParam: JSON.stringify({ code }),
      });
      
      const response = await client.sendSms(request);
      
      if (response.body.code === 'OK') {
        return { success: true, message: 'Verification code sent' };
      } else {
        throw new Error(response.body.message);
      }
      */
      
      // 临时：阿里云模式下也使用模拟（等待审核通过后切换）
      this.logger.warn('[ALIYUN SMS] SDK not configured, falling back to mock mode');
      return this.sendViaMock(phone, code);
    } catch (error) {
      this.logger.error(`Failed to send SMS via Aliyun: ${error.message}`);
      throw new BadRequestException('Failed to send verification code');
    }
  }

  /**
   * 验证验证码
   */
  async verifyCode(phone: string, code: string): Promise<boolean> {
    const codeKey = `${this.codePrefix}${phone}`;
    const storedCode = await this.redisService.get(codeKey);

    if (!storedCode) {
      return false;
    }

    if (storedCode !== code) {
      return false;
    }

    // 验证成功后删除验证码（一次性使用）
    await this.redisService.del(codeKey);
    return true;
  }

  /**
   * 验证手机号格式（中国大陆手机号）
   */
  private isValidPhone(phone: string): boolean {
    return /^1[3-9]\d{9}$/.test(phone);
  }
}
