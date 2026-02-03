export interface Config {
  port: number;
  nodeEnv: string;
  apiPrefix: string;

  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
    synchronize: boolean;
  };

  redis: {
    host: string;
    port: number;
    password?: string;
  };

  jwt: {
    secret: string;
    expiresIn: string;
  };

  wechat: {
    appid: string;
    secret: string;
  };

  wechatPay: {
    mchId: string;
    key: string;
    notifyUrl: string;
  };

  thirdPartyApi: {
    baseUrl: string;
    apiKey: string;
  };

  r2: {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
    publicUrl: string;
  };

  adminApiKey: string;

  generation: {
    dailyLimitNormal: number;
    dailyLimitVip: number;
    dailyLimitSvip: number;
  };

  cors: {
    origin: string;
  };

  throttler: {
    ttl: number;
    limit: number;
  };
}
