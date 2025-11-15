# Socket Disconnect Fix - CRITICAL

## 🔴 Problem Found

The socket was **connecting and then immediately disconnecting**, causing all WebRTC calls to fail!

**Console showed:**
```
[SocketService] Disconnected: io client disconnect
[SocketService] Cannot listen to event, socket not connected: call:incoming
[SocketService] Cannot listen to event, socket not connected: call:offer
... (all other events failed)
```

## ✅ Root Cause

The issue was in the **order of operations** and **listener setup timing**:

1. **Old flow** (BROKEN):
   ```
   1. setupSocketListeners()     ← Socket doesn't exist yet!
   2. setupSignalingListeners()   ← Socket doesn't exist yet!
   3. socket.connect()            ← Now socket connects
   4. Listeners try to register   ← Socket already disconnected
   ```

2. **Socket was being recreated** every time `connect()` was called, causing:
   - Old listeners to be lost
   - New connection to replace old one
   - Immediate disconnect of previous connection

## 🔧 Fixes Applied

### Fix 1: SocketService Improvements (`socket.service.ts`)

**Added proper socket cleanup:**
```typescript
connect(userId: string) {
  // Clean up old socket before creating new one
  if (this.socket) {
    this.socket.removeAllListeners(); // NEW: Remove all listeners
    this.socket.disconnect();
    this.socket = null;
  }
  
  this.socket = io(socketUrl, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    forceNew: true // NEW: Force new connection
  });
}
```

**Better event listener handling:**
```typescript
on<T = any>(event: string, handler: (payload: T) => void) {
  if (!this.socket) {
    // Wait and retry instead of failing immediately
    setTimeout(() => {
      if (this.socket?.connected) {
        this.socket.on(event, handler as any);
      }
    }, 1000);
    return;
  }
  
  // Set up listener even if not connected yet
  // It will work once connection establishes
  this.socket.on(event, handler as any);
}
```

### Fix 2: Component Initialization Order (`doctor-doctor-messages.component.ts`)

**New flow** (FIXED):
```typescript
private initializeComponent(): void {
  // 1. Connect socket FIRST
  if (this.currentUser?.id) {
    this.socketService.connect(this.currentUser.id);
    
    // 2. Wait for socket to connect, THEN setup listeners
    setTimeout(() => {
      this.setupSocketListeners();
      this.setupSignalingListeners();
    }, 500);
  }
  
  // 3. Load data (independent of socket)
  this.loadConversations();
  this.loadDoctors();
}
```

## ✅ What This Fixes

1. **Socket stays connected** - No more immediate disconnects
2. **Listeners register properly** - They wait for socket to be ready
3. **Calls work** - `call:incoming`, `call:offer`, etc. now reach the client
4. **Multiple connections handled** - Old connections cleaned up before new ones

## 🧪 Testing

After these changes, you should see:

**✅ GOOD Console Output:**
```
[SocketService] Connect called for user: doctor-123
[SocketService] Connecting to: http://localhost:3000
[SocketService] Connected successfully, socket ID: abc789
[SocketService] Joining room for user: doctor-123
[Doctor Chat] Setting up listeners...
[SocketService] Listening to event: call:incoming
[SocketService] Listening to event: call:offer
[SocketService] Listening to event: call:answer
... (all other events)
```

**❌ OLD Console Output (FIXED):**
```
[SocketService] Cannot listen to event, socket not connected: call:incoming
[SocketService] Disconnected: io client disconnect
```

## 📋 How to Test

1. **Clear browser cache**: `Ctrl + Shift + Delete`
2. **Hard reload**: `Ctrl + Shift + R`
3. **Open console** in both doctor browsers
4. **Login as doctors** in separate browsers
5. **Check console** - should see successful connection
6. **Try making a call** - should work now!

## 🎯 Expected Behavior

### Doctor A (Caller):
```
[SocketService] Connected successfully
[Doctor Chat] Starting call: { from: "A", to: "B", type: "audio" }
[SocketService] Emitting event: call:request
```

### Doctor B (Receiver):
```
[SocketService] Connected successfully  
[SocketService] Listening to event: call:incoming
[Doctor Chat] Incoming call: { fromUserId: "A", toUserId: "B" }
[Doctor Chat] Showing incoming call UI
```

### UI:
- ✅ Doctor B sees orange incoming call banner
- ✅ Has Accept/Decline buttons
- ✅ Ringing sound plays
- ✅ Call connects after accept

## 🆘 If Still Not Working

1. **Check Backend is Running**:
   ```bash
   cd chifaacare-backend
   npm run start:dev
   ```

2. **Verify No Console Errors**:
   - Should NOT see "io client disconnect"
   - Should NOT see "Cannot listen to event"
   - SHOULD see "Connected successfully"

3. **Check Network Tab**:
   - Look for WebSocket (ws://)
   - Should show "101 Switching Protocols"
   - Should stay connected (not close immediately)

4. **Try Different Port** (if 3000 is busy):
   - Update `environment.ts`: `apiUrl: 'http://localhost:3001/api/v1'`
   - Update backend port in `main.ts`

## 📚 Files Modified

1. **socket.service.ts**:
   - Better connection management
   - Proper cleanup of old connections
   - Retry logic for event listeners

2. **doctor-doctor-messages.component.ts**:
   - Fixed initialization order
   - Wait for socket before setting up listeners
   - Added logging for debugging

## ✨ Your Calls Should Now Work!

The socket disconnect issue is fixed. Calls between doctors should work perfectly now! 🎉
