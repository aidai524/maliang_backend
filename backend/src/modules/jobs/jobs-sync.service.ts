import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GenerationsService } from '../generations/generations.service';
import { JobsService } from '../jobs/jobs.service';
import { Generation, GenerationStatus } from '../generations/entities/generation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, In } from 'typeorm';

import { UpdateResult } from 'typeorm';

@Injectable()
export class JobsSyncService {
  private readonly logger = new Logger(JobsSyncService.name);

  constructor(
    private readonly generationsService: GenerationsService,
    private readonly jobsService: JobsService,
    @InjectRepository(Generation)
    private readonly generationRepository: Repository<Generation>,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async syncStuckJobs() {
    this.logger.log('Starting to sync stuck jobs...');
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const stuckJobs = await this.generationRepository.find({
        where: [
          { status: GenerationStatus.PENDING, createdAt: LessThan(oneHourAgo) },
          { status: GenerationStatus.PROCESSING, createdAt: LessThan(oneHourAgo) },
        ],
        order: { createdAt: 'DESC' },
        take: 10,
      });

      if (stuckJobs.length === 0) {
        this.logger.log('No stuck jobs found');
        return;
      }
      this.logger.log(`Found ${stuckJobs.length} stuck jobs to sync`);
      let syncedCount = 0;
      let failedCount = 0;
      for (const job of stuckJobs) {
        if (!job.jobId) {
          this.logger.warn(`Job ${job.id} has no jobId, skipping`);
          continue;
        }
        try {
          await this.jobsService.getJob(job.userId, job.jobId);
          this.logger.log(`✅ Synced job ${job.jobId} (ID: ${job.id})`);
          syncedCount++;
        } catch (error) {
          this.logger.error(`Failed to sync job ${job.jobId}: ${error.message}`);
          failedCount++;
        }
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      this.logger.log(
        `Sync completed: ${syncedCount} synced, ${failedCount} failed`,
      );
    } catch (error) {
      this.logger.error(`Failed to sync stuck jobs: ${error.message}`, error.stack);
    }
  }
  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredJobs() {
    this.logger.log('Starting to cleanup expired jobs...');
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const expiredJobs = await this.generationRepository
        .createQueryBuilder()
        .update(Generation)
        .set({
          status: GenerationStatus.FAILED,
          errorMessage: 'Job timeout (exceeded 24 hours)',
          completedAt: new Date(),
        })
        .where('status IN (:...statuses)', {
          statuses: [GenerationStatus.PENDING, GenerationStatus.PROCESSING],
        })
        .andWhere('createdAt < :date', { date: twentyFourHoursAgo })
        .execute() as UpdateResult;
      if (expiredJobs && expiredJobs.affected > 0) {
        this.logger.log(`Cleaned up ${expiredJobs.affected} expired jobs`);
      }
    } catch (error) {
      this.logger.error(`Failed to cleanup expired jobs: ${error.message}`, error.stack);
    }
  }
}
