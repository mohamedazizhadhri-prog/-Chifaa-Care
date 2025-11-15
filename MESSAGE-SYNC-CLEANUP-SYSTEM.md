# Message Sync & Cleanup System

## Overview
This system automatically syncs doctor/patient information in messages and removes conversations with deleted or inactive users.

## Features

### 1. **Automatic Cleanup on Load**
- When the messaging component initializes, it automatically cleans up messages from inactive users
- Removes conversation threads with deleted or deactivated doctors/patients
- Updates user information (names, specializations) from the database

### 2. **Manual Refresh Button**
- Located in the message sidebar header (sync icon)
- Click to manually trigger cleanup and refresh
- Shows spinner animation while processing
- Displays success notification with count of removed messages

### 3. **Auto-Update User Information**
- The `getConversations` endpoint now returns fresh user data including:
  - Updated first and last names
  - Current specialization
  - Profile images
  - Active status
- Backend automatically filters out inactive users (isActive: false)

### 4. **Real-time Filtering**
- Only shows conversations with active users
- Automatically removes chats when doctors/patients are deactivated
- Clears selected chat if the user is deleted

## Backend Endpoints

### GET `/api/v1/messages/conversations/:userId`
Returns all conversations for a user, automatically filtering inactive users and including fresh user data.

**Response:**
```json
{
  "status": "success",
  "results": 5,
  "data": {
    "conversations": [
      {
        "otherUserId": "uuid",
        "name": "Dr. John Smith",
        "role": "DOCTOR",
        "email": "doctor@example.com",
        "specialization": "Cardiology",
        "profileImage": "url",
        "lastMessage": "Hello",
        "lastMessageTime": "2025-11-09T...",
        "unreadCount": 2
      }
    ]
  }
}
```

### DELETE `/api/v1/messages/cleanup-inactive/:userId`
Removes all message threads involving inactive users.

**Response:**
```json
{
  "status": "success",
  "data": {
    "deleted": 25,
    "inactiveUserCount": 3,
    "message": "Cleaned up 25 messages from 3 inactive users"
  }
}
```

### GET `/api/v1/messages/user-info/:userId`
Gets fresh user information for a specific user.

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Smith",
      "email": "doctor@example.com",
      "role": "DOCTOR",
      "profileImage": "url",
      "specialization": "Cardiology",
      "isActive": true
    }
  }
}
```

## Frontend Implementation

### Message Service Methods

```typescript
// Clean up inactive messages
cleanupInactiveMessages(userId: string): Observable<Response>

// Get fresh user info
getUserInfo(userId: string): Observable<UserInfo>
```

### Component Methods

```typescript
// Manual cleanup trigger
cleanupInactiveConversations(): void

// Manual refresh (cleanup + reload)
refreshConversations(): void
```

## How It Works

### On Component Init:
1. `cleanupInactiveConversations()` is called
2. Backend deletes messages from inactive users
3. `loadConversations()` fetches fresh data
4. Only active users are shown in the conversation list

### During Auto-Refresh (Every 5 seconds):
1. `loadConversations()` fetches latest data
2. Backend filters out inactive users automatically
3. Frontend updates conversation list
4. If selected chat user is inactive, chat is cleared

### On Manual Refresh:
1. User clicks the sync button
2. Cleanup is triggered
3. Success notification shows how many messages were removed
4. Conversations are reloaded with fresh data

### When Loading Doctors List:
1. Only active doctors (isActive: true) are fetched
2. Doctors must have a doctor profile
3. Current user is excluded from the list

## Database Schema

The `User` table includes:
- `isActive: Boolean` - Tracks if user is active/deleted
- When a user is deleted, set `isActive = false` instead of hard deleting
- This allows cleanup system to identify and remove their messages

## UI Components

### Refresh Button
- Shows sync icon when idle
- Shows spinner when processing
- Disabled during cleanup
- Tooltip: "Refresh and cleanup conversations"

### Cleanup Notification
- Green success banner
- Shows count of removed messages
- Auto-dismisses after 5 seconds
- Smooth slide-down animation

## Best Practices

### When Deleting Users:
```typescript
// Instead of hard delete:
await prisma.user.delete({ where: { id } });

// Do soft delete:
await prisma.user.update({ 
  where: { id }, 
  data: { isActive: false } 
});
```

### When Updating User Info:
- Changes to firstName, lastName, or specialization are automatically reflected
- The next conversation load will show updated information
- No manual sync needed

## Error Handling

### If cleanup fails:
- Error message is shown in notification
- Cleanup button is re-enabled
- User can retry

### If doctor is deleted mid-conversation:
- Backend returns 404 error
- Frontend clears the chat
- Conversation list is refreshed
- User is notified

### If conversation endpoint fails:
- Existing conversations remain visible
- Error is logged to console
- Auto-retry happens on next refresh cycle

## Testing

### Test Scenario 1: Delete a Doctor
1. Open messages with Doctor A
2. Admin deletes/deactivates Doctor A
3. Click refresh button
4. Verify Doctor A's conversation is removed
5. Verify success notification appears

### Test Scenario 2: Update Doctor Name
1. Doctor B changes name from "Bob Smith" to "Robert Smith"
2. Wait for auto-refresh (5 seconds) OR click manual refresh
3. Verify conversation shows "Robert Smith"

### Test Scenario 3: Multiple Inactive Users
1. Admin deactivates 3 doctors
2. Doctor has conversations with all 3
3. Click refresh
4. Verify notification shows "Removed X messages from 3 inactive doctor(s)"
5. Verify all 3 conversations are removed

## Performance Considerations

- Auto-refresh intervals:
  - Conversations: 5 seconds
  - Messages: 3 seconds (only when chat is open)
  - Doctors list: 30 seconds
- Cleanup only runs on demand (init + manual refresh)
- Database queries use indexes on `isActive` and `id` fields
- Batch operations used for deleting multiple messages

## Security

- Cleanup endpoint requires userId (can't delete others' messages)
- Only deletes messages where user is sender OR recipient
- Backend validates user exists and is active before operations
- No cascade deletion - messages remain until explicitly cleaned up

## Future Enhancements

1. **Scheduled Cleanup Job**
   - Run nightly cleanup for all users
   - Remove very old messages from inactive users

2. **Archive Instead of Delete**
   - Move inactive conversations to archive
   - Allow recovery within 30 days

3. **Notification on Cleanup**
   - Push notification when messages are auto-cleaned
   - Option to review what was removed

4. **Partial Sync**
   - Only update changed conversations
   - Reduce network traffic

5. **Optimistic Updates**
   - Update UI immediately
   - Sync with backend in background
