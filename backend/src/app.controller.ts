import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@Controller()
@ApiTags('App')
export class AppController {
  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  async healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'dream-wechat-backend',
    };
  }

  @Get()
  @ApiOperation({ summary: 'API root endpoint' })
  @ApiBearerAuth()
  async getRoot() {
    return {
      message: 'Welcome to Dream WeChat Backend API',
      version: '1.0.0',
      docs: '/api/docs',
    };
  }
}
