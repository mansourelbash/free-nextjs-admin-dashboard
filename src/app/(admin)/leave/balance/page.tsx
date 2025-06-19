'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

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

const getLeaveTypeEmoji = (leaveType: string): string => {
  switch (leaveType) {
    case 'VACATION': return '🏖️';
    case 'SICK': return '🏥';
    case 'MATERNITY': return '👶';
    case 'PATERNITY': return '👨‍👶';
    case 'BEREAVEMENT': return '🕊️';
    case 'PERSONAL': return '🏠';
    case 'UNPAID': return '⏸️';
    default: return '📅';
  }
};

const getUtilizationColor = (percentage: number): string => {
  if (percentage <= 50) return 'bg-green-500';
  if (percentage <= 80) return 'bg-yellow-500';
  return 'bg-red-500';
};

const getUtilizationTextColor = (percentage: number): string => {
  if (percentage <= 50) return 'text-green-700';
  if (percentage <= 80) return 'text-yellow-700';
  return 'text-red-700';
};

export default function LeaveBalancePage() {
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const [employeeBalances, setEmployeeBalances] = useState<EmployeeBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaveBalance = async () => {
      try {
        const response = await fetch('/api/leave/balance');
        if (!response.ok) {
          throw new Error('Failed to fetch leave balance');
        }
        const data = await response.json();
        setEmployeeBalances(data);
      } catch (error) {
        console.error('Error fetching leave balance:', error);
        setError('Failed to load leave balance');
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchLeaveBalance();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-sm border border-stroke bg-white px-5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <h3 className="mb-2 text-xl font-semibold text-black dark:text-white">
            Error Loading Leave Balance
          </h3>
          <p className="text-body dark:text-bodydark">{error}</p>
        </div>
      </div>
    );
  }  const isAdmin = session?.user?.role === 'ADMIN';
  const isManager = session?.user?.role === 'MANAGER';

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Leave Balance
        </h2>
        <nav>
          <ol className="flex items-center gap-2">
            <li>
              <Link className="font-medium" href="/">
                Dashboard /
              </Link>
            </li>
            <li className="font-medium text-primary">Leave Balance</li>
          </ol>
        </nav>
      </div>

      {/* Leave Balance Overview */}
      <div className="space-y-6">
        {employeeBalances.map((employeeBalance) => (
          <div
            key={employeeBalance.employeeId}
            className="rounded-sm border border-stroke bg-white px-5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5"
          >
            {/* Employee Header (only show for admin/manager viewing multiple employees) */}
            {(isAdmin || isManager) && employeeBalances.length > 1 && (
              <div className="mb-6 border-b border-stroke pb-4 dark:border-strokedark">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      {employeeBalance.employee.firstName} {employeeBalance.employee.lastName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {employeeBalance.employee.email} • {employeeBalance.employee.department}
                    </p>
                  </div>
                  <div className="mt-2 sm:mt-0 text-sm text-gray-500 dark:text-gray-400">
                    <p>Years of Service: <span className="font-medium">{employeeBalance.employee.yearsOfService} years</span></p>
                    <p>Start Date: <span className="font-medium">{new Date(employeeBalance.employee.startDate).toLocaleDateString()}</span></p>
                  </div>
                </div>
              </div>
            )}

            {/* Leave Types Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {employeeBalance.balances.map((balance) => (
                <div
                  key={`${employeeBalance.employeeId}-${balance.leaveType}`}
                  className="rounded-lg border border-stroke bg-gray-50 p-4 dark:border-strokedark dark:bg-meta-4"
                >
                  {/* Leave Type Header */}
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getLeaveTypeEmoji(balance.leaveType)}</span>
                      <h4 className="font-medium text-black dark:text-white">
                        {balance.leaveTypeName}
                      </h4>
                    </div>
                  </div>

                  {/* Leave Stats */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Total Days:</span>
                      <span className="font-medium text-black dark:text-white">
                        {balance.totalDays === 999 ? 'Unlimited' : balance.totalDays}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Used Days:</span>
                      <span className="font-medium text-black dark:text-white">{balance.usedDays}</span>
                    </div>
                    {balance.pendingDays > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Pending Days:</span>
                        <span className="font-medium text-yellow-600">{balance.pendingDays}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Remaining:</span>
                      <span className={`font-medium ${balance.remainingDays <= 5 && balance.totalDays !== 999 ? 'text-red-600' : 'text-green-600'}`}>
                        {balance.totalDays === 999 ? 'Unlimited' : balance.remainingDays}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar (only for limited leave types) */}
                  {balance.totalDays !== 999 && (
                    <div className="mt-3">
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">Utilization</span>
                        <span className={`font-medium ${getUtilizationTextColor(balance.utilizationPercentage)}`}>
                          {balance.utilizationPercentage}%
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getUtilizationColor(balance.utilizationPercentage)}`}
                          style={{ width: `${Math.min(balance.utilizationPercentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Warning for low balance */}
                  {balance.remainingDays <= 5 && balance.totalDays !== 999 && balance.remainingDays > 0 && (
                    <div className="mt-2 rounded bg-yellow-50 p-2 text-xs text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                      ⚠️ Low balance remaining
                    </div>
                  )}

                  {/* Warning for exhausted balance */}
                  {balance.remainingDays === 0 && balance.totalDays !== 999 && (
                    <div className="mt-2 rounded bg-red-50 p-2 text-xs text-red-800 dark:bg-red-900/20 dark:text-red-400">
                      🚫 No balance remaining
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Legal Notice */}
            <div className="mt-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <div className="flex items-start gap-3">
                <div className="text-blue-600 dark:text-blue-400">ℹ️</div>
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  <p className="font-medium mb-1">Jordanian Labor Law Compliance</p>
                  <p>
                    Leave allocations are calculated according to the Jordanian Labor Law No. 8 of 1996.
                    Vacation days increase from 14 to 21 days after 5 years of service.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/leave/requests"
          className="rounded bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
        >
          📝 View Leave Requests
        </Link>
        <Link
          href="/leave/requests"
          className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
        >
          ➕ Request Leave
        </Link>
        {(isAdmin || isManager) && (
          <Link
            href="/leave/approvals"
            className="rounded bg-yellow-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-yellow-700"
          >
            ⚖️ Pending Approvals
          </Link>
        )}
        <Link
          href="/leave/policies"
          className="rounded bg-gray-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
        >
          📋 Leave Policies
        </Link>
      </div>
    </div>
  );
}
