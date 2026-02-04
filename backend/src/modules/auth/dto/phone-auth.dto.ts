import { IsString, IsOptional, Matches, Length } from 'class-validator';

export class SendCodeDto {
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: 'Invalid phone number format' })
  phone: string;
}

export class PhoneLoginDto {
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: 'Invalid phone number format' })
  phone: string;

  @IsString()
  @Length(6, 6, { message: 'Verification code must be 6 digits' })
  code: string;

  @IsOptional()
  @IsString()
  nickName?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}

export class BindAccountDto {
  @IsString()
  action: 'bind' | 'keep_separate';

  @IsOptional()
  @IsString()
  preferAccount?: 'phone' | 'wechat'; // 合并时保留哪个账号的数据
}

export interface AccountConflictInfo {
  conflictType: 'phone_exists' | 'wechat_exists';
  existingAccount: {
    id: number;
    nickName: string | null;
    avatarUrl: string | null;
    vipLevel: string;
    createdAt: Date;
  };
  message: string;
}
