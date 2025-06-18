import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyUsers() {
  try {
    console.log('🔍 Verifying test users in database...\n');

    const users = await prisma.user.findMany({
      where: {
        email: {
          in: ['superadmin@hrms.com', 'admin@hrms.com', 'hr@hrms.com', 'manager@hrms.com', 'employee@hrms.com']
        }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        password: true,
        emailVerified: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: {
        role: 'asc'
      }
    });

    if (users.length === 0) {
      console.log('❌ No test users found in database!');
      return;
    }

    console.log(`✅ Found ${users.length} test users:\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   👤 Role: ${user.role}`);
      console.log(`   🔐 Has Password: ${user.password ? 'Yes' : 'No'}`);
      console.log(`   ✅ Email Verified: ${user.emailVerified ? 'Yes' : 'No'}`);
      console.log(`   🟢 Active: ${user.isActive ? 'Yes' : 'No'}`);
      console.log(`   📅 Created: ${user.createdAt.toISOString()}`);
      console.log('');
    });

    console.log('🎯 All users are ready for testing!');
    console.log('🌐 Go to: http://localhost:3000/auth/signin');
    console.log('🔑 Use any email above with password: password123');

  } catch (error) {
    console.error('❌ Error verifying users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyUsers();
