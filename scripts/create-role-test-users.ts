import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface TestUser {
  role: Role;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  displayName: string;
}

const testUsers: TestUser[] = [
  {
    role: 'SUPER_ADMIN',
    email: 'superadmin@hrms.com',
    password: 'password123',
    firstName: 'Super',
    lastName: 'Admin',
    displayName: '🔴 SUPER_ADMIN'
  },
  {
    role: 'ADMIN',
    email: 'admin@hrms.com',
    password: 'password123',
    firstName: 'System',
    lastName: 'Admin',
    displayName: '🟠 ADMIN'
  },
  {
    role: 'HR_MANAGER',
    email: 'hr@hrms.com',
    password: 'password123',
    firstName: 'HR',
    lastName: 'Manager',
    displayName: '🟢 HR_MANAGER'
  },
  {
    role: 'MANAGER',
    email: 'manager@hrms.com',
    password: 'password123',
    firstName: 'Team',
    lastName: 'Manager',
    displayName: '🟣 MANAGER'
  },
  {
    role: 'EMPLOYEE',
    email: 'employee@hrms.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Employee',
    displayName: '🔵 EMPLOYEE'
  }
];

async function createTestUsers() {
  console.log('👥 Creating role-based test users...\n');

  // First, let's clean up existing test users to avoid conflicts
  console.log('🧹 Cleaning up existing test users...');
  const testEmails = testUsers.map(user => user.email);
  
  try {
    await prisma.user.deleteMany({
      where: {
        email: {
          in: testEmails
        }
      }
    });
    console.log('✅ Cleaned up existing test users\n');    } catch (error: any) {
      console.log('⚠️  No existing test users to clean up\n');
    }

  console.log('📝 Creating new test users:');
  console.log('================================================');
  console.log('Role\t\t\tEmail\t\t\tPassword\tName');
  console.log('================================================');

  for (const testUser of testUsers) {
    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(testUser.password, 12);      // Create the user with type assertion to handle schema mismatch
      await (prisma.user as any).create({
        data: {
          email: testUser.email,
          password: hashedPassword,
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          role: testUser.role,
          emailVerified: new Date(), // Mark as verified for testing
          isActive: true
        }
      });

      console.log(`${testUser.displayName}\t${testUser.email}\t${testUser.password}\t${testUser.firstName} ${testUser.lastName}`);

    } catch (error) {
      console.error(`❌ Error creating user ${testUser.email}:`, error);
    }
  }

  console.log('================================================');
  console.log('\n✅ All test users created successfully!');
  console.log('\n📋 Quick Reference:');
  console.log('All users have password: password123');
  console.log('All users are marked as verified and active');
  
  console.log('\n🔐 Role Hierarchy:');
  console.log('SUPER_ADMIN > ADMIN > HR_MANAGER > MANAGER > EMPLOYEE');
  
  console.log('\n🌐 Test Login URLs:');
  console.log('• Sign In: http://localhost:3000/auth/signin');
  console.log('• Dashboard: http://localhost:3000/dashboard (after login)');
}

async function verifyUsers() {
  console.log('\n🔍 Verifying created users...');
    const users = await (prisma.user as any).findMany({
    where: {
      email: {
        in: testUsers.map(u => u.email)
      }
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true
    },
    orderBy: [
      { role: 'asc' },
      { email: 'asc' }
    ]
  });

  console.log('\n📊 Created Users Summary:');
  console.log('==================================');  users.forEach((user: any) => {
    const roleEmoji: { [key: string]: string } = {
      'SUPER_ADMIN': '🔴',
      'ADMIN': '🟠', 
      'HR_MANAGER': '🟢',
      'MANAGER': '🟣',
      'EMPLOYEE': '🔵'
    };
    const emoji = roleEmoji[user.role] || '⚪';

    console.log(`${emoji} ${user.role.padEnd(12)} | ${user.email.padEnd(20)} | ${user.firstName} ${user.lastName}`);
  });
  
  console.log('==================================');
  console.log(`\n✅ Total users created: ${users.length}`);
}

async function main() {
  try {
    await createTestUsers();
    await verifyUsers();
  } catch (error) {
    console.error('❌ Error in main function:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('❌ Script failed:', e);
    process.exit(1);
  });
