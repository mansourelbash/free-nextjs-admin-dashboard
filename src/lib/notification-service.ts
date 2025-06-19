import { prisma } from '@/lib/prisma';

export interface CreateNotificationData {
  userId: string;
  type: 'LEAVE_REQUEST_SUBMITTED' | 'LEAVE_REQUEST_APPROVED' | 'LEAVE_REQUEST_REJECTED' | 'LEAVE_REQUEST_CANCELLED' | 'GENERAL';
  title: string;
  message: string;
  leaveRequestId?: string;
  actionUrl?: string; // URL to navigate to when notification is clicked
}

export class NotificationService {
    static async createNotification(data: CreateNotificationData) {
    try {
      console.log('NotificationService: Creating notification with data:', data);
      
      const notification = await (prisma as any).notification.create({
        data,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          leaveRequest: {
            include: {
              employee: {
                include: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      console.log('NotificationService: Notification created successfully:', notification.id);
      return notification;
    } catch (error) {
      console.error('NotificationService: Error creating notification:', error);
      throw error;
    }
  }
  static async createLeaveRequestNotification(
    leaveRequestId: string,
    employeeName: string,
    leaveType: string,
    startDate: string,
    endDate: string,
    managerUserId: string
  ) {
    const title = 'New Leave Request';
    const message = `${employeeName} has submitted a ${leaveType} request from ${startDate} to ${endDate}`;
    const actionUrl = '/leave/approvals'; // Navigate to approvals page for managers

    return this.createNotification({
      userId: managerUserId,
      type: 'LEAVE_REQUEST_SUBMITTED',
      title,
      message,
      leaveRequestId,
      actionUrl,
    });
  }
  static async createLeaveApprovalNotification(
    leaveRequestId: string,
    employeeUserId: string,
    leaveType: string,
    status: 'APPROVED' | 'REJECTED',
    approverName: string
  ) {
    const title = status === 'APPROVED' ? 'Leave Request Approved' : 'Leave Request Rejected';
    const message = status === 'APPROVED' 
      ? `Your ${leaveType} request has been approved by ${approverName}`
      : `Your ${leaveType} request has been rejected by ${approverName}`;
    const actionUrl = '/leave/requests'; // Navigate to employee's requests page

    return this.createNotification({
      userId: employeeUserId,
      type: status === 'APPROVED' ? 'LEAVE_REQUEST_APPROVED' : 'LEAVE_REQUEST_REJECTED',
      title,
      message,
      leaveRequestId,
      actionUrl,
    });
  }
  static async createLeaveCancellationNotification(
    leaveRequestId: string,
    managerUserId: string,
    employeeName: string,
    leaveType: string
  ) {    const title = 'Leave Request Cancelled';
    const message = `${employeeName} has cancelled their ${leaveType} request`;
    const actionUrl = '/leave/approvals'; // Navigate to approvals page for managers

    return this.createNotification({
      userId: managerUserId,
      type: 'LEAVE_REQUEST_CANCELLED',
      title,
      message,
      leaveRequestId,
      actionUrl,
    });
  }

  static async getUserNotifications(userId: string, limit = 20, unreadOnly = false) {
    try {
      const whereClause: { userId: string; isRead?: boolean } = {
        userId,
      };

      if (unreadOnly) {
        whereClause.isRead = false;
      }

      const notifications = await (prisma as any).notification.findMany({
        where: whereClause,
        include: {
          leaveRequest: {
            include: {
              employee: {
                include: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                      imageUrl: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
      });

      const unreadCount = await (prisma as any).notification.count({
        where: {
          userId,
          isRead: false,
        },
      });

      return { notifications, unreadCount };
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  }

  static async markAsRead(notificationId: string, userId: string) {
    try {
      // Verify the notification belongs to the user
      const notification = await (prisma as any).notification.findUnique({
        where: { id: notificationId },
      });

      if (!notification || notification.userId !== userId) {
        throw new Error('Notification not found or unauthorized');
      }

      return await (prisma as any).notification.update({
        where: { id: notificationId },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  static async markAllAsRead(userId: string) {
    try {
      return await (prisma as any).notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
}
