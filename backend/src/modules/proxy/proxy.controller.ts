import { Controller, Post, Get, Delete, Headers, Body, Query, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProxyService } from './proxy.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Proxy')
@ApiBearerAuth()
@Controller('proxy')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Post('images/generate')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Generate image (proxy to third-party API, supports face-lock)' })
  async generateImage(
    @Request() req: any,
    @Body() generateDto: any,
  ): Promise<any> {
    const userId = req.user?.id || null;
    return await this.proxyService.proxyImageGeneration(userId, generateDto);
  }

  @Get('jobs')
  @ApiOperation({ summary: 'List jobs (proxy to third-party API)' })
  async getJobs(
    @Headers('Authorization') authHeader: string,
    @Query('status') status?: string,
    @Query('limit') limit?: number,
    @Query('cursor') cursor?: string,
  ): Promise<any> {
    return await this.proxyService.proxyGetJobs(authHeader, status, limit, cursor);
  }

  @Get('jobs/:jobId')
  @ApiOperation({ summary: 'Get job detail (proxy to third-party API)' })
  async getJob(
    @Headers('Authorization') authHeader: string,
    @Param('jobId') jobId: string,
  ): Promise<any> {
    return await this.proxyService.proxyGetJob(authHeader, jobId);
  }

  @Delete('jobs/:jobId')
  @ApiOperation({ summary: 'Cancel job (proxy to third-party API)' })
  async cancelJob(
    @Headers('Authorization') authHeader: string,
    @Param('jobId') jobId: string,
  ): Promise<any> {
    return await this.proxyService.proxyCancelJob(authHeader, jobId);
  }
}
