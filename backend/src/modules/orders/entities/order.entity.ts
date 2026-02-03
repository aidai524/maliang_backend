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

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

@Entity('orders')
@Index('idx_orders_order_id', ['orderId'], { unique: true })
@Index('idx_orders_status', ['status'])
@Index('idx_orders_user_id', ['userId'])
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_id', length: 100, unique: true })
  orderId: string;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'plan_id', length: 50, nullable: true })
  planId: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ name: 'amount', type: 'int' })
  amount: number;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt: Date;

  @Column({ name: 'vip_expire_at', type: 'timestamp', nullable: true })
  vipExpireAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
