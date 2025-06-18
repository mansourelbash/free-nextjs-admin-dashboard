import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { OTPService } from "@/lib/otp";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if email exists or not for security
      return NextResponse.json(
        { message: "If the email exists, a password reset link has been sent." },
        { status: 200 }
      );
    }    // Send password reset OTP instead of token
    const otpResult = await OTPService.createAndSendOTP(email, 'PASSWORD_RESET');

    if (!otpResult.success) {
      console.warn('⚠️ Email sending failed, but OTP was created for development testing');
      console.log(`🔢 Development Password Reset OTP for ${email}: Check OTP table or console`);
      // Don't return error - allow development testing
    }

    return NextResponse.json(
      { message: "If the email exists, a password reset code has been sent to your email." },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
