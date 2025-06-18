import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testLogin() {
  try {
    console.log('Testing login for admin@hrms.com...');
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: 'admin@hrms.com' }
    });
    
    if (!user) {
      console.log('❌ User not found in database');
      return;
    }
    
    console.log('✅ User found:');
    console.log('- Email:', user.email);
    console.log('- Role:', user.role);
    console.log('- Has password:', !!user.password);
    console.log('- Active:', user.isActive);
    
    if (!user.password) {
      console.log('❌ User has no password hash');
      return;
    }
    
    // Test password
    const testPassword = 'password123';
    const isValid = await bcrypt.compare(testPassword, user.password);
    
    console.log('🔐 Password test:');
    console.log('- Testing password:', testPassword);
    console.log('- Password valid:', isValid);
    
    if (isValid) {
      console.log('✅ Login should work!');
    } else {
      console.log('❌ Password does not match');
      
      // Let's also test what the stored hash looks like
      console.log('- Stored hash:', user.password.substring(0, 20) + '...');
      console.log('- Hash length:', user.password.length);
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
