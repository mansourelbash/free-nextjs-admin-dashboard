import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserPassword() {
  try {
    console.log('🔍 Checking user password in database...');
    
    const user = await prisma.user.findUnique({
      where: { email: 'mansour.programmar@gmail.com' },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        createdAt: true,
      }
    });
    
    if (user) {
      console.log('✅ User found:');
      console.log('- Email:', user.email);
      console.log('- Has Password:', !!user.password);
      console.log('- Password Hash Length:', user.password?.length || 0);
      console.log('- Role:', user.role);
      console.log('- Created:', user.createdAt);
    } else {
      console.log('❌ User not found');
    }
    
    // Also check test users
    console.log('\n🔍 Checking test users...');
    const testUsers = await prisma.user.findMany({
      where: {
        email: {
          in: ['superadmin@hrms.com', 'admin@hrms.com', 'hr@hrms.com']
        }
      },
      select: {
        email: true,
        password: true,
        role: true,
      }
    });
    
    testUsers.forEach(user => {
      console.log(`- ${user.email}: Has Password: ${!!user.password}, Role: ${user.role}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserPassword();
