import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PointsService } from './points.service';
import { PointsRechargeDto, PointsTransactionsQueryDto } from './dto/points.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Points')
@ApiBearerAuth()
@Controller('points')
@UseGuards(JwtAuthGuard)
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Get('balance')
  @ApiOperation({ summary: 'Get points balance' })
  async getBalance(@Request() req: any): Promise<any> {
    const userId = req.user.userId;
    return await this.pointsService.getBalance(userId);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get transaction history' })
  async getTransactions(
    @Request() req: any,
    @Query() queryDto: PointsTransactionsQueryDto,
  ): Promise<any> {
    const userId = req.user.userId;
    return await this.pointsService.getTransactions(
      userId,
      queryDto.type,
      queryDto.limit,
      queryDto.page,
    );
  }

  @Post('recharge')
  @ApiOperation({ summary: 'Recharge points' })
  async recharge(
    @Request() req: any,
    @Body() rechargeDto: PointsRechargeDto,
  ): Promise<any> {
    const userId = req.user.userId;
    return await this.pointsService.rechargePoints(
      userId,
      rechargeDto.amount,
      rechargeDto.paymentMethod,
    );
  }
}
