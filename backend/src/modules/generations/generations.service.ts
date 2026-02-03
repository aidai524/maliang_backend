import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Generation, GenerationStatus } from './entities/generation.entity';
import { User, VipLevel } from '../users/entities/user.entity';

export interface DailyLimits {
  NORMAL: number;
  VIP: number;
  SVIP: number;
}

export interface GenerationStats {
  totalGenerations: number;
  todayGenerations: number;
  todayRemaining: number;
  dailyLimit: number;
}

@Injectable()
export class GenerationsService {
  private readonly logger = new Logger(GenerationsService.name);

  constructor(
    @InjectRepository(Generation)
    private readonly generationRepository: Repository<Generation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 获取每日生成限额配置
   */
  getDailyLimits(): DailyLimits {
    const config = this.configService.get('app.generation') || {};
    return {
      NORMAL: config.dailyLimitNormal || 2,
      VIP: config.dailyLimitVip || 20,
      SVIP: config.dailyLimitSvip || 100,
    };
  }

  /**
   * 获取用户的每日限额
   */
  getUserDailyLimit(vipLevel: VipLevel): number {
    const limits = this.getDailyLimits();
    return limits[vipLevel] || limits.NORMAL;
  }

  /**
   * 获取今天的开始时间（本地时间 00:00:00）
   */
  private getTodayStart(): Date {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return todayStart;
  }

  /**
   * 获取用户今日已生成数量
   */
  async getTodayGenerationCount(userId: number): Promise<number> {
    const todayStart = this.getTodayStart();

    const count = await this.generationRepository.count({
      where: {
        userId,
        createdAt: MoreThanOrEqual(todayStart),
      },
    });

    return count;
  }

  /**
   * 获取用户累计生成数量
   */
  async getTotalGenerationCount(userId: number): Promise<number> {
    return await this.generationRepository.count({
      where: { userId },
    });
  }

  /**
   * 获取用户生成统计
   */
  async getUserGenerationStats(userId: number, vipLevel: VipLevel): Promise<GenerationStats> {
    const [totalGenerations, todayGenerations] = await Promise.all([
      this.getTotalGenerationCount(userId),
      this.getTodayGenerationCount(userId),
    ]);

    const dailyLimit = this.getUserDailyLimit(vipLevel);
    const todayRemaining = Math.max(0, dailyLimit - todayGenerations);

    return {
      totalGenerations,
      todayGenerations,
      todayRemaining,
      dailyLimit,
    };
  }

  /**
   * 检查用户是否可以生成
   */
  async canGenerate(userId: number): Promise<{ canGenerate: boolean; reason?: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return { canGenerate: false, reason: 'User not found' };
    }

    // 检查 VIP 是否过期
    let effectiveVipLevel = user.vipLevel;
    if (user.vipLevel !== VipLevel.NORMAL && user.vipExpireAt) {
      if (new Date(user.vipExpireAt) < new Date()) {
        effectiveVipLevel = VipLevel.NORMAL;
      }
    }

    const todayCount = await this.getTodayGenerationCount(userId);
    const dailyLimit = this.getUserDailyLimit(effectiveVipLevel);

    if (todayCount >= dailyLimit) {
      return {
        canGenerate: false,
        reason: `Daily limit reached (${todayCount}/${dailyLimit})`,
      };
    }

    return { canGenerate: true };
  }

  /**
   * 创建生成记录
   */
  async createGeneration(
    userId: number,
    prompt: string,
    jobId?: string,
    params?: Record<string, any>,
  ): Promise<Generation> {
    // 检查是否可以生成
    const { canGenerate, reason } = await this.canGenerate(userId);
    if (!canGenerate) {
      throw new ForbiddenException(reason);
    }

    const generation = this.generationRepository.create({
      userId,
      prompt,
      jobId,
      params,
      status: GenerationStatus.PENDING,
    });

    await this.generationRepository.save(generation);
    this.logger.log(`Created generation ${generation.id} for user ${userId}`);

    return generation;
  }

  /**
   * 更新生成记录状态
   */
  async updateGeneration(
    generationId: number,
    updates: Partial<Generation>,
  ): Promise<Generation> {
    const generation = await this.generationRepository.findOne({
      where: { id: generationId },
    });

    if (!generation) {
      throw new Error(`Generation ${generationId} not found`);
    }

    Object.assign(generation, updates);

    if (updates.status === GenerationStatus.COMPLETED) {
      generation.completedAt = new Date();
    }

    await this.generationRepository.save(generation);
    return generation;
  }

  /**
   * 根据 jobId 更新生成记录
   */
  async updateGenerationByJobId(
    jobId: string,
    updates: Partial<Generation>,
  ): Promise<Generation | null> {
    const generation = await this.generationRepository.findOne({
      where: { jobId },
    });

    if (!generation) {
      this.logger.warn(`Generation with jobId ${jobId} not found`);
      return null;
    }

    Object.assign(generation, updates);

    if (updates.status === GenerationStatus.COMPLETED) {
      generation.completedAt = new Date();
    }

    await this.generationRepository.save(generation);
    return generation;
  }

  /**
   * 获取用户的生成历史
   */
  async getUserGenerations(
    userId: number,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ generations: Generation[]; total: number }> {
    const [generations, total] = await this.generationRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { generations, total };
  }
}
