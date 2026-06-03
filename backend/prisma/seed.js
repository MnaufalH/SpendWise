import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

async function main() {
  const fileContent = await fs.readFile('./userData.json', 'utf-8');
  const data = JSON.parse(fileContent);

  console.log('Seeding users...');
  for (const user of data.users) {
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email }
    });
    if (!existingUser) {
      await prisma.user.create({
        data: {
          id: user.userId || `user-${nanoid(16)}`,
          fullName: user.fullName,
          userName: user.username,
          email: user.email,
          password: user.password
        }
      });
      console.log(`Created user: ${user.username}`);
    }
  }

  console.log('Seeding wallets...');
  for (const wallet of data.wallets) {
    const userId = wallet.userId;
    // Wallets are BCA, Cash, OVO, Dana, Mandiri
    const names = ['BCA', 'Cash', 'OVO', 'Dana', 'Mandiri'];
    for (const name of names) {
      const key = name.toLowerCase();
      const amount = wallet[key] || 0;

      const existingWallet = await prisma.wallet.findUnique({
        where: {
          userId_name: {
            userId,
            name
          }
        }
      });

      if (!existingWallet) {
        await prisma.wallet.create({
          data: {
            id: `wlt-${nanoid(16)}`,
            userId,
            name,
            amount: parseFloat(amount)
          }
        });
        console.log(`Created wallet ${name} for user ${userId}`);
      }
    }
  }

  console.log('Seeding budgets...');
  for (const budget of data.budgets) {
    const id = budget.id || `bud-${nanoid(16)}`;
    const existingBudget = await prisma.budget.findUnique({
      where: { id }
    });
    if (!existingBudget) {
      // Find userId in database, if it exists
      const userExists = await prisma.user.findUnique({
        where: { id: budget.userId }
      });
      if (userExists) {
        await prisma.budget.create({
          data: {
            id,
            userId: budget.userId,
            name: budget.name || 'Budget',
            used: budget.used || 0,
            allocation: budget.allocation || budget.acllocation || 0,
            createdAt: new Date()
          }
        });
        console.log(`Created budget ${budget.name} for user ${budget.userId}`);
      }
    }
  }

  console.log('Seeding transactions...');
  if (data.transactions) {
    for (const trs of data.transactions) {
      // Check if user exists
      const userExists = await prisma.user.findUnique({
        where: { id: trs.userId }
      });
      if (userExists) {
        const id = `trs-${nanoid(16)}`;
        await prisma.transaction.create({
          data: {
            id,
            userId: trs.userId,
            type: trs.type,
            descript: trs.descript,
            amount: parseFloat(trs.amount),
            category: trs.category,
            wallet: trs.wallet,
            date: trs.date
          }
        });
        console.log(`Created transaction for user ${trs.userId}: ${trs.descript}`);
      }
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
