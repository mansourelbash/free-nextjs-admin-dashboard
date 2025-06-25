import { NextRequest, NextResponse } from 'next/server';
import { otpService } from '@/lib/otp-service';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Schema for password reset request (step 1: send OTP)
const passwordResetRequestSchema = z.object({
  email: z.string().email('Invalid email format')
});

// Schema for password reset confirmation (step 2: verify OTP and reset password)
const passwordResetConfirmSchema = z.object({
  email: z.string().email('Invalid email format'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters')
});

// POST: Send password reset OTP
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('🔐 Password reset OTP request:', { email: body.email });

    // Validate request body
    const validation = passwordResetRequestSchema.safeParse(body);
    if (!validation.success) {
      console.log('❌ Validation failed:', validation.error.errors);
      return NextResponse.json(
        { success: false, message: 'Invalid email format', errors: validation.error.errors },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { success: true, message: 'If an account with this email exists, a password reset OTP has been sent.' },
        { status: 200 }
      );
    }

    // Check if user has a password (not a social login user)
    if (!user.password) {
      return NextResponse.json(
        { success: false, message: 'This account uses social login. Password reset is not available.' },
        { status: 400 }
      );
    }

    // Send OTP
    const result = await otpService.createAndSendOTP(email, 'PASSWORD_RESET');

    if (result.success) {
      return NextResponse.json(
        { success: true, message: 'Password reset OTP sent to your email address.' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('Error in password reset request:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Verify OTP and reset password
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('🔐 Password reset confirmation:', { email: body.email, otp: '***' });

    // Validate request body
    const validation = passwordResetConfirmSchema.safeParse(body);
    if (!validation.success) {
      console.log('❌ Validation failed:', validation.error.errors);
      return NextResponse.json(
        { success: false, message: 'Invalid request data', errors: validation.error.errors },
        { status: 400 }
      );
    }

    const { email, otp, newPassword } = validation.data;

    // Verify OTP
    const otpResult = await otpService.verifyOTP(email, otp, 'PASSWORD_RESET');
    if (!otpResult.success) {
      return NextResponse.json(otpResult, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user's password
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        password: hashedPassword,
        updatedAt: new Date()
      }
    });

    console.log(`✅ Password reset successful for user: ${email}`);

    return NextResponse.json(
      { success: true, message: 'Password reset successfully. You can now log in with your new password.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in password reset confirmation:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
