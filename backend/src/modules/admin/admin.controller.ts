import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { AdminService } from './admin.service';
import { UpdateUserVipDto, UpdateUserDto } from './dto/admin.dto';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(AdminAuthGuard)
@ApiHeader({ name: 'X-Admin-Key', description: 'Admin API Key', required: true })
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ========== 用户管理 ==========

  @Get('users')
  @ApiOperation({ summary: 'List all users (Admin)' })
  async listUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('search') search?: string,
  ): Promise<{ users: any[]; total: number; page: number; limit: number }> {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 20, 100);

    const { users, total } = await this.adminService.listUsers(pageNum, limitNum, search);
    return { users, total, page: pageNum, limit: limitNum };
  }

  @Get('users/:userId')
  @ApiOperation({ summary: 'Get user detail (Admin)' })
  async getUserDetail(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<{ user: any }> {
    const user = await this.adminService.getUserById(userId);
    return { user };
  }

  @Put('users/:userId')
  @ApiOperation({ summary: 'Update user info (Admin)' })
  async updateUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: UpdateUserDto,
  ): Promise<{ user: any }> {
    const user = await this.adminService.updateUser(userId, dto);
    return { user };
  }

  @Delete('users/:userId')
  @ApiOperation({ summary: 'Delete user (Admin)' })
  async deleteUser(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<{ message: string }> {
    await this.adminService.deleteUser(userId);
    return { message: `User ${userId} deleted` };
  }

  // ========== VIP 管理 ==========

  @Put('users/:userId/vip')
  @ApiOperation({ summary: 'Set user VIP (Admin)' })
  async setUserVip(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: UpdateUserVipDto,
  ): Promise<{ user: any; message: string }> {
    const user = await this.adminService.setUserVip(userId, dto);
    return { user, message: 'VIP updated successfully' };
  }

  @Delete('users/:userId/vip')
  @ApiOperation({ summary: 'Cancel user VIP (Admin)' })
  async cancelUserVip(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<{ user: any; message: string }> {
    const user = await this.adminService.cancelUserVip(userId);
    return { user, message: 'VIP cancelled' };
  }

  // ========== 统计信息 ==========

  @Get('stats')
  @ApiOperation({ summary: 'Get admin dashboard stats (Admin)' })
  async getStats(): Promise<any> {
    return await this.adminService.getDashboardStats();
  }
}
