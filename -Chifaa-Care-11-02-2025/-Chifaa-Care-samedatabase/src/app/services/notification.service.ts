import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  actions?: Array<{ action: string; title: string; icon?: string }>;
  tag?: string;
  requireInteraction?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly API_URL = environment.apiUrl;
  private notificationPermission$ = new BehaviorSubject<NotificationPermission>('default');
  private subscription: PushSubscription | null = null;

  constructor(private http: HttpClient) {
    this.checkPermission();
  }

  /**
   * Check current notification permission status
   */
  private checkPermission(): void {
    if ('Notification' in window) {
      this.notificationPermission$.next(Notification.permission);
    }
  }

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    this.notificationPermission$.next(permission);
    
    if (permission === 'granted') {
      // Subscribe to push notifications
      await this.subscribeToPushNotifications();
    }
    
    return permission;
  }

  /**
   * Get current permission status as observable
   */
  getPermissionStatus(): Observable<NotificationPermission> {
    return this.notificationPermission$.asObservable();
  }

  /**
   * Subscribe to push notifications (Web Push API)
   */
  async subscribeToPushNotifications(): Promise<void> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Subscribe to push notifications
        const vapidPublicKey = environment.vapidPublicKey || this.urlBase64ToUint8Array(
          'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
        );

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidPublicKey
        });
      }

      this.subscription = subscription;
      
      // Send subscription to backend
      await this.sendSubscriptionToBackend(subscription);
      
      console.log('Push notification subscription successful');
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
    }
  }

  /**
   * Send push subscription to backend
   */
  private async sendSubscriptionToBackend(subscription: PushSubscription): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await this.http.post(`${this.API_URL}/notifications/subscribe`, {
        subscription: subscription.toJSON()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      }).toPromise();
    } catch (error) {
      console.error('Failed to send subscription to backend:', error);
    }
  }

  /**
   * Show local notification (doesn't require backend)
   */
  async showNotification(payload: NotificationPayload): Promise<void> {
    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/assets/icons/icon-192x192.png',
        badge: payload.badge || '/assets/icons/icon-72x72.png',
        data: payload.data,
        actions: payload.actions,
        tag: payload.tag,
        requireInteraction: payload.requireInteraction || false,
        vibrate: [200, 100, 200]
      });
    } else {
      // Fallback to basic notification
      new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/assets/icons/icon-192x192.png'
      });
    }
  }

  /**
   * Send notification to specific user (via backend)
   */
  sendNotificationToUser(userId: string, payload: NotificationPayload): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post(`${this.API_URL}/notifications/send`, {
      userId,
      notification: payload
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /**
   * Notify patient about appointment
   */
  notifyAppointmentCreated(appointmentId: string, patientId: string, doctorName: string, date: string): Observable<any> {
    return this.sendNotificationToUser(patientId, {
      title: 'New Appointment Scheduled',
      body: `Your appointment with ${doctorName} is scheduled for ${date}`,
      icon: '/assets/icons/icon-192x192.png',
      data: { type: 'appointment', appointmentId },
      actions: [
        { action: 'view', title: 'View Details' },
        { action: 'dismiss', title: 'Dismiss' }
      ],
      tag: `appointment-${appointmentId}`,
      requireInteraction: true
    });
  }

  /**
   * Notify doctor about new appointment request
   */
  notifyDoctorNewRequest(doctorId: string, patientName: string, appointmentId: string): Observable<any> {
    return this.sendNotificationToUser(doctorId, {
      title: 'New Appointment Request',
      body: `${patientName} has requested an appointment`,
      icon: '/assets/icons/icon-192x192.png',
      data: { type: 'appointment-request', appointmentId },
      actions: [
        { action: 'accept', title: 'Accept' },
        { action: 'view', title: 'View Details' }
      ],
      tag: `request-${appointmentId}`,
      requireInteraction: true
    });
  }

  /**
   * Notify patient about appointment confirmation
   */
  notifyAppointmentConfirmed(patientId: string, doctorName: string, date: string): Observable<any> {
    return this.sendNotificationToUser(patientId, {
      title: 'Appointment Confirmed',
      body: `Dr. ${doctorName} confirmed your appointment for ${date}`,
      icon: '/assets/icons/icon-192x192.png',
      data: { type: 'appointment-confirmed' },
      tag: 'appointment-confirmed'
    });
  }

  /**
   * Send appointment reminder (1 day before)
   */
  notifyAppointmentReminder(userId: string, doctorName: string, date: string, time: string): Observable<any> {
    return this.sendNotificationToUser(userId, {
      title: 'Appointment Reminder',
      body: `You have an appointment with ${doctorName} tomorrow at ${time}`,
      icon: '/assets/icons/icon-192x192.png',
      data: { type: 'reminder' },
      requireInteraction: true
    });
  }

  /**
   * Notify about new message
   */
  notifyNewMessage(userId: string, senderName: string, preview: string): Observable<any> {
    return this.sendNotificationToUser(userId, {
      title: `New message from ${senderName}`,
      body: preview,
      icon: '/assets/icons/icon-192x192.png',
      data: { type: 'message' },
      actions: [
        { action: 'reply', title: 'Reply' },
        { action: 'view', title: 'View' }
      ]
    });
  }

  /**
   * Notify about prescription ready
   */
  notifyPrescriptionReady(patientId: string, doctorName: string): Observable<any> {
    return this.sendNotificationToUser(patientId, {
      title: 'Prescription Ready',
      body: `Dr. ${doctorName} has issued a new prescription`,
      icon: '/assets/icons/icon-192x192.png',
      data: { type: 'prescription' },
      actions: [
        { action: 'view', title: 'View Prescription' }
      ]
    });
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<void> {
    if (!this.subscription) return;

    try {
      await this.subscription.unsubscribe();
      this.subscription = null;
      console.log('Unsubscribed from push notifications');
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
    }
  }

  /**
   * Convert VAPID key to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}
