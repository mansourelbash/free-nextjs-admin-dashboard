import React from 'react';
import {
  DashboardIcon,
  EmployeesIcon,
  AttendanceIcon,
  PayrollIcon,
  LeaveIcon,
  PerformanceIcon,
  ReportsIcon,
  SettingsIcon,
} from '../components/hrms/HRMSIcons';

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

export const hrmsNavItems: NavItem[] = [
  {
    icon: <DashboardIcon />,
    name: "Dashboard",
    path: "/dashboard",
  },
  {
    icon: <EmployeesIcon />,
    name: "Employees",
    subItems: [
      { name: "All Employees", path: "/employees", pro: false },
      { name: "Add Employee", path: "/employees/add", pro: false },
      { name: "Employee Directory", path: "/employees/directory", pro: false },
      { name: "Departments", path: "/employees/departments", pro: false },
      { name: "Positions", path: "/employees/positions", pro: false },
    ],
  },
  {
    icon: <AttendanceIcon />,
    name: "Attendance",
    subItems: [
      { name: "Daily Attendance", path: "/attendance/daily", pro: false },
      { name: "Time Tracking", path: "/attendance/tracking", pro: false },
      { name: "Attendance Reports", path: "/attendance/reports", pro: false },
      { name: "Work Schedules", path: "/attendance/schedules", pro: false },
    ],
  },
  {
    icon: <LeaveIcon />,
    name: "Leave Management",
    subItems: [
      { name: "Leave Requests", path: "/leave/requests", pro: false },
      { name: "Leave Approvals", path: "/leave/approvals", pro: false },
      { name: "Leave Balance", path: "/leave/balance", pro: false },
      { name: "Leave Policies", path: "/leave/policies", pro: false },
    ],
  },
  {
    icon: <PayrollIcon />,
    name: "Payroll",
    subItems: [
      { name: "Payroll Processing", path: "/payroll/processing", pro: false },
      { name: "Salary Management", path: "/payroll/salary", pro: false },
      { name: "Pay Slips", path: "/payroll/payslips", pro: false },
      { name: "Tax Management", path: "/payroll/tax", pro: false },
    ],
  },
];

export const hrmsOthersItems: NavItem[] = [
  {
    icon: <PerformanceIcon />,
    name: "Performance",
    subItems: [
      { name: "Performance Reviews", path: "/performance/reviews", pro: false },
      { name: "Goal Setting", path: "/performance/goals", pro: false },
      { name: "360° Feedback", path: "/performance/feedback", pro: false },
      { name: "Performance Reports", path: "/performance/reports", pro: false },
    ],
  },
  {
    icon: <ReportsIcon />,
    name: "Reports & Analytics",
    subItems: [
      { name: "Employee Reports", path: "/reports/employees", pro: false },
      { name: "Attendance Reports", path: "/reports/attendance", pro: false },
      { name: "Payroll Reports", path: "/reports/payroll", pro: false },
      { name: "Custom Reports", path: "/reports/custom", pro: false },
    ],
  },
  {
    icon: <SettingsIcon />,
    name: "Settings",
    subItems: [
      { name: "Company Settings", path: "/settings/company", pro: false },
      { name: "User Management", path: "/settings/users", pro: false },
      { name: "System Settings", path: "/settings/system", pro: false },
      { name: "Backup & Security", path: "/settings/security", pro: false },
    ],
  },
];
