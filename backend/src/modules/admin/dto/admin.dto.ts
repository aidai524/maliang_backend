import { IsString, IsOptional, IsIn, IsDateString, IsInt, Min } from 'class-validator';

// VIP 等级值
const VIP_LEVELS = ['NORMAL', 'VIP', 'SVIP'] as const;

// 更新用户 VIP
export class UpdateUserVipDto {
  @IsIn(VIP_LEVELS)
  vipLevel: 'NORMAL' | 'VIP' | 'SVIP';

  // VIP 到期时间（ISO 8601 格式）
  @IsOptional()
  @IsDateString()
  vipExpireAt?: string;

  // 赠送天数（会自动计算到期时间）
  @IsOptional()
  @IsInt()
  @Min(1)
  days?: number;
}

// 更新用户信息
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  nickName?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  pointsBalance?: number;
}
