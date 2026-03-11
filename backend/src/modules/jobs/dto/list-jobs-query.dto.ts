import { IsOptional, IsString } from 'class-validator';

export class ListJobsQueryDto {
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
  @IsString()
  characterId?: string;

  @IsOptional()
  @IsString()
  createdAfter?: string;

  @IsOptional()
  @IsString()
  createdBefore?: string;
}
