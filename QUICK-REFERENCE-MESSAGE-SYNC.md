# ⚡ Message Sync & Cleanup - Quick Reference

## 🚀 Quick Start

```bash
# Run manual cleanup
npm run cleanup:messages

# Start server (scheduler auto-starts)
npm run dev
```

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/sync/trigger-cleanup` | POST | Run cleanup now |
| `/sync/status` | GET | Check scheduler status |
| `/sync/stats` | GET | View statistics |
| `/sync/user-updated` | POST | Notify profile update |
| `/sync/user-deactivated` | POST | Clean user messages |
| `/sync/start-scheduler` | POST | Start scheduler |
| `/sync/stop-scheduler` | POST | Stop scheduler |

## 💻 Common Tasks

### Trigger Manual Cleanup
```bash
curl -X POST http://localhost:3000/api/v1/messages/sync/trigger-cleanup
```

### Check Status
```bash
curl http://localhost:3000/api/v1/messages/sync/status
```

### View Stats
```bash
curl http://localhost:3000/api/v1/messages/sync/stats
```

### Notify User Updated
```bash
curl -X POST http://localhost:3000/api/v1/messages/sync/user-updated \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-123"}'
```

## 🎯 Frontend Integration

### Reload Conversations After Profile Update
```typescript
updateProfile(data: any) {
  return this.http.put('/api/v1/profile', data).pipe(
    tap(() => this.messageService.refreshConversations())
  );
}
```

### Handle User Deactivation
```typescript
deactivateUser(userId: string) {
  return this.http.patch(`/users/${userId}/deactivate`).pipe(
    switchMap(() => 
      this.http.post('/messages/sync/user-deactivated', { userId })
    )
  );
}
```

### Socket.io Events
```typescript
// Listen for user deactivation
this.socket.on('user:deactivated', (data) => {
  this.conversations = this.conversations.filter(
    c => c.otherUserId !== data.userId
  );
});

// Listen for profile updates
this.socket.on('user:updated', (data) => {
  const conv = this.conversations.find(c => c.otherUserId === data.userId);
  if (conv) conv.name = `${data.firstName} ${data.lastName}`;
});
```

## 🔧 Configuration

### Change Cleanup Time
Edit `src/services/message-sync.service.ts`:
```typescript
private cleanupSchedule = {
  intervalMs: 24 * 60 * 60 * 1000, // 24 hours
  preferredHour: 2 // Change to desired hour (0-23)
};
```

### Change Frequency
```typescript
// Run every 12 hours
intervalMs: 12 * 60 * 60 * 1000

// Run every 6 hours
intervalMs: 6 * 60 * 60 * 1000
```

## 🐛 Troubleshooting

### Scheduler Not Running
```bash
# Check status
curl http://localhost:3000/api/v1/messages/sync/status

# Restart scheduler
curl -X POST http://localhost:3000/api/v1/messages/sync/start-scheduler
```

### Messages Not Deleting
```bash
# Check stats
curl http://localhost:3000/api/v1/messages/sync/stats

# Run manual cleanup
npm run cleanup:messages
```

### Names Not Updating
```typescript
// Force reload conversations
this.messageService.loadConversations();

// Or notify backend
this.http.post('/messages/sync/user-updated', { userId }).subscribe();
```

## 📊 Monitoring

### Console Logs
```
🚀 Starting Message Sync & Cleanup Scheduler
⏰ Next cleanup scheduled for: 11/9/2025, 2:00:00 AM
✅ Message sync scheduler started

[At 2 AM]
🧹 ===== Starting Scheduled Message Cleanup =====
📊 Found 3 inactive users
📨 Found 45 messages to delete
✅ Deleted 45 messages
✅ Cleanup Completed Successfully
```

### Database Queries
```sql
-- Check inactive users
SELECT id, firstName, lastName, isActive 
FROM "User" 
WHERE isActive = false;

-- Count orphaned messages
SELECT COUNT(*) 
FROM "Message" m
LEFT JOIN "User" u ON m.senderId = u.id OR m.recipientId = u.id
WHERE u.isActive = false OR u.id IS NULL;
```

## 🎯 Best Practices

1. **Always use `isActive = false`** instead of deleting users
2. **Notify system** when profiles are updated
3. **Monitor scheduler** health regularly
4. **Run manual cleanup** after bulk operations
5. **Index database columns** for performance

## ⚠️ Important Notes

- Scheduler runs automatically when server starts
- Cleanup is non-reversible (no undo)
- Socket.io connection required for real-time updates
- Backend filters inactive users automatically
- Frontend should reload data periodically

## 📝 File Locations

```
chifaacare-backend/
├── src/
│   ├── scripts/
│   │   └── cleanup-messages.ts          # Cleanup logic
│   ├── services/
│   │   └── message-sync.service.ts      # Scheduler
│   ├── controllers/
│   │   ├── message.controller.ts        # Message APIs
│   │   └── message-sync.controller.ts   # Sync APIs
│   └── routes/
│       └── message.routes.ts            # All routes
└── package.json                          # npm scripts
```

## 🔗 Related Documentation

- Full Guide: `MESSAGE-SYNC-COMPLETE-GUIDE.md`
- Auto-Update Guide: `AUTO-UPDATE-MESSAGES-GUIDE.md`
- Message System: `MESSAGE-SYNC-CLEANUP-SYSTEM.md`

---

**Need help?** Check the full guide or server console logs!
