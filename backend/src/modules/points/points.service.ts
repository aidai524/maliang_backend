import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PointTransaction, TransactionType } from './entities/point-transaction.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PointsService {
  private readonly logger = new Logger(PointsService.name);

  constructor(
    @InjectRepository(PointTransaction)
    private readonly transactionRepository: Repository<PointTransaction>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getBalance(userId: number): Promise<{ balance: number; totalEarned: number; totalSpent: number }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

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

    return { balance, totalEarned, totalSpent };
  }

  async getTransactions(
    userId: number,
    type?: string,
    limit: number = 20,
    page: number = 1,
  ): Promise<{ items: PointTransaction[]; total: number }> {
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.userId = :userId', { userId })
      .orderBy('transaction.createdAt', 'DESC')
      .take(limit)
      .skip((page - 1) * limit);

    if (type) {
      queryBuilder.andWhere('transaction.type = :type', { type });
    }

    const [items, total] = await queryBuilder.getManyAndCount();

    return { items, total };
  }

  async rechargePoints(userId: number, amount: number, paymentMethod: string): Promise<any> {
    this.logger.log(`Recharging points: userId=${userId}, amount=${amount}`);

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const { balance } = await this.getBalance(userId);

    const transaction = this.transactionRepository.create({
      userId,
      type: TransactionType.EARN,
      amount,
      description: 'Points recharge',
      balanceAfter: balance + amount,
    });

    await this.transactionRepository.save(transaction);

    const wxPayParams = await this.generateWechatPayParams(amount, 'Points recharge');

    this.logger.log(`Created points recharge transaction`);

    return {
      transactionId: transaction.id,
      amount,
      wxPayParams,
    };
  }

  async spendPoints(userId: number, amount: number, description: string): Promise<void> {
    const { balance } = await this.getBalance(userId);

    if (balance < amount) {
      throw new BadRequestException('Insufficient points balance');
    }

    const transaction = this.transactionRepository.create({
      userId,
      type: TransactionType.SPEND,
      amount,
      description,
      balanceAfter: balance - amount,
    });

    await this.transactionRepository.save(transaction);

    this.logger.log(`Spent points: userId=${userId}, amount=${amount}`);
  }

  private async generateWechatPayParams(amount: number, description: string): Promise<any> {
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
}
