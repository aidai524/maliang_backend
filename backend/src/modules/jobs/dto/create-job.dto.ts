import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateJobDto {
  @IsString()
  prompt: string;

  @IsOptional()
  @IsString()
  negativePrompt?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  aspectRatio?: string;

  @IsOptional()
  @IsString()
  resolution?: string;

  @IsOptional()
  @IsObject()
  params?: Record<string, any>;
}
