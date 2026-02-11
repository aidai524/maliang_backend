import { Injectable, ForbiddenException, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CustomHttpService } from '../../common/providers/custom-http.service';
import { GenerationsService } from '../generations/generations.service';
import { Generation, GenerationStatus } from '../generations/entities/generation.entity';
import { UsersService } from '../users/users.service';
import { CharactersService } from '../characters/characters.service';
import { CreateJobDto } from './dto/create-job.dto';
import axios from 'axios';

// 锁脸提示词前缀（英文，让 AI 更好理解）
const FACE_LOCK_PROMPT_PREFIX = `Please reference the facial features from the following character image and generate an image that matches the requirements. Maintain consistent facial characteristics, face shape, and key features.

Style requirement: `;

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);
  private readonly apiKey: string;

  constructor(
    private readonly httpService: CustomHttpService,
    private readonly configService: ConfigService,
    private readonly generationsService: GenerationsService,
    private readonly usersService: UsersService,
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
   * 创建生成任务
   */
  async createJob(userId: number, dto: CreateJobDto): Promise<any> {
    // 1. 检查用户是否可以生成（限额检查）
    const { canGenerate, reason } = await this.generationsService.canGenerate(userId);
    if (!canGenerate) {
      throw new ForbiddenException(reason);
    }

    // 2. 处理锁脸功能：获取角色照片
    let inputImage: string | undefined = dto.inputImage;
    let finalPrompt = dto.prompt;
    let usedCharacterId: string | undefined;

    if (dto.characterId) {
      try {
        // 获取角色的照片
        const photos = await this.charactersService.getCharacterPhotos(userId, dto.characterId);
        
        if (!photos || photos.length === 0) {
          throw new BadRequestException('Selected character has no photos. Please upload photos first.');
        }

        // 使用第一张照片作为参考图（原图优先，没有则用缩略图）
        const photo = photos[0];
        const imageUrl = photo.originalUrl || photo.thumbnailUrl;
        
        if (imageUrl) {
          // 下载图片并转换为 base64
          inputImage = await this.downloadImageAsBase64(imageUrl, photo.mimeType);
          usedCharacterId = dto.characterId;
          
          // 添加锁脸提示词前缀
          finalPrompt = FACE_LOCK_PROMPT_PREFIX + dto.prompt;
          
          this.logger.log(`Using character ${dto.characterId} photo for face lock`);
        }
      } catch (error) {
        if (error instanceof BadRequestException || error instanceof NotFoundException || error instanceof ForbiddenException) {
          throw error;
        }
        this.logger.error(`Failed to get character photo: ${error.message}`);
        throw new BadRequestException('Failed to load character photo for face lock');
      }
    }

    // 3. 调用第三方 API 创建任务
    const requestBody: any = {
      prompt: finalPrompt,
      negative_prompt: dto.negativePrompt,
      model: dto.model,
      aspect_ratio: dto.aspectRatio,
      resolution: dto.resolution,
      mode: dto.mode || 'final',
      ...dto.params,
    };

    // 如果有参考图片，添加 inputImage 字段
    if (inputImage) {
      requestBody.inputImage = inputImage;
    }

    let thirdPartyResponse: any;
    try {
      thirdPartyResponse = await this.httpService.proxyPost(
        '/v1/images/generate',
        requestBody,
        { headers: this.getAuthHeaders() },
      );
    } catch (error) {
      this.logger.error(`Failed to create job via third-party API: ${error.message}`);
      throw error;
    }

    // 4. 记录到数据库
    const jobId = thirdPartyResponse?.id || thirdPartyResponse?.job_id;
    
    const generation = await this.generationsService.createGeneration(
      userId,
      dto.prompt, // 保存原始提示词（不含锁脸前缀）
      jobId,
      {
        negativePrompt: dto.negativePrompt,
        model: dto.model,
        aspectRatio: dto.aspectRatio,
        resolution: dto.resolution,
        mode: dto.mode,
        characterId: usedCharacterId,
        ...dto.params,
      },
    );

    this.logger.log(`Created job ${jobId} for user ${userId}, generation ID: ${generation.id}${usedCharacterId ? `, character: ${usedCharacterId}` : ''}`);

    return {
      ...thirdPartyResponse,
      generationId: generation.id,
    };
  }

  /**
   * 下载图片并转换为 base64 格式
   */
  private async downloadImageAsBase64(imageUrl: string, mimeType: string = 'image/jpeg'): Promise<string> {
    try {
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000, // 30 秒超时
      });

      const buffer = Buffer.from(response.data);
      const base64 = buffer.toString('base64');
      
      // 返回 data URI 格式
      const actualMimeType = response.headers['content-type'] || mimeType;
      return `data:${actualMimeType};base64,${base64}`;
    } catch (error) {
      this.logger.error(`Failed to download image from ${imageUrl}: ${error.message}`);
      throw new Error('Failed to download character photo');
    }
  }

  /**
   * 获取用户的任务列表
   */
  async listUserJobs(userId: number, page: number = 1, limit: number = 20): Promise<any> {
    const { generations, total } = await this.generationsService.getUserGenerations(
      userId,
      page,
      limit,
    );

    return {
      jobs: generations.map(this.formatGeneration),
      total,
      page,
      limit,
    };
  }

  /**
   * 获取任务详情
   */
  async getJob(userId: number, jobId: string): Promise<any> {
    // 先从第三方 API 获取最新状态
    let thirdPartyResponse: any;
    try {
      thirdPartyResponse = await this.httpService.proxyGet(
        `/v1/jobs/${jobId}`,
        null,
        { headers: this.getAuthHeaders() },
      );
    } catch (error) {
      this.logger.warn(`Failed to get job ${jobId} from third-party API: ${error.message}`);
    }

    // 如果第三方返回了结果，更新本地记录
    if (thirdPartyResponse) {
      const status = this.mapStatus(thirdPartyResponse.status);
      const updates: Partial<Generation> = { status };

      if (thirdPartyResponse.output?.image_url) {
        updates.imageUrl = thirdPartyResponse.output.image_url;
      }
      if (thirdPartyResponse.output?.thumbnail_url) {
        updates.thumbnailUrl = thirdPartyResponse.output.thumbnail_url;
      }
      if (thirdPartyResponse.error) {
        updates.errorMessage = thirdPartyResponse.error;
      }

      await this.generationsService.updateGenerationByJobId(jobId, updates);
    }

    return thirdPartyResponse;
  }

  /**
   * 取消任务
   */
  async cancelJob(userId: number, jobId: string): Promise<any> {
    // 调用第三方 API 取消任务
    const response = await this.httpService.proxyDelete(
      `/v1/jobs/${jobId}`,
      { headers: this.getAuthHeaders() },
    );

    // 更新本地记录状态
    await this.generationsService.updateGenerationByJobId(jobId, {
      status: GenerationStatus.FAILED,
      errorMessage: 'Cancelled by user',
    });

    return response;
  }

  /**
   * 获取用户配额信息
   */
  async getUserQuota(userId: number): Promise<any> {
    const user = await this.usersService.findById(userId);
    const stats = await this.generationsService.getUserGenerationStats(userId, user.vipLevel);

    return {
      vipLevel: user.vipLevel,
      dailyLimit: stats.dailyLimit,
      todayUsed: stats.todayGenerations,
      todayRemaining: stats.todayRemaining,
      totalGenerations: stats.totalGenerations,
    };
  }

  /**
   * 映射第三方状态到本地状态
   */
  private mapStatus(thirdPartyStatus: string): GenerationStatus {
    const statusMap: Record<string, GenerationStatus> = {
      pending: GenerationStatus.PENDING,
      processing: GenerationStatus.PROCESSING,
      completed: GenerationStatus.COMPLETED,
      succeeded: GenerationStatus.COMPLETED,
      failed: GenerationStatus.FAILED,
      cancelled: GenerationStatus.FAILED,
    };
    return statusMap[thirdPartyStatus?.toLowerCase()] || GenerationStatus.PENDING;
  }

  /**
   * 格式化 generation 记录
   */
  private formatGeneration(gen: Generation): any {
    return {
      id: gen.id,
      jobId: gen.jobId,
      prompt: gen.prompt,
      status: gen.status,
      imageUrl: gen.imageUrl,
      thumbnailUrl: gen.thumbnailUrl,
      createdAt: gen.createdAt,
      completedAt: gen.completedAt,
    };
  }
}
