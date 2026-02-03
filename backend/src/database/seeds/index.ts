import { dataSource } from '../data-source';
import { seedVipPlans } from './vip-plans.seed';
import { seedTemplates } from './templates.seed';

const runAllSeeds = async () => {
  console.log('Starting all database seeds...');

  try {
    await dataSource.initialize();
    console.log('Database connected.');

    await seedVipPlans(dataSource);
    await seedTemplates(dataSource);

    console.log('All seeds completed successfully!');
  } catch (error) {
    console.error('Error running seeds:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
};

runAllSeeds().catch((error) => {
  console.error('Seed error:', error);
  process.exit(1);
});
