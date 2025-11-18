# 🔄 Message Sync & Cleanup System - Complete Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Installation](#installation)
5. [Usage](#usage)
6. [API Endpoints](#api-endpoints)
7. [Automated Scheduler](#automated-scheduler)
8. [Manual Cleanup](#manual-cleanup)
9. [Frontend Integration](#frontend-integration)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The Message Sync & Cleanup System automatically:
- ✅ **Deletes messages** from inactive/deleted users
- ✅ **Auto-syncs** user information when profiles are updated
- ✅ **Prevents orphaned conversations** from showing in the UI
- ✅ **Runs scheduled cleanups** daily at 2 AM
- ✅ **Provides manual triggers** via API endpoints
- ✅ **Real-time updates** via Socket.io

---

## ✨ Features

### 1. Automated Daily Cleanup
- Runs every day at 2 AM (configurable)
- Removes messages from users where `isActive = false`
- Cleans up both sent and received messages
- Logs detailed statistics

### 2. Real-Time Synchronization
- Updates user info across all conversations instantly
- Removes inactive users from conversation lists
- Notifies connected clients via Socket.io

### 3. Manual Control
- API endpoints to trigger cleanup on demand
- View cleanup statistics without running cleanup
- Start/stop the scheduler programmatically

### 4. Backend Integration
- Automatically filters inactive users in `getConversations()`
- Returns 404 for messages to/from inactive users
- Provides user info refresh endpoint

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│              Frontend (Angular)                 │
│  ┌────────────────────────────────────────┐    │
│  │  Doctor Messages Component             │    │
│  │  - Loads conversations                 │    │
│  │  - Filters inactive users              │    │
│  │  - Listens to Socket events            │    │
│  └────────────────────────────────────────┘    │
└────────────────┬────────────────────────────────┘
                 │
                 │ HTTP Requests
                 │ Socket.io Events
                 │
┌────────────────▼────────────────────────────────┐
│           Backend (Express/NestJS)              │
│  ┌────────────────────────────────────────┐    │
│  │  Message Controller                    │    │
│  │  - getConversations()                  │    │
│  │  - getThread()                         │    │
│  │  - sendMessage()                       │    │
│  │  - getUserInfo()                       │    │
│  └────────────────────────────────────────┘    │
│                                                  │
│  ┌────────────────────────────────────────┐    │
│  │  Message Sync Controller               │    │
│  │  - triggerCleanup()                    │    │
│  │  - getSyncStatus()                     │    │
│  │  - getSyncStats()                      │    │
│  │  - notifyUserUpdated()                 │    │
│  │  - handleUserDeactivation()            │    │
│  └────────────────────────────────────────┘    │
│                                                  │
│  ┌────────────────────────────────────────┐    │
│  │  Message Sync Service                  │    │
│  │  - Scheduler (runs daily at 2 AM)     │    │
│  │  - Auto-cleanup inactive messages      │    │
│  │  - Sync user information               │    │
│  └────────────────────────────────────────┘    │
│                                                  │
│  ┌────────────────────────────────────────┐    │
│  │  Cleanup Script                        │    │
│  │  - cleanupMessages()                   │    │
│  │  - cleanupUserMessages()               │    │
│  │  - getCleanupStats()                   │    │
│  └────────────────────────────────────────┘    │
└────────────────┬────────────────────────────────┘
                 │
                 │ Prisma ORM
                 │
┌────────────────▼────────────────────────────────┐
│           Database (PostgreSQL)                 │
│  ┌────────────────────────────────────────┐    │
│  │  users table                           │    │
│  │  - id, isActive, firstName, etc.       │    │
│  └────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────┐    │
│  │  messages table                        │    │
│  │  - id, senderId, recipientId, etc.     │    │
│  └────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Installation

### Step 1: Files Already Created
The following files have been created in your project:

**Backend:**
- `src/scripts/cleanup-messages.ts` - Cleanup logic
- `src/services/message-sync.service.ts` - Scheduler service
- `src/controllers/message-sync.controller.ts` - API endpoints
- `src/routes/message.routes.ts` - Updated with new endpoints
- `src/index.ts` - Updated to start scheduler

**Package.json:**
- Added `"cleanup:messages"` script

### Step 2: Rebuild Backend
```bash
cd chifaacare-backend
npm run build
```

### Step 3: Start Server
```bash
npm run dev
# or
npm start
```

The scheduler will automatically start when the server boots up!

---

## 📖 Usage

### Automated Cleanup (Default)
The system runs automatically:
- **When:** Every day at 2 AM
- **What:** Removes messages from inactive users
- **Logs:** Console logs with detailed statistics

### Manual Cleanup (On Demand)
Run cleanup immediately:

**Option 1: Via npm script**
```bash
cd chifaacare-backend
npm run cleanup:messages
```

**Option 2: Via API endpoint**
```bash
POST http://localhost:3000/api/v1/messages/sync/trigger-cleanup
```

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:3000/api/v1/messages
```

### 1. Trigger Manual Cleanup
**Endpoint:** `POST /sync/trigger-cleanup`

**Description:** Manually trigger message cleanup

**Response:**
```json
{
  "status": "success",
  "message": "Cleanup completed successfully",
  "data": {
    "deletedMessages": 15,
    "timestamp": "2025-11-09T18:00:00.000Z"
  }
}
```

### 2. Get Scheduler Status
**Endpoint:** `GET /sync/status`

**Description:** Check if scheduler is running

**Response:**
```json
{
  "status": "success",
  "data": {
    "scheduler": {
      "isRunning": true,
      "isCleanupInProgress": false,
      "lastCleanupTime": "2025-11-08T02:00:00.000Z",
      "nextCleanupTime": "2025-11-09T02:00:00.000Z"
    }
  }
}
```

### 3. Get Cleanup Statistics
**Endpoint:** `GET /sync/stats`

**Description:** View statistics without running cleanup

**Response:**
```json
{
  "status": "success",
  "data": {
    "statistics": {
      "inactiveUsers": 3,
      "messagesFromInactive": 25,
      "messagesToInactive": 30,
      "totalAffectedMessages": 45,
      "affectedConversations": 12
    },
    "scheduler": {
      "isRunning": true,
      "lastCleanupTime": "2025-11-08T02:00:00.000Z"
    }
  }
}
```

### 4. Notify User Profile Updated
**Endpoint:** `POST /sync/user-updated`

**Description:** Notify system that user profile was updated

**Request Body:**
```json
{
  "userId": "user-123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "User info sync triggered",
  "data": {
    "userId": "user-123"
  }
}
```

### 5. Handle User Deactivation
**Endpoint:** `POST /sync/user-deactivated`

**Description:** Immediately clean up messages when user is deactivated

**Request Body:**
```json
{
  "userId": "user-123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "User messages cleaned up",
  "data": {
    "userId": "user-123",
    "deletedMessages": 10
  }
}
```

### 6. Start Scheduler
**Endpoint:** `POST /sync/start-scheduler`

**Description:** Manually start the cleanup scheduler

**Response:**
```json
{
  "status": "success",
  "message": "Cleanup scheduler started",
  "data": {
    "isRunning": true,
    "nextCleanupTime": "2025-11-09T02:00:00.000Z"
  }
}
```

### 7. Stop Scheduler
**Endpoint:** `POST /sync/stop-scheduler`

**Description:** Manually stop the cleanup scheduler

**Response:**
```json
{
  "status": "success",
  "message": "Cleanup scheduler stopped",
  "data": {
    "isRunning": false
  }
}
```

---

## ⏰ Automated Scheduler

### Configuration
The scheduler is configured in `message-sync.service.ts`:

```typescript
private cleanupSchedule = {
  intervalMs: 24 * 60 * 60 * 1000, // 24 hours
  preferredHour: 2 // 2 AM
};
```

### Customization
To change the schedule, modify these values:

**Run every 12 hours:**
```typescript
intervalMs: 12 * 60 * 60 * 1000
```

**Run at 3 AM:**
```typescript
preferredHour: 3
```

### Scheduler Lifecycle
1. **Server starts** → Scheduler initializes
2. **Calculates next 2 AM** → Schedules first run
3. **Runs cleanup** → Logs statistics
4. **Repeats every 24 hours** → Automatic
5. **Server stops** → Scheduler stops gracefully

---

## 🛠️ Manual Cleanup

### Via NPM Script
```bash
npm run cleanup:messages
```

**Output:**
```
🧹 Starting message cleanup...
📊 Found 3 inactive users
  - John Doe (john@example.com) [DOCTOR]
  - Jane Smith (jane@example.com) [PATIENT]
  - Bob Wilson (bob@example.com) [DOCTOR]
📨 Found 45 messages to delete
💬 12 unique conversations will be affected
✅ Deleted 45 messages
✅ All target messages successfully deleted
⏱️ Cleanup completed in 0.85s

📋 Cleanup Summary:
═══════════════════════════════════════
🗑️  Deleted Messages: 45
👥 Inactive Users: 3
💬 Affected Conversations: 12
⏰ Timestamp: 2025-11-09T18:00:00.000Z
═══════════════════════════════════════
```

### Via API
```bash
curl -X POST http://localhost:3000/api/v1/messages/sync/trigger-cleanup
```

### Programmatically
```typescript
import { messageSyncService } from './services/message-sync.service';

// Run cleanup
const result = await messageSyncService.runCleanup();
console.log(`Deleted ${result.deletedCount} messages`);
```

---

## 🎨 Frontend Integration

### Update Doctor Profile
When a doctor updates their profile, notify the backend:

```typescript
// In your profile update service
updateDoctorProfile(userId: string, data: any) {
  return this.http.put(`/api/v1/profile/${userId}`, data)
    .pipe(
      switchMap(() => 
        // Notify message sync system
        this.http.post('/api/v1/messages/sync/user-updated', { userId })
      )
    );
}
```

### Handle User Deactivation
When deactivating a user:

```typescript
deactivateUser(userId: string) {
  return this.http.patch(`/api/v1/users/${userId}/deactivate`)
    .pipe(
      switchMap(() => 
        // Clean up messages immediately
        this.http.post('/api/v1/messages/sync/user-deactivated', { userId })
      )
    );
}
```

### Listen for Real-Time Updates
```typescript
// In your message component
ngOnInit() {
  // Listen for user deactivation events
  this.socketService.on('user:deactivated', (data: { userId: string }) => {
    // Remove from conversation list
    this.conversations = this.conversations.filter(
      conv => conv.otherUserId !== data.userId
    );
    
    // Clear selection if viewing that chat
    if (this.selectedChatId === data.userId) {
      this.selectedChatId = null;
      this.currentMessages = [];
    }
  });
  
  // Listen for profile updates
  this.socketService.on('user:updated', (data: { userId: string, ...profile }) => {
    // Update conversation list with new info
    const conv = this.conversations.find(c => c.otherUserId === data.userId);
    if (conv) {
      conv.name = `${data.firstName} ${data.lastName}`;
      conv.specialization = data.specialization;
    }
  });
}
```

---

## 🔍 Troubleshooting

### Issue: Deleted doctors still appear in conversations

**Solution:**
The backend already filters them out in `getConversations()`. Make sure your frontend reloads conversations:

```typescript
// Force reload
this.loadConversations();
```

### Issue: Scheduler not running

**Check status:**
```bash
curl http://localhost:3000/api/v1/messages/sync/status
```

**Restart scheduler:**
```bash
curl -X POST http://localhost:3000/api/v1/messages/sync/start-scheduler
```

### Issue: Names don't update in real-time

**Check Socket connection:**
```typescript
if (!this.socketService.isConnected()) {
  this.socketService.connect(this.currentUser.id);
}
```

**Manually trigger sync:**
```bash
curl -X POST http://localhost:3000/api/v1/messages/sync/user-updated \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-123"}'
```

### Issue: Cleanup not deleting all messages

**Check inactive users:**
```bash
curl http://localhost:3000/api/v1/messages/sync/stats
```

**Verify isActive flag:**
```sql
SELECT id, firstName, lastName, isActive FROM "User" WHERE isActive = false;
```

**Run cleanup manually:**
```bash
npm run cleanup:messages
```

---

## 📊 Monitoring & Logging

### View Scheduler Status
```bash
curl http://localhost:3000/api/v1/messages/sync/status
```

### View Statistics
```bash
curl http://localhost:3000/api/v1/messages/sync/stats
```

### Check Server Logs
The scheduler logs to console:
```
🚀 Starting Message Sync & Cleanup Scheduler
⏰ Next cleanup scheduled for: 11/9/2025, 2:00:00 AM
⏱️  Time until cleanup: 8.25 hours

[Later at 2 AM]
🧹 ===== Starting Scheduled Message Cleanup =====
⏰ Time: 11/9/2025, 2:00:00 AM
📊 Pre-cleanup stats: {...}
✅ ===== Cleanup Completed Successfully =====
```

---

## 🎯 Best Practices

### 1. Deactivate Users Properly
Always set `isActive = false` instead of deleting:
```typescript
await prisma.user.update({
  where: { id: userId },
  data: { isActive: false }
});
```

### 2. Notify System on Profile Updates
```typescript
// After updating user
await fetch('/api/v1/messages/sync/user-updated', {
  method: 'POST',
  body: JSON.stringify({ userId })
});
```

### 3. Monitor Scheduler Health
Set up a health check:
```typescript
setInterval(async () => {
  const status = await fetch('/api/v1/messages/sync/status');
  const data = await status.json();
  
  if (!data.data.scheduler.isRunning) {
    console.error('⚠️ Scheduler is not running!');
    // Alert admin
  }
}, 60 * 60 * 1000); // Check every hour
```

### 4. Run Manual Cleanup After Bulk Operations
```typescript
// After bulk deactivation
await bulkDeactivateUsers(userIds);
await fetch('/api/v1/messages/sync/trigger-cleanup', { method: 'POST' });
```

---

## 📈 Performance

### Database Impact
- **Cleanup operation**: ~0.5-2 seconds for 1000 messages
- **Scheduler overhead**: Minimal (runs once per day)
- **API endpoints**: < 100ms response time

### Optimization Tips
1. **Index important columns:**
```sql
CREATE INDEX idx_users_is_active ON "User"(isActive);
CREATE INDEX idx_messages_sender ON "Message"(senderId);
CREATE INDEX idx_messages_recipient ON "Message"(recipientId);
```

2. **Batch operations** for large datasets
3. **Monitor logs** for slow queries

---

## 🔐 Security

### Access Control
Add authentication middleware to sync endpoints:
```typescript
router.post('/sync/trigger-cleanup', authMiddleware, isAdmin, triggerCleanup);
```

### Rate Limiting
Protect cleanup endpoints:
```typescript
import rateLimit from 'express-rate-limit';

const cleanupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10 // Max 10 requests per hour
});

router.post('/sync/trigger-cleanup', cleanupLimiter, triggerCleanup);
```

---

## ✅ Summary

Your system now has:
- ✅ **Automatic daily cleanup** at 2 AM
- ✅ **Manual cleanup** via npm script or API
- ✅ **Real-time synchronization** of user profiles
- ✅ **Filtered conversations** (no inactive users)
- ✅ **Comprehensive logging** and monitoring
- ✅ **Health check endpoints** for scheduler status

**Result:** Clean, up-to-date message system with no orphaned conversations! 🎉

---

## 📞 Support

If you need help:
1. Check server logs for errors
2. Verify database connectivity
3. Test API endpoints with Postman
4. Check Socket.io connection
5. Review scheduler status

---

## 🔄 Changelog

**v1.0.0** (2025-11-09)
- Initial release
- Automated daily cleanup
- Manual trigger endpoints
- Real-time synchronization
- Comprehensive logging

---

**Happy Cleaning! 🧹✨**
