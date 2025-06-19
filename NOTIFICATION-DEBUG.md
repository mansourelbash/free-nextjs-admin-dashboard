# Real-Time Notification Debugging Guide

## Current Issue
Real-time notifications are not working when a user requests leave.

## Potential Causes and Solutions

### 1. Manager Assignment Issue
**Problem**: The employee submitting the leave request might not have a manager assigned.
**Solution**: Check manager assignment and fallback to HR/Admin users.

**Debug Steps**:
- Visit: `http://localhost:3002/api/debug/user-info` to check if the current user has a manager assigned
- Look for `employee.manager` field in the response

### 2. Notification Creation Issues
**Problem**: Notifications might not be getting created in the database.
**Solution**: Added extensive logging to track notification creation.

**Debug Steps**:
- Check browser console and server console for notification creation logs
- Look for logs starting with "Creating notification for manager:" and "Notification created successfully:"

### 3. Polling Frequency Too Slow
**Problem**: The 30-second polling interval might be too slow to notice new notifications.
**Solution**: Reduced polling to 5 seconds for testing.

**Current Settings**:
- Polling interval: 5 seconds (was 30 seconds)
- Timeout: 10 seconds for API calls

### 4. Context Provider Issues
**Problem**: The NotificationContext might not be properly initialized.
**Solution**: Added error handling and logging to the context.

**Debug Steps**:
- Check browser console for logs starting with "NotificationContext:"
- Verify the context is fetching notifications regularly

## Test Endpoints Created

### Test Notification Creation
```
POST http://localhost:3002/api/test-notification
```
This creates a test notification for the current user to verify the system works.

### User Debug Information
```
GET http://localhost:3002/api/debug/user-info
```
This shows user information, manager assignment, and notification count.

## Testing Steps

1. **Login** to the application
2. **Check User Info**: Visit the debug endpoint to verify manager assignment
3. **Create Test Notification**: Use the test notification endpoint
4. **Check Notifications**: Look for the notification dropdown to update
5. **Submit Leave Request**: Create a new leave request and monitor console logs
6. **Switch Users**: Login as a manager/admin to see if notification appears

## Console Logs to Watch For

### When Creating Leave Request:
- "Looking for manager to notify. Direct manager ID: [ID]"
- "Creating notification for manager: [ID]"
- "Notification created successfully: [ID]"

### When Fetching Notifications:
- "NotificationContext: Fetching notifications for user: [email]"
- "NotificationContext: Fetched notifications: [count] notifications, unread: [count]"

### On Notification API:
- "Notifications API: Fetching notifications for user: [email]"
- "Notifications API: Found [count] notifications, [count] unread"

## Quick Fixes Applied

1. **Added extensive logging** to track notification flow
2. **Reduced polling interval** to 5 seconds for immediate testing
3. **Added timeout protection** to prevent hanging API calls
4. **Improved error handling** in NotificationContext
5. **Added manager fallback logic** to HR/Admin users
6. **Created test endpoints** for debugging

## Next Steps

1. Open browser console and network tab
2. Navigate to leave requests page
3. Submit a new leave request
4. Watch console logs for notification creation
5. Wait 5 seconds and check if notification appears
6. If still not working, check the debug endpoints

## Database Check

If notifications are still not working, check if they're being created in the database:
```sql
SELECT * FROM notifications ORDER BY createdAt DESC LIMIT 10;
```
