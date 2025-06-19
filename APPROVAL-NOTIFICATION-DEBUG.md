# Debug Guide: Admin Approval Notifications Not Working

## Issue
When admins approve or reject leave requests, employees are not receiving notifications.

## Debugging Steps Added

### 1. Enhanced Logging
Added detailed console logging in `/api/leave/requests/[id]/[action]` to track:
- Employee information (userId, name)
- Notification creation attempts
- Success/failure of notification creation

### 2. Database Query Fix
Updated the Prisma query to explicitly select `employee.userId`:
```typescript
include: {
  employee: {
    select: {
      id: true,
      userId: true, // Explicitly select this field
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  },
}
```

### 3. Test Endpoints Created
- **Test General Notification**: `POST /api/test-notification`
- **Test Approval Notification**: `POST /api/test-approval-notification`

### 4. Test Buttons Added
In development mode, added two test buttons in the header:
- **Blue "T" button**: Creates general test notification
- **Green "A" button**: Creates approval test notification

## How to Debug

### Step 1: Check Basic Notification System
1. Login to the application
2. Click the blue "T" button in the header
3. Check if notification appears in dropdown within 5 seconds
4. If this works, the basic notification system is functioning

### Step 2: Test Approval Notifications
1. Click the green "A" button in the header
2. Check if approval notification appears
3. Click the notification to see if it navigates to `/leave/requests`
4. If this works, the approval notification system is functioning

### Step 3: Test Real Leave Request Flow
1. **As Employee**: Submit a leave request
2. **As Admin/Manager**: Go to `/leave/approvals`
3. **Watch Console**: Open browser dev tools and monitor console logs
4. **Approve/Reject**: Click approve or reject button
5. **Check Logs**: Look for these console messages:
   ```
   Creating notification for leave request action: {action, requestId, employeeUserId, ...}
   Approval notification created successfully: [notification-id]
   ```
6. **Switch to Employee**: Login as the employee who submitted the request
7. **Check Notifications**: Should see the approval/rejection notification

### Step 4: Manual Database Check
If notifications aren't appearing, check the database directly:
```sql
-- Check if notifications are being created
SELECT * FROM notifications 
WHERE type IN ('LEAVE_REQUEST_APPROVED', 'LEAVE_REQUEST_REJECTED') 
ORDER BY createdAt DESC 
LIMIT 10;

-- Check user IDs to ensure they match
SELECT u.id, u.email, u.firstName, u.lastName, e.userId 
FROM users u 
JOIN employees e ON u.id = e.userId;
```

## Expected Console Logs

### When Approving/Rejecting:
```
Creating notification for leave request action: {
  action: 'approve',
  requestId: 'cuid-here',
  employeeUserId: 'user-id-here',
  employeeName: 'John Doe',
  approverName: 'Admin User',
  leaveType: 'VACATION',
  formattedLeaveType: 'Vacation'
}
NotificationService: Creating notification with data: {
  userId: 'user-id-here',
  type: 'LEAVE_REQUEST_APPROVED',
  title: 'Leave Request Approved',
  message: 'Your Vacation request has been approved by Admin User',
  leaveRequestId: 'cuid-here',
  actionUrl: '/leave/requests'
}
NotificationService: Notification created successfully: notification-id
Approval notification created successfully: notification-id
```

### When Employee Checks Notifications:
```
NotificationContext: Fetching notifications for user: employee@example.com
Notifications API: Fetching notifications for user: employee@example.com ID: user-id-here
Notifications API: Found 1 notifications, 1 unread for user: employee@example.com
NotificationContext: Fetched notifications: 1 notifications, unread: 1
```

## Common Issues and Solutions

### Issue 1: Employee userId Missing
**Symptoms**: `Employee userId is missing from leave request` error
**Solution**: Check that the leave request query includes employee.userId

### Issue 2: Notification Creation Fails
**Symptoms**: Error in notification service
**Solution**: Check that all required fields are provided and database is accessible

### Issue 3: Notification Created but Not Showing
**Symptoms**: Notification created in logs but not appearing in UI
**Solution**: 
- Check if polling is working (should fetch every 5 seconds)
- Verify user is logged in with correct ID
- Check browser console for errors

### Issue 4: Wrong User Receiving Notification
**Symptoms**: Notification goes to wrong user
**Solution**: Verify that `leaveRequest.employee.userId` matches the employee who submitted the request

## Files Modified

1. `/api/leave/requests/[id]/[action]/route.ts` - Added logging and fixed query
2. `/api/test-approval-notification/route.ts` - New test endpoint
3. `/layout/AppHeader.tsx` - Added test buttons
4. `/lib/notification-service.ts` - Enhanced logging

## Next Steps

1. Test the system using the debug steps above
2. Check console logs during approval/rejection
3. Verify notifications are created in database
4. If still not working, provide the console log output for further diagnosis

## Quick Test Commands

For terminal/browser console testing:
```javascript
// Test notification creation
fetch('/api/test-approval-notification', {method: 'POST'})
  .then(r => r.json())
  .then(console.log);

// Check current user info
fetch('/api/debug/user-info')
  .then(r => r.json())
  .then(console.log);
```
