import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUserRole() {
  const email = process.argv[2];
  const role = process.argv[3];

  if (!email || !role) {
    console.log('❌ Usage: npx tsx scripts/update-role.ts <email> <role>');
    console.log('');
    console.log('Available roles: SUPER_ADMIN, ADMIN, HR_MANAGER, MANAGER, EMPLOYEE');
    console.log('');
    console.log('Example:');
    console.log('  npx tsx scripts/update-role.ts user@example.com SUPER_ADMIN');
    return;
  }

  const validRoles = ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'MANAGER', 'EMPLOYEE'];
  
  if (!validRoles.includes(role)) {
    console.log(`❌ Invalid role: ${role}`);
    console.log(`Valid roles: ${validRoles.join(', ')}`);
    return;
  }

  try {    const user = await prisma.user.update({
      where: { email },
      data: { role: role as 'SUPER_ADMIN' | 'ADMIN' | 'HR_MANAGER' | 'MANAGER' | 'EMPLOYEE' },
    });

    console.log('✅ User role updated successfully!');
    console.log(`📧 Email: ${user.email}`);
    console.log(`👤 Name: ${user.firstName} ${user.lastName}`);
    console.log(`🔑 New Role: ${user.role}`);
    console.log('');
    console.log('🎯 You can now test the admin features!');
    
  } catch (error) {
    if (error.code === 'P2025') {
      console.log(`❌ User not found with email: ${email}`);
      console.log('');
      console.log('Available users:');
      
      const users = await prisma.user.findMany({
        select: { email: true, firstName: true, lastName: true, role: true }
      });
      
      users.forEach(user => {
        console.log(`  📧 ${user.email} - ${user.firstName} ${user.lastName} (${user.role})`);
      });
    } else {
      console.error('❌ Error updating user role:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

updateUserRole();
