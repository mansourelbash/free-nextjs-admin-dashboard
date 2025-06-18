import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get command line arguments
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('📋 Current users in database:');
    console.log('================================');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        clerkId: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (users.length === 0) {
      console.log('No users found. Sign up first at http://localhost:3004');
      return;
    }

    users.forEach((user: typeof users[0], index: number) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Clerk ID: ${user.clerkId}`);
      console.log('');
    });

    console.log('💡 Usage:');
    console.log('  To change role: npm run change-role <email> <role>');
    console.log('  Available roles: SUPER_ADMIN, ADMIN, HR_MANAGER, MANAGER, EMPLOYEE');
    console.log('  Example: npm run change-role your@email.com SUPER_ADMIN');
    return;
  }

  if (args.length !== 2) {
    console.log('❌ Usage: npm run change-role <email> <role>');
    console.log('Available roles: SUPER_ADMIN, ADMIN, HR_MANAGER, MANAGER, EMPLOYEE');
    return;
  }

  const [email, role] = args;
  const validRoles = ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'MANAGER', 'EMPLOYEE'];

  if (!validRoles.includes(role)) {
    console.log(`❌ Invalid role: ${role}`);
    console.log(`Available roles: ${validRoles.join(', ')}`);
    return;
  }

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: role as 'SUPER_ADMIN' | 'ADMIN' | 'HR_MANAGER' | 'MANAGER' | 'EMPLOYEE' },
    });

    console.log(`✅ Successfully updated ${user.firstName} ${user.lastName} (${user.email}) to role: ${role}`);
    console.log('🎯 You can now test the new role by refreshing your browser!');  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      console.log(`❌ User with email ${email} not found`);
      console.log('💡 Make sure the user has signed up first');
    } else {
      console.error('❌ Error updating user role:', error);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
