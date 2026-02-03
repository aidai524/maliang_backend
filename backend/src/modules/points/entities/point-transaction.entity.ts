import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum TransactionType {
  EARN = 'EARN',
  SPEND = 'SPEND',
  REFUND = 'REFUND',
}

@Entity('point_transactions')
@Index('idx_point_transactions_user_id', ['userId'])
@Index('idx_point_transactions_type', ['type'])
export class PointTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({
    name: 'type',
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({ name: 'amount', type: 'int' })
  amount: number;

  @Column({ name: 'description', length: 200, nullable: true })
  description: string;

  @Column({ name: 'balance_after', type: 'int' })
  balanceAfter: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.pointTransactions)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
