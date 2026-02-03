import { dataSource } from '../data-source';
import { seedVipPlans } from './vip-plans.seed';
import { seedTemplates } from './templates.seed';

export const runSeed = async () => {
  console.log('Starting database seeding...');

  try {
    await dataSource.initialize();
    console.log('Database connected.');

    // Run seeds
    await seedVipPlans(dataSource);
    await seedTemplates(dataSource);

    console.log('Database seeding completed!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
};

runSeed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
