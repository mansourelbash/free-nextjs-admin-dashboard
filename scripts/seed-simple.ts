import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with test data...');

  // Create departments
  const itDepartment = await prisma.department.upsert({
    where: { name: 'Information Technology' },
    update: {},
    create: {
      name: 'Information Technology',
      description: 'Software development and IT support',
    },
  });

  const hrDepartment = await prisma.department.upsert({
    where: { name: 'Human Resources' },
    update: {},
    create: {
      name: 'Human Resources',
      description: 'Employee management and HR services',
    },
  });

  const financeDepartment = await prisma.department.upsert({
    where: { name: 'Finance' },
    update: {},
    create: {
      name: 'Finance',
      description: 'Financial planning and accounting',
    },
  });

  // Create positions
  console.log('Creating positions...');
  
  try {
    await prisma.position.createMany({
      data: [
        { title: 'Software Engineer', departmentId: itDepartment.id, level: 'MID' },
        { title: 'Senior Developer', departmentId: itDepartment.id, level: 'SENIOR' },
        { title: 'IT Manager', departmentId: itDepartment.id, level: 'MANAGER' },
        { title: 'HR Specialist', departmentId: hrDepartment.id, level: 'MID' },
        { title: 'HR Manager', departmentId: hrDepartment.id, level: 'MANAGER' },
        { title: 'Accountant', departmentId: financeDepartment.id, level: 'MID' },
        { title: 'Finance Manager', departmentId: financeDepartment.id, level: 'MANAGER' },
      ],
      skipDuplicates: true,
    });
  } catch {
    console.log('Positions may already exist, skipping...');
  }

  // Create dummy users for testing
  console.log('Creating dummy users...');
  
  try {    const dummyUsers = [
      {
        clerkId: 'user_dummy_admin',
        email: 'admin@hrms.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'SUPER_ADMIN' as const,
      },
      {
        clerkId: 'user_dummy_hr',
        email: 'hr@hrms.com',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'HR_MANAGER' as const,
      },
      {
        clerkId: 'user_dummy_employee',
        email: 'employee@hrms.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'EMPLOYEE' as const,
      },
    ];

    for (const userData of dummyUsers) {
      await prisma.user.upsert({
        where: { clerkId: userData.clerkId },
        update: {},
        create: userData,
      });
    }
    
    console.log('✅ Created 3 dummy users with different roles');
  } catch (seedError) {
    console.log('Dummy users may already exist or error occurred:', seedError);
  }

  console.log('✅ Database seeded successfully!');
  console.log('📊 Created:');
  console.log('  - 3 Departments (IT, HR, Finance)');
  console.log('  - 7 Positions across departments');
  console.log('  - 3 Dummy users (SUPER_ADMIN, HR_MANAGER, EMPLOYEE)');
  console.log('');
  console.log('🎯 Next steps:');
  console.log('  1. Sign up at http://localhost:3002');
  console.log('  2. Check your role in the dashboard');
  console.log('  3. For testing: Use admin@hrms.com (SUPER_ADMIN), hr@hrms.com (HR_MANAGER), employee@hrms.com (EMPLOYEE)');
  console.log('  4. Start managing employees!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
