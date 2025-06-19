"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useNotifications, type Notification } from "@/context/NotificationContext";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  
  // Use the notification context with error handling
  let notifications: Notification[] = [];
  let unreadCount = 0;
  let markAllAsReadFn: (() => Promise<void>) | undefined;
  let markAsReadFn: ((id: string) => Promise<void>) | undefined;
  
  try {
    const context = useNotifications();
    notifications = context.notifications;
    unreadCount = context.unreadCount;
    markAllAsReadFn = context.markAllAsRead;
    markAsReadFn = context.markAsRead;
  } catch {
    // Fallback to empty state if context is not available
    console.warn('NotificationContext not available, using fallback');
  }

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleClick = () => {
    toggleDropdown();
  };  const handleNotificationClick = async (notification: Notification) => {
    console.log('NotificationDropdown: Notification clicked:', notification.id, 'isRead:', notification.isRead);
    try {
      // Mark notification as read
      if (markAsReadFn && !notification.isRead) {
        console.log('NotificationDropdown: Marking notification as read...');
        await markAsReadFn(notification.id);
      } else if (notification.isRead) {
        console.log('NotificationDropdown: Notification already read');
      } else {
        console.log('NotificationDropdown: markAsReadFn not available');
      }
      
      // Close dropdown
      closeDropdown();
      
      // Navigate to action URL if available
      if (notification.actionUrl) {
        console.log('NotificationDropdown: Navigating to:', notification.actionUrl);
        router.push(notification.actionUrl);
      } else {
        // Fallback navigation based on notification type
        switch (notification.type) {
          case 'LEAVE_REQUEST_SUBMITTED':
            console.log('NotificationDropdown: Navigating to approvals page');
            router.push('/leave/approvals');
            break;
          case 'LEAVE_REQUEST_APPROVED':
          case 'LEAVE_REQUEST_REJECTED':
          case 'LEAVE_REQUEST_CANCELLED':
            console.log('NotificationDropdown: Navigating to requests page');
            router.push('/leave/requests');
            break;
          default:
            console.log('NotificationDropdown: No navigation for notification type:', notification.type);
            break;
        }
      }
    } catch (error) {
      console.error('NotificationDropdown: Error handling notification click:', error);
      closeDropdown();
    }
  };

  const handleMarkAllRead = async () => {
    if (markAllAsReadFn) {
      try {
        await markAllAsReadFn();
      } catch (error) {
        console.error('Failed to mark all notifications as read:', error);
      }
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hr ago`;
    return `${Math.floor(diffInMinutes / 1440)} day ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'LEAVE_REQUEST_SUBMITTED':
        return '📝';
      case 'LEAVE_REQUEST_APPROVED':
        return '✅';
      case 'LEAVE_REQUEST_REJECTED':
        return '❌';
      case 'LEAVE_REQUEST_CANCELLED':
        return '🚫';
      default:
        return '📢';
    }
  };

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'LEAVE_REQUEST_APPROVED':
        return 'bg-green-500';
      case 'LEAVE_REQUEST_REJECTED':
        return 'bg-red-500';
      case 'LEAVE_REQUEST_SUBMITTED':
        return 'bg-blue-500';
      case 'LEAVE_REQUEST_CANCELLED':
        return 'bg-gray-500';
      default:
        return 'bg-orange-500';
    }
  };

  return (
    <div className="relative">      <button
        className="relative dropdown-toggle flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleClick}
      >        {unreadCount > 0 && (
          <>
            {/* Counter badge with pulse animation */}
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center min-w-5 z-30 border-2 border-white dark:border-gray-900">
              <span className="absolute -inset-1 bg-red-500 rounded-full opacity-75 animate-ping"></span>
              <span className="relative z-10">{unreadCount > 99 ? '99+' : unreadCount}</span>
            </span>
          </>
        )}
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {unreadCount}
              </span>
            )}
          </h5>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={toggleDropdown}
              className="text-gray-500 transition dropdown-toggle dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <svg
                className="fill-current"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>
        <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
          {notifications.length === 0 ? (
            <li className="flex items-center justify-center py-8 text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <div className="text-4xl mb-2">🔔</div>
                <p>No notifications yet</p>
              </div>
            </li>
          ) : (
            notifications.map((notification) => (
              <li key={notification.id}>                <DropdownItem
                  onItemClick={() => handleNotificationClick(notification)}
                  className={`flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5 cursor-pointer transition-colors ${
                    !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  } ${notification.actionUrl ? 'hover:bg-blue-50 dark:hover:bg-blue-900/10' : ''}`}
                >
                  <span className="relative block w-full h-10 rounded-full z-1 max-w-10">
                    {notification.leaveRequest?.employee?.user?.imageUrl ? (
                      <Image
                        width={40}
                        height={40}
                        src={notification.leaveRequest.employee.user.imageUrl}
                        alt="User"
                        className="w-full overflow-hidden rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-lg">
                        {getNotificationIcon(notification.type)}
                      </div>
                    )}
                    <span className={`absolute bottom-0 right-0 z-10 h-2.5 w-full max-w-2.5 rounded-full border-[1.5px] border-white ${getStatusColor(notification.type)} dark:border-gray-900`}></span>
                  </span>

                  <span className="block flex-1">
                    <span className="mb-1.5 block text-theme-sm font-medium text-gray-800 dark:text-white/90">
                      {notification.title}
                    </span>
                    <span className="mb-1.5 block text-theme-sm text-gray-600 dark:text-gray-300">
                      {notification.message}
                    </span>                    <span className="flex items-center gap-2 text-gray-500 text-theme-xs dark:text-gray-400">
                      <span>Leave</span>
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span>{formatTimeAgo(notification.createdAt)}</span>
                      {!notification.isRead && (
                        <>
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        </>
                      )}
                      {notification.actionUrl && (
                        <>
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          <span className="text-blue-500 text-xs">Click to view</span>
                        </>
                      )}
                    </span>
                  </span>
                </DropdownItem>
              </li>
            ))
          )}
        </ul>
        <Link
          href="/leave/requests"
          className="block px-4 py-2 mt-3 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          View All Notifications
        </Link>
      </Dropdown>
    </div>
  );
}
