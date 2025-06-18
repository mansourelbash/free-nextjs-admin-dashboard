import type { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import type { Session } from "next-auth";

export const metadata: Metadata = {
  title: "HRMS Dashboard | Human Resource Management System",
  description: "Comprehensive HRMS dashboard for managing employees, attendance, payroll, and more",
};

export default async function HomePage() {
  const session = await getServerSession(authOptions) as Session | null;
  
  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Role-based routing logic
  const userRole = session.user.role;
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {session.user.firstName} {session.user.lastName}!
        </h1>
        <p className="text-gray-600">
          Role: {userRole} • Email: {session.user.email}
        </p>
        <div className="mt-4">
          <p>Dashboard is loading successfully!</p>
          <p>User ID: {session.user.id}</p>
          
          {/* Role-based dashboard content */}
          {(userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900">Admin Dashboard</h3>
              <p className="text-blue-700">You have administrative privileges</p>
            </div>
          )}
          
          {userRole === 'HR_MANAGER' && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900">HR Manager Dashboard</h3>
              <p className="text-green-700">Manage HR operations and employee data</p>
            </div>
          )}
          
          {userRole === 'MANAGER' && (
            <div className="mt-4 p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-900">Manager Dashboard</h3>
              <p className="text-purple-700">Manage your team and projects</p>
            </div>
          )}
          
          {userRole === 'EMPLOYEE' && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900">Employee Dashboard</h3>
              <p className="text-gray-700">View your profile, attendance, and tasks</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
