import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GalleryImage } from './entities/gallery-image.entity';

@Injectable()
export class GalleryService {
  private readonly logger = new Logger(GalleryService.name);

  constructor(
    @InjectRepository(GalleryImage)
    private readonly galleryRepository: Repository<GalleryImage>,
  ) {}

  async getGalleryImages(
    category?: string,
    tag?: string,
    limit: number = 20,
    page: number = 1,
  ): Promise<{ items: GalleryImage[]; hasMore: boolean; total: number }> {
    const queryBuilder = this.galleryRepository
      .createQueryBuilder('image')
      .orderBy('image.createdAt', 'DESC')
      .take(limit + 1)
      .skip((page - 1) * limit);

    if (category && category !== 'all') {
      queryBuilder.andWhere('image.categoryId = :categoryId', { categoryId: category });
    }

    const items = await queryBuilder.getMany();
    const hasMore = items.length > limit;

    if (hasMore) {
      items.pop();
    }

    const total = await this.galleryRepository.count();

    return { items, hasMore, total };
  }

  async getCategories(): Promise<Array<{ id: string; name: string; icon: string }>> {
    return [
      { id: 'all', name: 'All', icon: 'grid' },
      { id: 'portrait', name: 'Portrait', icon: 'user' },
      { id: 'landscape', name: 'Landscape', icon: 'image' },
      { id: 'cartoon', name: 'Cartoon', icon: 'smile' },
      { id: 'abstract', name: 'Abstract', icon: 'apps' },
    ];
  }

  async likeImage(imageId: number, userId: number): Promise<{ liked: boolean; totalLikes: number }> {
    const image = await this.galleryRepository.findOne({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundException(`Image with ID ${imageId} not found`);
    }

    image.likes += 1;
    await this.galleryRepository.save(image);

    this.logger.log(`User ${userId} liked image ${imageId}`);

    return { liked: true, totalLikes: image.likes };
  }

  async unlikeImage(imageId: number, userId: number): Promise<{ liked: boolean; totalLikes: number }> {
    const image = await this.galleryRepository.findOne({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundException(`Image with ID ${imageId} not found`);
    }

    if (image.likes > 0) {
      image.likes -= 1;
      await this.galleryRepository.save(image);
    }

    this.logger.log(`User ${userId} unliked image ${imageId}`);

    return { liked: false, totalLikes: image.likes };
  }

  async publishToGallery(
    userId: number,
    jobId: string,
    categoryId: string,
    tags?: string[],
  ): Promise<GalleryImage> {
    const image = this.galleryRepository.create({
      imageUrl: `https://assets.example.com/${jobId}/image.png`,
      thumbnailUrl: `https://assets.example.com/${jobId}/thumb.png`,
      prompt: 'Generated image',
      categoryId,
      authorId: userId,
      likes: 0,
    });

    await this.galleryRepository.save(image);

    this.logger.log(`Published image to gallery: ${image.id}`);

    return image;
  }
}
