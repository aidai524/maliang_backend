import { Injectable, BadRequestException, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CustomHttpService } from '../../common/providers/custom-http.service';
import { CharactersService } from '../characters/characters.service';
import axios from 'axios';

// 锁脸提示词前缀（英文，让 AI 更好理解）
const FACE_LOCK_PROMPT_PREFIX = `Please reference the facial features from the following character image and generate an image that matches the requirements. Maintain consistent facial characteristics, face shape, and key features.

Style requirement: `;

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);
  private readonly apiKey: string;

  constructor(
    private readonly httpService: CustomHttpService,
    private readonly configService: ConfigService,
    private readonly charactersService: CharactersService,
  ) {
    const config = this.configService.get('app');
    this.apiKey = config.thirdPartyApi.apiKey;
  }

  private getAuthHeaders() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * 下载图片并转换为 base64 格式
   */
  private async downloadImageAsBase64(imageUrl: string, mimeType: string = 'image/jpeg'): Promise<string> {
    try {
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
      });

      const buffer = Buffer.from(response.data);
      const base64 = buffer.toString('base64');
      
      const actualMimeType = response.headers['content-type'] || mimeType;
      return `data:${actualMimeType};base64,${base64}`;
    } catch (error) {
      this.logger.error(`Failed to download image from ${imageUrl}: ${error.message}`);
      throw new Error('Failed to download character photo');
    }
  }

  async proxyImageGeneration(userId: number | null, generateDto: any): Promise<any> {
    const url = '/v1/images/generate';
    
    this.logger.log(`proxyImageGeneration called - userId: ${userId}, characterId: ${generateDto.characterId}`);
    
    // 处理锁脸功能
    let inputImage: string | undefined = generateDto.inputImage;
    let finalPrompt = generateDto.prompt;

    if (generateDto.characterId && userId) {
      try {
        // 获取角色的照片
        const photos = await this.charactersService.getCharacterPhotos(userId, generateDto.characterId);
        
        if (!photos || photos.length === 0) {
          throw new BadRequestException('Selected character has no photos. Please upload photos first.');
        }

        // 使用第一张照片作为参考图
        const photo = photos[0];
        const imageUrl = photo.originalUrl || photo.thumbnailUrl;
        
        if (imageUrl) {
          inputImage = await this.downloadImageAsBase64(imageUrl, photo.mimeType);
          finalPrompt = FACE_LOCK_PROMPT_PREFIX + generateDto.prompt;
          
          this.logger.log(`Using character ${generateDto.characterId} photo for face lock`);
        }
      } catch (error) {
        if (error instanceof BadRequestException || error instanceof NotFoundException || error instanceof ForbiddenException) {
          throw error;
        }
        this.logger.error(`Failed to get character photo: ${error.message}`);
        throw new BadRequestException('Failed to load character photo for face lock');
      }
    }

    // 构建请求体
    const requestBody: any = {
      ...generateDto,
      prompt: finalPrompt,
    };

    // 如果有参考图片，添加 inputImage 字段
    if (inputImage) {
      requestBody.inputImage = inputImage;
    }

    // 移除 characterId，不需要传给第三方
    delete requestBody.characterId;

    // 调试日志：打印实际发送的请求体（不打印完整 base64）
    const debugBody = { ...requestBody };
    if (debugBody.inputImage) {
      debugBody.inputImage = `${debugBody.inputImage.substring(0, 50)}...(${debugBody.inputImage.length} chars)`;
    }
    this.logger.log(`Sending to third-party API: ${JSON.stringify(debugBody)}`);

    return await this.httpService.proxyPost(url, requestBody, {
      headers: this.getAuthHeaders(),
    });
  }

  async proxyGetJobs(
    authHeader: string,
    status?: string,
    limit?: number,
    cursor?: string,
  ): Promise<any> {
    const params: any = {};
    if (status) params.status = status;
    if (limit) params.limit = limit;
    if (cursor) params.cursor = cursor;

    const url = '/v1/jobs';
    return await this.httpService.proxyGet(url, params, {
      headers: this.getAuthHeaders(),
    });
  }

  async proxyGetJob(authHeader: string, jobId: string): Promise<any> {
    const url = `/v1/jobs/${jobId}`;
    return await this.httpService.proxyGet(url, null, {
      headers: this.getAuthHeaders(),
    });
  }

  async proxyCancelJob(authHeader: string, jobId: string): Promise<any> {
    const url = `/v1/jobs/${jobId}`;
    return await this.httpService.proxyDelete(url, {
      headers: this.getAuthHeaders(),
    });
  }
}
