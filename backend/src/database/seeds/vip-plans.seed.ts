import { DataSource } from 'typeorm';
import { VipPlan } from '../../modules/vip/entities/vip-plan.entity';

export const seedVipPlans = async (dataSource: DataSource) => {
  console.log('Seeding VIP plans...');

  const planRepository = dataSource.getRepository(VipPlan);

  const plans = [
    {
      planId: 'vip_month',
      name: 'Monthly VIP',
      duration: 30,
      originalPrice: 2999,
      currentPrice: 1999,
      benefits: ['unlimited_generation', 'high_quality', '2k_resolution', 'history_retention_60days'],
      popular: false,
    },
    {
      planId: 'vip_year',
      name: 'Yearly VIP',
      duration: 365,
      originalPrice: 29990,
      currentPrice: 19990,
      benefits: ['unlimited_generation', 'high_quality', '4k_resolution', 'priority_queue', 'history_retention_permanent', 'exclusive_support'],
      popular: true,
    },
    {
      planId: 'svip_lifetime',
      name: 'Lifetime SVIP',
      duration: 36500,
      originalPrice: 299900,
      currentPrice: 199900,
      benefits: ['all_vip_benefits', '4k_resolution_unlimited', 'exclusive_features', 'priority_support'],
      popular: false,
    },
  ];

  for (const plan of plans) {
    const existingPlan = await planRepository.findOne({
      where: { planId: plan.planId },
    });

    if (!existingPlan) {
      const newPlan = planRepository.create(plan);
      await planRepository.save(newPlan);
      console.log(`Created VIP plan: ${plan.name}`);
    } else {
      console.log(`VIP plan already exists: ${plan.name}`);
    }
  }

  console.log('VIP plans seeding completed.');
};
