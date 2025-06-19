import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { LeaveType, LeaveStatus } from '@prisma/client';
import { calculateWorkingDays, getHolidaysInRange, isNonWorkingDay } from '@/utils/jordanian-holidays';
import { NotificationService } from '@/lib/notification-service';

interface ExtendedSession {
  user: {
    id: string;
    role: string;
    email: string;
    firstName: string;
    lastName: string;
  }
}

export async function GET(request: NextRequest) {
  try {
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

    console.log('Leave requests access by:', session.user.email, 'with role:', session.user.role);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const employeeId = searchParams.get('employeeId');

    // Build where clause
    const where: Record<string, any> = {};
    if (status && status !== 'ALL') {
      where.status = status as LeaveStatus;
    }
    if (employeeId) {
      where.employeeId = employeeId;
    }// For employees, only show their own requests
    // For managers, show requests from their department only
    // For admins, show all requests
    if (session.user.role === 'EMPLOYEE') {
      // Find employee record for this user
      const employee = await (prisma as any).employee.findUnique({
        where: { userId: session.user.id }
      });
      if (employee) {
        where.employeeId = employee.id;
      }
    } else if (session.user.role === 'MANAGER') {
      // Managers see requests from their department only
      const managerEmployee = await (prisma as any).employee.findUnique({
        where: { userId: session.user.id },
        include: { department: true }
      });
      
      if (managerEmployee?.departmentId) {
        // Get all employees in the same department
        const departmentEmployees = await (prisma as any).employee.findMany({
          where: { departmentId: managerEmployee.departmentId },
          select: { id: true }
        });
        
        where.employeeId = {
          in: departmentEmployees.map((emp: any) => emp.id)
        };
      } else {
        // If manager has no department, show only their own requests
        where.employeeId = managerEmployee?.id;
      }    }
    // ADMIN, HR_MANAGER, SUPER_ADMIN see all requests (no additional where clause)

    const requests = await (prisma as any).leaveRequest.findMany({
      where,
      include: {
        employee: {
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
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });    // Transform the data to include calculated totalDays (working days only) and format leaveType
    const leaveRequests = requests.map((request: any) => {
      const start = new Date(request.startDate);
      const end = new Date(request.endDate);
      
      // Calculate working days (excluding weekends and Jordanian holidays)
      const totalDays = calculateWorkingDays(start, end);

      return {
        ...request,
        totalDays,
        leaveType: {
          name: request.leaveType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
        }
      };
    });

    return NextResponse.json(leaveRequests);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leave requests' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any) as ExtendedSession | null;
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { leaveType, startDate, endDate, reason } = body;

    // Validate required fields
    if (!leaveType || !startDate || !endDate || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find employee record for this user
    const employee = await (prisma as any).employee.findUnique({
      where: { userId: session.user.id }
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee record not found' },
        { status: 404 }
      );
    }    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    if (start < new Date()) {
      return NextResponse.json(
        { error: 'Start date cannot be in the past' },
        { status: 400 }
      );
    }

    // Calculate working days (excluding weekends and holidays)
    const workingDays = calculateWorkingDays(start, end);
    const holidaysInRange = getHolidaysInRange(start, end);
    
    // Add info about holidays in the range
    let holidayInfo = '';
    if (holidaysInRange.length > 0) {
      holidayInfo = `Note: ${holidaysInRange.length} public holiday(s) excluded from calculation: ${holidaysInRange.map(h => h.name).join(', ')}`;
    }    // Create leave request
    const leaveRequest = await (prisma as any).leaveRequest.create({
      data: {
        employeeId: employee.id,
        leaveType: leaveType as LeaveType,
        startDate: start,
        endDate: end,
        reason,
        status: 'PENDING'
      },
      include: {
        employee: {
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
            manager: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });    // Create notification for manager
    try {
      const employeeName = `${leaveRequest.employee.user.firstName} ${leaveRequest.employee.user.lastName}`;
      const formattedLeaveType = leaveType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
      const formattedStartDate = start.toLocaleDateString();
      const formattedEndDate = end.toLocaleDateString();

      // Find manager (either direct manager or department manager)
      let managerUserId = leaveRequest.employee.manager?.id;

      console.log('Looking for manager to notify. Direct manager ID:', managerUserId);

      if (!managerUserId) {
        // If no direct manager, find department manager or any HR_MANAGER/ADMIN
        const departmentManager = await (prisma as any).user.findFirst({
          where: {
            OR: [
              { role: 'HR_MANAGER' },
              { role: 'ADMIN' },
              { role: 'SUPER_ADMIN' }
            ],
            isActive: true
          }
        });
        managerUserId = departmentManager?.id;
        console.log('No direct manager found, using department/admin manager:', managerUserId);
      }

      if (managerUserId) {
        console.log('Creating notification for manager:', managerUserId);
        const notification = await NotificationService.createLeaveRequestNotification(
          leaveRequest.id,
          employeeName,
          formattedLeaveType,
          formattedStartDate,
          formattedEndDate,
          managerUserId
        );
        console.log('Notification created successfully:', notification.id);
      } else {
        console.warn('No manager found to notify for leave request:', leaveRequest.id);
      }
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Don't fail the request if notification fails
    }return NextResponse.json({ 
      message: 'Leave request submitted successfully',
      leaveRequest: {
        ...leaveRequest,
        totalDays: workingDays
      },
      holidayInfo: holidayInfo || undefined
    });
  } catch (error) {
    console.error('Error creating leave request:', error);
    return NextResponse.json(
      { error: 'Failed to create leave request' },
      { status: 500 }
    );
  }
}
