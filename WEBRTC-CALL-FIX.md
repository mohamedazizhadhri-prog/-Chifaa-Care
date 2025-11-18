# WebRTC Call Functionality - Troubleshooting & Fix

## Problem
The call functionality in both Doctor and Patient dashboards stopped working. Users can click "Request Call" but nothing happens.

## Root Causes

### 1. **Socket Connection Issue**
The components use `SocketService` which wraps Socket.IO, but there might be a disconnection or the socket isn't properly joining the user room.

### 2. **Missing Room Join**
For WebRTC signaling to work, users must join their personal room (`user:{userId}`) on the socket server. If this join doesn't happen, they won't receive incoming call events.

### 3. **Event Name Mismatch**
The frontend emits `call:request` but the backend might not be listening for it, or vice versa.

##  Current Flow (How It Should Work)

### Caller Side:
1. User clicks "Request Call" (audio/video)
2. Frontend emits: `call:request` → `{ fromUserId, toUserId, media }`
3. Shows "Ringing..." UI
4. Waits for `call:accepted` event
5. When accepted, creates peer connection and sends `call:offer`
6. Establishes WebRTC connection

### Callee Side:
1. Receives: `call:incoming` → Shows incoming call banner
2. User clicks "Accept"
3. Emits: `call:accept`
4. Waits for `call:offer`
5. Responds with `call:answer`
6. Establishes WebRTC connection

## Diagnostic Steps

### Step 1: Check Socket Connection

Add this to browser console:
```javascript
// In browser console, check if socket is connected
window.socketDebug = true;
```

### Step 2: Check if User Joined Room

The socket service should emit 'join' with userId. Check in the component's ngOnInit:

```typescript
// This should be called in both components
this.socketService.connect(user.id);
```

### Step 3: Test Socket Events

In browser console:
```javascript
// Listen for any socket event
io.on('*', (event, data) => {
  console.log('[Socket Event]', event, data);
});
```

## The Fix

### Problem Identified:
Looking at the code, I can see that both components emit `call:request` but the socket service might not be properly initialized or connected.

### Solution:

#### Fix 1: Ensure Socket Joins User Room

Make sure the socket service properly joins the user room. Check your `SocketService`:

```typescript
// src/app/services/socket.service.ts
connect(userId: string): void {
  if (!this.socket || !this.socket.connected) {
    this.socket = io(this.SOCKET_URL, {
      transports: ['websocket', 'polling']
    });
  }
  
  // CRITICAL: Join user room
  this.socket.emit('join', userId);
  console.log('[Socket] Joined room for user:', userId);
}
```

#### Fix 2: Add Debug Logging

Add logging to track call events:

**In Doctor Component (`doctor-doctor-messages.component.ts`):**

```typescript
async startCall(type: 'audio' | 'video'): Promise<void> {
  this.showCallMenu = false;
  if (!this.currentUser?.id || !this.selectedChatId) {
    console.error('[Call] Missing user ID or selected chat');
    return;
  }
  
  this.mediaType = type;
  
  console.log('[Call] Initiating call:', {
    from: this.currentUser.id,
    to: this.selectedChatId,
    type: type
  });
  
  // Send call request
  this.socketService.emit('call:request', { 
    fromUserId: this.currentUser.id, 
    toUserId: this.selectedChatId, 
    media: type 
  });
  
  this.dialing = true;
  this.startRinging(true);
  
  console.log('[Call] Waiting for response...');
}
```

**In Patient Component (`messages.component.ts`):**

```typescript
async startCall(type: 'audio' | 'video') {
  this.showCallMenu = false;
  if (!this.currentPatientId || !this.selectedOtherUserId) {
    console.error('[Call] Missing patient ID or doctor ID');
    return;
  }
  
  this.mediaType = type;
  
  console.log('[Call] Patient initiating call:', {
    from: this.currentPatientId,
    to: this.selectedOtherUserId,
    type: type
  });
  
  // Send call request
  this.socket.emit('call:request', { 
    fromUserId: this.currentPatientId, 
    toUserId: this.selectedOtherUserId, 
    media: type 
  });
  
  this.startRinging(true);
  this.dialing = true;
  
  console.log('[Call] Waiting for response...');
}
```

#### Fix 3: Add Event Listeners Debugging

Add logging to socket listeners to see if events are being received:

```typescript
private setupSignalingListeners(): void {
  console.log('[Call] Setting up signaling listeners for user:', this.currentUser?.id);
  
  this.socketService.on('call:incoming', async (p: any) => {
    console.log('[Call] Incoming call received:', p);
    // ... rest of handler
  });
  
  this.socketService.on('call:accepted', async (p: any) => {
    console.log('[Call] Call accepted:', p);
    // ... rest of handler
  });
  
  this.socketService.on('call:declined', (p: any) => {
    console.log('[Call] Call declined:', p);
    // ... rest of handler
  });
  
  // ... other listeners with logging
}
```

#### Fix 4: Verify Backend Socket Events

Check that backend (`socket.ts`) is properly handling events:

```typescript
// In socket.ts - add logging
socket.on('call:request', (payload: { fromUserId: string; toUserId: string; media: 'audio' | 'video' }) => {
  console.log('[Backend] Call request received:', payload);
  
  try {
    if (!payload?.fromUserId || !payload?.toUserId) {
      console.error('[Backend] Invalid call request payload');
      return;
    }
    
    console.log(`[Backend] Emitting call:incoming to user:${payload.toUserId}`);
    io?.to(`user:${payload.toUserId}`).emit('call:incoming', payload);
    console.log('[Backend] call:incoming emitted successfully');
  } catch (e) {
    console.error('[Backend] Error handling call request:', e);
  }
});
```

## Testing Checklist

### 1. Test Socket Connection
- [ ] Open browser console
- [ ] Navigate to messages page
- [ ] Look for `[Socket] Joined room for user: <userId>` log
- [ ] Check if `socket.connected` is true

### 2. Test Call Request
- [ ] Click "Request Call"
- [ ] Look for `[Call] Initiating call:` log with correct user IDs
- [ ] Check if backend receives the request
- [ ] Look for `[Backend] Call request received:` log

### 3. Test Call Reception
- [ ] Have another user call you
- [ ] Look for `[Call] Incoming call received:` log
- [ ] Check if incoming call banner appears
- [ ] Try accepting the call

### 4. Test WebRTC Connection
- [ ] After accepting call
- [ ] Look for `[Call] Call accepted:` log
- [ ] Check for ICE candidate logs
- [ ] Verify video/audio streams appear

## Common Issues & Solutions

### Issue 1: "Call request not reaching recipient"
**Cause:** User didn't join their socket room  
**Fix:** Ensure `socket.emit('join', userId)` is called

### Issue 2: "Call accepted but no video/audio"
**Cause:** WebRTC peer connection failed or ICE candidates not exchanged  
**Fix:** Check browser console for WebRTC errors, verify STUN servers are accessible

### Issue 3: "Events not being received"
**Cause:** Socket disconnected or wrong event names  
**Fix:** Check socket connection status, verify event names match between frontend and backend

### Issue 4: "Permission denied for camera/microphone"
**Cause:** Browser blocked media access  
**Fix:** Check browser permissions, ensure HTTPS (or localhost)

## Quick Test Script

Run this in browser console while on messages page:

```javascript
// Test if socket is connected and can emit events
const socket = window.io || (window as any).socket;
if (socket && socket.connected) {
  console.log('✓ Socket connected');
  
  // Test emitting an event
  socket.emit('call:request', {
    fromUserId: 'test-user-1',
    toUserId: 'test-user-2',
    media: 'audio'
  });
  
  console.log('✓ Test call request sent');
} else {
  console.error('✗ Socket not connected!');
}
```

## File Locations

- **Doctor-Doctor Messages:** `src/app/portals/doctor/doctor-messages/doctor-doctor-messages.component.ts`
- **Patient Messages:** `src/app/portals/patient/messages/messages.component.ts`
- **Socket Service:** `src/app/services/socket.service.ts`
- **Backend Socket:** `chifaacare-backend/src/socket.ts`

## Expected Console Output (Working System)

```
[Socket] Connecting to socket server...
[Socket] Connected successfully
[Socket] Joined room for user: abc-123-def
[Call] Setting up signaling listeners for user: abc-123-def
[Call] Initiating call: { from: 'abc-123', to: 'def-456', type: 'audio' }
[Call] Waiting for response...
[Backend] Call request received: { fromUserId: 'abc-123', toUserId: 'def-456', media: 'audio' }
[Backend] Emitting call:incoming to user:def-456
[Call] Incoming call received: { fromUserId: 'abc-123', toUserId: 'def-456', media: 'audio' }
[Call] Call accepted: { fromUserId: 'def-456', toUserId: 'abc-123' }
[Call] Creating peer connection...
[Call] ICE candidate generated
[Call] Remote stream received
```

## Next Steps

1. Add the debug logging as shown above
2. Test call functionality
3. Check browser console for logs
4. If calls still don't work, share the console logs
5. Check backend logs to see if events are being received

The most likely issue is that the socket isn't properly joining the user room, or the socket service isn't properly initialized. The debug logging will help identify exactly where the flow breaks.
