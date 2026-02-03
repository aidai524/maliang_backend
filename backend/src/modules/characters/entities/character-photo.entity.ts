import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { Character } from './character.entity';

@Entity('character_photos')
@Index('idx_character_photos_character_id', ['character'])
export class CharacterPhoto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'uuid', length: 36, unique: true })
  uuid: string;

  @ManyToOne(() => Character, (character) => character.photos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'character_id' })
  character: Character;

  @Column({ name: 'character_id' })
  characterId: number;

  // 缩略图路径（用于 UI 显示）
  @Column({ name: 'thumbnail_url', type: 'text' })
  thumbnailUrl: string;

  // 原图路径（用于 AI 生成）
  @Column({ name: 'original_url', type: 'text' })
  originalUrl: string;

  @Column({ name: 'mime_type', length: 50, default: 'image/jpeg' })
  mimeType: string;

  // 缩略图大小（字节）
  @Column({ name: 'thumbnail_size', type: 'int', default: 0 })
  thumbnailSize: number;

  // 原图大小（字节）
  @Column({ name: 'original_size', type: 'int', default: 0 })
  originalSize: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
