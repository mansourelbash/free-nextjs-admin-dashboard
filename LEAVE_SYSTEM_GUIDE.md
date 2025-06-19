# Leave Management System - User Guide

## 🎯 How to Request Leave:

### Step 1: Navigate to Leave Requests
1. Login to the HRMS system
2. Go to sidebar → "Leave Management" → "Leave Requests"

### Step 2: Create New Request
1. Click "New Request" button (top right)
2. Fill out the modal form:
   - **Leave Type**: Select from dropdown (Vacation, Sick, Personal, etc.)
   - **Start Date**: Pick start date
   - **End Date**: Pick end date  
   - **Reason**: Explain why you need leave
3. Click "Submit Request"

### Step 3: Track Your Requests
- View all your requests in the table
- See status: PENDING (yellow), APPROVED (green), REJECTED (red)
- Check number of days calculated automatically

## 👥 Role-Based Access:

### **EMPLOYEE Role:**
- ✅ Can submit leave requests
- ✅ Can view own requests
- ✅ Can view leave balance
- ✅ Can view leave policies
- ❌ Cannot approve/reject requests

### **MANAGER/HR_MANAGER/ADMIN/SUPER_ADMIN Roles:**
- ✅ All employee permissions
- ✅ Can view pending requests from team members
- ✅ Can approve/reject requests
- ✅ Can see all employee requests

## 📊 Leave Balance Tracking:
- View total allocated days per leave type
- See used days (approved requests)
- See pending days (pending requests)  
- See remaining days available
- Visual progress bars for usage

## 🔄 Status Flow:
1. **PENDING** → Request submitted, waiting for approval
2. **APPROVED** → Manager approved the request
3. **REJECTED** → Manager rejected the request

## 📍 Navigation Structure:
```
Leave Management/
├── Leave Requests (Submit & Track)
├── Leave Approvals (Manager View)
├── Leave Balance (Personal Balance)
└── Leave Policies (Company Policies)
```

## 🛠️ API Endpoints Available:
- `POST /api/leave/requests` - Submit request
- `GET /api/leave/requests` - View requests  
- `GET /api/leave/types` - Get leave types
- `PATCH /api/leave/requests/[id]/approve` - Approve
- `PATCH /api/leave/requests/[id]/reject` - Reject
- `GET /api/leave/balance` - View balance
