import 'reflect-metadata';
import { dataSource } from '../data-source';
import { bulkImportTemplates } from './bulk-import';

async function run() {
  try {
    await dataSource.initialize();
    console.log('Database connected.');

    await bulkImportTemplates(dataSource);

    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

run();
