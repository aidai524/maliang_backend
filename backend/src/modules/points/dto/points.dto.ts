import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class PointsBalanceDto {}

export class PointsRechargeDto {
  @IsInt()
  @Type(() => Number)
  amount: number;

  @IsString()
  paymentMethod: string;
}

export class PointsTransactionsQueryDto {
  @IsString()
  @IsOptional()
  type?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;
}
