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

// PATCH /api/notifications/[id] - Mark notification as read/unread
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions as any) as ExtendedSession | null;
    
    if (!session?.user?.id) {
      console.log('Notifications API: No session for mark as read');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notificationId = params.id;
    const body = await request.json();
    const { isRead } = body;

    console.log('Notifications API: Marking notification as read:', {
      notificationId,
      userId: session.user.id,
      userEmail: session.user.email,
      isRead
    });

    // Verify the notification belongs to the user
    const notification = await (prisma as any).notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      console.log('Notifications API: Notification not found:', notificationId);
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    if (notification.userId !== session.user.id) {
      console.log('Notifications API: Access denied. Notification belongs to:', notification.userId, 'but user is:', session.user.id);
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update the notification
    const updatedNotification = await (prisma as any).notification.update({
      where: { id: notificationId },
      data: {
        isRead: isRead ?? true,
        readAt: isRead === false ? null : new Date(),
      },
    });

    console.log('Notifications API: Successfully updated notification:', notificationId, 'isRead:', updatedNotification.isRead);

    return NextResponse.json({ notification: updatedNotification });

  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications/[id] - Delete notification
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions as any) as ExtendedSession | null;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notificationId = params.id;

    // Verify the notification belongs to the user
    const notification = await (prisma as any).notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    if (notification.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete the notification
    await (prisma as any).notification.delete({
      where: { id: notificationId },
    });

    return NextResponse.json({ message: 'Notification deleted successfully' });

  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
