import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { WechatAuthService } from './wechat-auth.service';
import { WechatLoginDto } from './dto/wechat-login.dto';
import { User } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

export interface LoginResponse {
  token: string;
  expiresIn: string;
  user: User;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly wechatAuthService: WechatAuthService,
  ) {}

  @Post('wechat-login')
  @ApiOperation({ summary: 'WeChat login' })
  async wechatLogin(@Body() loginDto: WechatLoginDto): Promise<LoginResponse> {
    return await this.wechatAuthService.login(loginDto);
  }

  @Post('refresh-token')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh JWT token' })
  async refreshToken(
    @Headers('Authorization') authHeader: string,
  ): Promise<{ token: string; expiresIn: string }> {
    const token = authHeader?.replace('Bearer ', '');
    const payload = await this.authService.validateToken(token);
    return await this.authService.generateToken(payload.userId);
  }

  @Get('userinfo')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user info' })
  async getUserInfo(@Request() req: any): Promise<{ user: User; stats?: any }> {
    const userId = req.user.userId;
    const user = await this.usersService.findById(userId);
    const stats = await this.usersService.getUserStats(userId);
    return { user, stats };
  }

  @Get('check')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check login status' })
  async checkLoginStatus(@Request() req: any): Promise<{ valid: boolean; user: User }> {
    const userId = req.user.userId;
    const user = await this.usersService.findById(userId);
    return { valid: true, user };
  }
}
