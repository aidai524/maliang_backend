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

export enum FavoriteType {
  IMAGE = 'image',
  PROMPT = 'prompt',
}

@Entity('favorites')
@Index('idx_favorites_user_id', ['userId'])
@Index('idx_favorites_type', ['type'])
@Index('idx_favorites_unique', ['userId', 'type', 'resourceId'], { unique: true })
export class Favorite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'type', length: 20 })
  type: string;

  @Column({ name: 'resource_id', length: 100 })
  resourceId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.favorites)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
