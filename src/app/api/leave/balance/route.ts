import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { LeaveType, LeaveStatus } from '@prisma/client';
import { calculateWorkingDays } from '@/utils/jordanian-holidays';

interface ExtendedSession {
  user: {
    id: string;
    role: string;
    email: string;
    firstName: string;
    lastName: string;
  }
}

// Jordanian Labor Law leave allocations
const getJordanianLeaveAllocation = (leaveType: LeaveType, yearsOfService: number): number => {
  switch (leaveType) {
    case LeaveType.VACATION:
      // Article 61: 14 days for <5 years, 21 days for ≥5 years
      return yearsOfService >= 5 ? 21 : 14;
    case LeaveType.SICK:
      // Article 65: 14 days full pay + 14 days half pay
      return 14;
    case LeaveType.MATERNITY:
      // Article 67: 10 weeks (70 days) fully paid
      return 70;
    case LeaveType.PATERNITY:
      // 3 days paid leave
      return 3;
    case LeaveType.BEREAVEMENT:
      // 3 days per occurrence
      return 3;
    case LeaveType.PERSONAL:
      // Company discretion - not mandated by law
      return 5;
    case LeaveType.UNPAID:
      // Unlimited but requires approval
      return 999;
    default:
      return 0;
  }
};

const calculateYearsOfService = (startDate: Date): number => {
  const now = new Date();
  const diffTime = now.getTime() - startDate.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25));
};

export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await getServerSession(authOptions as any) as ExtendedSession | null;
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // SECURITY: Ensure user has a valid role
    if (!session.user.role) {
      console.error('User has no role assigned:', session.user.email);
      return NextResponse.json({ error: 'Access denied: No role assigned' }, { status: 403 });
    }

    // SECURITY: Validate role is one of the expected values
    const validRoles = ['EMPLOYEE', 'MANAGER', 'ADMIN', 'HR_MANAGER', 'SUPER_ADMIN'];
    if (!validRoles.includes(session.user.role)) {
      console.error('User has invalid role:', session.user.role, 'for email:', session.user.email);
      return NextResponse.json({ error: 'Access denied: Invalid role' }, { status: 403 });
    }

    console.log('Leave balance access by:', session.user.email, 'with role:', session.user.role);

    const userRole = session.user.role;
    
    // For ADMIN and MANAGER: get all employees' leave balances
    // For EMPLOYEE: get only their own balance
    if (userRole === 'ADMIN' || userRole === 'MANAGER') {
      // Get all employees with their leave data
      const employees = await prisma.employee.findMany({
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          },
          department: {
            select: {
              name: true
            }
          },
          leaveRequests: {
            where: {
              createdAt: {
                gte: new Date(new Date().getFullYear(), 0, 1), // Current year
              }
            }
          }
        }
      });

      const employeeBalances = await Promise.all(
        employees.map(async (employee) => {
          const yearsOfService = calculateYearsOfService(employee.hireDate);
          const leaveTypes = Object.values(LeaveType);
            const balances = leaveTypes.map((leaveType) => {
            const totalDays = getJordanianLeaveAllocation(leaveType, yearsOfService);
            
            // Calculate used days (approved requests only - withdrawn/cancelled requests should not count)
            const usedDays = employee.leaveRequests
              .filter(req => req.leaveType === leaveType && req.status === LeaveStatus.APPROVED)
              .reduce((sum, req) => {
                const start = new Date(req.startDate);
                const end = new Date(req.endDate);
                const diffTime = Math.abs(end.getTime() - start.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                return sum + diffDays;
              }, 0);

            // Calculate pending days (pending requests only - exclude cancelled/withdrawn)
            const pendingDays = employee.leaveRequests
              .filter(req => req.leaveType === leaveType && req.status === LeaveStatus.PENDING)
              .reduce((sum, req) => {
                const start = new Date(req.startDate);
                const end = new Date(req.endDate);
                const diffTime = Math.abs(end.getTime() - start.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                return sum + diffDays;
              }, 0);

            const remainingDays = Math.max(0, totalDays - usedDays);
            
            return {
              leaveType,
              leaveTypeName: leaveType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              totalDays,
              usedDays,
              pendingDays,
              remainingDays,
              utilizationPercentage: totalDays > 0 ? Math.round((usedDays / totalDays) * 100) : 0
            };
          });

          return {
            employeeId: employee.id,
            employee: {
              firstName: employee.user.firstName,
              lastName: employee.user.lastName,
              email: employee.user.email,
              department: employee.department?.name || 'N/A',
              startDate: employee.hireDate,
              yearsOfService
            },
            balances
          };
        })
      );

      return NextResponse.json(employeeBalances);
    } else {
      // For regular employees, return only their own balance
      const employee = await prisma.employee.findUnique({
        where: { userId: session.user.id },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          },
          department: {
            select: {
              name: true
            }
          },
          leaveRequests: {
            where: {
              createdAt: {
                gte: new Date(new Date().getFullYear(), 0, 1), // Current year
              }
            }
          }
        }
      });

      if (!employee) {
        return NextResponse.json({ error: 'Employee record not found' }, { status: 404 });
      }

      const yearsOfService = calculateYearsOfService(employee.hireDate);
      const leaveTypes = Object.values(LeaveType);
        const balances = leaveTypes.map((leaveType) => {
        const totalDays = getJordanianLeaveAllocation(leaveType, yearsOfService);
        
        // Calculate used days (approved requests only - withdrawn/cancelled requests should not count)
        const usedDays = employee.leaveRequests
          .filter(req => req.leaveType === leaveType && req.status === LeaveStatus.APPROVED)
          .reduce((sum, req) => {
            const start = new Date(req.startDate);
            const end = new Date(req.endDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            return sum + diffDays;
          }, 0);

        // Calculate pending days (pending requests only - exclude cancelled/withdrawn)
        const pendingDays = employee.leaveRequests
          .filter(req => req.leaveType === leaveType && req.status === LeaveStatus.PENDING)
          .reduce((sum, req) => {
            const start = new Date(req.startDate);
            const end = new Date(req.endDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            return sum + diffDays;
          }, 0);

        const remainingDays = Math.max(0, totalDays - usedDays);
        
        return {
          leaveType,
          leaveTypeName: leaveType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          totalDays,
          usedDays,
          pendingDays,
          remainingDays,
          utilizationPercentage: totalDays > 0 ? Math.round((usedDays / totalDays) * 100) : 0
        };
      });

      return NextResponse.json([{
        employeeId: employee.id,
        employee: {
          firstName: employee.user.firstName,
          lastName: employee.user.lastName,
          email: employee.user.email,
          department: employee.department?.name || 'N/A',
          startDate: employee.hireDate,
          yearsOfService
        },
        balances
      }]);
    }
  } catch (error) {
    console.error('Error fetching leave balance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
