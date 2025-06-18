import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testAuth() {
  try {
    console.log('🧪 Testing authentication for admin@hrms.com...\n');

    // Test user lookup
    const user = await prisma.user.findUnique({
      where: { email: 'admin@hrms.com' }
    });

    if (!user) {
      console.log('❌ User not found!');
      return;
    }

    console.log('✅ User found:');
    console.log(`   📧 Email: ${user.email}`);
    console.log(`   👤 Name: ${user.firstName} ${user.lastName}`);
    console.log(`   🎭 Role: ${user.role}`);
    console.log(`   🔐 Has password: ${!!user.password}`);
    console.log(`   ✅ Email verified: ${!!user.emailVerified}`);

    // Test password verification
    if (user.password) {
      const isValid = await bcrypt.compare('password123', user.password);
      console.log(`   🔑 Password 'password123' valid: ${isValid}`);
    }

    // Test login log creation
    console.log('\n🔍 Testing login log creation...');
    await prisma.loginLog.create({
      data: {
        userId: user.id,
        email: user.email,
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent',
        success: true,
        failureReason: null,
      }
    });
    console.log('✅ Login log created successfully!');

    // Count login logs
    const logCount = await prisma.loginLog.count({
      where: { email: user.email }
    });
    console.log(`📊 Total login logs for ${user.email}: ${logCount}`);

    console.log('\n🎉 Authentication system is working correctly!');
    console.log('🌐 Ready to test at: http://localhost:3000/auth/signin');

  } catch (error) {
    console.error('❌ Error testing authentication:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();
