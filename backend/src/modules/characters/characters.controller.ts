import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CharactersService } from './characters.service';
import { CreateCharacterDto, UpdateCharacterDto, AddPhotoDto, UploadPhotoDto } from './dto/character.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Characters')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('characters')
export class CharactersController {
  constructor(private readonly charactersService: CharactersService) {}

  // 获取所有角色
  @Get()
  @ApiOperation({ summary: 'Get all characters for current user' })
  async findAll(@Request() req: any) {
    const userId = req.user.userId;
    return await this.charactersService.findAllByUser(userId);
  }

  // 获取单个角色详情
  @Get(':characterId')
  @ApiOperation({ summary: 'Get character detail' })
  async findOne(@Request() req: any, @Param('characterId') characterId: string) {
    const userId = req.user.userId;
    const character = await this.charactersService.findOne(userId, characterId);
    return { character };
  }

  // 创建角色
  @Post()
  @ApiOperation({ summary: 'Create a new character' })
  async create(@Request() req: any, @Body() dto: CreateCharacterDto) {
    const userId = req.user.userId;
    const character = await this.charactersService.create(userId, dto);
    return { success: true, character };
  }

  // 更新角色
  @Put(':characterId')
  @ApiOperation({ summary: 'Update character' })
  async update(
    @Request() req: any,
    @Param('characterId') characterId: string,
    @Body() dto: UpdateCharacterDto,
  ) {
    const userId = req.user.userId;
    const character = await this.charactersService.update(userId, characterId, dto);
    return { success: true, character };
  }

  // 删除角色
  @Delete(':characterId')
  @ApiOperation({ summary: 'Delete character' })
  async delete(@Request() req: any, @Param('characterId') characterId: string) {
    const userId = req.user.userId;
    await this.charactersService.delete(userId, characterId);
    return { success: true, message: 'Character deleted' };
  }

  // ========== 照片管理 ==========

  // 上传照片到 R2（推荐方式）
  @Post(':characterId/photos/upload')
  @ApiOperation({ summary: 'Upload photo to R2 (base64)' })
  async uploadPhoto(
    @Request() req: any,
    @Param('characterId') characterId: string,
    @Body() dto: UploadPhotoDto,
  ) {
    const userId = req.user.userId;
    const photo = await this.charactersService.uploadPhoto(userId, characterId, dto);
    return { success: true, photo };
  }

  // 添加照片（URL 方式，用于已上传的图片）
  @Post(':characterId/photos')
  @ApiOperation({ summary: 'Add photo by URL' })
  async addPhoto(
    @Request() req: any,
    @Param('characterId') characterId: string,
    @Body() dto: AddPhotoDto,
  ) {
    const userId = req.user.userId;
    const photo = await this.charactersService.addPhoto(userId, characterId, dto);
    return { success: true, photo };
  }

  // 获取照片详情
  @Get(':characterId/photos/:photoId')
  @ApiOperation({ summary: 'Get photo detail' })
  async getPhoto(
    @Request() req: any,
    @Param('characterId') characterId: string,
    @Param('photoId') photoId: string,
  ) {
    const userId = req.user.userId;
    const photo = await this.charactersService.getPhoto(userId, characterId, photoId);
    return { photo };
  }

  // 删除照片（同时删除 R2 文件）
  @Delete(':characterId/photos/:photoId')
  @ApiOperation({ summary: 'Delete photo (also removes from R2)' })
  async deletePhoto(
    @Request() req: any,
    @Param('characterId') characterId: string,
    @Param('photoId') photoId: string,
  ) {
    const userId = req.user.userId;
    await this.charactersService.deletePhotoWithR2(userId, characterId, photoId);
    return { success: true, message: 'Photo deleted' };
  }
}
