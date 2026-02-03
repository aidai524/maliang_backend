import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';

@ApiTags('Jobs')
@ApiBearerAuth()
@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new image generation job' })
  async createJob(
    @Request() req: any,
    @Body() createJobDto: CreateJobDto,
  ): Promise<any> {
    const userId = req.user.userId;
    return await this.jobsService.createJob(userId, createJobDto);
  }

  @Get()
  @ApiOperation({ summary: 'List user jobs' })
  async listJobs(
    @Request() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ): Promise<any> {
    const userId = req.user.userId;
    return await this.jobsService.listUserJobs(userId, page, limit);
  }

  @Get('quota')
  @ApiOperation({ summary: 'Get user daily quota info' })
  async getQuota(@Request() req: any): Promise<any> {
    const userId = req.user.userId;
    return await this.jobsService.getUserQuota(userId);
  }

  @Get(':jobId')
  @ApiOperation({ summary: 'Get job detail' })
  async getJob(
    @Request() req: any,
    @Param('jobId') jobId: string,
  ): Promise<any> {
    const userId = req.user.userId;
    return await this.jobsService.getJob(userId, jobId);
  }

  @Delete(':jobId')
  @ApiOperation({ summary: 'Cancel a job' })
  async cancelJob(
    @Request() req: any,
    @Param('jobId') jobId: string,
  ): Promise<any> {
    const userId = req.user.userId;
    return await this.jobsService.cancelJob(userId, jobId);
  }
}
