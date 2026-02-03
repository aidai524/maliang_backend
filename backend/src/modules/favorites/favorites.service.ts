import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from '../../common/providers/redis.service';
import { Favorite } from './entities/favorite.entity';

@Injectable()
export class FavoritesService {
  private readonly logger = new Logger(FavoritesService.name);
  private readonly cachePrefix = 'favorite';
  private readonly cacheTTL = 3600;

  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    private readonly redisService: RedisService,
  ) {}

  async create(userId: number, type: string, resourceId: string): Promise<Favorite> {
    this.logger.log(`Creating favorite: userId=${userId}, type=${type}, resourceId=${resourceId}`);

    const existing = await this.favoriteRepository.findOne({
      where: { userId, type, resourceId },
    });

    if (existing) {
      this.logger.log('Favorite already exists');
      return existing;
    }

    const favorite = this.favoriteRepository.create({
      userId,
      type,
      resourceId,
    });

    await this.favoriteRepository.save(favorite);
    await this.invalidateUserFavoritesCache(userId);

    return favorite;
  }

  async remove(favoriteId: number, userId: number): Promise<void> {
    const favorite = await this.favoriteRepository.findOne({
      where: { id: favoriteId },
    });

    if (!favorite) {
      throw new NotFoundException(`Favorite with ID ${favoriteId} not found`);
    }

    if (favorite.userId !== userId) {
      throw new NotFoundException('You can only remove your own favorites');
    }

    await this.favoriteRepository.remove(favorite);
    await this.invalidateUserFavoritesCache(userId);

    this.logger.log(`Removed favorite: ${favoriteId}`);
  }

  async getUserFavorites(
    userId: number,
    type?: string,
    limit: number = 20,
    page: number = 1,
  ): Promise<{ items: Favorite[]; total: number }> {
    const queryBuilder = this.favoriteRepository
      .createQueryBuilder('favorite')
      .where('favorite.userId = :userId', { userId })
      .orderBy('favorite.createdAt', 'DESC')
      .take(limit)
      .skip((page - 1) * limit);

    if (type) {
      queryBuilder.andWhere('favorite.type = :type', { type });
    }

    const [items, total] = await queryBuilder.getManyAndCount();

    return { items, total };
  }

  async checkIsFavorited(
    userId: number,
    type: string,
    resourceId: string,
  ): Promise<{ isFavorited: boolean; favoriteId?: number }> {
    const favorite = await this.favoriteRepository.findOne({
      where: { userId, type, resourceId },
    });

    if (favorite) {
      return { isFavorited: true, favoriteId: favorite.id };
    }

    return { isFavorited: false };
  }

  private async invalidateUserFavoritesCache(userId: number): Promise<void> {
    const pattern = `${this.cachePrefix}:${userId}:*`;
    const keys = await this.redisService.keys(pattern);

    for (const key of keys) {
      await this.redisService.del(key);
    }
  }
}
