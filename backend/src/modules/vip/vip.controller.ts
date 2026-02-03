import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VipService } from './vip.service';
import { UsersService } from '../users/users.service';
import { OrdersService } from '../orders/orders.service';
import { AuthService } from '../auth/auth.service';
import { VipPlan } from './entities/vip-plan.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('VIP')
@Controller('vip')
export class VipController {
  constructor(
    private readonly vipService: VipService,
    private readonly usersService: UsersService,
    private readonly ordersService: OrdersService,
    private readonly authService: AuthService,
  ) {}

  @Get('plans')
  @ApiOperation({ summary: 'Get all VIP plans' })
  async getPlans(): Promise<{ plans: VipPlan[] }> {
    const plans = await this.vipService.findAll();
    return { plans };
  }

  @Get('info')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get VIP info and quota' })
  async getVipInfo(@Request() req: any): Promise<any> {
    const userId = req.user.userId;
    const user = await this.usersService.findById(userId);
    return await this.vipService.getVipInfo(user.id, user.vipLevel, user.vipExpireAt);
  }

  @Post('purchase')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Purchase VIP plan' })
  async purchase(
    @Request() req: any,
    @Body() purchaseDto: { planId: string; paymentMethod: string },
  ): Promise<any> {
    const userId = req.user.userId;
    return await this.ordersService.createOrder(
      userId,
      purchaseDto.planId,
      purchaseDto.paymentMethod,
    );
  }

  @Post('orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create VIP order (alias for purchase)' })
  async createOrder(
    @Request() req: any,
    @Body() orderDto: { planId: string; paymentMethod?: string },
  ): Promise<any> {
    const userId = req.user.userId;
    return await this.ordersService.createOrder(
      userId,
      orderDto.planId,
      orderDto.paymentMethod || 'wechat',
    );
  }
}
