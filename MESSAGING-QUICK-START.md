# 🚀 Quick Start - Messaging System Installation

## Step 1: Install Dependencies

```bash
npm install socket.io-client
```

## Step 2: Update Environment

Edit `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1',
  socketUrl: 'http://localhost:3000'  // ← ADD THIS
};
```

## Step 3: Done!

The messaging system is now ready to use! 🎉

## Step 4: Add to Doctor Dashboard

Add this route to your doctor routing:

```typescript
{
  path: 'messages',
  component: DoctorMessagesComponent
}
```

## Step 5: Add Menu Link

In your doctor dashboard, add a link:

```html
<a routerLink="/doctor/messages">
  <i class="fas fa-comments"></i>
  Messages
  <span class="badge" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
</a>
```

## Testing Without Backend

The system will work offline with mock data. Real-time features require backend Socket.IO server.

## Next Steps

1. ✅ Install socket.io-client (Done above)
2. ✅ Update environment (Done above)
3. ⏳ Set up backend Socket.IO server (See BACKEND-SOCKET-EXAMPLE.md)
4. ⏳ Test messaging features
5. ⏳ Test voice/video calls

---

## Optional: Add Notification Sounds

1. Create folder: `src/assets/sounds/`
2. Add MP3 files:
   - `notification.mp3` - For new messages
   - `ringtone.mp3` - For incoming calls

If files don't exist, the system will work without sounds.

---

## Quick Test

1. Run your app: `ng serve`
2. Navigate to `/doctor/messages`
3. You should see the messages interface!

**Status: ✅ Frontend Complete!**

For backend setup, see: `BACKEND-SOCKET-EXAMPLE.md`
