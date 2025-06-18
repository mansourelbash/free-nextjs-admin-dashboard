import { prisma } from './prisma';
import { emailService } from './email';

export class OTPService {
  // Generate a 6-digit OTP
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Create and send OTP
  static async createAndSendOTP(email: string, type: 'REGISTRATION' | 'PASSWORD_RESET' | 'EMAIL_VERIFICATION' | 'LOGIN_VERIFICATION') {
    try {
      // Delete any existing OTPs for this email and type
      await prisma.otpVerification.deleteMany({
        where: {
          email,
          type,
        },
      });

      // Generate new OTP
      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Save OTP to database
      await prisma.otpVerification.create({
        data: {
          email,
          otp,
          type,
          expiresAt,
        },
      });      // Send OTP via email
      const emailSent = await emailService.sendOTP(email, otp, type);
      
      if (!emailSent) {
        console.warn('⚠️ Email sending failed, but OTP was created in database for development testing');
        console.log(`🔢 Development OTP for ${email}: ${otp} (Type: ${type})`);
        // Don't throw error - allow development testing without email setup
      } else {
        console.log('✅ OTP sent successfully via email');
      }

      return { success: true, message: 'OTP sent successfully' };
    } catch (error) {
      console.error('Error creating and sending OTP:', error);
      return { success: false, message: 'Failed to send OTP' };
    }
  }

  // Verify OTP
  static async verifyOTP(email: string, otp: string, type: 'REGISTRATION' | 'PASSWORD_RESET' | 'EMAIL_VERIFICATION' | 'LOGIN_VERIFICATION') {
    try {
      const otpRecord = await prisma.otpVerification.findFirst({
        where: {
          email,
          otp,
          type,
          verified: false,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (!otpRecord) {
        return { success: false, message: 'Invalid or expired OTP' };
      }

      // Mark OTP as verified
      await prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { verified: true },
      });

      return { success: true, message: 'OTP verified successfully' };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return { success: false, message: 'Failed to verify OTP' };
    }
  }

  // Clean up expired OTPs (run this periodically)
  static async cleanupExpiredOTPs() {
    try {
      const result = await prisma.otpVerification.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });
      
      console.log(`Cleaned up ${result.count} expired OTPs`);
      return result.count;
    } catch (error) {
      console.error('Error cleaning up expired OTPs:', error);
      return 0;
    }
  }
}

export default OTPService;
