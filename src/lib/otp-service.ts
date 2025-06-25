import { prisma } from './prisma';
import { emailService } from './email';

export class OTPService {
  // Generate 6-digit OTP
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Create and send OTP
  async createAndSendOTP(email: string, type: 'REGISTRATION' | 'PASSWORD_RESET' | 'EMAIL_VERIFICATION' | 'LOGIN_VERIFICATION'): Promise<{ success: boolean; message: string }> {
    try {
      // Clean up old OTPs for this email and type
      await prisma.otpVerification.deleteMany({
        where: {
          email: email.toLowerCase(),
          type,
          OR: [
            { verified: true },
            { expiresAt: { lt: new Date() } }
          ]
        }
      });

      // Generate new OTP
      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Save OTP to database
      await prisma.otpVerification.create({
        data: {
          email: email.toLowerCase(),
          otp,
          type,
          expiresAt,
          verified: false
        }
      });

      // Send email
      const emailSent = await emailService.sendOTP(email, otp, type);
      
      if (emailSent) {
        console.log(`✅ OTP sent successfully for ${type} to ${email}`);
        return {
          success: true,
          message: 'OTP sent successfully to your email address'
        };
      } else {
        console.error(`❌ Failed to send OTP email for ${type} to ${email}`);
        return {
          success: false,
          message: 'Failed to send OTP email. Please try again.'
        };
      }
    } catch (error) {
      console.error('Error creating and sending OTP:', error);
      return {
        success: false,
        message: 'Internal server error. Please try again.'
      };
    }
  }

  // Verify OTP
  async verifyOTP(email: string, otp: string, type: 'REGISTRATION' | 'PASSWORD_RESET' | 'EMAIL_VERIFICATION' | 'LOGIN_VERIFICATION'): Promise<{ success: boolean; message: string; data?: { otpId: string } }> {
    try {
      console.log(`🔍 Verifying OTP for ${email}, type: ${type}, OTP: ${otp}`);

      // Find the OTP
      const otpRecord = await prisma.otpVerification.findFirst({
        where: {
          email: email.toLowerCase(),
          otp,
          type,
          verified: false,
          expiresAt: { gt: new Date() }
        }
      });

      if (!otpRecord) {
        console.log(`❌ Invalid or expired OTP for ${email}`);
        return {
          success: false,
          message: 'Invalid or expired OTP'
        };
      }

      // Mark OTP as verified
      await prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { verified: true }
      });

      console.log(`✅ OTP verified successfully for ${email}`);

      // Handle different OTP types
      if (type === 'EMAIL_VERIFICATION') {
        // Update user's emailVerified field
        await prisma.user.update({
          where: { email: email.toLowerCase() },
          data: { emailVerified: new Date() }
        });
        console.log(`📧 Email verified for user: ${email}`);
      }

      return {
        success: true,
        message: 'OTP verified successfully',
        data: { otpId: otpRecord.id }
      };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        message: 'Internal server error. Please try again.'
      };
    }
  }

  // Check if OTP is valid (without verifying it)
  async isOTPValid(email: string, otp: string, type: 'REGISTRATION' | 'PASSWORD_RESET' | 'EMAIL_VERIFICATION' | 'LOGIN_VERIFICATION'): Promise<boolean> {
    try {
      const otpRecord = await prisma.otpVerification.findFirst({
        where: {
          email: email.toLowerCase(),
          otp,
          type,
          verified: false,
          expiresAt: { gt: new Date() }
        }
      });

      return !!otpRecord;
    } catch (error) {
      console.error('Error checking OTP validity:', error);
      return false;
    }
  }

  // Resend OTP (with rate limiting)
  async resendOTP(email: string, type: 'REGISTRATION' | 'PASSWORD_RESET' | 'EMAIL_VERIFICATION' | 'LOGIN_VERIFICATION'): Promise<{ success: boolean; message: string }> {
    try {
      // Check if there's a recent OTP (within last 2 minutes)
      const recentOTP = await prisma.otpVerification.findFirst({
        where: {
          email: email.toLowerCase(),
          type,
          createdAt: { gt: new Date(Date.now() - 2 * 60 * 1000) } // 2 minutes ago
        }
      });

      if (recentOTP) {
        return {
          success: false,
          message: 'Please wait 2 minutes before requesting a new OTP'
        };
      }

      // Create and send new OTP
      return await this.createAndSendOTP(email, type);
    } catch (error) {
      console.error('Error resending OTP:', error);
      return {
        success: false,
        message: 'Internal server error. Please try again.'
      };
    }
  }

  // Clean up expired OTPs (can be called by a cron job)
  async cleanupExpiredOTPs(): Promise<void> {
    try {
      const result = await prisma.otpVerification.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { verified: true },
            { createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } } // Older than 24 hours
          ]
        }
      });

      console.log(`🧹 Cleaned up ${result.count} expired/verified OTP records`);
    } catch (error) {
      console.error('Error cleaning up expired OTPs:', error);
    }
  }
}

export const otpService = new OTPService();
