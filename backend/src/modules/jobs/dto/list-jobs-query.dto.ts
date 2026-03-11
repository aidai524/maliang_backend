import { IsOptional, IsString, IsIn } from 'class-validator';

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
  @IsDateString()
  createdAfter?: string;

  @IsOptional()
  @IsDateString()
  createdBefore?: string;
}
