import { IsString, IsOptional, IsBoolean, IsInt, IsArray, Min } from 'class-validator';

// 创建提示词模板 DTO
export class CreatePromptTemplateDto {
  @IsString()
  templateId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  prompt: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  previewImages?: string[];

  @IsOptional()
  @IsBoolean()
  isHot?: boolean;
}

// 创建参数模板 DTO
export class CreateParamTemplateDto {
  @IsString()
  templateId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  previewImages?: string[];

  @IsOptional()
  @IsString()
  mode?: string;

  @IsOptional()
  @IsString()
  resolution?: string;

  @IsOptional()
  @IsString()
  aspectRatio?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  sampleCount?: number;
}

// 更新提示词模板 DTO（所有字段可选，除了 templateId）
export class UpdatePromptTemplateDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  prompt?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  previewImages?: string[];

  @IsOptional()
  @IsBoolean()
  isHot?: boolean;
}

// 更新参数模板 DTO
export class UpdateParamTemplateDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  previewImages?: string[];

  @IsOptional()
  @IsString()
  mode?: string;

  @IsOptional()
  @IsString()
  resolution?: string;

  @IsOptional()
  @IsString()
  aspectRatio?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  sampleCount?: number;
}
