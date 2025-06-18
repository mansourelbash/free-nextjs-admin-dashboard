# 📧 Gmail Setup Guide for OTP/Email Features

## 🚨 **Current Status: Email Service in Development Mode**

The OTP/Email features are currently working in **simulation mode** because Gmail credentials are not configured. OTPs will be displayed in the server console for testing.

## ⚡ **Quick Testing (Current Setup)**

**OTPs are printed in the terminal console**, so you can:

1. **Try Registration**: Go to `/auth/signup` and enter any email
2. **Check Console**: Look for `🔢 OTP for your-email@example.com: 123456`  
3. **Use the OTP**: Enter the displayed OTP in the verification form

## 🔧 **To Enable Real Gmail Sending**

### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Navigate to **Security** → **2-Step Verification**
3. Enable 2-Factor Authentication

### Step 2: Generate App Password
1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select **Mail** and **Windows Computer** (or Custom)
3. Click **Generate**
4. Copy the 16-character app password (example: `abcd efgh ijkl mnop`)

### Step 3: Update .env.local
```bash
# Replace these placeholder values:
GMAIL_USER=your-actual-gmail@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
```

### Step 4: Restart Server
```bash
npm run dev
```

## ✅ **Current Testing Instructions**

Since we're in development mode, you can test all authentication flows:

### 🔐 **Login Testing**
- **URL**: http://localhost:3000/auth/signin
- **Test Accounts**: superadmin@hrms.com (password: password123)

### 📝 **Registration Testing**
1. Go to `/auth/signup`
2. Fill out the form with any email
3. **Check terminal console** for the OTP
4. Enter the OTP in the verification form
5. Registration completes successfully

### 🔄 **Password Reset Testing**
1. Go to `/auth/forgot-password`
2. Enter any email address
3. **Check terminal console** for the reset OTP
4. Enter the OTP to proceed to password reset

## 🎯 **What Works Now (Without Gmail)**

✅ **Login** - Fully functional with test accounts  
✅ **Registration** - Works with console OTP display  
✅ **Password Reset** - Works with console OTP display  
✅ **Change Password** - Fully functional for logged-in users  
✅ **Social Login** - Ready (needs Google/Facebook app setup)  
✅ **All UI Components** - Complete and responsive  

## 🚀 **Production Setup**

For production, you'll want to:
1. ✅ Configure real Gmail credentials (as above)
2. ✅ Set up Google/Facebook OAuth apps for social login
3. ✅ Use a professional email service (SendGrid, AWS SES, etc.)
4. ✅ Set up proper domain and SSL certificates

---

## 💡 **TL;DR for Testing**

**The system works perfectly for testing!** Just:
1. Visit http://localhost:3000/auth/signin
2. For OTP features, check the terminal console for codes
3. All authentication flows are fully functional

**Gmail setup is optional for development testing.**
