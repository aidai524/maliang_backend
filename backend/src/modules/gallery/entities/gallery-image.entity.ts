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

@Entity('gallery_images')
@Index('idx_gallery_images_category_id', ['categoryId'])
@Index('idx_gallery_images_created_at', ['createdAt'])
export class GalleryImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'image_url', type: 'text' })
  imageUrl: string;

  @Column({ name: 'thumbnail_url', type: 'text', nullable: true })
  thumbnailUrl: string;

  @Column({ name: 'prompt', type: 'text' })
  prompt: string;

  @Column({ name: 'category_id', length: 50, nullable: true })
  categoryId: string;

  @Column({ name: 'author_id', type: 'int', nullable: true })
  authorId: number;

  @Column({ name: 'likes', type: 'int', default: 0 })
  likes: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'author_id' })
  author: User;
}
