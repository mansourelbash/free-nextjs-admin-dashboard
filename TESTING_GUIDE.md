# HRMS Testing Guide

## Overview
Your HRMS system is now properly configured with Clerk authentication and Neon PostgreSQL database. Here's how to test all features:

## Current Setup Status ✅

- ✅ Clerk authentication configured
- ✅ Neon PostgreSQL database connected
- ✅ Webhook endpoint for user sync (`/api/webhooks/clerk`)
- ✅ Database schema with HRMS tables
- ✅ Seeded with departments and positions
- ✅ Next.js image configuration for Clerk avatars fixed
- ✅ Role management scripts ready

## How to Test the System

### Step 1: Start the Development Server
```bash
npm run dev
```
The server will run on `http://localhost:3004` (or next available port)

### Step 2: Sign Up / Sign In Options

#### Option A: Use Existing Test User
If you want to test with the existing user, you can change their role:

1. **View current users:**
   ```bash
   npm run change-role
   ```

2. **Change role to SUPER_ADMIN:**
   ```bash
   npm run change-role user@example.com SUPER_ADMIN
   ```

#### Option B: Create New Account
1. Go to `http://localhost:3004`
2. Click "Sign Up"
3. Use **any email address** (your own recommended)
4. Choose from:
   - Email/password signup
   - Google sign-in
   - GitHub sign-in
   - Any other social provider configured in Clerk

### Step 3: Test User Role Management

After creating an account, you'll have the `EMPLOYEE` role by default. To test admin features:

1. **Check your email in the database:**
   ```bash
   npm run change-role
   ```

2. **Change your role to SUPER_ADMIN:**
   ```bash
   npm run change-role your@email.com SUPER_ADMIN
   ```

3. **Refresh your browser** to see the admin features

### Step 4: Available Roles

- **SUPER_ADMIN**: Full system access
- **ADMIN**: Administrative access
- **HR_MANAGER**: HR management features
- **MANAGER**: Team management features  
- **EMPLOYEE**: Basic employee features

### Step 5: Features to Test

#### Dashboard Features
- [ ] User profile display (with Clerk avatar)
- [ ] Role-based navigation
- [ ] User dropdown with logout functionality
- [ ] Dashboard statistics

#### Authentication Features
- [ ] Sign up with email/password
- [ ] Sign up with social login (Google, GitHub, etc.)
- [ ] Sign in/out functionality
- [ ] User profile updates sync to database
- [ ] Role-based access control

#### Admin Features (SUPER_ADMIN role)
- [ ] Employee management
- [ ] Department management
- [ ] Position management
- [ ] User role management

## Webhook Configuration

### For Local Testing (Development)
The webhook is already configured to handle:
- `user.created` - Creates user in database
- `user.updated` - Updates user information
- `user.deleted` - Removes user from database

### For Production Deployment
You'll need to:
1. Set up ngrok or deploy to production
2. Configure webhook URL in Clerk Dashboard
3. Add `CLERK_WEBHOOK_SECRET` to environment variables

## Database Management

### View Database Content
```bash
npm run db:studio
```
This opens Prisma Studio at `http://localhost:5555`

### Seed Database with Test Data
```bash
npm run db:seed
```

### Manage User Roles
```bash
# View all users
npm run change-role

# Change user role
npm run change-role user@email.com SUPER_ADMIN
npm run change-role user@email.com HR_MANAGER
npm run change-role user@email.com EMPLOYEE
```

## Troubleshooting

### Issue: "Couldn't find your account"
- **Cause**: Trying to sign in with email that doesn't exist in Clerk
- **Solution**: Use "Sign Up" instead of "Sign In" for new users

### Issue: "Unique constraint failed on email"
- **Cause**: Fixed! Webhook now uses `upsert` instead of `create`
- **Solution**: The webhook will handle duplicates gracefully

### Issue: Next.js image error for Clerk avatars
- **Status**: ✅ Fixed! Added `img.clerk.com` to Next.js image domains

### Issue: User not syncing to database
- **Check**: Webhook endpoint accessible at `/api/webhooks/clerk`
- **Check**: `CLERK_WEBHOOK_SECRET` in `.env.local`
- **Check**: Clerk webhook configured in dashboard

## Next Steps for Development

1. **Add Employee CRUD operations**
2. **Implement attendance tracking**
3. **Build payroll management**
4. **Add performance reviews**
5. **Create reporting dashboard**
6. **Set up email notifications**

## Environment Variables Required

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

---

🎉 **Your HRMS system is ready for testing!**

Start by signing up at `http://localhost:3004` and then use the role management script to test different user permissions.
