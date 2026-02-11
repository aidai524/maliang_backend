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
  @IsString()
  mode?: string;

  // 角色 UUID，用于锁脸功能
  @IsOptional()
  @IsString()
  characterId?: string;

  // 直接传入参考图片 (data:image/...;base64,...)
  @IsOptional()
  @IsString()
  inputImage?: string;

  @IsOptional()
  @IsObject()
  params?: Record<string, any>;
}
