import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('prompt_templates')
@Index('idx_prompt_templates_template_id', ['templateId'], { unique: true })
@Index('idx_prompt_templates_category', ['category'])
export class PromptTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'template_id', length: 50, unique: true })
  templateId: string;

  @Column({ name: 'title', length: 100 })
  title: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'prompt', type: 'text' })
  prompt: string;

  @Column({ name: 'category', length: 50, nullable: true })
  category: string;

  @Column({ name: 'thumbnail_url', type: 'text', nullable: true })
  thumbnailUrl: string;

  @Column({ name: 'preview_images', type: 'jsonb', nullable: true })
  previewImages: string[];

  @Column({ name: 'usage_count', type: 'int', default: 0 })
  usageCount: number;

  @Column({ name: 'is_hot', type: 'boolean', default: false })
  isHot: boolean;
}
