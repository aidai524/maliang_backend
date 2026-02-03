import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from '../../common/providers/redis.service';
import { VipPlan } from './entities/vip-plan.entity';

@Injectable()
export class VipService {
  private readonly logger = new Logger(VipService.name);
  private readonly cachePrefix = 'vip_plan';
  private readonly cacheTTL = 7200;

  constructor(
    @InjectRepository(VipPlan)
    private readonly vipPlanRepository: Repository<VipPlan>,
    private readonly redisService: RedisService,
  ) {}

  async findAll(): Promise<VipPlan[]> {
    const cacheKey = `${this.cachePrefix}:all`;

    const cached = await this.redisService.getJson<VipPlan[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const plans = await this.vipPlanRepository.find({
      order: { duration: 'ASC' },
    });

    await this.redisService.setexJson(cacheKey, this.cacheTTL, plans);

    return plans;
  }

  async findByPlanId(planId: string): Promise<VipPlan> {
    const plan = await this.vipPlanRepository.findOne({
      where: { planId },
    });

    if (!plan) {
      throw new NotFoundException(`VIP plan ${planId} not found`);
    }

    return plan;
  }

  async getVipInfo(userId: number, userVipLevel: string, userVipExpireAt: Date | null): Promise<any> {
    const allPlans = await this.findAll();

    const benefits = this.getBenefitsForLevel(userVipLevel);

    const now = new Date();
    const remainingDays = userVipExpireAt && userVipExpireAt > now
      ? Math.ceil((userVipExpireAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      vipLevel: userVipLevel,
      vipExpireAt: userVipExpireAt,
      remainingDays,
      plans: allPlans,
      benefits,
      quota: this.getQuotaForLevel(userVipLevel),
    };
  }

  private getBenefitsForLevel(level: string): string[] {
    const benefitsMap: Record<string, string[]> = {
      NORMAL: ['basic_generation', 'daily_limit_5', 'history_retention_30days'],
      VIP: ['unlimited_generation', 'high_quality', '2k_resolution', 'priority_queue', 'history_retention_permanent'],
      SVIP: ['all_vip_benefits', '4k_resolution', 'exclusive_features', 'priority_support'],
    };

    return benefitsMap[level] || benefitsMap.NORMAL;
  }

  private getQuotaForLevel(level: string): any {
    const quotaMap: Record<string, any> = {
      NORMAL: {
        dailyGenerations: { used: 0, limit: 5 },
        monthlyGenerations: { used: 0, limit: 100 },
        totalRemaining: 95,
      },
      VIP: {
        dailyGenerations: { used: 0, limit: 999999 },
        monthlyGenerations: { used: 0, limit: 999999 },
        totalRemaining: 999999,
      },
      SVIP: {
        dailyGenerations: { used: 0, limit: 999999 },
        monthlyGenerations: { used: 0, limit: 999999 },
        totalRemaining: 999999,
      },
    };

    return quotaMap[level] || quotaMap.NORMAL;
  }
}
