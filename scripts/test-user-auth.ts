import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testLogin(email: string, password: string) {
  console.log(`\n🔐 Testing login for: ${email}`);
  
  try {
    // Find user
    const user = await (prisma.user as any).findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        password: true,
        isActive: true
      }
    });

    if (!user) {
      console.log('❌ User not found');
      return false;
    }

    if (!user.isActive) {
      console.log('❌ User account is inactive');
      return false;
    }

    if (!user.password) {
      console.log('❌ User has no password set');
      return false;
    }

    // Test password
    const isValid = await bcrypt.compare(password, user.password);
    
    if (isValid) {
      console.log('✅ Login successful!');
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   ID: ${user.id}`);
      return true;
    } else {
      console.log('❌ Invalid password');
      return false;
    }

  } catch (error) {
    console.log('❌ Error during login test:', error);
    return false;
  }
}

async function testAllUsers() {
  console.log('🧪 Testing authentication for all test users...');
  console.log('================================================');

  const testUsers = [
    { email: 'superadmin@hrms.com', password: 'password123', role: '🔴 SUPER_ADMIN' },
    { email: 'admin@hrms.com', password: 'password123', role: '🟠 ADMIN' },
    { email: 'hr@hrms.com', password: 'password123', role: '🟢 HR_MANAGER' },
    { email: 'manager@hrms.com', password: 'password123', role: '🟣 MANAGER' },
    { email: 'employee@hrms.com', password: 'password123', role: '🔵 EMPLOYEE' }
  ];

  let successCount = 0;

  for (const testUser of testUsers) {
    console.log(`\n${testUser.role} - ${testUser.email}`);
    const success = await testLogin(testUser.email, testUser.password);
    if (success) {
      successCount++;
    }
  }

  console.log('\n================================================');
  console.log(`✅ Authentication test results: ${successCount}/${testUsers.length} successful`);
  
  if (successCount === testUsers.length) {
    console.log('🎉 All test users can authenticate successfully!');
  } else {
    console.log('⚠️  Some users failed authentication - check the logs above');
  }
}

async function main() {
  try {
    await testAllUsers();
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('❌ Script failed:', e);
    process.exit(1);
  });
