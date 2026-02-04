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
import { PhoneAuthService } from './phone-auth.service';
import { SmsService } from './sms.service';
import { WechatLoginDto } from './dto/wechat-login.dto';
import { SendCodeDto, PhoneLoginDto } from './dto/phone-auth.dto';
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
    private readonly phoneAuthService: PhoneAuthService,
    private readonly smsService: SmsService,
  ) {}

  // ========== 微信登录 ==========

  @Post('wechat-login')
  @ApiOperation({ summary: 'WeChat login' })
  async wechatLogin(@Body() loginDto: WechatLoginDto): Promise<LoginResponse> {
    return await this.wechatAuthService.login(loginDto);
  }

  // ========== 手机号登录 ==========

  @Post('send-code')
  @ApiOperation({ summary: 'Send SMS verification code' })
  async sendCode(@Body() dto: SendCodeDto): Promise<{ success: boolean; message: string; code?: string }> {
    const result = await this.smsService.sendVerificationCode(dto.phone);
    return result;
  }

  @Post('phone-login')
  @ApiOperation({ summary: 'Phone number login/register' })
  async phoneLogin(@Body() dto: PhoneLoginDto): Promise<LoginResponse> {
    const result = await this.phoneAuthService.login(dto);
    return {
      token: result.token,
      expiresIn: result.expiresIn,
      user: result.user,
    };
  }

  // ========== 账号绑定 ==========

  @Post('bind-phone')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bind phone number to current account (WeChat user)' })
  async bindPhone(
    @Request() req: any,
    @Body() dto: { phone: string; code: string },
  ): Promise<{ success: boolean; user: User }> {
    const userId = req.user.userId;

    // 验证验证码
    const isValid = await this.smsService.verifyCode(dto.phone, dto.code);
    if (!isValid) {
      throw new Error('Invalid or expired verification code');
    }

    // 检查手机号是否已被使用
    const user = await this.usersService.findById(userId);
    const conflict = await this.phoneAuthService.checkPhoneConflict(dto.phone, user.openid);

    if (conflict) {
      // 有冲突，执行账号合并
      const mergedUser = await this.phoneAuthService.bindPhoneToWechat(userId, dto.phone, true);
      return { success: true, user: mergedUser };
    }

    // 没有冲突，直接绑定
    const updatedUser = await this.usersService.updateUser(userId, { phone: dto.phone });
    return { success: true, user: updatedUser };
  }

  @Post('bind-wechat')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bind WeChat to current account (phone user)' })
  async bindWechat(
    @Request() req: any,
    @Body() dto: { code: string },
  ): Promise<{ success: boolean; user: User; needMerge?: boolean }> {
    const userId = req.user.userId;

    // 通过微信 code 获取 openid
    // 这里需要调用微信接口，简化处理
    // TODO: 实现完整的微信绑定流程

    return { success: false, user: null, needMerge: false };
  }

  // ========== Token 相关 ==========

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

  // ========== 用户信息 ==========

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
