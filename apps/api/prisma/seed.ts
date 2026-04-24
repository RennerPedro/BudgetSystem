import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  await prisma.alert.deleteMany();
  await prisma.budgetAdjustment.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleaned existing data');

  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      passwordHash,
    },
  });

  console.log('👤 Created test user:', user.email);

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const totalIncome = 5000;
  const totalFixed = 2000;
  const available = totalIncome - totalFixed;

  const budget = await prisma.budget.create({
    data: {
      userId: user.id,
      month,
      year,
      totalIncome,
      totalFixed,
      totalSpent: 0,
      availableBalance: available,
      remainingBalance: available,
      dailyBudget: 100,
      strategy: 'LINEAR',
      status: 'HEALTHY',
    },
  });

  console.log('💰 Created budget for', `${month}/${year}`);

  const categories = ['food', 'transport', 'entertainment', 'utilities', 'health'];
  const expenses = [];

  for (let i = 1; i <= 10; i++) {
    const expense = await prisma.expense.create({
      data: {
        userId: user.id,
        budgetId: budget.id,
        amount: Math.floor(Math.random() * 200) + 50,
        type: 'VARIABLE',
        category: categories[Math.floor(Math.random() * categories.length)],
        date: new Date(year, month - 1, Math.floor(Math.random() * 20) + 1),
      },
    });
    expenses.push(expense);
  }

  const totalVariableSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  await prisma.budget.update({
    where: { id: budget.id },
    data: {
      totalSpent: totalVariableSpent,
      remainingBalance: available - totalVariableSpent,
    },
  });

  console.log(`📊 Created ${expenses.length} sample expenses`);

  const alerts = [
    {
      type: 'BUDGET_WARNING',
      message: 'You are 15% over your expected spending for this period',
      severity: 'WARNING',
    },
    {
      type: 'DAILY_LIMIT_EXCEEDED',
      message: 'Today\'s spending exceeded your daily budget by $25',
      severity: 'INFO',
    },
  ];

  for (const alert of alerts) {
    await prisma.alert.create({
      data: {
        userId: user.id,
        ...alert,
      },
    });
  }

  console.log(`🔔 Created ${alerts.length} sample alerts`);

  await prisma.budgetAdjustment.create({
    data: {
      budgetId: budget.id,
      previousDailyBudget: 110,
      newDailyBudget: 100,
      adjustment: -10,
      reason: 'Excess spending detected - applying linear correction',
      strategy: 'LINEAR',
      status: 'WARNING',
    },
  });

  console.log('📈 Created budget adjustment record');

  console.log('\n✅ Seed completed successfully!');
  console.log('\n📝 Test credentials:');
  console.log('   Email: test@example.com');
  console.log('   Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
