import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestAccounts() {
  try {
    console.log('Creating test accounts...');

    // Hash password for all accounts (using "password123" as the common password)
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Account 1: Super Admin
    const superAdmin = await prisma.user.upsert({
      where: { email: 'superadmin@hrms.com' },
      update: {},
      create: {
        email: 'superadmin@hrms.com',
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });

    // Account 2: Admin
    const admin = await prisma.user.upsert({
      where: { email: 'admin@hrms.com' },
      update: {},
      create: {
        email: 'admin@hrms.com',
        password: hashedPassword,
        firstName: 'System',
        lastName: 'Admin',
        role: 'ADMIN',
        isActive: true,
      },
    });

    // Account 3: HR Manager
    const hrManager = await prisma.user.upsert({
      where: { email: 'hr@hrms.com' },
      update: {},
      create: {
        email: 'hr@hrms.com',
        password: hashedPassword,
        firstName: 'HR',
        lastName: 'Manager',
        role: 'HR_MANAGER',
        isActive: true,
      },
    });

    // Account 4: Manager
    const manager = await prisma.user.upsert({
      where: { email: 'manager@hrms.com' },
      update: {},
      create: {
        email: 'manager@hrms.com',
        password: hashedPassword,
        firstName: 'Team',
        lastName: 'Manager',
        role: 'MANAGER',
        isActive: true,
      },
    });

    // Account 5: Employee
    const employee = await prisma.user.upsert({
      where: { email: 'employee@hrms.com' },
      update: {},
      create: {
        email: 'employee@hrms.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Employee',
        role: 'EMPLOYEE',
        isActive: true,
      },
    });

    console.log('✅ Test accounts created successfully!');
    console.log('\n📧 Test Account Credentials:');
    console.log('================================');
    console.log('1. SUPER ADMIN:');
    console.log('   Email: superadmin@hrms.com');
    console.log('   Password: password123');
    console.log('   Role: SUPER_ADMIN');
    console.log('');
    console.log('2. ADMIN:');
    console.log('   Email: admin@hrms.com');
    console.log('   Password: password123');
    console.log('   Role: ADMIN');
    console.log('');
    console.log('3. HR MANAGER:');
    console.log('   Email: hr@hrms.com');
    console.log('   Password: password123');
    console.log('   Role: HR_MANAGER');
    console.log('');
    console.log('4. MANAGER:');
    console.log('   Email: manager@hrms.com');
    console.log('   Password: password123');
    console.log('   Role: MANAGER');
    console.log('');
    console.log('5. EMPLOYEE:');
    console.log('   Email: employee@hrms.com');
    console.log('   Password: password123');
    console.log('   Role: EMPLOYEE');
    console.log('================================');

  } catch (error) {
    console.error('Error creating test accounts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestAccounts();
