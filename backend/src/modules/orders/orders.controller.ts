import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user orders' })
  async getUserOrders(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('cursor') cursor?: string,
  ): Promise<any> {
    const userId = req.user.userId;
    return await this.ordersService.findUserOrders(userId, status, limit, cursor);
  }

  @Get(':orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order detail' })
  async getOrder(@Param('orderId') orderId: string): Promise<Order> {
    return await this.ordersService.findByOrderId(orderId);
  }

  @Post('payment-callback')
  @ApiOperation({ summary: 'WeChat payment callback' })
  async paymentCallback(@Body() notifyData: any): Promise<any> {
    return await this.ordersService.handlePaymentCallback(notifyData);
  }
}
