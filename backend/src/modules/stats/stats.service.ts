import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Order } from '../orders/entities/order.entity';
import { Favorite } from '../favorites/entities/favorite.entity';
import { PointTransaction } from '../points/entities/point-transaction.entity';

@Injectable()
export class StatsService {
  private readonly logger = new Logger(StatsService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    @InjectRepository(PointTransaction)
    private readonly transactionRepository: Repository<PointTransaction>,
  ) {}

  async getUserStats(userId: number): Promise<any> {
    this.logger.log(`Getting stats for userId: ${userId}`);

    const [totalOrders, totalFavorites, totalTransactions] = await Promise.all([
      this.orderRepository.count({ where: { userId } }),
      this.favoriteRepository.count({ where: { userId } }),
      this.transactionRepository.count({ where: { userId } }),
    ]);

    const result = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select([
        `SUM(CASE WHEN transaction.type = 'EARN' THEN transaction.amount ELSE 0 END) as "totalEarned"`,
        `SUM(CASE WHEN transaction.type = 'SPEND' THEN transaction.amount ELSE 0 END) as "totalSpent"`,
      ])
      .where('transaction.userId = :userId', { userId })
      .getRawOne();

    const totalEarned = parseInt(result?.totalEarned || '0', 10);
    const totalSpent = parseInt(result?.totalSpent || '0', 10);
    const balance = totalEarned - totalSpent;

    return {
      userId,
      totalOrders,
      totalFavorites,
      totalTransactions,
      totalEarned,
      totalSpent,
      balance,
      totalImagesGenerated: totalOrders,
    };
  }

  async getGlobalStats(): Promise<any> {
    this.logger.log('Getting global stats');

    const [totalUsers, totalOrders, totalFavorites] = await Promise.all([
      this.userRepository.count(),
      this.orderRepository.count(),
      this.favoriteRepository.count(),
    ]);

    const result = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select([
        `SUM(CASE WHEN transaction.type = 'EARN' THEN transaction.amount ELSE 0 END) as "totalEarned"`,
        `SUM(CASE WHEN transaction.type = 'SPEND' THEN transaction.amount ELSE 0 END) as "totalSpent"`,
      ])
      .getRawOne();

    const totalEarned = parseInt(result?.totalEarned || '0', 10);
    const totalSpent = parseInt(result?.totalSpent || '0', 10);

    return {
      totalUsers,
      totalOrders,
      totalFavorites,
      totalEarned,
      totalSpent,
    };
  }
}
