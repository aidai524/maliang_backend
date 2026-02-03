import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GalleryService } from './gallery.service';
import { GalleryImage } from './entities/gallery-image.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Gallery')
@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Get('images')
  @ApiOperation({ summary: 'Get gallery images' })
  async getImages(
    @Query('category') category?: string,
    @Query('tag') tag?: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
  ): Promise<any> {
    return await this.galleryService.getGalleryImages(category, tag, limit, page);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get image categories' })
  async getCategories(): Promise<any> {
    return { categories: await this.galleryService.getCategories() };
  }

  @Post('images/:imageId/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Like an image' })
  async likeImage(
    @Request() req: any,
    @Param('imageId', ParseIntPipe) imageId: number,
  ): Promise<any> {
    const userId = req.user.userId;
    return await this.galleryService.likeImage(imageId, userId);
  }

  @Delete('images/:imageId/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unlike an image' })
  async unlikeImage(
    @Request() req: any,
    @Param('imageId', ParseIntPipe) imageId: number,
  ): Promise<any> {
    const userId = req.user.userId;
    return await this.galleryService.unlikeImage(imageId, userId);
  }

  @Post('publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish image to gallery' })
  async publishImage(
    @Request() req: any,
    @Body() publishDto: { jobId: string; categoryId: string; tags?: string[] },
  ): Promise<any> {
    const userId = req.user.userId;
    return await this.galleryService.publishToGallery(
      userId,
      publishDto.jobId,
      publishDto.categoryId,
      publishDto.tags,
    );
  }
}
