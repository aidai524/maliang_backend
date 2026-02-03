import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { CoreModule } from './modules/core.module';
import appConfig from './config/app.config';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // 数据库模块
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const config = configService.get('app');
        return {
          type: 'postgres',
          host: config.database.host,
          port: config.database.port,
          username: config.database.username,
          password: config.database.password,
          database: config.database.name,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: config.database.synchronize,
          logging: config.nodeEnv === 'development',
        };
      },
      inject: [ConfigService],
    }),

    // 限流模块
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const config = configService.get('app');
        return {
          throttlers: [
            {
              ttl: config.throttler.ttl * 1000, // 转换为毫秒
              limit: config.throttler.limit,
            },
          ],
        };
      },
      inject: [ConfigService],
    }),

    // 核心业务模块
    CoreModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
