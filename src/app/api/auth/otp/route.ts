import { NextRequest, NextResponse } from 'next/server';
import { otpService } from '@/lib/otp-service';
import { z } from 'zod';

// Schema for OTP creation request
const createOTPSchema = z.object({
  email: z.string().email('Invalid email format'),
  type: z.enum(['REGISTRATION', 'PASSWORD_RESET', 'EMAIL_VERIFICATION', 'LOGIN_VERIFICATION'])
});

// Schema for OTP verification request
const verifyOTPSchema = z.object({
  email: z.string().email('Invalid email format'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  type: z.enum(['REGISTRATION', 'PASSWORD_RESET', 'EMAIL_VERIFICATION', 'LOGIN_VERIFICATION'])
});

// POST: Send OTP
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('📧 OTP creation request:', { email: body.email, type: body.type });

    // Validate request body
    const validation = createOTPSchema.safeParse(body);
    if (!validation.success) {
      console.log('❌ Validation failed:', validation.error.errors);
      return NextResponse.json(
        { success: false, message: 'Invalid request data', errors: validation.error.errors },
        { status: 400 }
      );
    }

    const { email, type } = validation.data;

    // Create and send OTP
    const result = await otpService.createAndSendOTP(email, type);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('Error in OTP creation:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Verify OTP
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('🔍 OTP verification request:', { email: body.email, type: body.type, otp: '***' });

    // Validate request body
    const validation = verifyOTPSchema.safeParse(body);
    if (!validation.success) {
      console.log('❌ Validation failed:', validation.error.errors);
      return NextResponse.json(
        { success: false, message: 'Invalid request data', errors: validation.error.errors },
        { status: 400 }
      );
    }

    const { email, otp, type } = validation.data;

    // Verify OTP
    const result = await otpService.verifyOTP(email, otp, type);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('Error in OTP verification:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
