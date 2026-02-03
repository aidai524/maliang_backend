import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { Favorite } from '../../favorites/entities/favorite.entity';
import { PointTransaction } from '../../points/entities/point-transaction.entity';

export enum VipLevel {
  NORMAL = 'NORMAL',
  VIP = 'VIP',
  SVIP = 'SVIP',
}

@Entity('users')
@Index('idx_users_openid', ['openid'], { unique: true })
@Index('idx_users_phone', ['phone'])
@Index('idx_users_vip_level', ['vipLevel'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'openid', length: 100, unique: true })
  openid: string;

  @Column({ name: 'unionid', length: 100, nullable: true })
  unionid: string;

  @Column({ name: 'phone', length: 20, nullable: true })
  phone: string;

  @Column({ name: 'nick_name', length: 100, nullable: true })
  nickName: string;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl: string;

  @Column({
    name: 'vip_level',
    type: 'enum',
    enum: VipLevel,
    default: VipLevel.NORMAL,
  })
  vipLevel: VipLevel;

  @Column({ name: 'vip_expire_at', type: 'timestamp', nullable: true })
  vipExpireAt: Date;

  @Column({ name: 'points_balance', type: 'int', default: 0 })
  pointsBalance: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[];

  @OneToMany(() => PointTransaction, (transaction) => transaction.user)
  pointTransactions: PointTransaction[];
}
