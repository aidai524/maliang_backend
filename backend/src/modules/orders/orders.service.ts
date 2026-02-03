import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from '../../common/providers/redis.service';
import { Order, OrderStatus } from './entities/order.entity';
import { VipService } from '../vip/vip.service';
import { UsersService } from '../users/users.service';
import { VipLevel } from '../users/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  private readonly cachePrefix = 'order';
  private readonly cacheTTL = 3600;

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly redisService: RedisService,
    private readonly vipService: VipService,
    private readonly usersService: UsersService,
  ) {}

  async createOrder(userId: number, planId: string, paymentMethod: string): Promise<any> {
    this.logger.log(`Creating order for userId ${userId}, plan ${planId}`);

    const plan = await this.vipService.findByPlanId(planId);

    const order = this.orderRepository.create({
      orderId: `ORD${Date.now()}${uuidv4().slice(0, 8)}`,
      userId,
      planId,
      status: OrderStatus.PENDING,
      amount: plan.currentPrice,
    });

    await this.orderRepository.save(order);

    const wxPayParams = await this.generateWechatPayParams(order);

    this.logger.log(`Created order: ${order.orderId}`);

    return {
      orderId: order.orderId,
      amount: plan.currentPrice,
      wxPayParams,
    };
  }

  async findUserOrders(
    userId: number,
    status?: string,
    limit: number = 20,
    cursor?: string,
  ): Promise<{ items: Order[]; hasMore: boolean; nextCursor?: string }> {
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .where('order.userId = :userId', { userId })
      .orderBy('order.createdAt', 'DESC')
      .take(limit + 1);

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    if (cursor) {
      const decodedCursor = this.decodeCursor(cursor);
      queryBuilder.andWhere('order.createdAt < :cursorDate', {
        cursorDate: decodedCursor.date,
      });
    }

    const items = await queryBuilder.getMany();

    const hasMore = items.length > limit;
    if (hasMore) {
      items.pop();
    }

    let nextCursor;
    if (hasMore && items.length > 0) {
      nextCursor = this.encodeCursor(items[items.length - 1].createdAt);
    }

    return { items, hasMore, nextCursor };
  }

  async findByOrderId(orderId: string): Promise<Order> {
    const cacheKey = `${this.cachePrefix}:${orderId}`;
    const cached = await this.redisService.getJson<Order>(cacheKey);

    if (cached) {
      return cached;
    }

    const order = await this.orderRepository.findOne({
      where: { orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    await this.redisService.setexJson(cacheKey, this.cacheTTL, order);

    return order;
  }

  async handlePaymentCallback(notifyData: any): Promise<Order> {
    const { orderId } = notifyData;

    this.logger.log(`Processing payment callback for order: ${orderId}`);

    const order = await this.findByOrderId(orderId);

    if (order.status === OrderStatus.PAID) {
      this.logger.log(`Order ${orderId} already paid, skipping`);
      return order;
    }

    order.status = OrderStatus.PAID;
    order.paidAt = new Date();

    await this.orderRepository.save(order);

    const plan = await this.vipService.findByPlanId(order.planId);

    const vipExpireAt = new Date();
    vipExpireAt.setDate(vipExpireAt.getDate() + plan.duration);

    await this.usersService.updateVipLevel(order.userId, VipLevel.VIP, vipExpireAt);

    this.logger.log(`Order ${orderId} payment processed, VIP activated until ${vipExpireAt}`);

    return order;
  }

  private async generateWechatPayParams(order: Order): Promise<any> {
    // TODO: 集成真实的微信支付
    return {
      timeStamp: Math.floor(Date.now() / 1000).toString(),
      nonceStr: this.generateNonce(),
      package: `prepay_id=mock_prepay_id`,
      signType: 'MD5',
      paySign: 'mock_pay_sign',
    };
  }

  private generateNonce(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private decodeCursor(cursor: string): any {
    return JSON.parse(Buffer.from(cursor, 'base64').toString());
  }

  private encodeCursor(date: Date): string {
    return Buffer.from(JSON.stringify({ date })).toString('base64');
  }
}
