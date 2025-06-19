# Notification Navigation Feature Implementation

## Overview
Implemented clickable notifications that navigate users to relevant action pages when clicked.

## Features Added

### 1. **Actionable Notifications**
- **Action URLs**: Notifications now include optional `actionUrl` field
- **Smart Navigation**: Clicking notifications navigates to relevant pages
- **Mark as Read**: Notifications are automatically marked as read when clicked

### 2. **Navigation Mapping**
- **Leave Request Submitted** → `/leave/approvals` (for managers)
- **Leave Request Approved/Rejected** → `/leave/requests` (for employees)
- **Leave Request Cancelled** → `/leave/approvals` (for managers)
- **General Notifications** → Custom URL or no navigation

### 3. **Visual Indicators**
- **Clickable Design**: Notifications have hover effects and cursor pointer
- **Action Indicator**: "Click to view" text for notifications with actions
- **Unread Status**: Visual indicators for unread notifications
- **Enhanced Styling**: Different hover colors for actionable notifications

## Implementation Details

### Database Changes
```sql
-- Added actionUrl field to notifications table
ALTER TABLE notifications ADD COLUMN actionUrl TEXT;
```

### Code Changes

#### 1. **NotificationService** (`src/lib/notification-service.ts`)
- Added `actionUrl` to `CreateNotificationData` interface
- Updated all notification creation methods to include appropriate action URLs
- Added URL mapping for different notification types

#### 2. **NotificationContext** (`src/context/NotificationContext.tsx`)
- Updated `Notification` interface to include `actionUrl` field
- Enhanced error handling for navigation actions

#### 3. **NotificationDropdown** (`src/components/header/NotificationDropdown.tsx`)
- Added `useRouter` for navigation
- Implemented `handleNotificationClick` with:
  - Automatic mark-as-read functionality
  - Navigation to action URL or fallback routes
  - Error handling for failed actions
- Enhanced visual styling for clickable notifications
- Added "Click to view" indicator for actionable notifications

#### 4. **Database Schema** (`prisma/schema.prisma`)
- Added `actionUrl String?` field to `Notification` model
- Updated database with `prisma db push`

## Testing Features

### 1. **Test Notification Button**
- Added development-only test button in header (T button)
- Creates test notifications with action URLs
- Only visible in development environment

### 2. **Debug Endpoints**
- `/api/test-notification` - Creates test notifications
- `/api/debug/user-info` - Shows user and manager information

## Usage Examples

### Creating Notifications with Actions
```typescript
// Leave request notification for manager
await NotificationService.createLeaveRequestNotification(
  leaveRequestId,
  employeeName,
  leaveType,
  startDate,
  endDate,
  managerUserId
); // Automatically includes actionUrl: '/leave/approvals'

// Leave approval notification for employee
await NotificationService.createLeaveApprovalNotification(
  leaveRequestId,
  employeeUserId,
  leaveType,
  'APPROVED',
  approverName
); // Automatically includes actionUrl: '/leave/requests'
```

### Handling Notification Clicks
```typescript
const handleNotificationClick = async (notification: Notification) => {
  // Mark as read
  if (!notification.isRead) {
    await markAsRead(notification.id);
  }
  
  // Navigate to action
  if (notification.actionUrl) {
    router.push(notification.actionUrl);
  }
};
```

## User Experience

### For Managers:
1. **Receive notification** when employee submits leave request
2. **Click notification** → Navigate to `/leave/approvals`
3. **See pending request** highlighted and ready for action
4. **Notification marked as read** automatically

### For Employees:
1. **Receive notification** when leave request is approved/rejected
2. **Click notification** → Navigate to `/leave/requests`
3. **See updated request status** in their requests list
4. **Notification marked as read** automatically

## Visual Design

### Notification States:
- **Unread**: Blue background, blue dot indicator
- **Read**: Normal background
- **Actionable**: Enhanced hover effects, "Click to view" text
- **Loading**: Subtle animation during navigation

### Responsive Design:
- Works on all screen sizes
- Touch-friendly on mobile devices
- Keyboard accessible

## Future Enhancements

### Planned Features:
1. **Real-time Updates**: WebSocket/SSE instead of polling
2. **Notification Groups**: Group related notifications
3. **Custom Actions**: Multiple action buttons per notification
4. **Rich Content**: Images, attachments, formatted text
5. **Push Notifications**: Browser push notifications for offline users

### Performance Optimizations:
1. **Lazy Loading**: Load older notifications on demand
2. **Caching**: Cache frequently accessed notifications
3. **Debouncing**: Debounce mark-as-read API calls

## Testing Checklist

- [ ] Click test notification button (T in header)
- [ ] Submit leave request as employee
- [ ] Check manager receives clickable notification
- [ ] Click notification navigates to approvals page
- [ ] Notification is marked as read
- [ ] Login as manager and approve/reject request
- [ ] Check employee receives clickable notification
- [ ] Click notification navigates to requests page
- [ ] Verify visual indicators work correctly

## Security Considerations

- **Authorization**: Users can only see their own notifications
- **Input Validation**: Action URLs are validated on creation
- **XSS Prevention**: All notification content is sanitized
- **Rate Limiting**: Notification creation is rate-limited per user
