import { NextRequest, NextResponse } from 'next/server';
import { otpService } from '@/lib/otp-service';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for email verification request
const emailVerificationRequestSchema = z.object({
  email: z.string().email('Invalid email format')
});

// Schema for email verification confirmation
const emailVerificationConfirmSchema = z.object({
  email: z.string().email('Invalid email format'),
  otp: z.string().length(6, 'OTP must be 6 digits')
});

// POST: Send email verification OTP
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('📧 Email verification request:', { email: body.email });

    // Validate request body
    const validation = emailVerificationRequestSchema.safeParse(body);
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
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { success: false, message: 'Email is already verified' },
        { status: 400 }
      );
    }

    // Send OTP
    const result = await otpService.createAndSendOTP(email, 'EMAIL_VERIFICATION');

    if (result.success) {
      return NextResponse.json(
        { success: true, message: 'Email verification OTP sent to your email address.' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('Error in email verification request:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Verify email with OTP
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('📧 Email verification confirmation:', { email: body.email, otp: '***' });

    // Validate request body
    const validation = emailVerificationConfirmSchema.safeParse(body);
    if (!validation.success) {
      console.log('❌ Validation failed:', validation.error.errors);
      return NextResponse.json(
        { success: false, message: 'Invalid request data', errors: validation.error.errors },
        { status: 400 }
      );
    }

    const { email, otp } = validation.data;

    // Verify OTP (this will also update emailVerified field)
    const otpResult = await otpService.verifyOTP(email, otp, 'EMAIL_VERIFICATION');
    if (!otpResult.success) {
      return NextResponse.json(otpResult, { status: 400 });
    }

    console.log(`✅ Email verification successful for user: ${email}`);

    return NextResponse.json(
      { success: true, message: 'Email verified successfully!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in email verification confirmation:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
