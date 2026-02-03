import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * 管理员认证 Guard
 * 使用 API Key 方式认证，Header: X-Admin-Key
 */
@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const adminKey = request.headers['x-admin-key'];

    const validAdminKey = this.configService.get<string>('app.adminApiKey');

    if (!adminKey || adminKey !== validAdminKey) {
      throw new UnauthorizedException('Invalid admin API key');
    }

    return true;
  }
}
