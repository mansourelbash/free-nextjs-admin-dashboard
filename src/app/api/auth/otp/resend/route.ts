import { NextRequest, NextResponse } from 'next/server';
import { otpService } from '@/lib/otp-service';
import { z } from 'zod';

// Schema for OTP resend request
const resendOTPSchema = z.object({
  email: z.string().email('Invalid email format'),
  type: z.enum(['REGISTRATION', 'PASSWORD_RESET', 'EMAIL_VERIFICATION', 'LOGIN_VERIFICATION'])
});

// POST: Resend OTP
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('🔄 OTP resend request:', { email: body.email, type: body.type });

    // Validate request body
    const validation = resendOTPSchema.safeParse(body);
    if (!validation.success) {
      console.log('❌ Validation failed:', validation.error.errors);
      return NextResponse.json(
        { success: false, message: 'Invalid request data', errors: validation.error.errors },
        { status: 400 }
      );
    }

    const { email, type } = validation.data;

    // Resend OTP
    const result = await otpService.resendOTP(email, type);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 429 }); // Too Many Requests
    }
  } catch (error) {
    console.error('Error in OTP resend:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
