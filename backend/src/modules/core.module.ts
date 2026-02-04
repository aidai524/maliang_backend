import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Controllers
import { AuthController } from './auth/auth.controller';
import { UsersController } from './users/users.controller';
import { VipController } from './vip/vip.controller';
import { OrdersController } from './orders/orders.controller';
import { ProxyController } from './proxy/proxy.controller';
import { FavoritesController } from './favorites/favorites.controller';
import { GalleryController } from './gallery/gallery.controller';
import { PointsController } from './points/points.controller';
import { TemplatesController } from './templates/templates.controller';
import { StatsController } from './stats/stats.controller';
import { UploadController } from './upload/upload.controller';
import { CharactersController } from './characters/characters.controller';
import { AdminController } from './admin/admin.controller';
import { JobsController } from './jobs/jobs.controller';

// Services
import { AuthService } from './auth/auth.service';
import { WechatAuthService } from './auth/wechat-auth.service';
import { PhoneAuthService } from './auth/phone-auth.service';
import { SmsService } from './auth/sms.service';
import { UsersService } from './users/users.service';
import { VipService } from './vip/vip.service';
import { OrdersService } from './orders/orders.service';
import { ProxyService } from './proxy/proxy.service';
import { FavoritesService } from './favorites/favorites.service';
import { GalleryService } from './gallery/gallery.service';
import { PointsService } from './points/points.service';
import { TemplatesService } from './templates/templates.service';
import { StatsService } from './stats/stats.service';
import { CharactersService } from './characters/characters.service';
import { AdminService } from './admin/admin.service';
import { GenerationsService } from './generations/generations.service';
import { JobsService } from './jobs/jobs.service';

// Common Providers
import { RedisService } from '../common/providers/redis.service';
import { CustomHttpService } from '../common/providers/custom-http.service';
import { R2StorageService } from '../common/providers/r2-storage.service';

// Entities
import { User } from './users/entities/user.entity';
import { VipPlan } from './vip/entities/vip-plan.entity';
import { Order } from './orders/entities/order.entity';
import { Favorite } from './favorites/entities/favorite.entity';
import { GalleryImage } from './gallery/entities/gallery-image.entity';
import { PointTransaction } from './points/entities/point-transaction.entity';
import { PromptTemplate } from './templates/entities/prompt-template.entity';
import { ParamTemplate } from './templates/entities/param-template.entity';
import { Character } from './characters/entities/character.entity';
import { CharacterPhoto } from './characters/entities/character-photo.entity';
import { Generation } from './generations/entities/generation.entity';

@Module({
  imports: [
    // HTTP 模块 (用于代理请求)
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),

    // JWT 模块
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const config = configService.get('app');
        return {
          secret: config.jwt.secret,
          signOptions: { expiresIn: config.jwt.expiresIn },
        };
      },
      inject: [ConfigService],
    }),

    // TypeORM 实体
    TypeOrmModule.forFeature([
      User,
      VipPlan,
      Order,
      Favorite,
      GalleryImage,
      PointTransaction,
      PromptTemplate,
      ParamTemplate,
      Character,
      CharacterPhoto,
      Generation,
    ]),
  ],
  controllers: [
    AuthController,
    UsersController,
    VipController,
    OrdersController,
    ProxyController,
    FavoritesController,
    GalleryController,
    PointsController,
    TemplatesController,
    StatsController,
    UploadController,
    CharactersController,
    AdminController,
    JobsController,
  ],
  providers: [
    // Common Services
    RedisService,
    CustomHttpService,
    R2StorageService,

    // Business Services
    AuthService,
    WechatAuthService,
    PhoneAuthService,
    SmsService,
    UsersService,
    VipService,
    OrdersService,
    ProxyService,
    FavoritesService,
    GalleryService,
    PointsService,
    TemplatesService,
    StatsService,
    CharactersService,
    AdminService,
    GenerationsService,
    JobsService,
  ],
  exports: [
    AuthService,
    UsersService,
    RedisService,
  ],
})
export class CoreModule {}
