import { NextResponse } from 'next/server';
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

export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await getServerSession(authOptions as any) as ExtendedSession | null;
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user's employee record
    const employee = await prisma.employee.findUnique({
      where: { userId: session.user.id },
      include: {
        leaveRequests: {
          include: {
            leaveType: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee record not found' }, { status: 404 });
    }

    // Format the data for easy debugging
    const debugData = {
      employeeId: employee.id,
      userId: employee.userId,
      hireDate: employee.hireDate,
      leaveRequests: employee.leaveRequests.map(req => ({
        id: req.id,
        leaveType: req.leaveType,
        startDate: req.startDate,
        endDate: req.endDate,
        status: req.status,
        reason: req.reason,
        createdAt: req.createdAt,
        daysBetween: Math.ceil((new Date(req.endDate).getTime() - new Date(req.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
      }))
    };

    return NextResponse.json(debugData);

  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
