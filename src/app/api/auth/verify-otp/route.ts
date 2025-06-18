import { NextRequest, NextResponse } from "next/server";
import { OTPService } from "@/lib/otp";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const verifyOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
  type: z.enum(['REGISTRATION', 'PASSWORD_RESET', 'EMAIL_VERIFICATION', 'LOGIN_VERIFICATION']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp, type } = verifyOtpSchema.parse(body);    const result = await OTPService.verifyOTP(email, otp, type);

    if (result.success) {
      // If it's a password reset OTP, generate a reset token
      if (type === 'PASSWORD_RESET') {
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (user) {
          // Generate a secure reset token
          const resetToken = crypto.randomBytes(32).toString('hex');
          const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

          // Save the reset token
          await prisma.passwordResetToken.create({
            data: {
              userId: user.id,
              token: resetToken,
              expiresAt,
            },
          });

          return NextResponse.json(
            { message: result.message, token: resetToken },
            { status: 200 }
          );
        }
      }

      return NextResponse.json(
        { message: result.message },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
