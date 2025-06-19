"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ComponentCard from '@/components/common/ComponentCard';
import Link from 'next/link';

interface LeaveBalance {
  leaveType: string;
  leaveTypeName: string;
  totalDays: number;
  usedDays: number;
  pendingDays: number;
  remainingDays: number;
  utilizationPercentage: number;
}

interface EmployeeBalance {
  employeeId: string;
  employee: {
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    startDate: string;
    yearsOfService: number;
  };
  balances: LeaveBalance[];
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const [leaveBalances, setLeaveBalances] = useState<EmployeeBalance[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchLeaveBalances = async () => {
      try {
        const response = await fetch('/api/leave/balance');
        if (response.ok) {
          const data = await response.json();
          setLeaveBalances(data);
        } else {
          console.error('Failed to fetch leave balance:', response.status);
        }
      } catch (error) {
        console.error('Error fetching leave balances:', error);
      } finally {
        setLoading(false);
      }
    };

    // Set loading to false if session is not authenticated or still loading
    if (status === 'loading') {
      return; // Still loading session
    }
    
    if (status === 'unauthenticated') {
      setLoading(false);
      return;
    }

    if (session?.user) {
      fetchLeaveBalances();
    } else {
      setLoading(false);
    }
  }, [session, status]);

  const getLeaveTypeEmoji = (leaveType: string) => {
    const emojiMap: { [key: string]: string } = {
      'VACATION': '🏖️',
      'SICK': '🤒',
      'MATERNITY': '🤱',
      'PATERNITY': '👨‍👧',
      'BEREAVEMENT': '💔',
      'PERSONAL': '👤'
    };
    return emojiMap[leaveType] || '📋';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-red-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userRole = (session?.user as any)?.role || 'EMPLOYEE';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const firstName = (session?.user as any)?.firstName || session?.user?.name?.split(' ')[0] || 'User';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lastName = (session?.user as any)?.lastName || session?.user?.name?.split(' ')[1] || '';  const currentUserBalance = leaveBalances.length > 0 ? leaveBalances[0] : null;
  
  // Show loading only when session is still loading
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="ml-3">Loading...</p>
      </div>
    );
  }

  // If not authenticated, redirect or show error (this should be handled by middleware)
  if (status === 'unauthenticated' || !session?.user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Please sign in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <ComponentCard title={`Welcome back, ${firstName} ${lastName}!`}>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {userRole.replace(/_/g, ' ')} Dashboard
              </p>              <p className="text-gray-600 dark:text-gray-400">
                {session.user.email} • {userRole.replace(/_/g, ' ')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Today</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </ComponentCard>

      {/* Leave Balance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ComponentCard title="🇯🇴 Your Leave Balance - Jordan Labor Law">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="ml-3">Loading leave balances...</p>
              </div>
            ) : currentUserBalance ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentUserBalance.balances
                    .filter(balance => balance.totalDays > 0)
                    .map((balance) => (
                      <div 
                        key={balance.leaveType}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{getLeaveTypeEmoji(balance.leaveType)}</span>
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                                {balance.leaveTypeName}
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {balance.remainingDays} days left
                              </p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            balance.utilizationPercentage >= 80 ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                            balance.utilizationPercentage >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                            'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                          }`}>
                            {balance.utilizationPercentage}%
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(balance.utilizationPercentage)}`}
                              style={{ width: `${Math.min(balance.utilizationPercentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-1 text-xs">
                          <div className="text-center">
                            <p className="text-gray-500 dark:text-gray-400">Used</p>
                            <p className="font-bold text-red-600">{balance.usedDays}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-500 dark:text-gray-400">Pending</p>
                            <p className="font-bold text-yellow-600">{balance.pendingDays}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-500 dark:text-gray-400">Total</p>
                            <p className="font-bold text-blue-600">{balance.totalDays}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Years of Service: <span className="font-medium">{currentUserBalance.employee.yearsOfService} years</span>
                  </div>
                  <Link 
                    href="/leave/balance"
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No leave balance data available
              </div>
            )}
          </ComponentCard>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <ComponentCard title="⚡ Quick Actions">
            <div className="space-y-3">
              <Link 
                href="/leave/requests"
                className="block w-full bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 p-4 rounded-lg transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">📝</span>
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-200 group-hover:text-blue-800 dark:group-hover:text-blue-100">
                      New Leave Request
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Submit a new leave application</p>
                  </div>
                </div>
              </Link>

              <Link 
                href="/leave/balance"
                className="block w-full bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 p-4 rounded-lg transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">📊</span>
                  <div>
                    <h4 className="font-medium text-green-900 dark:text-green-200 group-hover:text-green-800 dark:group-hover:text-green-100">
                      Leave Balance
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300">View detailed leave balances</p>
                  </div>
                </div>
              </Link>

              <Link 
                href="/leave/policies"
                className="block w-full bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 p-4 rounded-lg transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">📋</span>
                  <div>
                    <h4 className="font-medium text-purple-900 dark:text-purple-200 group-hover:text-purple-800 dark:group-hover:text-purple-100">
                      Leave Policies
                    </h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300">Jordan Labor Law guidelines</p>
                  </div>
                </div>
              </Link>

              {(userRole === 'ADMIN' || userRole === 'MANAGER') && (
                <Link 
                  href="/leave/approvals"
                  className="block w-full bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 p-4 rounded-lg transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">✅</span>
                    <div>
                      <h4 className="font-medium text-orange-900 dark:text-orange-200 group-hover:text-orange-800 dark:group-hover:text-orange-100">
                        Approve Requests
                      </h4>
                      <p className="text-sm text-orange-700 dark:text-orange-300">Review pending leave requests</p>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          </ComponentCard>

          {/* Jordan Labor Law Info */}
          <ComponentCard title="🇯🇴 Legal Compliance">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Jordan Labor Law</h4>
              <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                <li>• Annual: 14-21 days (Art. 61)</li>
                <li>• Sick: 14 days full pay (Art. 65)</li>
                <li>• Maternity: 70 days (Art. 67)</li>
                <li>• Balances reset Jan 1st</li>
              </ul>
            </div>
          </ComponentCard>
        </div>
      </div>
    </div>
  );
}
