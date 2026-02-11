import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Character } from './entities/character.entity';
import { CharacterPhoto } from './entities/character-photo.entity';
import { CreateCharacterDto, UpdateCharacterDto, AddPhotoDto, UploadPhotoDto } from './dto/character.dto';
import { R2StorageService } from '../../common/providers/r2-storage.service';

// 每个角色最多 10 张照片
const MAX_PHOTOS_PER_CHARACTER = 10;

@Injectable()
export class CharactersService {
  private readonly logger = new Logger(CharactersService.name);

  constructor(
    @InjectRepository(Character)
    private readonly characterRepository: Repository<Character>,
    @InjectRepository(CharacterPhoto)
    private readonly photoRepository: Repository<CharacterPhoto>,
    private readonly r2Storage: R2StorageService,
  ) {}

  // 获取用户的所有角色
  async findAllByUser(userId: number): Promise<{ characters: Character[]; limits: any }> {
    const characters = await this.characterRepository.find({
      where: { userId },
      relations: ['photos'],
      order: { createdAt: 'DESC' },
    });

    return {
      characters,
      limits: {
        maxPhotosPerCharacter: MAX_PHOTOS_PER_CHARACTER,
      },
    };
  }

  // 获取单个角色详情（支持 UUID 或数字 ID）
  async findOne(userId: number, characterIdOrUuid: string | number): Promise<Character> {
    let character: Character | null = null;

    // 判断是数字 ID 还是 UUID
    const numericId = typeof characterIdOrUuid === 'number' 
      ? characterIdOrUuid 
      : parseInt(characterIdOrUuid, 10);

    if (!isNaN(numericId)) {
      // 用数字 ID 查找
      character = await this.characterRepository.findOne({
        where: { id: numericId },
        relations: ['photos'],
      });
    }
    
    // 如果用 ID 没找到，尝试用 UUID 查找
    if (!character && typeof characterIdOrUuid === 'string') {
      character = await this.characterRepository.findOne({
        where: { uuid: characterIdOrUuid },
        relations: ['photos'],
      });
    }

    if (!character) {
      throw new NotFoundException(`Character ${characterIdOrUuid} not found`);
    }

    // 检查是否属于该用户
    if (character.userId !== userId) {
      throw new ForbiddenException('You do not have access to this character');
    }

    return character;
  }

  // 创建角色
  async create(userId: number, dto: CreateCharacterDto): Promise<Character> {
    const character = this.characterRepository.create({
      uuid: uuidv4(),
      userId,
      name: dto.name,
      description: dto.description,
    });

    const saved = await this.characterRepository.save(character);
    this.logger.log(`Created character ${saved.uuid} for user ${userId}`);

    // 返回带空 photos 数组
    saved.photos = [];
    return saved;
  }

  // 更新角色
  async update(userId: number, characterUuid: string, dto: UpdateCharacterDto): Promise<Character> {
    const character = await this.findOne(userId, characterUuid);

    if (dto.name !== undefined) {
      character.name = dto.name;
    }
    if (dto.description !== undefined) {
      character.description = dto.description;
    }

    const saved = await this.characterRepository.save(character);
    this.logger.log(`Updated character ${characterUuid}`);

    return saved;
  }

  // 删除角色
  async delete(userId: number, characterUuid: string): Promise<void> {
    const character = await this.findOne(userId, characterUuid);

    await this.characterRepository.remove(character);
    this.logger.log(`Deleted character ${characterUuid}`);
  }

  // 添加照片
  async addPhoto(userId: number, characterUuid: string, dto: AddPhotoDto): Promise<CharacterPhoto> {
    const character = await this.findOne(userId, characterUuid);

    // 检查照片数量限制
    const photoCount = await this.photoRepository.count({
      where: { characterId: character.id },
    });

    if (photoCount >= MAX_PHOTOS_PER_CHARACTER) {
      throw new BadRequestException(
        `Maximum ${MAX_PHOTOS_PER_CHARACTER} photos per character allowed`,
      );
    }

    const photo = this.photoRepository.create({
      uuid: uuidv4(),
      characterId: character.id,
      thumbnailUrl: dto.thumbnailUrl,
      originalUrl: dto.originalUrl,
      mimeType: dto.mimeType || 'image/jpeg',
      thumbnailSize: dto.thumbnailSize || 0,
      originalSize: dto.originalSize || 0,
    });

    const saved = await this.photoRepository.save(photo);
    this.logger.log(`Added photo ${saved.uuid} to character ${characterUuid}`);

    return saved;
  }

  // 获取照片详情
  async getPhoto(userId: number, characterUuid: string, photoUuid: string): Promise<CharacterPhoto> {
    // 先验证角色权限
    const character = await this.findOne(userId, characterUuid);

    const photo = await this.photoRepository.findOne({
      where: { uuid: photoUuid, characterId: character.id },
    });

    if (!photo) {
      throw new NotFoundException(`Photo ${photoUuid} not found`);
    }

    return photo;
  }

  // 删除照片
  async deletePhoto(userId: number, characterUuid: string, photoUuid: string): Promise<void> {
    const photo = await this.getPhoto(userId, characterUuid, photoUuid);

    await this.photoRepository.remove(photo);
    this.logger.log(`Deleted photo ${photoUuid} from character ${characterUuid}`);
  }

  // 获取角色的所有照片（用于 AI 生成，支持 ID 或 UUID）
  async getCharacterPhotos(userId: number, characterIdOrUuid: string | number): Promise<CharacterPhoto[]> {
    const character = await this.findOne(userId, characterIdOrUuid);
    return character.photos;
  }

  // 上传照片到 R2（Base64 方式）
  async uploadPhoto(
    userId: number,
    characterUuid: string,
    dto: UploadPhotoDto,
  ): Promise<CharacterPhoto> {
    const character = await this.findOne(userId, characterUuid);

    // 检查照片数量限制
    const photoCount = await this.photoRepository.count({
      where: { characterId: character.id },
    });

    if (photoCount >= MAX_PHOTOS_PER_CHARACTER) {
      throw new BadRequestException(
        `Maximum ${MAX_PHOTOS_PER_CHARACTER} photos per character allowed`,
      );
    }

    // 解码 base64（如果没有 originalData，则使用 thumbnailData）
    const thumbnailBuffer = Buffer.from(dto.thumbnailData, 'base64');
    const originalBuffer = dto.originalData 
      ? Buffer.from(dto.originalData, 'base64') 
      : thumbnailBuffer;

    const mimeType = dto.mimeType || 'image/jpeg';

    // 上传到 R2
    const { thumbnailUrl, originalUrl, photoId } = await this.r2Storage.uploadCharacterPhoto(
      userId,
      characterUuid,
      thumbnailBuffer,
      originalBuffer,
      mimeType,
    );

    // 保存到数据库
    const photo = this.photoRepository.create({
      uuid: photoId,
      characterId: character.id,
      thumbnailUrl,
      originalUrl,
      mimeType,
      thumbnailSize: dto.thumbnailSize || thumbnailBuffer.length,
      originalSize: dto.originalSize || originalBuffer.length,
    });

    const saved = await this.photoRepository.save(photo);
    this.logger.log(`Uploaded photo ${saved.uuid} to R2 for character ${characterUuid}`);

    return saved;
  }

  // 删除照片（同时删除 R2 文件）
  async deletePhotoWithR2(userId: number, characterUuid: string, photoUuid: string): Promise<void> {
    const photo = await this.getPhoto(userId, characterUuid, photoUuid);

    // 删除 R2 文件
    try {
      await this.r2Storage.deleteCharacterPhoto(photo.thumbnailUrl, photo.originalUrl);
    } catch (error) {
      this.logger.warn(`Failed to delete R2 files for photo ${photoUuid}: ${error.message}`);
    }

    // 删除数据库记录
    await this.photoRepository.remove(photo);
    this.logger.log(`Deleted photo ${photoUuid} from character ${characterUuid}`);
  }
}
