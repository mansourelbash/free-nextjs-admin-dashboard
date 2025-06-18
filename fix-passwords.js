import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function fixPasswords() {
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  await prisma.user.updateMany({
    where: { email: { in: ['admin@hrms.com', 'superadmin@hrms.com', 'hr@hrms.com', 'manager@hrms.com', 'employee@hrms.com'] } },
    data: { password: hashedPassword }
  });
  
  console.log('✅ Passwords updated!');
  await prisma.$disconnect();
}

fixPasswords();
