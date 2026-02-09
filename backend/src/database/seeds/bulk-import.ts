import { DataSource } from 'typeorm';
import { PromptTemplate } from '../../modules/templates/entities/prompt-template.entity';
import { ParamTemplate } from '../../modules/templates/entities/param-template.entity';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 批量导入模板脚本
 *
 * 使用方法：
 * 1. 准备数据文件 templates-data.json
 * 2. 运行: npm run import-templates
 */

interface PromptTemplateData {
  templateId: string;
  title: string;
  description?: string;
  prompt: string;
  category?: string;
  thumbnailUrl?: string;
  previewImages?: string[];
  isHot?: boolean;
}

interface ParamTemplateData {
  templateId: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  previewImages?: string[];
  mode?: string;
  resolution?: string;
  aspectRatio?: string;
  sampleCount?: number;
}

interface TemplatesData {
  promptTemplates?: PromptTemplateData[];
  paramTemplates?: ParamTemplateData[];
}

export const bulkImportTemplates = async (dataSource: DataSource) => {
  console.log('📥 开始批量导入模板...');

  // 读取数据文件
  const dataPath = path.join(process.cwd(), 'data/templates-data.json');

  if (!fs.existsSync(dataPath)) {
    console.log(`❌ 数据文件不存在: ${dataPath}`);
    console.log('📝 请创建数据文件，参考 templates-data.example.json');
    return;
  }

  const fileContent = fs.readFileSync(dataPath, 'utf-8');
  const data: TemplatesData = JSON.parse(fileContent);

  let importedCount = 0;
  let skippedCount = 0;

  // 导入 Prompt Templates
  if (data.promptTemplates && data.promptTemplates.length > 0) {
    console.log(`\n📦 导入 Prompt Templates (${data.promptTemplates.length} 条)...`);
    const result = await importPromptTemplates(dataSource, data.promptTemplates);
    importedCount += result.imported;
    skippedCount += result.skipped;
  }

  // 导入 Param Templates
  if (data.paramTemplates && data.paramTemplates.length > 0) {
    console.log(`\n📦 导入 Param Templates (${data.paramTemplates.length} 条)...`);
    const result = await importParamTemplates(dataSource, data.paramTemplates);
    importedCount += result.imported;
    skippedCount += result.skipped;
  }

  console.log(`\n✅ 导入完成!`);
  console.log(`   - 新增: ${importedCount} 条`);
  console.log(`   - 跳过: ${skippedCount} 条 (已存在)`);
};

const importPromptTemplates = async (
  dataSource: DataSource,
  templates: PromptTemplateData[]
) => {
  const repository = dataSource.getRepository(PromptTemplate);
  let imported = 0;
  let skipped = 0;

  for (const data of templates) {
    const existing = await repository.findOne({
      where: { templateId: data.templateId },
    });

    if (existing) {
      console.log(`  ⏭️  跳过: ${data.title} (已存在)`);
      skipped++;
    } else {
      const template = repository.create({
        ...data,
        usageCount: 0,
        isHot: data.isHot ?? false,
      });
      await repository.save(template);
      console.log(`  ✅ ${data.title}`);
      imported++;
    }
  }

  return { imported, skipped };
};

const importParamTemplates = async (
  dataSource: DataSource,
  templates: ParamTemplateData[]
) => {
  const repository = dataSource.getRepository(ParamTemplate);
  let imported = 0;
  let skipped = 0;

  for (const data of templates) {
    const existing = await repository.findOne({
      where: { templateId: data.templateId },
    });

    if (existing) {
      console.log(`  ⏭️  跳过: ${data.title} (已存在)`);
      skipped++;
    } else {
      const template = repository.create(data);
      await repository.save(template);
      console.log(`  ✅ ${data.title}`);
      imported++;
    }
  }

  return { imported, skipped };
};
