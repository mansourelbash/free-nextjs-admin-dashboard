import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { LeaveStatus } from '@prisma/client';
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; action: string }> }
) {
  try {
    const { id, action } = await params;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await getServerSession(authOptions as any) as ExtendedSession | null;
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }    // Check permissions based on action
    if (action === 'withdraw') {
      // For withdraw: only the employee who created the request can withdraw it
      const leaveRequest = await prisma.leaveRequest.findUnique({
        where: { id },
        include: {
          employee: true,
        },
      });

      if (!leaveRequest) {
        return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
      }

      if (leaveRequest.employee.userId !== session.user.id) {
        return NextResponse.json({ error: 'You can only withdraw your own requests' }, { status: 403 });
      }
    } else {
      // For approve/reject: check if user has permission
      const canApprove = ['ADMIN', 'SUPER_ADMIN', 'HR_MANAGER', 'MANAGER'].includes(session.user.role);
      if (!canApprove) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
    }

    // Validate action
    if (!['approve', 'reject', 'withdraw'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }    // Find the leave request
    const leaveRequest = await (prisma as any).leaveRequest.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            userId: true, // Make sure we get the userId field
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!leaveRequest) {
      return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
    }

    // Check if request is still pending
    if (leaveRequest.status !== 'PENDING') {
      return NextResponse.json({ 
        error: 'Leave request has already been processed' 
      }, { status: 400 });
    }    // Update the leave request
    let newStatus: LeaveStatus;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let updateData: any;

    if (action === 'approve') {
      newStatus = LeaveStatus.APPROVED;
      updateData = {
        status: newStatus,
        updatedAt: new Date(),
        approvedBy: session.user.id,
        approvedAt: new Date(),
      };
    } else if (action === 'reject') {
      newStatus = LeaveStatus.REJECTED;
      updateData = {
        status: newStatus,
        updatedAt: new Date(),
        rejectedAt: new Date(),
      };    } else if (action === 'withdraw') {
      newStatus = LeaveStatus.CANCELLED;
      updateData = {
        status: newStatus,
        updatedAt: new Date(),
      };    }    const updatedRequest = await prisma.leaveRequest.update({
      where: { id },
      data: updateData,
      include: {
        employee: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },    });    // Create notification for the employee
    try {
      const approverName = `${session.user.firstName} ${session.user.lastName}`;
      const formattedLeaveType = String(leaveRequest.leaveType).replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());

      console.log('Creating notification for leave request action:', {
        action,
        requestId: leaveRequest.id,
        employeeUserId: leaveRequest.employee.userId,
        employeeName: `${leaveRequest.employee.user.firstName} ${leaveRequest.employee.user.lastName}`,
        approverName,
        leaveType: leaveRequest.leaveType,
        formattedLeaveType
      });

      // Verify employee userId exists
      if (!leaveRequest.employee.userId) {
        console.error('Employee userId is missing from leave request:', leaveRequest.id);
        throw new Error('Employee userId is missing');
      }

      if (action === 'approve') {
        const notification = await NotificationService.createLeaveApprovalNotification(
          leaveRequest.id,
          leaveRequest.employee.userId,
          formattedLeaveType,
          'APPROVED',
          approverName
        );
        console.log('Approval notification created successfully:', notification.id);
      } else if (action === 'reject') {
        const notification = await NotificationService.createLeaveApprovalNotification(
          leaveRequest.id,
          leaveRequest.employee.userId,
          formattedLeaveType,
          'REJECTED',
          approverName        );
        console.log('Rejection notification created successfully:', notification.id);      } else if (action === 'withdraw') {
        // Notify admin/manager when employee cancels their leave request
        const employeeName = `${leaveRequest.employee.user.firstName} ${leaveRequest.employee.user.lastName}`;        // Find manager to notify about the cancellation
        const employeeWithManager = await prisma.employee.findUnique({
          where: { id: leaveRequest.employee.id },
          include: { 
            manager: {
              select: { id: true, email: true }
            }
          }
        });
        
        const managerUserId = employeeWithManager?.manager?.id;
        
        // Notify direct manager if exists
        if (managerUserId) {
          try {
            const managerNotification = await NotificationService.createLeaveCancellationNotification(
              leaveRequest.id,
              managerUserId,
              employeeName,
              formattedLeaveType
            );
            console.log('Manager cancellation notification created:', managerNotification.id);
          } catch (error) {
            console.error('Error creating manager cancellation notification:', error);
          }
        }
        
        // ALSO notify all admins about the cancellation
        const adminUsers = await prisma.user.findMany({
          where: {
            OR: [
              { role: 'HR_MANAGER' },
              { role: 'ADMIN' },
              { role: 'SUPER_ADMIN' }
            ],
            isActive: true,
            // Don't duplicate notification if admin is already the direct manager
            ...(managerUserId ? { id: { not: managerUserId } } : {})
          }
        });
        
        console.log(`Found ${adminUsers.length} admin users to notify about leave cancellation`);
        
        // Create cancellation notifications for all admins
        for (const adminUser of adminUsers) {
          try {
            const adminNotification = await NotificationService.createLeaveCancellationNotification(
              leaveRequest.id,
              adminUser.id,
              employeeName,
              formattedLeaveType
            );
            console.log('Admin cancellation notification created:', adminNotification.id, 'for admin:', adminUser.email);
          } catch (error) {
            console.error('Error creating admin cancellation notification for:', adminUser.email, error);
          }
        }
        
        if (!managerUserId && adminUsers.length === 0) {
          console.warn('No manager/admin found to notify about leave cancellation:', leaveRequest.id);
        }
      }// Note: withdraw action doesn't send notification to employee (they initiated it)
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      console.error('Leave request data:', {
        id: leaveRequest.id,
        employee: leaveRequest.employee,
        leaveType: leaveRequest.leaveType
      });
      // Don't fail the request if notification fails
    }

    return NextResponse.json({
      message: `Leave request ${action === 'withdraw' ? 'withdrawn' : action + 'd'} successfully`,
      leaveRequest: updatedRequest,
    });
  } catch (error) {
    console.error(`Error processing leave request action:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
