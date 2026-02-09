import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

/**
 * 组合认证 Guard - 支持 JWT Token 或 Admin Key
 */
@Injectable()
export class EitherAuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 1. 尝试 Admin Key 认证
    const adminKey = request.headers['x-admin-key'];
    const validAdminKey = this.configService.get<string>('app.adminApiKey');

    if (adminKey && adminKey === validAdminKey) {
      return true;
    }

    // 2. 尝试 JWT 认证
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const payload = await this.jwtService.verifyAsync(token);
        request.user = payload;
        return true;
      } catch {
        // JWT 无效，继续抛出错误
      }
    }

    throw new UnauthorizedException('Invalid authentication (requires Admin Key or JWT Token)');
  }
}
