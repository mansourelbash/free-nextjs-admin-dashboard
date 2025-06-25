"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import Alert from '@/components/ui/alert/Alert';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import JordanianDatePicker from '@/components/form/JordanianFlatpickr';
import { useNotifications } from '@/context/NotificationContext';
import Select from '@/components/form/Select';
import Label from '@/components/form/Label';
import { PlusIcon } from '@/icons';
import { calculateWorkingDays } from '@/utils/jordanian-holidays';

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

interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  leaveType: {
    name: string;
  };
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  totalDays: number;
  employee: {
    firstName: string;
    lastName: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
    department: {
      name: string;
    } | null;
  };
  createdAt: string;
}

interface LeaveBalance {
  leaveType: string;
  leaveTypeName: string;
  totalDays: number;
  usedDays: number;
  pendingDays: number;
  remainingDays: number;
  utilizationPercentage: number;
}

interface UserLeaveBalance {
  balances: LeaveBalance[];
}

const LeaveRequestsPage = () => {
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);  const [leaveTypes, setLeaveTypes] = useState<{id: string, name: string}[]>([]);
  const [submitting, setSubmitting] = useState(false);  const [leaveBalance, setLeaveBalance] = useState<UserLeaveBalance | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const { refreshNotifications } = useNotifications();
  const [newRequest, setNewRequest] = useState({
    startDate: '',
    endDate: '',
    leaveType: '',
    reason: ''
  });
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  } | null>(null);
  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setNotification({ type, title, message });
    setTimeout(() => setNotification(null), 5000);
  };
  const fetchLeaveTypes = useCallback(async () => {
    try {
      const response = await fetch('/api/leave/types', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setLeaveTypes(data);
      }
    } catch (error) {
      console.error('Error fetching leave types:', error);
    }
  }, []);
  const fetchLeaveRequests = useCallback(async () => {
    try {
      const response = await fetch('/api/leave/requests', {
        credentials: 'include'
      });
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
  const fetchLeaveBalance = async () => {
    setBalanceLoading(true);
    try {
      const response = await fetch('/api/leave/balance', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setLeaveBalance(data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching leave balance:', error);
    } finally {
      setBalanceLoading(false);
    }
  };
  const calculateRequestedDays = () => {
    if (!newRequest.startDate || !newRequest.endDate) return 0;
    const start = new Date(newRequest.startDate);
    const end = new Date(newRequest.endDate);
    // Use working days calculation (excluding weekends and holidays)
    return calculateWorkingDays(start, end);
  };

  const getSelectedLeaveBalance = () => {
    if (!leaveBalance || !newRequest.leaveType) return null;
    return leaveBalance.balances.find(b => b.leaveType === newRequest.leaveType);
  };

  useEffect(() => {
    fetchLeaveRequests();
    fetchLeaveTypes();
  }, [fetchLeaveRequests, fetchLeaveTypes]);
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      CANCELLED: 'bg-gray-100 text-gray-800 dark:bg-gray-700/20 dark:text-gray-400',
    };
    return statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800 dark:bg-gray-700/20 dark:text-gray-400';
  };  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Check if user can view employee details (admin/manager roles)
  const canViewEmployeeDetails = session?.user?.role === 'ADMIN' ||
                                 session?.user?.role === 'SUPER_ADMIN' ||
                                 session?.user?.role === 'HR_MANAGER' ||
                                 session?.user?.role === 'MANAGER';const handleSubmitRequest = async () => {
    if (submitting) return; // Prevent double submission
    
    if (!newRequest.startDate || !newRequest.endDate || !newRequest.leaveType || !newRequest.reason) {
      showNotification('error', 'Validation Error', 'Please fill in all required fields');
      return;
    }

    // Check if there's sufficient leave balance
    const selectedBalance = getSelectedLeaveBalance();
    const requestedDays = calculateRequestedDays();
    
    if (selectedBalance && requestedDays > selectedBalance.remainingDays) {
      showNotification('error', 'Insufficient Balance', 
        `You only have ${selectedBalance.remainingDays} days remaining for ${selectedBalance.leaveTypeName}. You're requesting ${requestedDays} days.`);
      return;
    }

    setSubmitting(true);
    try {      const response = await fetch('/api/leave/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include session cookies
        body: JSON.stringify(newRequest),
      });if (response.ok) {
        showNotification('success', 'Success', 'Leave request submitted successfully');
        setShowCreateModal(false);
        setNewRequest({ startDate: '', endDate: '', leaveType: '', reason: '' });
        setLeaveBalance(null); // Clear balance data
        fetchLeaveRequests();
        // Refresh notifications to show the new notification
        console.log('Leave request submitted, refreshing notifications...');
        refreshNotifications();
      } else {
        const errorData = await response.json();
        showNotification('error', 'Error', errorData.error || 'Failed to submit leave request');
      }} catch {
      showNotification('error', 'Error', 'An error occurred while submitting the request');
    } finally {
      setSubmitting(false);
    }
  };  const handleWithdrawRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to withdraw this leave request?')) {
      return;
    }

    try {
      const response = await fetch(`/api/leave/requests/${requestId}/withdraw`, {
        method: 'PATCH',
        credentials: 'include'
      });

      if (response.ok) {
        showNotification('success', 'Success', 'Leave request withdrawn successfully');
        fetchLeaveRequests();
      } else {
        const errorData = await response.json();
        showNotification('error', 'Error', errorData.error || 'Failed to withdraw leave request');
      }
    } catch {
      showNotification('error', 'Error', 'An error occurred while withdrawing the request');
    }
  };
  if (loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Leave Requests" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="ml-4">Loading leave requests...</p>
        </div>
      </div>
    );
  }
  return (
    <div>
      <PageBreadcrumb pageTitle="Leave Requests" />
      
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
        <ComponentCard title="My Leave Requests">
        <div className="mb-6 flex justify-end">          <Button
            onClick={() => {
              setShowCreateModal(true);
              fetchLeaveBalance();
            }}
            variant="primary"
            size="md"
            startIcon={<PlusIcon className="h-5 w-5" />}
          >
            New Request
          </Button>
        </div>

        {leaveRequests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No leave requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                  {canViewEmployeeDetails && (
                    <th className="min-w-[180px] py-4 px-4 font-medium text-black dark:text-white">
                      Employee
                    </th>
                  )}
                  <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
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
                  <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>                {leaveRequests.map((request) => (
                  <tr key={request.id} className="border-b border-stroke dark:border-strokedark">
                    {canViewEmployeeDetails && (
                      <td className="py-4 px-4">
                        <div className="text-black dark:text-white">
                          <p className="font-medium">
                            {request.employee.user.firstName} {request.employee.user.lastName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {request.employee.department?.name || 'No Department'}
                          </p>
                        </div>
                      </td>
                    )}
                    <td className="py-4 px-4">
                      <p className="text-black dark:text-white">
                        {request.leaveType.name}
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
                      <p className="text-black dark:text-white line-clamp-2">
                        {request.reason}
                      </p>
                    </td>                    <td className="py-4 px-4">
                      <p className="text-black dark:text-white">
                        {formatDate(request.createdAt)}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      {request.status === 'PENDING' && (
                        <button
                          onClick={() => handleWithdrawRequest(request.id)}
                          className="inline-flex items-center px-3 py-1 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 rounded-md transition-colors"
                        >
                          Withdraw
                        </button>
                      )}
                      {request.status !== 'PENDING' && (
                        <span className="text-gray-400 dark:text-gray-500 text-sm">
                          No actions
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        {request.status === 'PENDING' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleWithdrawRequest(request.id)}
                          >
                            Withdraw
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ComponentCard>      {/* Create Leave Request Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setLeaveBalance(null);
          setNewRequest({ startDate: '', endDate: '', leaveType: '', reason: '' });
        }}
        className="max-w-2xl p-6"
      >
        <div className="space-y-6">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Submit Leave Request
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Fill in the details for your leave request
            </p>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="leave-type">Leave Type *</Label>                <Select
                  options={leaveTypes.map(type => ({ value: type.id, label: type.name }))}
                  placeholder="Select leave type"
                  onChange={(value) => setNewRequest({ ...newRequest, leaveType: value })}
                  defaultValue={newRequest.leaveType}
                />
              </div>              <div>
                <JordanianDatePicker
                  id="start-date"
                  label="Start Date *"
                  placeholder="Select start date"
                  onChange={(selectedDates) => {
                    if (selectedDates.length > 0) {
                      const date = selectedDates[0];
                      const formattedDate = date.toISOString().split('T')[0];
                      console.log('Start date changed:', formattedDate);
                      setNewRequest({ ...newRequest, startDate: formattedDate });
                    }
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">              <div>
                <JordanianDatePicker
                  id="end-date"
                  label="End Date *"
                  placeholder="Select end date"
                  onChange={(selectedDates) => {
                    if (selectedDates.length > 0) {
                      const date = selectedDates[0];
                      const formattedDate = date.toISOString().split('T')[0];
                      console.log('End date changed:', formattedDate);
                      setNewRequest({ ...newRequest, endDate: formattedDate });
                    }
                  }}
                  minDate={newRequest.startDate || new Date()}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="reason">Reason *</Label>
              <textarea
                id="reason"
                value={newRequest.reason}
                onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                placeholder="Please provide reason for leave"
                required
              />            </div>

            {/* Leave Balance Preview */}
            {newRequest.leaveType && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-3">
                  📊 Leave Balance Preview
                </h3>
                {balanceLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-blue-700 dark:text-blue-300">Loading balance...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(() => {
                      const selectedBalance = getSelectedLeaveBalance();
                      const requestedDays = calculateRequestedDays();
                      
                      if (!selectedBalance) {
                        return (
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Select dates to see balance preview
                          </p>
                        );
                      }

                      const afterRequestRemaining = Math.max(0, selectedBalance.remainingDays - requestedDays);
                      const isInsufficientBalance = requestedDays > selectedBalance.remainingDays;

                      return (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h4 className="text-xs font-medium text-blue-800 dark:text-blue-200 uppercase tracking-wide">
                              Current Balance
                            </h4>
                            <div className="bg-white dark:bg-gray-800 rounded-md p-3 border border-blue-200 dark:border-blue-700">
                              <div className="text-center">
                                <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                                  {selectedBalance.remainingDays}
                                </div>
                                <div className="text-xs text-blue-600 dark:text-blue-400">
                                  out of {selectedBalance.totalDays} days
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Used: {selectedBalance.usedDays} | Pending: {selectedBalance.pendingDays}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <h4 className="text-xs font-medium text-blue-800 dark:text-blue-200 uppercase tracking-wide">
                              After This Request
                            </h4>
                            <div className={`rounded-md p-3 border ${
                              isInsufficientBalance 
                                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700' 
                                : 'bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-700'
                            }`}>
                              <div className="text-center">
                                <div className={`text-lg font-bold ${
                                  isInsufficientBalance 
                                    ? 'text-red-700 dark:text-red-300' 
                                    : 'text-green-700 dark:text-green-300'
                                }`}>
                                  {afterRequestRemaining}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  days remaining
                                </div>
                                {requestedDays > 0 && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Requesting: {requestedDays} days
                                  </div>
                                )}
                                {isInsufficientBalance && (
                                  <div className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
                                    ⚠️ Insufficient balance
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  setLeaveBalance(null);
                  setNewRequest({ startDate: '', endDate: '', leaveType: '', reason: '' });
                }}
              >
                Cancel
              </Button><Button
                variant="primary"
                onClick={handleSubmitRequest}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default LeaveRequestsPage;
