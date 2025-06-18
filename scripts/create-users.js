import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUsers() {
  try {
    console.log('🔄 Creating test users with all roles...');

    // Hash password for all accounts
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Test users data
    const users = [
      {
        email: 'superadmin@hrms.com',
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'SUPER_ADMIN',
        isActive: true,
        emailVerified: new Date(),
      },
      {
        email: 'admin@hrms.com',
        password: hashedPassword,
        firstName: 'System',
        lastName: 'Admin',
        role: 'ADMIN',
        isActive: true,
        emailVerified: new Date(),
      },
      {
        email: 'hr@hrms.com',
        password: hashedPassword,
        firstName: 'HR',
        lastName: 'Manager',
        role: 'HR_MANAGER',
        isActive: true,
        emailVerified: new Date(),
      },
      {
        email: 'manager@hrms.com',
        password: hashedPassword,
        firstName: 'Team',
        lastName: 'Manager',
        role: 'MANAGER',
        isActive: true,
        emailVerified: new Date(),
      },
      {
        email: 'employee@hrms.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Employee',
        role: 'EMPLOYEE',
        isActive: true,
        emailVerified: new Date(),
      },
    ];

    // Clear existing users first
    console.log('🗑️ Clearing existing test users...');
    await prisma.user.deleteMany({
      where: {
        email: {
          in: users.map(u => u.email)
        }
      }
    });

    // Create users using upsert for safety
    console.log('➕ Creating new test users...');
    for (const userData of users) {
      const user = await prisma.user.create({
        data: userData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          emailVerified: true,
          createdAt: true,
        }
      });
      
      console.log(`✅ Created: ${user.firstName} ${user.lastName} (${user.role}) - ${user.email}`);
    }

    console.log('\n🎉 All test users created successfully!\n');
    
    console.log('📧 TEST ACCOUNT CREDENTIALS:');
    console.log('═'.repeat(50));
    console.log('🔴 SUPER ADMIN:');
    console.log('   Email: superadmin@hrms.com');
    console.log('   Password: password123');
    console.log('   Role: SUPER_ADMIN');
    console.log('');
    console.log('🟠 ADMIN:');
    console.log('   Email: admin@hrms.com');
    console.log('   Password: password123');
    console.log('   Role: ADMIN');
    console.log('');
    console.log('🟢 HR MANAGER:');
    console.log('   Email: hr@hrms.com');
    console.log('   Password: password123');
    console.log('   Role: HR_MANAGER');
    console.log('');
    console.log('🟣 MANAGER:');
    console.log('   Email: manager@hrms.com');
    console.log('   Password: password123');
    console.log('   Role: MANAGER');
    console.log('');
    console.log('🔵 EMPLOYEE:');
    console.log('   Email: employee@hrms.com');
    console.log('   Password: password123');
    console.log('   Role: EMPLOYEE');
    console.log('═'.repeat(50));

    // Verify users were created
    const userCount = await prisma.user.count({
      where: {
        email: {
          in: users.map(u => u.email)
        }
      }
    });
    
    console.log(`\n📊 Total test users in database: ${userCount}`);

  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers();
