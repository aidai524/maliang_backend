import { DataSource } from 'typeorm';
import { PromptTemplate } from '../../modules/templates/entities/prompt-template.entity';
import { ParamTemplate } from '../../modules/templates/entities/param-template.entity';

export const seedTemplates = async (dataSource: DataSource) => {
  console.log('Seeding templates...');

  await seedPromptTemplates(dataSource);
  await seedParamTemplates(dataSource);

  console.log('Templates seeding completed.');
};

const seedPromptTemplates = async (dataSource: DataSource) => {
  const templateRepository = dataSource.getRepository(PromptTemplate);

  const templates = [
    {
      templateId: 'cyberpunk_style',
      title: 'Cyberpunk Style',
      prompt: 'A futuristic cyberpunk cityscape, neon lights, rain, 8K, ultra detailed',
      category: 'style',
      thumbnailUrl: '',
      usageCount: 0,
      isHot: true,
    },
    {
      templateId: 'ghibli_style',
      title: 'Ghibli Style',
      prompt: 'Studio Ghibli style, beautiful landscape, hand drawn, vibrant colors',
      category: 'style',
      thumbnailUrl: '',
      usageCount: 0,
      isHot: true,
    },
    {
      templateId: 'photorealistic',
      title: 'Photorealistic',
      prompt: 'Photorealistic, ultra detailed, natural lighting, professional photography',
      category: 'style',
      thumbnailUrl: '',
      usageCount: 0,
      isHot: false,
    },
    {
      templateId: 'anime_style',
      title: 'Anime Style',
      prompt: 'Anime style, vibrant colors, clean lines, detailed artwork',
      category: 'style',
      thumbnailUrl: '',
      usageCount: 0,
      isHot: false,
    },
    {
      templateId: 'portrait',
      title: 'Portrait',
      prompt: 'A portrait photography, professional lighting, detailed facial features',
      category: 'subject',
      thumbnailUrl: '',
      usageCount: 0,
      isHot: true,
    },
    {
      templateId: 'landscape',
      title: 'Landscape',
      prompt: 'Beautiful natural landscape, mountains, lake, sunset, peaceful atmosphere',
      category: 'subject',
      thumbnailUrl: '',
      usageCount: 0,
      isHot: true,
    },
  ];

  for (const template of templates) {
    const existingTemplate = await templateRepository.findOne({
      where: { templateId: template.templateId },
    });

    if (!existingTemplate) {
      const newTemplate = templateRepository.create(template);
      await templateRepository.save(newTemplate);
      console.log(`Created prompt template: ${template.title}`);
    }
  }
};

const seedParamTemplates = async (dataSource: DataSource) => {
  const templateRepository = dataSource.getRepository(ParamTemplate);

  const templates = [
    {
      templateId: 'quick_preview',
      title: 'Quick Preview',
      mode: 'draft',
      resolution: null,
      aspectRatio: '1:1',
      sampleCount: 1,
    },
    {
      templateId: 'hd_portrait',
      title: 'HD Portrait',
      mode: 'final',
      resolution: '2K',
      aspectRatio: '9:16',
      sampleCount: 1,
    },
    {
      templateId: 'hd_landscape',
      title: 'HD Landscape',
      mode: 'final',
      resolution: '2K',
      aspectRatio: '16:9',
      sampleCount: 1,
    },
    {
      templateId: 'uhd_wallpaper',
      title: 'UHD Wallpaper',
      mode: 'final',
      resolution: '4K',
      aspectRatio: '16:9',
      sampleCount: 1,
    },
  ];

  for (const template of templates) {
    const existingTemplate = await templateRepository.findOne({
      where: { templateId: template.templateId },
    });

    if (!existingTemplate) {
      const newTemplate = templateRepository.create(template);
      await templateRepository.save(newTemplate);
      console.log(`Created param template: ${template.title}`);
    }
  }
};
