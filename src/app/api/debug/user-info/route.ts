import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface ExtendedSession {
  user: {
    id: string;
    role: string;
    email: string;
    firstName: string;
    lastName: string;
  }
}

// GET /api/debug/user-info - Get user information for debugging
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any) as ExtendedSession | null;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user information
    const user = await (prisma as any).user.findUnique({
      where: { id: session.user.id },
      include: {
        employee: {
          include: {
            manager: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
              }
            },
            department: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      }
    });

    // Get all users with manager roles
    const managers = await (prisma as any).user.findMany({
      where: {
        OR: [
          { role: 'MANAGER' },
          { role: 'HR_MANAGER' },
          { role: 'ADMIN' },
          { role: 'SUPER_ADMIN' }
        ],
        isActive: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      }
    });

    // Get notification count for this user
    const notificationCount = await (prisma as any).notification.count({
      where: { userId: session.user.id }
    });

    console.log('Debug user info for:', session.user.email);
    console.log('Employee info:', user?.employee);
    console.log('Manager info:', user?.employee?.manager);
    console.log('Available managers:', managers.length);
    console.log('Notification count:', notificationCount);

    return NextResponse.json({
      user: {
        id: user?.id,
        email: user?.email,
        firstName: user?.firstName,
        lastName: user?.lastName,
        role: user?.role,
      },
      employee: user?.employee ? {
        id: user.employee.id,
        employeeId: user.employee.employeeId,
        departmentId: user.employee.departmentId,
        department: user.employee.department,
        managerId: user.employee.managerId,
        manager: user.employee.manager,
      } : null,
      availableManagers: managers,
      notificationCount,
    });

  } catch (error) {
    console.error('Error getting debug info:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
