import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import webpush from 'web-push';

const prisma = new PrismaClient();

/**
 * Push Notification Controller for Web Push API
 * Sends notifications to patients and doctors
 */

// Configure web-push with VAPID keys
// Generate keys using: npx web-push generate-vapid-keys
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U',
  privateKey: process.env.VAPID_PRIVATE_KEY || 'UUxI4O8-FbRouAevSmBQ6o18hgE4nSG3qwvJTfKc-ls'
};

webpush.setVapidDetails(
  'mailto:admin@chifaacare.tn',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

/**
 * Subscribe user to push notifications
 */
export const subscribe = async (req: any, res: Response) => {
  try {
    const { subscription } = req.body;
    const userId = req.user.id;

    if (!subscription) {
      return res.status(400).json({
        status: 'error',
        message: 'Subscription data is required'
      });
    }

    // Store subscription in database
    await prisma.pushSubscription.upsert({
      where: { userId },
      update: {
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        updatedAt: new Date()
      },
      create: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Subscribed to push notifications'
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to subscribe to notifications'
    });
  }
};

/**
 * Unsubscribe user from push notifications
 */
export const unsubscribe = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    await prisma.pushSubscription.delete({
      where: { userId }
    });

    res.status(200).json({
      status: 'success',
      message: 'Unsubscribed from push notifications'
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to unsubscribe'
    });
  }
};

/**
 * Send push notification to specific user
 */
export const sendNotification = async (req: any, res: Response) => {
  try {
    const { userId, notification } = req.body;

    if (!userId || !notification) {
      return res.status(400).json({
        status: 'error',
        message: 'userId and notification are required'
      });
    }

    // Get user's push subscription
    const subscription = await prisma.pushSubscription.findUnique({
      where: { userId }
    });

    if (!subscription) {
      return res.status(404).json({
        status: 'error',
        message: 'User not subscribed to push notifications'
      });
    }

    // Prepare push subscription object
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth
      }
    };

    // Send push notification
    const payload = JSON.stringify(notification);
    await webpush.sendNotification(pushSubscription, payload);

    // Store notification in database for history
    await prisma.notification.create({
      data: {
        userId,
        title: notification.title,
        body: notification.body,
        type: notification.data?.type || 'general',
        data: notification.data ? JSON.stringify(notification.data) : null,
        isRead: false
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Notification sent successfully'
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send notification'
    });
  }
};

/**
 * Send notification to multiple users
 */
export const sendBulkNotification = async (req: any, res: Response) => {
  try {
    const { userIds, notification } = req.body;

    if (!userIds || !Array.isArray(userIds) || !notification) {
      return res.status(400).json({
        status: 'error',
        message: 'userIds (array) and notification are required'
      });
    }

    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        userId: { in: userIds }
      }
    });

    const payload = JSON.stringify(notification);
    const results = await Promise.allSettled(
      subscriptions.map(sub => 
        webpush.sendNotification({
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        }, payload)
      )
    );

    // Store notifications in database
    await prisma.notification.createMany({
      data: userIds.map(userId => ({
        userId,
        title: notification.title,
        body: notification.body,
        type: notification.data?.type || 'general',
        data: notification.data ? JSON.stringify(notification.data) : null,
        isRead: false
      }))
    });

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    res.status(200).json({
      status: 'success',
      message: `Sent ${successful} notifications, ${failed} failed`,
      results: { successful, failed }
    });
  } catch (error) {
    console.error('Bulk notification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send bulk notifications'
    });
  }
};

/**
 * Get user's notification history
 */
export const getNotifications = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { limit = 50, unreadOnly = false } = req.query;

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly === 'true' && { isRead: false })
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit as string)
    });

    res.status(200).json({
      status: 'success',
      results: notifications.length,
      data: { notifications }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch notifications'
    });
  }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: {
        id,
        userId
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to mark notification as read'
    });
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to mark all as read'
    });
  }
};

/**
 * Delete notification
 */
export const deleteNotification = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await prisma.notification.deleteMany({
      where: {
        id,
        userId
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete notification'
    });
  }
};

/**
 * Helper: Send appointment reminder notifications
 * Called by cron job or scheduler
 */
export const sendAppointmentReminders = async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const endOfTomorrow = new Date(tomorrow);
    endOfTomorrow.setHours(23, 59, 59, 999);

    // Get appointments for tomorrow
    const appointments = await prisma.appointment.findMany({
      where: {
        appointmentDate: {
          gte: tomorrow,
          lte: endOfTomorrow
        },
        status: 'CONFIRMED'
      },
      include: {
        patient: true,
        doctor: true
      }
    });

    for (const apt of appointments) {
      const time = new Date(apt.appointmentDate).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });

      // Notify patient
      const patientSub = await prisma.pushSubscription.findUnique({
        where: { userId: apt.patientId }
      });

      if (patientSub) {
        const notification = {
          title: 'Appointment Reminder',
          body: `You have an appointment with Dr. ${apt.doctor.firstName} ${apt.doctor.lastName} tomorrow at ${time}`,
          icon: '/assets/icons/icon-192x192.png',
          data: { type: 'reminder', appointmentId: apt.id }
        };

        await webpush.sendNotification({
          endpoint: patientSub.endpoint,
          keys: {
            p256dh: patientSub.p256dh,
            auth: patientSub.auth
          }
        }, JSON.stringify(notification));
      }

      // Notify doctor
      const doctorSub = await prisma.pushSubscription.findUnique({
        where: { userId: apt.doctorId }
      });

      if (doctorSub) {
        const notification = {
          title: 'Appointment Reminder',
          body: `You have an appointment with ${apt.patient.firstName} ${apt.patient.lastName} tomorrow at ${time}`,
          icon: '/assets/icons/icon-192x192.png',
          data: { type: 'reminder', appointmentId: apt.id }
        };

        await webpush.sendNotification({
          endpoint: doctorSub.endpoint,
          keys: {
            p256dh: doctorSub.p256dh,
            auth: doctorSub.auth
          }
        }, JSON.stringify(notification));
      }
    }

    console.log(`Sent ${appointments.length * 2} appointment reminders`);
  } catch (error) {
    console.error('Send appointment reminders error:', error);
  }
};
