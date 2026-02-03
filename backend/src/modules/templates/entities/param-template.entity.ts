import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('param_templates')
@Index('idx_param_templates_template_id', ['templateId'], { unique: true })
export class ParamTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'template_id', length: 50, unique: true })
  templateId: string;

  @Column({ name: 'title', length: 100 })
  title: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'thumbnail_url', type: 'text', nullable: true })
  thumbnailUrl: string;

  @Column({ name: 'preview_images', type: 'jsonb', nullable: true })
  previewImages: string[];

  @Column({ name: 'mode', length: 20, nullable: true })
  mode: string;

  @Column({ name: 'resolution', length: 20, nullable: true })
  resolution: string;

  @Column({ name: 'aspect_ratio', length: 20, nullable: true })
  aspectRatio: string;

  @Column({ name: 'sample_count', type: 'int', nullable: true })
  sampleCount: number;
}
