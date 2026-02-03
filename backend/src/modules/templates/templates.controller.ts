import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import { 
  CreatePromptTemplateDto, 
  CreateParamTemplateDto,
  UpdatePromptTemplateDto,
  UpdateParamTemplateDto,
} from './dto/create-template.dto';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';

@ApiTags('Templates')
@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get('prompts')
  @ApiOperation({ summary: 'Get prompt templates' })
  async getPromptTemplates(
    @Query('category') category?: string,
    @Query('trending') trending?: string,
  ): Promise<{ templates: any[] }> {
    return {
      templates: await this.templatesService.getPromptTemplates(category, trending === 'true'),
    };
  }

  @Get('prompts/:templateId')
  @ApiOperation({ summary: 'Get prompt template detail' })
  async getPromptTemplateDetail(
    @Param('templateId') templateId: string,
  ): Promise<{ template: any }> {
    const template = await this.templatesService.getPromptTemplateById(templateId);
    return { template };
  }

  @Post('prompts')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Create a prompt template (Admin)' })
  @ApiHeader({ name: 'X-Admin-Key', description: 'Admin API Key' })
  async createPromptTemplate(
    @Body() dto: CreatePromptTemplateDto,
  ): Promise<{ template: any }> {
    const template = await this.templatesService.createPromptTemplate(dto);
    return { template };
  }

  @Post('prompts/batch')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Create prompt templates in batch (Admin)' })
  @ApiHeader({ name: 'X-Admin-Key', description: 'Admin API Key' })
  async createPromptTemplatesBatch(
    @Body() body: { templates: CreatePromptTemplateDto[] },
  ): Promise<{ templates: any[]; count: number }> {
    const templates = await this.templatesService.createPromptTemplatesBatch(body.templates);
    return { templates, count: templates.length };
  }

  @Put('prompts/:templateId')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Update a prompt template (Admin)' })
  @ApiHeader({ name: 'X-Admin-Key', description: 'Admin API Key' })
  async updatePromptTemplate(
    @Param('templateId') templateId: string,
    @Body() dto: UpdatePromptTemplateDto,
  ): Promise<{ template: any }> {
    const template = await this.templatesService.updatePromptTemplate(templateId, dto);
    return { template };
  }

  @Get('params')
  @ApiOperation({ summary: 'Get param templates' })
  async getParamTemplates(): Promise<{ templates: any[] }> {
    return { templates: await this.templatesService.getParamTemplates() };
  }

  @Get('params/:templateId')
  @ApiOperation({ summary: 'Get param template detail' })
  async getParamTemplateDetail(
    @Param('templateId') templateId: string,
  ): Promise<{ template: any }> {
    const template = await this.templatesService.getParamTemplateById(templateId);
    return { template };
  }

  @Post('params')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Create a param template (Admin)' })
  @ApiHeader({ name: 'X-Admin-Key', description: 'Admin API Key' })
  async createParamTemplate(
    @Body() dto: CreateParamTemplateDto,
  ): Promise<{ template: any }> {
    const template = await this.templatesService.createParamTemplate(dto);
    return { template };
  }

  @Post('params/batch')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Create param templates in batch (Admin)' })
  @ApiHeader({ name: 'X-Admin-Key', description: 'Admin API Key' })
  async createParamTemplatesBatch(
    @Body() body: { templates: CreateParamTemplateDto[] },
  ): Promise<{ templates: any[]; count: number }> {
    const templates = await this.templatesService.createParamTemplatesBatch(body.templates);
    return { templates, count: templates.length };
  }

  @Put('params/:templateId')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Update a param template (Admin)' })
  @ApiHeader({ name: 'X-Admin-Key', description: 'Admin API Key' })
  async updateParamTemplate(
    @Param('templateId') templateId: string,
    @Body() dto: UpdateParamTemplateDto,
  ): Promise<{ template: any }> {
    const template = await this.templatesService.updateParamTemplate(templateId, dto);
    return { template };
  }

  @Delete('params/:templateId')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Delete a param template (Admin)' })
  @ApiHeader({ name: 'X-Admin-Key', description: 'Admin API Key' })
  async deleteParamTemplate(
    @Param('templateId') templateId: string,
  ): Promise<{ message: string }> {
    await this.templatesService.deleteParamTemplate(templateId);
    return { message: `Param template ${templateId} deleted` };
  }

  @Delete('params')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Delete param templates by IDs (Admin)' })
  @ApiHeader({ name: 'X-Admin-Key', description: 'Admin API Key' })
  async deleteParamTemplatesBatch(
    @Body() body: { templateIds: string[] },
  ): Promise<{ message: string; count: number }> {
    const count = await this.templatesService.deleteParamTemplatesBatch(body.templateIds);
    return { message: 'Param templates deleted', count };
  }

  @Post('prompts/:templateId/usage')
  @ApiOperation({ summary: 'Increment template usage' })
  async incrementUsage(@Param('templateId') templateId: string): Promise<{ message: string }> {
    await this.templatesService.incrementTemplateUsage(templateId);
    return { message: 'Usage count updated' };
  }

  @Delete('prompts/:templateId')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Delete a prompt template (Admin)' })
  @ApiHeader({ name: 'X-Admin-Key', description: 'Admin API Key' })
  async deletePromptTemplate(
    @Param('templateId') templateId: string,
  ): Promise<{ message: string }> {
    await this.templatesService.deletePromptTemplate(templateId);
    return { message: `Template ${templateId} deleted` };
  }

  @Delete('prompts')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Delete prompt templates by IDs (Admin)' })
  @ApiHeader({ name: 'X-Admin-Key', description: 'Admin API Key' })
  async deletePromptTemplatesBatch(
    @Body() body: { templateIds: string[] },
  ): Promise<{ message: string; count: number }> {
    const count = await this.templatesService.deletePromptTemplatesBatch(body.templateIds);
    return { message: 'Templates deleted', count };
  }
}
