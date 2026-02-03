import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromptTemplate } from './entities/prompt-template.entity';
import { ParamTemplate } from './entities/param-template.entity';
import { RedisService } from '../../common/providers/redis.service';
import { 
  CreatePromptTemplateDto, 
  CreateParamTemplateDto,
  UpdatePromptTemplateDto,
  UpdateParamTemplateDto,
} from './dto/create-template.dto';

@Injectable()
export class TemplatesService {
  private readonly logger = new Logger(TemplatesService.name);
  private readonly cachePrefix = 'templates';
  private readonly cacheTTL = 3600;

  constructor(
    @InjectRepository(PromptTemplate)
    private readonly promptRepository: Repository<PromptTemplate>,
    @InjectRepository(ParamTemplate)
    private readonly paramRepository: Repository<ParamTemplate>,
    private readonly redisService: RedisService,
  ) {}

  async getPromptTemplates(category?: string, trending: boolean = false): Promise<PromptTemplate[]> {
    const cacheKey = `${this.cachePrefix}:prompts:${category || 'all'}:${trending}`;

    const cached = await this.redisService.getJson<PromptTemplate[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const queryBuilder = this.promptRepository
      .createQueryBuilder('template')
      .orderBy('template.usageCount', 'DESC');

    if (category && category !== 'all') {
      queryBuilder.andWhere('template.category = :category', { category });
    }

    if (trending) {
      queryBuilder.andWhere('template.isHot = :isHot', { isHot: true });
    }

    const templates = await queryBuilder.getMany();

    await this.redisService.setexJson(cacheKey, this.cacheTTL, templates);

    return templates;
  }

  async getParamTemplates(): Promise<ParamTemplate[]> {
    const cacheKey = `${this.cachePrefix}:params`;

    const cached = await this.redisService.getJson<ParamTemplate[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const templates = await this.paramRepository.find({
      order: { id: 'ASC' },
    });

    await this.redisService.setexJson(cacheKey, this.cacheTTL, templates);

    return templates;
  }

  // 获取单个提示词模板详情
  async getPromptTemplateById(templateId: string): Promise<PromptTemplate> {
    const template = await this.promptRepository.findOne({
      where: { templateId },
    });

    if (!template) {
      throw new NotFoundException(`Template ${templateId} not found`);
    }

    return template;
  }

  // 获取单个参数模板详情
  async getParamTemplateById(templateId: string): Promise<ParamTemplate> {
    const template = await this.paramRepository.findOne({
      where: { templateId },
    });

    if (!template) {
      throw new NotFoundException(`Param template ${templateId} not found`);
    }

    return template;
  }

  async incrementTemplateUsage(templateId: string): Promise<void> {
    const template = await this.promptRepository.findOne({
      where: { templateId },
    });

    if (!template) {
      throw new NotFoundException(`Template ${templateId} not found`);
    }

    template.usageCount += 1;

    await this.promptRepository.save(template);
    await this.invalidatePromptCache();

    this.logger.log(`Incremented usage count for template ${templateId}`);
  }

  private async invalidatePromptCache(): Promise<void> {
    const pattern = `${this.cachePrefix}:prompts:*`;
    const keys = await this.redisService.keys(pattern);

    for (const key of keys) {
      await this.redisService.del(key);
    }
  }

  private async invalidateParamCache(): Promise<void> {
    const cacheKey = `${this.cachePrefix}:params`;
    await this.redisService.del(cacheKey);
  }

  // 创建提示词模板
  async createPromptTemplate(dto: CreatePromptTemplateDto): Promise<PromptTemplate> {
    // 检查是否已存在
    const existing = await this.promptRepository.findOne({
      where: { templateId: dto.templateId },
    });

    if (existing) {
      throw new ConflictException(`Template with ID ${dto.templateId} already exists`);
    }

    const template = this.promptRepository.create({
      templateId: dto.templateId,
      title: dto.title,
      description: dto.description,
      prompt: dto.prompt,
      category: dto.category,
      thumbnailUrl: dto.thumbnailUrl,
      previewImages: dto.previewImages,
      isHot: dto.isHot || false,
      usageCount: 0,
    });

    const saved = await this.promptRepository.save(template);
    await this.invalidatePromptCache();

    this.logger.log(`Created prompt template: ${dto.templateId}`);
    return saved;
  }

  // 批量创建提示词模板
  async createPromptTemplatesBatch(dtos: CreatePromptTemplateDto[]): Promise<PromptTemplate[]> {
    const templates = dtos.map(dto =>
      this.promptRepository.create({
        templateId: dto.templateId,
        title: dto.title,
        description: dto.description,
        prompt: dto.prompt,
        category: dto.category,
        thumbnailUrl: dto.thumbnailUrl,
        previewImages: dto.previewImages,
        isHot: dto.isHot || false,
        usageCount: 0,
      }),
    );

    const saved = await this.promptRepository.save(templates);
    await this.invalidatePromptCache();

    this.logger.log(`Created ${saved.length} prompt templates in batch`);
    return saved;
  }

  // 创建参数模板
  async createParamTemplate(dto: CreateParamTemplateDto): Promise<ParamTemplate> {
    const existing = await this.paramRepository.findOne({
      where: { templateId: dto.templateId },
    });

    if (existing) {
      throw new ConflictException(`Param template with ID ${dto.templateId} already exists`);
    }

    const template = this.paramRepository.create({
      templateId: dto.templateId,
      title: dto.title,
      description: dto.description,
      thumbnailUrl: dto.thumbnailUrl,
      previewImages: dto.previewImages,
      mode: dto.mode,
      resolution: dto.resolution,
      aspectRatio: dto.aspectRatio,
      sampleCount: dto.sampleCount,
    });

    const saved = await this.paramRepository.save(template);
    await this.invalidateParamCache();

    this.logger.log(`Created param template: ${dto.templateId}`);
    return saved;
  }

  // 批量创建参数模板
  async createParamTemplatesBatch(dtos: CreateParamTemplateDto[]): Promise<ParamTemplate[]> {
    const templates = dtos.map(dto =>
      this.paramRepository.create({
        templateId: dto.templateId,
        title: dto.title,
        description: dto.description,
        thumbnailUrl: dto.thumbnailUrl,
        previewImages: dto.previewImages,
        mode: dto.mode,
        resolution: dto.resolution,
        aspectRatio: dto.aspectRatio,
        sampleCount: dto.sampleCount,
      }),
    );

    const saved = await this.paramRepository.save(templates);
    await this.invalidateParamCache();

    this.logger.log(`Created ${saved.length} param templates in batch`);
    return saved;
  }

  // 删除提示词模板
  async deletePromptTemplate(templateId: string): Promise<void> {
    const template = await this.promptRepository.findOne({
      where: { templateId },
    });

    if (!template) {
      throw new NotFoundException(`Template ${templateId} not found`);
    }

    await this.promptRepository.remove(template);
    await this.invalidatePromptCache();

    this.logger.log(`Deleted prompt template: ${templateId}`);
  }

  // 批量删除提示词模板
  async deletePromptTemplatesBatch(templateIds: string[]): Promise<number> {
    const result = await this.promptRepository
      .createQueryBuilder()
      .delete()
      .where('template_id IN (:...templateIds)', { templateIds })
      .execute();

    await this.invalidatePromptCache();

    this.logger.log(`Deleted ${result.affected} prompt templates`);
    return result.affected || 0;
  }

  // 更新提示词模板
  async updatePromptTemplate(templateId: string, dto: UpdatePromptTemplateDto): Promise<PromptTemplate> {
    const template = await this.promptRepository.findOne({
      where: { templateId },
    });

    if (!template) {
      throw new NotFoundException(`Template ${templateId} not found`);
    }

    // 更新字段
    if (dto.title !== undefined) template.title = dto.title;
    if (dto.description !== undefined) template.description = dto.description;
    if (dto.prompt !== undefined) template.prompt = dto.prompt;
    if (dto.category !== undefined) template.category = dto.category;
    if (dto.thumbnailUrl !== undefined) template.thumbnailUrl = dto.thumbnailUrl;
    if (dto.previewImages !== undefined) template.previewImages = dto.previewImages;
    if (dto.isHot !== undefined) template.isHot = dto.isHot;

    const saved = await this.promptRepository.save(template);
    await this.invalidatePromptCache();

    this.logger.log(`Updated prompt template: ${templateId}`);
    return saved;
  }

  // 更新参数模板
  async updateParamTemplate(templateId: string, dto: UpdateParamTemplateDto): Promise<ParamTemplate> {
    const template = await this.paramRepository.findOne({
      where: { templateId },
    });

    if (!template) {
      throw new NotFoundException(`Param template ${templateId} not found`);
    }

    // 更新字段
    if (dto.title !== undefined) template.title = dto.title;
    if (dto.description !== undefined) template.description = dto.description;
    if (dto.thumbnailUrl !== undefined) template.thumbnailUrl = dto.thumbnailUrl;
    if (dto.previewImages !== undefined) template.previewImages = dto.previewImages;
    if (dto.mode !== undefined) template.mode = dto.mode;
    if (dto.resolution !== undefined) template.resolution = dto.resolution;
    if (dto.aspectRatio !== undefined) template.aspectRatio = dto.aspectRatio;
    if (dto.sampleCount !== undefined) template.sampleCount = dto.sampleCount;

    const saved = await this.paramRepository.save(template);
    await this.invalidateParamCache();

    this.logger.log(`Updated param template: ${templateId}`);
    return saved;
  }

  // 删除参数模板
  async deleteParamTemplate(templateId: string): Promise<void> {
    const template = await this.paramRepository.findOne({
      where: { templateId },
    });

    if (!template) {
      throw new NotFoundException(`Param template ${templateId} not found`);
    }

    await this.paramRepository.remove(template);
    await this.invalidateParamCache();

    this.logger.log(`Deleted param template: ${templateId}`);
  }

  // 批量删除参数模板
  async deleteParamTemplatesBatch(templateIds: string[]): Promise<number> {
    const result = await this.paramRepository
      .createQueryBuilder()
      .delete()
      .where('template_id IN (:...templateIds)', { templateIds })
      .execute();

    await this.invalidateParamCache();

    this.logger.log(`Deleted ${result.affected} param templates`);
    return result.affected || 0;
  }
}
