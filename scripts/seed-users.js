import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedUsers() {
  try {
    console.log('🌱 Starting to seed test users...');

    // Hash password for all users (using "password123" for all)
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Test users with different roles
    const testUsers = [
      {
        email: 'admin@hrms.com',
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'SUPER_ADMIN',
        imageUrl: null,
      },
      {
        email: 'hr@hrms.com',
        password: hashedPassword,
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'HR_MANAGER',
        imageUrl: null,
      },
      {
        email: 'manager@hrms.com',
        password: hashedPassword,
        firstName: 'Mike',
        lastName: 'Wilson',
        role: 'MANAGER',
        imageUrl: null,
      },
      {
        email: 'employee@hrms.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        role: 'EMPLOYEE',
        imageUrl: null,
      },
    ];

    console.log('📝 Creating users...');
    
    for (const userData of testUsers) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        console.log(`⚠️  User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Create new user
      const user = await prisma.user.create({
        data: userData
      });

      console.log(`✅ Created user: ${user.firstName} ${user.lastName} (${user.role}) - ${user.email}`);
    }

    console.log('\n🎉 User seeding completed successfully!');
    console.log('\n📋 TEST ACCOUNT CREDENTIALS:');
    console.log('=====================================');
    console.log('🔴 SUPER ADMIN:');
    console.log('   Email: admin@hrms.com');
    console.log('   Password: password123');
    console.log('   Role: SUPER_ADMIN');
    console.log('\n🟢 HR MANAGER:');
    console.log('   Email: hr@hrms.com');
    console.log('   Password: password123');
    console.log('   Role: HR_MANAGER');
    console.log('\n🟣 MANAGER:');
    console.log('   Email: manager@hrms.com');
    console.log('   Password: password123');
    console.log('   Role: MANAGER');
    console.log('\n⚪ EMPLOYEE:');
    console.log('   Email: employee@hrms.com');
    console.log('   Password: password123');
    console.log('   Role: EMPLOYEE');
    console.log('=====================================');

  } catch (error) {
    console.error('❌ Error seeding users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedUsers();
