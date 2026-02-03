import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class R2StorageService {
  private readonly logger = new Logger(R2StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly publicUrl: string;

  constructor(private readonly configService: ConfigService) {
    const config = this.configService.get('app');
    const r2Config = config.r2;

    this.bucketName = r2Config.bucketName;
    this.publicUrl = r2Config.publicUrl;

    // R2 使用 S3 兼容 API
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${r2Config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: r2Config.accessKeyId,
        secretAccessKey: r2Config.secretAccessKey,
      },
    });

    this.logger.log('R2 Storage Service initialized');
  }

  /**
   * 上传文件到 R2
   * @param buffer 文件内容
   * @param key 存储路径 (如: characters/userId/charId/photoId.jpg)
   * @param contentType MIME 类型
   * @returns 公开访问 URL
   */
  async uploadFile(
    buffer: Buffer,
    key: string,
    contentType: string = 'image/jpeg',
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      });

      await this.s3Client.send(command);

      const url = `${this.publicUrl}/${key}`;
      this.logger.log(`Uploaded file to R2: ${key}`);

      return url;
    } catch (error) {
      this.logger.error(`Failed to upload to R2: ${error.message}`);
      throw error;
    }
  }

  /**
   * 上传角色照片（缩略图 + 原图）
   * @param userId 用户 ID
   * @param characterId 角色 UUID
   * @param thumbnailBuffer 缩略图 Buffer
   * @param originalBuffer 原图 Buffer
   * @param mimeType MIME 类型
   * @returns { thumbnailUrl, originalUrl, photoId }
   */
  async uploadCharacterPhoto(
    userId: number,
    characterId: string,
    thumbnailBuffer: Buffer,
    originalBuffer: Buffer,
    mimeType: string = 'image/jpeg',
  ): Promise<{ thumbnailUrl: string; originalUrl: string; photoId: string }> {
    const photoId = uuidv4();
    const ext = mimeType === 'image/png' ? 'png' : 'jpg';

    const basePath = `characters/${userId}/${characterId}`;
    const thumbnailKey = `${basePath}/${photoId}_thumb.${ext}`;
    const originalKey = `${basePath}/${photoId}_original.${ext}`;

    // 并行上传缩略图和原图
    const [thumbnailUrl, originalUrl] = await Promise.all([
      this.uploadFile(thumbnailBuffer, thumbnailKey, mimeType),
      this.uploadFile(originalBuffer, originalKey, mimeType),
    ]);

    return { thumbnailUrl, originalUrl, photoId };
  }

  /**
   * 删除文件
   * @param key 存储路径
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`Deleted file from R2: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete from R2: ${error.message}`);
      throw error;
    }
  }

  /**
   * 从 URL 中提取 key
   */
  extractKeyFromUrl(url: string): string {
    if (url.startsWith(this.publicUrl)) {
      return url.replace(`${this.publicUrl}/`, '');
    }
    return url;
  }

  /**
   * 删除角色照片（缩略图 + 原图）
   */
  async deleteCharacterPhoto(thumbnailUrl: string, originalUrl: string): Promise<void> {
    await Promise.all([
      this.deleteFile(this.extractKeyFromUrl(thumbnailUrl)),
      this.deleteFile(this.extractKeyFromUrl(originalUrl)),
    ]);
  }
}
