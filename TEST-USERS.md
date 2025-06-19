# 👥 Role-Based Test Users for HRMS Dashboard

## 📋 Test Account Summary

All test users have been successfully created and verified for role-based authentication testing.

### 🔐 Login Credentials

| Role | Email | Password | Name | Description |
|------|-------|----------|------|-------------|
| 🔴 **SUPER_ADMIN** | `superadmin@hrms.com` | `password123` | Super Admin | Highest privilege level |
| 🟠 **ADMIN** | `admin@hrms.com` | `password123` | System Admin | System administration rights |
| 🟢 **HR_MANAGER** | `hr@hrms.com` | `password123` | HR Manager | Human resources management |
| 🟣 **MANAGER** | `manager@hrms.com` | `password123` | Team Manager | Team/department management |
| 🔵 **EMPLOYEE** | `employee@hrms.com` | `password123` | John Employee | Standard employee access |

## 🔗 Quick Access Links

- **Sign In Page**: http://localhost:3000/auth/signin
- **Dashboard**: http://localhost:3000/dashboard (after login)
- **Prisma Studio**: Run `npm run db:studio` to view database

## 🎯 Role Hierarchy

```
SUPER_ADMIN > ADMIN > HR_MANAGER > MANAGER > EMPLOYEE
```

## 🧪 Testing Role-Based Access

1. **Login with different roles**: Use any of the test accounts above
2. **Test role permissions**: Each role should have different access levels
3. **UI elements**: Check if UI elements show/hide based on user role
4. **API endpoints**: Verify API access restrictions work correctly

## 📝 Available Scripts

```bash
# Create new test users (cleans existing ones first)
npm run create-test-users

# Test authentication for all users
npm run test-auth

# Change user role (interactive script)
npm run change-role

# Open database viewer
npm run db:studio
```

## ✅ Verification Status

- ✅ All 5 test users created successfully
- ✅ Password hashing verified (bcrypt with salt rounds: 12)
- ✅ Authentication tested and working
- ✅ All users marked as active and email verified
- ✅ Unique IDs generated for each user

## 🔧 Development Notes

- Users are automatically marked as `emailVerified: true` for testing
- All users are set to `isActive: true`
- Passwords are properly hashed using bcryptjs
- Users can be recreated by running the script again (it cleans up first)

## 🚀 Next Steps

1. Test login functionality in the browser at: http://localhost:3000/auth/signin
2. Verify role-based navigation and permissions
3. Test both credentials login and social login (Google/Facebook)
4. Implement role-based UI components and route protection
