import { IsString } from 'class-validator';

export class CreateFavoriteDto {
  @IsString()
  type: string;

  @IsString()
  resourceId: string;
}

export class RemoveFavoriteDto {}
