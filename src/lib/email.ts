import nodemailer from 'nodemailer';

// Email service using Gmail (free)
class EmailService {
  private transporter: nodemailer.Transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER, // Your Gmail address
        pass: process.env.GMAIL_APP_PASSWORD, // Gmail App Password (not regular password)
      },
    });
  }
  async sendOTP(email: string, otp: string, type: string) {
    // Check if Gmail credentials are properly configured
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error('❌ Gmail credentials not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD in .env.local');
      console.error('📧 For testing purposes, we\'ll simulate email sending...');
      console.log(`🔢 OTP for ${email}: ${otp} (Type: ${type})`);
      return true; // Return true for development testing
    }

    if (process.env.GMAIL_USER === 'your-gmail@gmail.com' || process.env.GMAIL_APP_PASSWORD === 'your-gmail-app-password') {
      console.error('❌ Gmail credentials are still using placeholder values.');
      console.error('📧 For testing purposes, we\'ll simulate email sending...');
      console.log(`🔢 OTP for ${email}: ${otp} (Type: ${type})`);
      return true; // Return true for development testing
    }

    const subject = this.getSubject(type);
    const htmlContent = this.getOTPTemplate(otp, type);

    try {
      const info = await this.transporter.sendMail({
        from: `"HRMS System" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: subject,
        html: htmlContent,
      });

      console.log('✅ Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Error sending email:', error);
      console.error('📧 For testing purposes, we\'ll simulate email sending...');
      console.log(`🔢 OTP for ${email}: ${otp} (Type: ${type})`);
      return true; // Return true for development testing to not block the flow
    }
  }

  async sendPasswordResetLink(email: string, resetToken: string) {
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You requested a password reset for your HRMS account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Reset Password
        </a>
        <p style="margin-top: 20px;">This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: `"HRMS System" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: 'Password Reset Request - HRMS',
        html: htmlContent,
      });

      console.log('Password reset email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return false;
    }
  }

  private getSubject(type: string): string {
    switch (type) {
      case 'REGISTRATION':
        return 'Verify Your Email - HRMS Registration';
      case 'PASSWORD_RESET':
        return 'Password Reset Verification - HRMS';
      case 'EMAIL_VERIFICATION':
        return 'Email Verification - HRMS';
      case 'LOGIN_VERIFICATION':
        return 'Login Verification - HRMS';
      default:
        return 'Verification Code - HRMS';
    }
  }

  private getOTPTemplate(otp: string, type: string): string {
    const purpose = this.getPurpose(type);
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #007bff; margin: 0;">HRMS</h1>
          <p style="color: #666; margin: 5px 0;">Human Resource Management System</p>
        </div>
        
        <h2 style="color: #333; text-align: center;">Verification Code</h2>
        <p>Hello,</p>
        <p>You requested ${purpose}. Please use the verification code below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #f8f9fa; border: 2px dashed #007bff; padding: 20px; border-radius: 8px; display: inline-block;">
            <span style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 8px;">${otp}</span>
          </div>
        </div>
        
        <p>This code will expire in <strong>10 minutes</strong>.</p>
        <p>If you didn't request this, please ignore this email.</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          This is an automated email from HRMS. Please do not reply to this email.
        </p>
      </div>
    `;
  }

  private getPurpose(type: string): string {
    switch (type) {
      case 'REGISTRATION':
        return 'to verify your email for account registration';
      case 'PASSWORD_RESET':
        return 'to reset your password';
      case 'EMAIL_VERIFICATION':
        return 'to verify your email address';
      case 'LOGIN_VERIFICATION':
        return 'to verify your login attempt';
      default:
        return 'verification';
    }
  }
}

export const emailService = new EmailService();
