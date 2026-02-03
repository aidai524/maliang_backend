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

export enum GenerationStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('generations')
@Index('idx_generations_user_id', ['userId'])
@Index('idx_generations_created_at', ['createdAt'])
@Index('idx_generations_user_created', ['userId', 'createdAt'])
export class Generation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'job_id', length: 100, nullable: true })
  jobId: string;

  @Column({ name: 'prompt', type: 'text' })
  prompt: string;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl: string;

  @Column({ name: 'thumbnail_url', type: 'text', nullable: true })
  thumbnailUrl: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: GenerationStatus,
    default: GenerationStatus.PENDING,
  })
  status: GenerationStatus;

  @Column({ name: 'params', type: 'jsonb', nullable: true })
  params: Record<string, any>;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
