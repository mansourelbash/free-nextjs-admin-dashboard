"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
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

  const getLeaveTypeIcon = (leaveType: string) => {
    const iconMap: { [key: string]: string } = {
      'VACATION': '🏖️',
      'SICK': '🤒',
      'MATERNITY': '🤱',
      'PATERNITY': '👨‍👧',
      'BEREAVEMENT': '💔',
      'PERSONAL': '👤'
    };
    return iconMap[leaveType] || '📋';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'from-red-500 to-red-600';
    if (percentage >= 60) return 'from-yellow-500 to-yellow-600';
    return 'from-emerald-500 to-emerald-600';
  };

  const getProgressBgColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-red-50 dark:bg-red-900/10';
    if (percentage >= 60) return 'bg-yellow-50 dark:bg-yellow-900/10';
    return 'bg-emerald-50 dark:bg-emerald-900/10';
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userRole = (session?.user as any)?.role || 'EMPLOYEE';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const firstName = (session?.user as any)?.firstName || session?.user?.name?.split(' ')[0] || 'User';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lastName = (session?.user as any)?.lastName || session?.user?.name?.split(' ')[1] || '';

  const currentUserBalance = leaveBalances.length > 0 ? leaveBalances[0] : null;
  
  // Show loading only when session is still loading
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
          </div>
        </div>
        <p className="ml-4 text-gray-600 dark:text-gray-300 font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  // If not authenticated, redirect or show error (this should be handled by middleware)
  if (status === 'unauthenticated' || !session?.user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m13-9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Authentication Required</h2>
          <p className="text-gray-600 dark:text-gray-400">Please sign in to access your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Hero Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-200/30 to-blue-200/30 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">👋</span>
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                    Welcome back, {firstName}!
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 font-medium">
                    {userRole.replace(/_/g, ' ')} • {session.user.email}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-left lg:text-right space-y-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Today</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                {new Date().toLocaleDateString('en-US', { year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Leave Balance Section - Takes 2 columns on xl screens */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🇯🇴</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Leave Balance</h2>
                  <p className="text-gray-500 dark:text-gray-400">Jordan Labor Law Compliance</p>
                </div>
              </div>
              <Link 
                href="/leave/balance"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
              >
                View Details
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="ml-3 text-gray-500 dark:text-gray-400">Loading leave balances...</p>
              </div>
            ) : currentUserBalance ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentUserBalance.balances
                    .filter(balance => balance.totalDays > 0)
                    .map((balance) => (
                      <div 
                        key={balance.leaveType}
                        className={`relative overflow-hidden rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 ${getProgressBgColor(balance.utilizationPercentage)}`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{getLeaveTypeIcon(balance.leaveType)}</span>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {balance.leaveTypeName}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {balance.remainingDays} days remaining
                              </p>
                            </div>
                          </div>
                          <div className={`px-2 py-1 text-xs font-bold rounded-full ${
                            balance.utilizationPercentage >= 80 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                            balance.utilizationPercentage >= 60 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                            'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                          }`}>
                            {balance.utilizationPercentage}%
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-2 rounded-full bg-gradient-to-r transition-all duration-500 ease-out ${getProgressColor(balance.utilizationPercentage)}`}
                              style={{ width: `${Math.min(balance.utilizationPercentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Used</p>
                            <p className="text-lg font-bold text-red-600 dark:text-red-400">{balance.usedDays}</p>
                          </div>
                          <div className="text-center p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Pending</p>
                            <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{balance.pendingDays}</p>
                          </div>
                          <div className="text-center p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total</p>
                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{balance.totalDays}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">Years of Service: {currentUserBalance.employee.yearsOfService} years</span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Department: <span className="font-medium text-gray-700 dark:text-gray-300">{currentUserBalance.employee.department || 'Not Assigned'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Leave Balance Data</h3>
                <p className="text-gray-500 dark:text-gray-400">Your leave balance information is not available yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Quick Actions & Info */}
        <div className="space-y-6">
          
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
            </div>
            
            <div className="space-y-3">
              <Link 
                href="/leave/requests"
                className="group block w-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 p-4 rounded-xl transition-all duration-200 border border-blue-200/50 dark:border-blue-700/50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <span className="text-xl">📝</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-200 group-hover:text-blue-800 dark:group-hover:text-blue-100">
                      New Leave Request
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Submit a new leave application</p>
                  </div>
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>

              <Link 
                href="/leave/balance"
                className="group block w-full bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 hover:from-emerald-100 hover:to-green-100 dark:hover:from-emerald-900/30 dark:hover:to-green-900/30 p-4 rounded-xl transition-all duration-200 border border-emerald-200/50 dark:border-emerald-700/50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <span className="text-xl">📊</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-emerald-900 dark:text-emerald-200 group-hover:text-emerald-800 dark:group-hover:text-emerald-100">
                      Leave Balance
                    </h4>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">View detailed leave balances</p>
                  </div>
                  <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>

              <Link 
                href="/leave/policies"
                className="group block w-full bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 hover:from-purple-100 hover:to-violet-100 dark:hover:from-purple-900/30 dark:hover:to-violet-900/30 p-4 rounded-xl transition-all duration-200 border border-purple-200/50 dark:border-purple-700/50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <span className="text-xl">📋</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-purple-900 dark:text-purple-200 group-hover:text-purple-800 dark:group-hover:text-purple-100">
                      Leave Policies
                    </h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300">Jordan Labor Law guidelines</p>
                  </div>
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>

              {(userRole === 'ADMIN' || userRole === 'MANAGER' || userRole === 'SUPER_ADMIN' || userRole === 'HR_MANAGER') && (
                <Link 
                  href="/leave/approvals"
                  className="group block w-full bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 hover:from-orange-100 hover:to-red-100 dark:hover:from-orange-900/30 dark:hover:to-red-900/30 p-4 rounded-xl transition-all duration-200 border border-orange-200/50 dark:border-orange-700/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <span className="text-xl">✅</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-orange-900 dark:text-orange-200 group-hover:text-orange-800 dark:group-hover:text-orange-100">
                        Approve Requests
                      </h4>
                      <p className="text-sm text-orange-700 dark:text-orange-300">Review pending leave requests</p>
                    </div>
                    <svg className="w-5 h-5 text-orange-600 dark:text-orange-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              )}
            </div>
          </div>

          {/* Jordan Labor Law Info */}
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-2xl p-6 border border-amber-200/50 dark:border-amber-700/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-lg flex items-center justify-center">
                <span className="text-xl">🇯🇴</span>
              </div>
              <h3 className="text-lg font-bold text-amber-900 dark:text-amber-200">Legal Compliance</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-800/40 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">A</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Annual Leave</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">14-21 days (Article 61)</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-800/40 rounded-lg">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <span className="text-red-600 dark:text-red-400 text-sm font-bold">S</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Sick Leave</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">14 days full pay (Article 65)</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-800/40 rounded-lg">
                <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center">
                  <span className="text-pink-600 dark:text-pink-400 text-sm font-bold">M</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Maternity Leave</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">70 days (Article 67)</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                ⚠️ Leave balances reset on January 1st each year
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
