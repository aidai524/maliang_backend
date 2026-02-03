import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('vip_plans')
@Index('idx_vip_plans_plan_id', ['planId'], { unique: true })
export class VipPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'plan_id', length: 50, unique: true })
  planId: string;

  @Column({ name: 'name', length: 100 })
  name: string;

  @Column({ name: 'duration', type: 'int' })
  duration: number;

  @Column({ name: 'original_price', type: 'int' })
  originalPrice: number;

  @Column({ name: 'current_price', type: 'int' })
  currentPrice: number;

  @Column({ name: 'benefits', type: 'jsonb', nullable: true })
  benefits: string[];

  @Column({ name: 'popular', type: 'boolean', default: false })
  popular: boolean;
}
