import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createEmployeeRecords() {
  try {
    console.log('Checking for users without employee records...');

    // Find all users who don't have employee records
    const usersWithoutEmployees = await prisma.user.findMany({
      where: {
        employee: null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    console.log(`Found ${usersWithoutEmployees.length} users without employee records:`);
    usersWithoutEmployees.forEach(user => {
      console.log(`- ${user.email} (${user.firstName} ${user.lastName}) - Role: ${user.role}`);
    });

    // Create employee records for users without them
    for (const user of usersWithoutEmployees) {
      const employeeId = `EMP${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`;
      
      const employee = await prisma.employee.create({
        data: {
          employeeId: employeeId,
          userId: user.id,
          status: 'ACTIVE',
          hireDate: new Date(),
        },
      });

      console.log(`✅ Created employee record for ${user.email} with ID: ${employeeId}`);
    }

    console.log('✅ Employee record creation completed!');

    // Show summary
    const totalEmployees = await prisma.employee.count();
    console.log(`Total employee records in database: ${totalEmployees}`);

  } catch (error) {
    console.error('❌ Error creating employee records:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createEmployeeRecords();
