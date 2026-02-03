import { Config } from '../config/config.interface';

export const databaseConfig = (config: Config) => ({
  type: 'postgres' as const,
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.name,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: config.database.synchronize,
  logging: config.nodeEnv === 'development',
  ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
});
