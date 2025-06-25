# Email Setup Guide for HRMS System

## Overview
The HRMS system uses Gmail to send OTP (One-Time Password) codes for email verification and password reset functionality.

## Gmail App Password Setup

### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click on "Security" in the left sidebar
3. Find "2-Step Verification" and click "Get started" (if not already enabled)
4. Follow the prompts to set up 2-factor authentication with your phone

### Step 2: Generate App Password
1. Go back to [Google Account Security](https://myaccount.google.com/security)
2. Under "Signing in to Google", click on "2-Step Verification"
3. Scroll down to the bottom and click on "App passwords"
4. Select:
   - **App**: Mail
   - **Device**: Other (custom name)
   - **Name**: HRMS System
5. Click "Generate"
6. Google will display a 16-character password (like: `abcd efgh ijkl mnop`)
7. **Copy this password immediately** - you won't be able to see it again!

### Step 3: Update Environment Variables
1. Open `.env.local` file in your project root
2. Update the email configuration:
```bash
# Email Configuration (Gmail)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
```

### Step 4: Restart Development Server
```bash
npm run dev
```

## Testing Email Functionality

### Test OTP Email Verification
1. Go to `/auth/verify-email`
2. Enter your email address
3. Check your email for the OTP code
4. Enter the code to verify

### Test Password Reset with OTP
1. Go to `/auth/reset-password-otp`
2. Enter your email address
3. Check your email for the OTP code
4. Enter the code and set a new password

## Troubleshooting

### Error: "Username and Password not accepted"
- **Cause**: Using regular Gmail password instead of App Password
- **Solution**: Generate a new App Password following steps above

### Error: "Invalid login: 535-5.7.8"
- **Cause**: 2-Factor Authentication not enabled or App Password incorrect
- **Solution**: 
  1. Enable 2-Factor Authentication
  2. Generate a new App Password
  3. Update `.env.local` with the new password

### Emails not being sent
- **Check**: Console logs for error messages
- **Check**: Environment variables are set correctly
- **Check**: App Password hasn't expired (regenerate if needed)

### For Development/Testing
If you can't set up Gmail immediately, the system will:
1. Log the OTP to the console instead of sending email
2. Continue to work normally for testing
3. Display helpful setup instructions in the console

## Security Notes

1. **Never commit App Passwords to version control**
2. **Use different App Passwords for different applications**
3. **Regenerate App Passwords if compromised**
4. **Monitor Gmail account for suspicious activity**

## Alternative Email Providers

If you prefer not to use Gmail, you can modify the email service to use:
- **SendGrid** (recommended for production)
- **AWS SES**
- **Mailgun**
- **Outlook/Hotmail**

Update the nodemailer configuration in `src/lib/email.ts` accordingly.
