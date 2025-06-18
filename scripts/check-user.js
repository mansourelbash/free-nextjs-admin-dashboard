const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@hrms.com' }
    });
    
    if (user) {
      console.log('✅ User found in database:');
      console.log('ID:', user.id);
      console.log('Email:', user.email);
      console.log('Role:', user.role);
      console.log('Has password:', !!user.password);
      console.log('Password hash length:', user.password ? user.password.length : 'No password');
      console.log('Active:', user.isActive);
    } else {
      console.log('❌ User not found in database');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
