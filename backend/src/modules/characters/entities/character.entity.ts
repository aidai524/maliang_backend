import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CharacterPhoto } from './character-photo.entity';

@Entity('characters')
@Index('idx_characters_user_id', ['user'])
export class Character {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'uuid', length: 36, unique: true })
  uuid: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'name', length: 100 })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @OneToMany(() => CharacterPhoto, (photo) => photo.character, { cascade: true })
  photos: CharacterPhoto[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
