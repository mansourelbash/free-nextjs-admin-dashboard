import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
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

// POST /api/test-approval-notification - Create a test approval notification
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any) as ExtendedSession | null;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }    console.log('Creating test approval notification for user:', session.user.email);

    // Create a test approval notification for the current user
    // Note: Not using leaveRequestId to avoid foreign key constraint
    const notification = await NotificationService.createNotification({
      userId: session.user.id, // Send notification to the current user
      type: 'LEAVE_REQUEST_APPROVED',
      title: 'Leave Request Approved',
      message: 'Your Vacation request has been approved by Test Manager',
      actionUrl: '/leave/requests', // Add action URL for navigation
      // leaveRequestId: undefined, // Don't set this to avoid foreign key constraint
    });

    console.log('Test approval notification created:', notification.id);

    return NextResponse.json({
      success: true,
      notification,
      message: 'Test approval notification created successfully'
    });

  } catch (error) {
    console.error('Error creating test approval notification:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
