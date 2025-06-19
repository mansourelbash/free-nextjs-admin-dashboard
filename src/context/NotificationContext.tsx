"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export interface Notification {
  id: string;
  type: 'LEAVE_REQUEST_SUBMITTED' | 'LEAVE_REQUEST_APPROVED' | 'LEAVE_REQUEST_REJECTED' | 'LEAVE_REQUEST_CANCELLED' | 'GENERAL';
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  leaveRequest?: {
    id: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    employee: {
      user: {
        firstName: string;
        lastName: string;
        imageUrl?: string;
      };
    };
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);  const fetchNotifications = useCallback(async () => {
    if (status !== 'authenticated' || !session?.user) {
      console.log('NotificationContext: Not authenticated, skipping fetch');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    console.log('NotificationContext: Fetching notifications for user:', session.user.email);
    
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch('/api/notifications?limit=50', {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        console.log('NotificationContext: Fetched notifications:', data.notifications?.length || 0, 'notifications, unread:', data.unreadCount || 0);
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      } else {
        console.error('NotificationContext: Failed to fetch notifications:', response.status);
        // Set empty state on error
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('NotificationContext: Error fetching notifications:', error);
      // Set empty state on error
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [session, status]);
  const markAsRead = useCallback(async (notificationId: string) => {
    console.log('NotificationContext: Marking notification as read:', notificationId);
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRead: true }),
      });

      if (response.ok) {
        console.log('NotificationContext: Successfully marked notification as read');
        setNotifications(prev => {
          const updated = prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, isRead: true, readAt: new Date().toISOString() }
              : notification
          );
          console.log('NotificationContext: Updated notifications array');
          return updated;
        });
        setUnreadCount(prev => {
          const newCount = Math.max(0, prev - 1);
          console.log('NotificationContext: Updated unread count from', prev, 'to', newCount);
          return newCount;
        });
      } else {
        const errorData = await response.json();
        console.error('NotificationContext: Failed to mark as read:', response.status, errorData);
      }
    } catch (error) {
      console.error('NotificationContext: Error marking notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => ({
            ...notification,
            isRead: true,
            readAt: new Date().toISOString()
          }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const notification = notifications.find(n => n.id === notificationId);
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        
        if (notification && !notification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [notifications]);
  // Auto-refresh notifications every 30 seconds
  useEffect(() => {
    if (status === 'loading') {
      return; // Wait for session to load
    }
    
    if (status === 'authenticated' && session?.user) {
      fetchNotifications();
      
      const interval = setInterval(fetchNotifications, 5000); // 5 seconds for testing
      return () => clearInterval(interval);
    } else {
      // Clear notifications if not authenticated
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
    }
  }, [fetchNotifications, status, session]);

  // TODO: Add WebSocket/SSE for real-time updates
  // For now, we use polling, but this can be enhanced with WebSockets

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    refreshNotifications: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
