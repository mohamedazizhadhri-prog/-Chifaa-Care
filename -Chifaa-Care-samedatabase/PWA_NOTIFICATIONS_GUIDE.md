# PWA & Push Notifications Implementation Guide

## Overview
ChifaaCare is now a **Progressive Web App (PWA)** with full push notification support for patients and doctors.

## ✅ Features Implemented

### 🔔 **Push Notifications**
- ✅ Web Push API integration
- ✅ Browser notifications for patients and doctors
- ✅ Appointment reminders (1 day before)
- ✅ New appointment request notifications
- ✅ Appointment confirmation notifications
- ✅ New message notifications
- ✅ Prescription ready notifications
- ✅ Notification history and management

### 📱 **PWA Features**
- ✅ Service Worker for offline caching
- ✅ App manifest for "Add to Home Screen"
- ✅ Offline access to schedules and appointments
- ✅ App icons (72x72 to 512x512)
- ✅ Responsive design (already using Tailwind CSS)

## 🚀 Setup Instructions

### 1. Update Database Schema

```bash
cd chifaacare-backend

# Generate Prisma client with new models
npx prisma generate

# Push schema to database (creates PushSubscription and Notification tables)
npx prisma db push
```

### 2. Generate VAPID Keys

```bash
# Install web-push CLI globally
npm install -g web-push

# Generate VAPID keys
web-push generate-vapid-keys
```

Add to `chifaacare-backend/.env`:
```env
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
```

### 3. Update Frontend Environment

Add to `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1',
  vapidPublicKey: 'your_public_key_here' // Same as backend
};
```

### 4. Register Notification Routes

In `chifaacare-backend/src/index.ts`:
```typescript
import notificationRoutes from './routes/notification.routes';

// Add after other routes
app.use('/api/v1/notifications', notificationRoutes);
```

### 5. Initialize Notification Service

In your app component or service:
```typescript
import { NotificationService } from './services/notification.service';

constructor(private notificationService: NotificationService) {
  // Request permission on app load
  this.notificationService.requestPermission();
}
```

## 📋 Usage Examples

### Frontend (Angular)

#### Request Notification Permission
```typescript
import { NotificationService } from './services/notification.service';

async enableNotifications() {
  const permission = await this.notificationService.requestPermission();
  
  if (permission === 'granted') {
    console.log('Notifications enabled!');
  }
}
```

#### Send Local Notification
```typescript
this.notificationService.showNotification({
  title: 'Appointment Confirmed',
  body: 'Your appointment is scheduled for tomorrow at 10:00 AM',
  icon: '/assets/icons/icon-192x192.png',
  requireInteraction: true
});
```

#### Notify Patient About Appointment
```typescript
this.notificationService.notifyAppointmentCreated(
  appointmentId,
  patientId,
  'Dr. Amira Ben Salem',
  'Tomorrow at 10:00 AM'
).subscribe(response => {
  console.log('Notification sent!');
});
```

#### Notify Doctor About New Request
```typescript
this.notificationService.notifyDoctorNewRequest(
  doctorId,
  'Fatma Ben Ali',
  appointmentId
).subscribe();
```

### Backend (Node.js/Express)

#### Send Notification to User
```typescript
import { sendNotification } from './controllers/notification.controller';

// In your appointment controller
await sendNotification({
  body: {
    userId: patientId,
    notification: {
      title: 'Appointment Confirmed',
      body: `Dr. ${doctorName} confirmed your appointment`,
      data: { type: 'appointment', appointmentId }
    }
  }
});
```

#### Send Bulk Notifications
```typescript
await sendBulkNotification({
  body: {
    userIds: [patient1Id, patient2Id, patient3Id],
    notification: {
      title: 'System Maintenance',
      body: 'The system will be down for maintenance tonight'
    }
  }
});
```

## 🔔 Notification Types

### 1. Appointment Created
**Sent to:** Patient  
**Trigger:** Doctor creates appointment or patient books  
**Actions:** View Details, Dismiss

### 2. Appointment Request
**Sent to:** Doctor  
**Trigger:** Patient requests appointment  
**Actions:** Accept, View Details

### 3. Appointment Confirmed
**Sent to:** Patient  
**Trigger:** Doctor accepts appointment  
**Actions:** None (informational)

### 4. Appointment Reminder
**Sent to:** Patient & Doctor  
**Trigger:** 1 day before appointment (automated)  
**Actions:** None (informational)

### 5. New Message
**Sent to:** Recipient  
**Trigger:** New message received  
**Actions:** Reply, View

### 6. Prescription Ready
**Sent to:** Patient  
**Trigger:** Doctor issues prescription  
**Actions:** View Prescription

## 🤖 Automated Notifications

### Appointment Reminders (Cron Job)

Create a cron job to send daily reminders:

```typescript
import cron from 'node-cron';
import { sendAppointmentReminders } from './controllers/notification.controller';

// Run every day at 9:00 AM
cron.schedule('0 9 * * *', async () => {
  console.log('Sending appointment reminders...');
  await sendAppointmentReminders();
});
```

Install cron:
```bash
npm install node-cron
npm install -D @types/node-cron
```

## 📱 PWA Installation

### Desktop
1. Open ChifaaCare in Chrome/Edge
2. Click the install icon in address bar
3. Click "Install"
4. App opens in standalone window

### Mobile
1. Open ChifaaCare in mobile browser
2. Tap "Add to Home Screen"
3. App icon appears on home screen
4. Opens like a native app

## 🔧 Service Worker Configuration

The service worker (`ngsw-config.json`) caches:
- App shell (HTML, CSS, JS)
- Static assets (images, icons)
- API responses (appointments, schedules)
- Fonts and styles

### Offline Functionality
- ✅ View cached appointments
- ✅ View cached schedules
- ✅ View cached patient list
- ✅ Browse app while offline
- ⚠️ Cannot create/update data offline (requires connection)

## 📊 Notification Management

### Get Notification History
```typescript
GET /api/v1/notifications
Query params:
  - limit: number (default: 50)
  - unreadOnly: boolean (default: false)
```

### Mark as Read
```typescript
PATCH /api/v1/notifications/:id/read
```

### Mark All as Read
```typescript
PATCH /api/v1/notifications/read-all
```

### Delete Notification
```typescript
DELETE /api/v1/notifications/:id
```

## 🎨 Customization

### Notification Icons
Replace icons in `src/assets/icons/`:
- `icon-72x72.png` - Badge icon
- `icon-192x192.png` - Notification icon
- `icon-512x512.png` - App icon

### Notification Sound
Add to notification payload:
```typescript
{
  title: 'New Message',
  body: 'You have a new message',
  vibrate: [200, 100, 200], // Vibration pattern
  silent: false // Play default sound
}
```

### Custom Actions
```typescript
{
  title: 'Appointment Request',
  body: 'New appointment request',
  actions: [
    { action: 'accept', title: 'Accept', icon: '/assets/accept.png' },
    { action: 'reject', title: 'Reject', icon: '/assets/reject.png' }
  ]
}
```

Handle actions in service worker:
```typescript
self.addEventListener('notificationclick', (event) => {
  if (event.action === 'accept') {
    // Handle accept action
  }
});
```

## 🔒 Security & Privacy

### Permission Required
- Users must grant notification permission
- Can revoke permission anytime in browser settings
- Subscriptions stored securely in database

### Data Privacy
- Push subscriptions encrypted in transit
- VAPID keys protect against impersonation
- Notifications don't contain sensitive medical data
- Only notification titles and summaries sent

## 📈 Testing

### Test Notifications Locally

1. **Request Permission:**
```typescript
await notificationService.requestPermission();
```

2. **Send Test Notification:**
```typescript
await notificationService.showNotification({
  title: 'Test Notification',
  body: 'This is a test',
  requireInteraction: true
});
```

3. **Test Backend Endpoint:**
```bash
curl -X POST http://localhost:3000/api/v1/notifications/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id-here",
    "notification": {
      "title": "Test",
      "body": "Test notification"
    }
  }'
```

### Test PWA Offline

1. Open DevTools → Application → Service Workers
2. Check "Offline" checkbox
3. Refresh page
4. App should still load from cache

## 🌐 Browser Support

### Push Notifications
- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Firefox (Desktop & Mobile)
- ✅ Safari 16+ (Desktop & Mobile)
- ❌ IE (not supported)

### PWA Features
- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Firefox (Desktop & Mobile)
- ✅ Safari (iOS 11.3+)
- ✅ Samsung Internet

## 🚀 Production Deployment

### Environment Variables
```env
# Backend
VAPID_PUBLIC_KEY=your_production_public_key
VAPID_PRIVATE_KEY=your_production_private_key

# Frontend
VAPID_PUBLIC_KEY=your_production_public_key
```

### HTTPS Required
- Push notifications require HTTPS
- PWA requires HTTPS (except localhost)
- Use SSL certificate in production

### Update Manifest
Edit `src/manifest.webmanifest`:
```json
{
  "name": "ChifaaCare",
  "short_name": "ChifaaCare",
  "theme_color": "#3498db",
  "background_color": "#ffffff",
  "display": "standalone",
  "scope": "/",
  "start_url": "/",
  "icons": [...]
}
```

## 📱 Future: React Native Migration

For native mobile apps, consider:

### React Native Setup
```bash
npx react-native init ChifaaCareMobile
cd ChifaaCareMobile
npm install @react-native-firebase/messaging
```

### Push Notifications (FCM)
```typescript
import messaging from '@react-native-firebase/messaging';

// Request permission
await messaging().requestPermission();

// Get FCM token
const token = await messaging().getToken();

// Listen for notifications
messaging().onMessage(async remoteMessage => {
  console.log('Notification received:', remoteMessage);
});
```

## 📞 Support

### Common Issues

**Notifications not working:**
- Check browser permission settings
- Verify VAPID keys match
- Check HTTPS is enabled
- Verify service worker registered

**PWA not installing:**
- Ensure HTTPS enabled
- Check manifest.webmanifest is valid
- Verify service worker registered
- Check browser console for errors

**Offline mode not working:**
- Clear browser cache
- Unregister service worker
- Re-register service worker
- Check ngsw-config.json

---

**Last Updated:** October 2025  
**PWA Version:** 1.0.0  
**Notification API:** Web Push API  
**Service Worker:** Angular Service Worker (ngsw)
