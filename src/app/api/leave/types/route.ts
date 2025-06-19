import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { LeaveType } from '@prisma/client';

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

    console.log('Leave types access by:', session.user.email, 'with role:', session.user.role);

    // Return all available leave types from the enum
    const leaveTypes = Object.values(LeaveType).map((type) => ({
      id: type,
      name: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    }));

    return NextResponse.json(leaveTypes);
  } catch (error) {
    console.error('Error fetching leave types:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
