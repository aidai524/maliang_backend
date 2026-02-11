import { IsString, IsOptional, IsObject, IsNumber } from 'class-validator';

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

  // 角色 ID 或 UUID，用于锁脸功能（支持数字 ID 或字符串 UUID）
  @IsOptional()
  characterId?: string | number;

  // 直接传入参考图片 (data:image/...;base64,...)
  @IsOptional()
  @IsString()
  inputImage?: string;

  @IsOptional()
  @IsObject()
  params?: Record<string, any>;
}
