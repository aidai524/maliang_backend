import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Stats')
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('overview')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user statistics' })
  async getUserStats(@Request() req: any): Promise<any> {
    const userId = req.user.userId;
    return await this.statsService.getUserStats(userId);
  }

  @Get('global')
  @ApiOperation({ summary: 'Get global statistics' })
  async getGlobalStats(): Promise<any> {
    return await this.statsService.getGlobalStats();
  }
}
