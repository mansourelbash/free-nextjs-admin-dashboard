# HRMS Admin Login Guide

## 🔑 How to Login as Admin

### Step 1: Access the Application
1. Open your browser and go to: **http://localhost:3002**
2. You'll be redirected to the sign-in page

### Step 2: Create Your Admin Account
1. Click **"Sign Up"** if you don't have an account
2. Fill in your details:
   - **Email**: use your preferred email (e.g., admin@company.com)
   - **Password**: create a secure password
   - **First Name**: Admin
   - **Last Name**: User

3. Complete the email verification if required by Clerk

### Step 3: Automatic User Creation
- When you sign up through Clerk, the webhook automatically creates a user in our database
- By default, new users get the **EMPLOYEE** role
- We need to manually upgrade your account to **ADMIN** role

### Step 4: Upgrade to Admin Role
After creating your account, you have a few options to become an admin:

#### Option A: Database Direct Update (Recommended for Development)
Run this SQL query in your Neon database console:

```sql
UPDATE users 
SET role = 'SUPER_ADMIN' 
WHERE email = 'your-email@domain.com';
```

#### Option B: Use Prisma Studio (Visual Database Editor)
1. Run: `npx prisma studio`
2. Open the `User` table
3. Find your user record
4. Change the `role` field from `EMPLOYEE` to `SUPER_ADMIN`
5. Save the changes

## 🎭 Available User Roles

Our HRMS system has 5 different user roles with different permissions:

### 1. **SUPER_ADMIN** (Full Access)
- Complete system access
- Manage all employees
- System settings and configuration
- All reports and analytics

### 2. **ADMIN** (Company Administrator)
- Manage employees in their organization
- Payroll and attendance management
- Department and position management
- Most reports

### 3. **HR_MANAGER** (HR Department)
- Employee lifecycle management
- Leave and attendance approval
- Performance review management
- HR reports

### 4. **MANAGER** (Department Manager)
- Manage direct reports
- Approve leave requests
- View team performance
- Team reports

### 5. **EMPLOYEE** (Standard User)
- View own profile
- Submit leave requests
- Clock in/out for attendance
- View own payslips

## 🚀 After Becoming Admin

Once you're logged in as an admin, you'll have access to:

### Dashboard Features:
- **Employee Management**: Add, edit, view all employees
- **Attendance Tracking**: Monitor daily attendance
- **Leave Management**: Approve/reject leave requests
- **Payroll System**: Process payroll and generate payslips
- **Performance Reviews**: Conduct employee evaluations
- **Reports & Analytics**: Comprehensive reporting
- **Settings**: Company and system configuration

### Navigation Menu:
- Dashboard (Overview)
- Employees (Management)
- Attendance (Tracking)
- Leave Management
- Payroll
- Performance
- Reports & Analytics
- Settings

## 🔧 Quick Admin Setup Commands

If you want to quickly set up test data:

1. **Start Prisma Studio**: `npx prisma studio`
2. **View Database**: Open http://localhost:5555
3. **Add Test Employees**: Create sample employee records
4. **Set Roles**: Assign different roles to test users

## 🎯 Testing Different Views

To test different user experiences:
1. Create multiple accounts with different email addresses
2. Assign different roles to each account
3. Login with each account to see how the dashboard changes
4. Test permissions and access levels

## 📧 Next Steps

1. **Sign up** at http://localhost:3002
2. **Verify email** through Clerk
3. **Upgrade role** using one of the methods above
4. **Explore** the admin dashboard
5. **Create test data** to see the full system in action

Happy testing! 🎉
