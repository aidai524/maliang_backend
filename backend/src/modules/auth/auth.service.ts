import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async generateToken(
    userId: number,
    payload?: any,
  ): Promise<{ token: string; expiresIn: string }> {
    const appConfig = this.configService.get('app');

    const tokenPayload = {
      userId,
      ...payload,
    };

    const token = await this.jwtService.signAsync(tokenPayload, {
      secret: appConfig.jwt.secret,
      expiresIn: appConfig.jwt.expiresIn,
    });

    this.logger.log(`Generated token for userId: ${userId}`);

    return {
      token,
      expiresIn: appConfig.jwt.expiresIn,
    };
  }

  async validateToken(token: string): Promise<any> {
    const appConfig = this.configService.get('app');

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: appConfig.jwt.secret,
      });
      return payload;
    } catch (error) {
      this.logger.error(`Token validation failed: ${error.message}`);
      throw new Error('Invalid token');
    }
  }

  decodeToken(token: string): any {
    try {
      return this.jwtService.decode(token);
    } catch (error) {
      this.logger.error(`Token decode failed: ${error.message}`);
      throw new Error('Invalid token');
    }
  }
}
