# Doctor-to-Doctor Call Debugging Guide

## 🐛 Problem: Call doesn't appear for the other doctor

When Doctor A calls Doctor B, Doctor B doesn't see the incoming call banner.

## ✅ Step-by-Step Debugging

### Step 1: Open Both Browser Consoles

1. **Browser 1**: Login as Doctor A
2. **Browser 2**: Login as Doctor B  
3. **Both browsers**: Open Developer Tools (F12) → Console tab

### Step 2: Check Socket Connection (Both Browsers)

Look for these logs in the console:

**✅ GOOD - What you should see:**
```
[SocketService] Connect called for user: doctor-a-id-here
[SocketService] Connecting to: http://localhost:3000
[SocketService] Connected successfully, socket ID: XYZ123
[SocketService] Joining room for user: doctor-a-id-here
```

**❌ BAD - If you see:**
```
[SocketService] Connection error: ...
// OR nothing at all
```
**Fix**: Backend not running. Start it:
```bash
cd chifaacare-backend
npm run start:dev
```

### Step 3: Verify User IDs Match

**In Doctor B's console, look for:**
```
[Doctor Chat] Current user ID: actual-doctor-b-id
```

**Write this down!** This is Doctor B's actual user ID.

### Step 4: Doctor A Makes the Call

**Doctor A**: Click "Request Call" → "Voice only"

**In Doctor A's console, you should see:**
```
[Doctor Chat] Starting call: {
  from: "doctor-a-id",
  to: "doctor-b-id",
  type: "audio"
}
[SocketService] Emitting event: call:request { fromUserId: "...", toUserId: "...", media: "audio" }
```

### Step 5: Check Doctor B Receives It

**In Doctor B's console, you should IMMEDIATELY see:**
```
[Doctor Chat] Incoming call: { fromUserId: "doctor-a-id", toUserId: "doctor-b-id", media: "audio" }
[Doctor Chat] Current user ID: doctor-b-id
[Doctor Chat] Showing incoming call UI
```

---

## 🔍 Common Problems & Solutions

### Problem 1: Doctor B sees "Ignoring incoming call - not for this user"

**You'll see:**
```
[Doctor Chat] Incoming call: { fromUserId: "abc", toUserId: "xyz", media: "audio" }
[Doctor Chat] Current user ID: different-id  ← MISMATCH!
[Doctor Chat] Ignoring incoming call - not for this user
```

**Cause**: The `toUserId` in the call request doesn't match Doctor B's actual user ID.

**Fix**:
1. Check what Doctor B's actual ID is: Look for `[Doctor Chat] Current user ID: ...`
2. Make sure Doctor A is selecting the correct doctor from the chat list
3. Verify the conversation shows the correct doctor name

**To verify the conversation ID**:
Add this temporary log in doctor-doctor-messages.component.ts, in the `selectChat` method:
```typescript
selectChat(chatId: string): void {
  console.log('SELECTED CHAT ID:', chatId);  // Add this line
  this.selectedChatId = chatId;
  // ... rest of code
}
```

### Problem 2: No "Incoming call" log at all on Doctor B

**Possible causes:**

**A) Socket not connected**
- Check for `[SocketService] Connected successfully` in console
- If missing, backend might not be running

**B) Not joined room**
- Check for `[SocketService] Joining room for user: ...`
- If missing, socket connection might have failed

**C) Event listeners not set up**
- Check for `[SocketService] Listening to event: call:incoming`
- If missing, `setupSignalingListeners()` wasn't called

**Fix**: Reload Doctor B's page and check all three logs appear.

### Problem 3: currentUser is undefined

**You'll see:**
```
[Doctor Chat] Current user ID: undefined
```

**Cause**: The AuthService didn't properly set the current user, or the component initialized before the user loaded.

**Fix**:
Check in doctor-doctor-messages.component.ts, `ngOnInit()`:
```typescript
ngOnInit(): void {
  this.authService.currentUser$
    .pipe(takeUntil(this.destroy$))
    .subscribe(user => {
      console.log('[Doctor Chat] User loaded:', user); // Add this log
      this.currentUser = user;
      if (user?.id) {
        this.initializeComponent();
      }
    });
}
```

If user is null/undefined:
- Not logged in properly
- Token expired
- AuthService not working

### Problem 4: Call appears briefly then disappears

**Cause**: Component is being destroyed/recreated.

**Fix**: Check for multiple subscriptions or routing issues.

---

## 🧪 Manual Test

### Quick Copy-Paste Test

**In Doctor A's browser console:**
```javascript
// Get Doctor B's actual ID from their chat list
// Then emit a test call
const testCall = {
  fromUserId: "current-doctor-a-id",  // Replace with Doctor A's ID
  toUserId: "current-doctor-b-id",     // Replace with Doctor B's ID from chat
  media: "audio"
};

console.log("Emitting test call:", testCall);
// This would work if you had access to socketService
// socketService.emit('call:request', testCall);
```

**In Doctor B's browser console:**
- You should see the incoming call logs immediately

---

## 📋 Complete Verification Checklist

Run through this checklist on BOTH browsers:

### Doctor A (Caller)
- [ ] `[SocketService] Connected successfully`
- [ ] `[SocketService] Joining room for user: doctor-a-id`
- [ ] Can see Doctor B in the chat list
- [ ] Can select Doctor B's chat
- [ ] Click "Request Call" button works
- [ ] See `[Doctor Chat] Starting call: ...` in console
- [ ] See `[SocketService] Emitting event: call:request` in console

### Doctor B (Receiver)
- [ ] `[SocketService] Connected successfully`
- [ ] `[SocketService] Joining room for user: doctor-b-id`
- [ ] `[SocketService] Listening to event: call:incoming` appears
- [ ] `[Doctor Chat] Current user ID: doctor-b-id` (actual ID, not undefined)
- [ ] When A calls: See `[Doctor Chat] Incoming call: ...`
- [ ] When A calls: See `[Doctor Chat] Showing incoming call UI`
- [ ] Incoming call banner appears in UI

---

## 🔧 If Still Not Working

### 1. Add More Debug Logs

In `doctor-doctor-messages.component.ts`, add these logs:

```typescript
private setupSignalingListeners(): void {
  console.log('[Doctor Chat] setupSignalingListeners called'); // Add this
  
  this.socketService.on('call:incoming', async (p: { fromUserId: string; toUserId: string; media: 'audio' | 'video' }) => {
    console.log('[Doctor Chat] Incoming call:', p);
    console.log('[Doctor Chat] Current user ID:', this.currentUser?.id);
    console.log('[Doctor Chat] Match?', p.toUserId === this.currentUser?.id); // Add this
    
    if (!this.currentUser || p.toUserId !== this.currentUser.id) {
      console.log('[Doctor Chat] Ignoring incoming call - not for this user');
      return;
    }
    console.log('[Doctor Chat] Showing incoming call UI');
    this.mediaType = p.media;
    this.selectedChatId = p.fromUserId;
    this.incomingCall = true;
    this.incomingFromUserId = p.fromUserId;
    this.startRinging(false);
  });
}
```

### 2. Check Backend Logs

In the backend terminal, you should see socket connections:
```
Socket connected: XYZ123
User joined room: user:doctor-a-id
User joined room: user:doctor-b-id
```

### 3. Test with Different Browsers

Try:
- Chrome + Chrome Incognito
- Chrome + Firefox
- Different computers

### 4. Check Network Tab

In DevTools → Network tab:
- Look for WebSocket connection (ws://)
- Should show "Connected" status
- Messages should be flowing

### 5. Hard Reload Everything

1. Stop backend: `Ctrl+C`
2. Stop frontend: `Ctrl+C`
3. Clear browser cache: `Ctrl+Shift+Delete`
4. Start backend: `npm run start:dev`
5. Start frontend: `ng serve`
6. Hard reload browsers: `Ctrl+Shift+R`

---

## ✅ Success Criteria

When it's working, you'll see this sequence:

**Doctor A's Console:**
```
[Doctor Chat] Starting call: { from: "A", to: "B", type: "audio" }
[SocketService] Emitting event: call:request
```

**Doctor B's Console (within 100ms):**
```
[Doctor Chat] Incoming call: { fromUserId: "A", toUserId: "B", media: "audio" }
[Doctor Chat] Current user ID: B
[Doctor Chat] Showing incoming call UI
```

**Doctor B's UI:**
- 🟢 Orange banner appears at top of chat
- 🟢 Shows "Incoming audio call from [Doctor A Name]"
- 🟢 Has Accept and Decline buttons
- 🟢 Ringing sound plays

---

## 🆘 Still Stuck?

If you've tried everything and it still doesn't work:

1. **Share the console logs** from both browsers (copy the entire console output)
2. **Share the doctor IDs** - what are Doctor A and B's actual user IDs?
3. **Share the chat conversation** - is Doctor B actually in Doctor A's chat list?
4. **Check the database** - verify both doctors exist and are active:
   ```sql
   SELECT id, email, role, firstName, lastName FROM users WHERE role = 'DOCTOR';
   ```

Good luck! The logs should tell us exactly what's happening. 🕵️
