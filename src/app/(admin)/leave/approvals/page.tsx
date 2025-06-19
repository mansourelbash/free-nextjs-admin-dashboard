"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import Alert from '@/components/ui/alert/Alert';
import { useNotifications } from '@/context/NotificationContext';

interface ExtendedUser {
  role?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface ExtendedSession {
  user?: ExtendedUser;
  expires: string;
}

// Utility function to format leave type
const formatLeaveType = (leaveType: string | unknown): string => {
  return String(leaveType).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  leaveType: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  totalDays: number;
  employee: {
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
}

const LeaveApprovalsPage = () => {
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { refreshNotifications } = useNotifications();
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  } | null>(null);

  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setNotification({ type, title, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchPendingLeaveRequests = useCallback(async () => {
    try {
      const response = await fetch('/api/leave/requests?status=PENDING');
      if (response.ok) {
        const data = await response.json();
        setLeaveRequests(data);
      } else {
        showNotification('error', 'Error', 'Failed to fetch leave requests');
      }
    } catch {
      showNotification('error', 'Error', 'Error fetching leave requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingLeaveRequests();
  }, [fetchPendingLeaveRequests]);

  const handleApproval = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`/api/leave/requests/${requestId}/${action}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });      if (response.ok) {
        fetchPendingLeaveRequests();
        // Refresh notifications to show the new notification to the employee
        refreshNotifications();
        showNotification(
          'success',
          'Success',
          `Leave request ${action === 'approve' ? 'approved' : 'rejected'} successfully`
        );
      } else {
        const error = await response.json();
        showNotification('error', 'Error', error.message || `Failed to ${action} leave request`);
      }
    } catch {
      showNotification('error', 'Error', `Error ${action}ing leave request`);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    return statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });  };

  // Check if user has permission to approve leave requests
  const canApprove = session?.user?.role === 'ADMIN' ||
                     session?.user?.role === 'SUPER_ADMIN' ||
                     session?.user?.role === 'HR_MANAGER' ||
                     session?.user?.role === 'MANAGER';

  if (!canApprove) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Leave Approvals" />
        <Alert
          variant="warning"
          title="Access Denied"
          message="You don't have permission to access this page. Only managers and administrators can approve leave requests."
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Leave Approvals" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Leave Approvals" />
      
      {/* Notification */}
      {notification && (
        <div className="mb-6">
          <Alert
            variant={notification.type}
            title={notification.title}
            message={notification.message}
          />
        </div>
      )}
      
      <ComponentCard title="Pending Leave Requests">
        {leaveRequests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No pending leave requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                  <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                    Employee
                  </th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                    Leave Type
                  </th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                    Start Date
                  </th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                    End Date
                  </th>
                  <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">
                    Days
                  </th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                    Status
                  </th>
                  <th className="min-w-[200px] py-4 px-4 font-medium text-black dark:text-white">
                    Reason
                  </th>
                  <th className="py-4 px-4 font-medium text-black dark:text-white">
                    Applied On
                  </th>
                  <th className="py-4 px-4 font-medium text-black dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.map((request) => (
                  <tr key={request.id} className="border-b border-stroke dark:border-strokedark">
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-black dark:text-white font-medium">
                          {request.employee.firstName} {request.employee.lastName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {request.employee.email}
                        </p>
                      </div>
                    </td>                    <td className="py-4 px-4">
                      <p className="text-black dark:text-white">
                        {formatLeaveType(request.leaveType)}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-black dark:text-white">
                        {formatDate(request.startDate)}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-black dark:text-white">
                        {formatDate(request.endDate)}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-black dark:text-white">
                        {request.totalDays}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusBadge(
                          request.status
                        )}`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-black dark:text-white line-clamp-2" title={request.reason}>
                        {request.reason}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-black dark:text-white">
                        {formatDate(request.createdAt)}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      {request.status === 'PENDING' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproval(request.id, 'approve')}
                            className="inline-flex items-center justify-center rounded bg-green-500 py-1 px-3 text-sm text-white hover:bg-green-600"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleApproval(request.id, 'reject')}
                            className="inline-flex items-center justify-center rounded bg-red-500 py-1 px-3 text-sm text-white hover:bg-red-600"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ComponentCard>
    </div>
  );
};

export default LeaveApprovalsPage;
