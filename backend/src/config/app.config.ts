import { registerAs } from '@nestjs/config';
import { Config } from './config.interface';

export default registerAs('app', (): Config => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || 'v1',

  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    name: process.env.DATABASE_NAME || 'dream_wechat',
    synchronize: process.env.NODE_ENV === 'development',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: process.env.JWT_EXPIRATION || '7d',
  },

  wechat: {
    appid: process.env.WECHAT_APPID || '',
    secret: process.env.WECHAT_SECRET || '',
  },

  wechatPay: {
    mchId: process.env.WECHAT_PAY_MCH_ID || '',
    key: process.env.WECHAT_PAY_KEY || '',
    notifyUrl: process.env.WECHAT_PAY_NOTIFY_URL || '',
  },

  thirdPartyApi: {
    baseUrl: process.env.THIRD_PARTY_API_BASE_URL || 'http://localhost:3001',
    apiKey: process.env.THIRD_PARTY_API_KEY || '',
  },

  r2: {
    accountId: process.env.R2_ACCOUNT_ID || '',
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    bucketName: process.env.R2_BUCKET_NAME || 'dream-wechat-assets',
    publicUrl: process.env.R2_PUBLIC_BASE_URL || process.env.R2_PUBLIC_URL || '',
  },

  // 管理员 API Key
  adminApiKey: process.env.ADMIN_API_KEY || '',

  // 图片生成限额配置
  generation: {
    dailyLimitNormal: parseInt(process.env.GENERATION_DAILY_LIMIT_NORMAL, 10) || 2,
    dailyLimitVip: parseInt(process.env.GENERATION_DAILY_LIMIT_VIP, 10) || 20,
    dailyLimitSvip: parseInt(process.env.GENERATION_DAILY_LIMIT_SVIP, 10) || 100,
  },

  // 短信服务配置
  sms: {
    mode: (process.env.SMS_MODE as 'mock' | 'aliyun') || 'mock',
    aliyunAccessKeyId: process.env.ALIYUN_SMS_ACCESS_KEY_ID || '',
    aliyunAccessKeySecret: process.env.ALIYUN_SMS_ACCESS_KEY_SECRET || '',
    aliyunSignName: process.env.ALIYUN_SMS_SIGN_NAME || '',
    aliyunTemplateCode: process.env.ALIYUN_SMS_TEMPLATE_CODE || '',
  },

  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },

  throttler: {
    ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60,
    limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 100,
  },
}));
