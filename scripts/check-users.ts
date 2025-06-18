import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  console.log('🔍 Checking users in database...\n');

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (users.length === 0) {
      console.log('❌ No users found in database');
      console.log('📝 This means:');
      console.log('   1. No one has signed up yet');
      console.log('   2. The webhook may not be working');
      console.log('   3. Or the webhook secret is incorrect');
    } else {
      console.log(`✅ Found ${users.length} users:\n`);
      
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   🔑 Role: ${user.role}`);
        console.log(`   🆔 Clerk ID: ${user.clerkId}`);
        console.log(`   📅 Created: ${user.createdAt}`);
        console.log('');
      });
    }

    // Check departments and positions
    const departments = await prisma.department.count();
    const positions = await prisma.position.count();
    
    console.log(`📊 Database Status:`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Departments: ${departments}`);
    console.log(`   - Positions: ${positions}`);

  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
