import { IsString, IsOptional, MaxLength, IsUrl, IsInt, IsNumber } from 'class-validator';

// 创建角色
export class CreateCharacterDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

// 更新角色
export class UpdateCharacterDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

// 添加照片（URL 方式 - 已上传的图片）
export class AddPhotoDto {
  @IsString()
  @IsUrl()
  thumbnailUrl: string;

  @IsString()
  @IsUrl()
  originalUrl: string;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsNumber()
  thumbnailSize?: number;

  @IsOptional()
  @IsNumber()
  originalSize?: number;
}

// 上传照片（Base64 方式 - 直接上传到 R2）
export class UploadPhotoDto {
  // 缩略图 base64 数据（不含 data:image/xxx;base64, 前缀）
  @IsString()
  thumbnailData: string;

  // 原图 base64 数据（可选，不传则使用 thumbnailData）
  @IsOptional()
  @IsString()
  originalData?: string;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsInt()
  thumbnailSize?: number;

  @IsOptional()
  @IsInt()
  originalSize?: number;
}
