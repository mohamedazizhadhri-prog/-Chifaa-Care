# Quick Fix Reference - Messages & Calls

## What Was Fixed

1. ✅ **Duplicate Messages** - Messages no longer appear twice
2. ✅ **Conversations Not Loading** - Now shows all patient conversations with debug mode
3. ✅ **Auto-Select** - First conversation auto-selected on page load
4. ✅ **WebRTC Calls** - Complete socket service rewrite with logging

## Quick Test Commands

### Test Socket Connection (Browser Console)
```javascript
// Should see socket ID and connection status
console.log('Socket connected:', window.socket?.connected);
```

### Test Message Send
1. Navigate to `/doctor/messages`
2. Send a message
3. Check console for: `[Doctor Messages] Ignoring own message from socket`
4. Message should appear only once

### Test Calls
1. Open two browsers
2. Click "Request Call"
3. Check console for: `[SocketService] Emitting event: call:request`
4. Other browser should show incoming call

## Console Log Cheat Sheet

| Log Message | Meaning | Status |
|------------|---------|--------|
| `[SocketService] Connected successfully` | Socket connected | ✅ Good |
| `[SocketService] Connection error` | Socket failed | ❌ Bad |
| `[Doctor Messages] Auto-selecting first chat` | Chat auto-selected | ✅ Good |
| `[Doctor Messages] No patient conversations found` | No chats | ⚠️ Check DB |
| `[Call] Initiating call` | Call started | ✅ Good |
| `[Call] Incoming call received` | Receiving call | ✅ Good |
| `Cannot emit event, socket not connected` | Socket issue | ❌ Bad |

## Files Changed

```
src/app/services/socket.service.ts         (COMPLETE REWRITE)
src/app/portals/doctor/messages/           (FIXED)
  doctor-messages.component.ts
```

## If Something's Not Working

### Messages Not Showing
1. Open console
2. Look for: `[Doctor Messages] Total conversations loaded: X`
3. If X = 0, check database has messages
4. If X > 0, check role filtering logs

### Calls Not Working  
1. Check: `[SocketService] Connected successfully` (must see this)
2. Check: `[SocketService] Joining room for user:` (must see this)
3. Click call button
4. Check: `[SocketService] Emitting event: call:request` (must see this)
5. If not seeing these, backend might be down

### Duplicate Messages
1. Should be auto-fixed with 2-second deduplication
2. Check for: `[Doctor Messages] Ignoring own message from socket`
3. If still duplicating, something's wrong with the timer

## Emergency Rollback

If new code causes issues, revert socket.service.ts:

```typescript
// Old simple version (no logging)
connect(userId: string) {
  if (this.socket) return;
  this.socket = io(environment.apiUrl.replace('/api/v1', ''), {
    transports: ['websocket'],
  });
  this.socket.on('connect', () => {
    this.socket?.emit('join', userId);
  });
}
```

## Production Deployment

1. Test everything works in dev
2. Reduce logging (keep errors only)
3. Deploy backend first
4. Deploy frontend
5. Monitor logs for first 24 hours

## Support Checklist

When reporting issues, include:

- [ ] Browser console logs (last 50 lines)
- [ ] Backend server logs (if accessible)
- [ ] What you clicked/did before the issue
- [ ] Browser name and version
- [ ] Whether it works in incognito mode

## Success Indicators

✅ Messages send instantly without duplicates  
✅ Conversations load on page open  
✅ First conversation auto-selected  
✅ Call buttons show "Ringing..." state  
✅ Incoming calls show accept/decline buttons  
✅ Video/audio appear after accepting call  
✅ Console shows clean logs with no errors  

---

**Quick Reference Version 1.0** - Last Updated: 2025-11-14
