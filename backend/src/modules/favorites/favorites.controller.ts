import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  Param,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/favorite.dto';
import { Favorite, FavoriteType } from './entities/favorite.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Favorites')
@ApiBearerAuth()
@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  @ApiOperation({ summary: 'Add to favorites' })
  async createFavorite(
    @Request() req: any,
    @Body() createDto: CreateFavoriteDto,
  ): Promise<Favorite> {
    const userId = req.user.userId;
    return await this.favoritesService.create(userId, createDto.type, createDto.resourceId);
  }

  @Delete(':favoriteId')
  @ApiOperation({ summary: 'Remove from favorites' })
  async removeFavorite(
    @Request() req: any,
    @Param('favoriteId', ParseIntPipe) favoriteId: number,
  ): Promise<{ message: string }> {
    const userId = req.user.userId;
    await this.favoritesService.remove(favoriteId, userId);
    return { message: 'Favorite removed' };
  }

  @Get()
  @ApiOperation({ summary: 'Get user favorites' })
  async getUserFavorites(
    @Request() req: any,
    @Query('type') type?: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
  ): Promise<{ items: Favorite[]; total: number }> {
    const userId = req.user.userId;
    return await this.favoritesService.getUserFavorites(userId, type, limit, page);
  }

  @Get('check')
  @ApiOperation({ summary: 'Check if item is favorited' })
  async checkFavorite(
    @Request() req: any,
    @Query('type') type: string,
    @Query('resourceId') resourceId: string,
  ): Promise<{ isFavorited: boolean; favoriteId?: number }> {
    const userId = req.user.userId;
    return await this.favoritesService.checkIsFavorited(userId, type, resourceId);
  }
}
