import { NextRequest, NextResponse } from "next/server";
import { OTPService } from "@/lib/otp";
import { z } from "zod";

const sendOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  type: z.enum(['REGISTRATION', 'PASSWORD_RESET', 'EMAIL_VERIFICATION', 'LOGIN_VERIFICATION']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, type } = sendOtpSchema.parse(body);

    const result = await OTPService.createAndSendOTP(email, type);

    if (result.success) {
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

    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
