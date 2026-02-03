import { IsString, IsOptional, IsObject } from 'class-validator';

export class WechatLoginDto {
  @IsString()
  code: string;

  // 新版：手机号授权返回的 code（推荐）
  @IsOptional()
  @IsString()
  phoneCode?: string;

  // 旧版：加密数据（用于获取手机号等敏感信息）
  @IsOptional()
  @IsString()
  encryptedData?: string;

  // 旧版：加密算法初始向量
  @IsOptional()
  @IsString()
  iv?: string;

  @IsOptional()
  @IsObject()
  userInfo?: {
    nickName?: string;
    avatarUrl?: string;
  };
}
