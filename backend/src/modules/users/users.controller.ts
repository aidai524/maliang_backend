import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user statistics' })
  async getMyStats(@Request() req: any): Promise<any> {
    const userId = req.user.userId;
    const user = await this.usersService.findById(userId);
    const stats = await this.usersService.getUserStats(userId);
    
    return {
      user: {
        id: user.id,
        nickName: user.nickName,
        avatarUrl: user.avatarUrl,
        vipLevel: user.vipLevel,
        vipExpireAt: user.vipExpireAt,
        pointsBalance: user.pointsBalance,
      },
      stats,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getMyProfile(@Request() req: any): Promise<any> {
    const userId = req.user.userId;
    const user = await this.usersService.findById(userId);
    return { user };
  }
}
