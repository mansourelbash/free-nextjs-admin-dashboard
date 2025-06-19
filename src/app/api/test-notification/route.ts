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

// POST /api/test-notification - Create a test notification
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any) as ExtendedSession | null;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Creating test notification for user:', session.user.email);    // Create a test notification for the current user
    const notification = await NotificationService.createNotification({
      userId: session.user.id,
      type: 'GENERAL',
      title: 'Test Notification',
      message: `Hello ${session.user.firstName}! This is a test notification created at ${new Date().toLocaleString()}`,
      actionUrl: '/leave/requests', // Test action URL
    });

    console.log('Test notification created:', notification.id);

    return NextResponse.json({
      success: true,
      notification,
    });

  } catch (error) {
    console.error('Error creating test notification:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
