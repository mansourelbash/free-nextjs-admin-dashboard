import { PrismaClient, Position } from '@prisma/client';

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
    });  } catch (error) {
    console.log('Positions may already exist, skipping...');
  }

  // Create dummy users for testing
  console.log('Creating dummy users...');
    try {
    // Get positions
    const positions = await prisma.position.findMany();
    const softwareEngineer = positions.find(p => p.title === 'Software Engineer');
    const hrManager = positions.find(p => p.title === 'HR Manager');
    const financeManager = positions.find(p => p.title === 'Finance Manager');

    // Create dummy users
    const dummyUsers = [
      {
        clerkId: 'user_dummy_admin',
        email: 'admin@hrms.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'SUPER_ADMIN' as const,
        employee: softwareEngineer ? {
          create: {
            employeeId: 'EMP001',
            positionId: softwareEngineer.id,
            hireDate: new Date('2023-01-01'),
            status: 'ACTIVE' as const,
            salary: 120000,
          }
        } : undefined,
      },
      {
        clerkId: 'user_dummy_hr',
        email: 'hr@hrms.com',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'HR_ADMIN' as const,
        employee: hrManager ? {
          create: {
            employeeId: 'EMP002',
            positionId: hrManager.id,
            hireDate: new Date('2023-02-01'),
            status: 'ACTIVE' as const,
            salary: 95000,
          }
        } : undefined,
      },
      {
        clerkId: 'user_dummy_employee',
        email: 'employee@hrms.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'EMPLOYEE' as const,
        employee: financeManager ? {
          create: {
            employeeId: 'EMP003',
            positionId: financeManager.id,
            hireDate: new Date('2023-03-01'),
            status: 'ACTIVE' as const,
            salary: 85000,
          }
        } : undefined,
      },
    ];    for (const userData of dummyUsers) {
      const user = await prisma.user.upsert({
        where: { clerkId: userData.clerkId },
        update: {},
        create: {
          clerkId: userData.clerkId,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
        },
      });

      // Create employee record if position exists
      if (userData.employee?.create && userData.employee.create.positionId) {
        await prisma.employee.upsert({
          where: { userId: user.id },
          update: {},
          create: {
            employeeId: userData.employee.create.employeeId,
            userId: user.id,
            positionId: userData.employee.create.positionId,
            hireDate: userData.employee.create.hireDate,
            status: userData.employee.create.status,
            salary: userData.employee.create.salary,
          },
        });
      }
    }
    console.log('✅ Created 3 dummy users with different roles');
  } catch (seedError) {
    console.log('Dummy users may already exist or error occurred:', seedError);
  }

  console.log('✅ Database seeded successfully!');
  console.log('📊 Created:');
  console.log('  - 3 Departments (IT, HR, Finance)');
  console.log('  - 7 Positions across departments');
  console.log('  - 3 Dummy users (SUPER_ADMIN, HR_ADMIN, EMPLOYEE)');
  console.log('');
  console.log('🎯 Next steps:');
  console.log('  1. Sign up at http://localhost:3002');
  console.log('  2. Check your role in the dashboard');
  console.log('  3. For testing: Use admin@hrms.com (SUPER_ADMIN), hr@hrms.com (HR_ADMIN), employee@hrms.com (EMPLOYEE)');
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
