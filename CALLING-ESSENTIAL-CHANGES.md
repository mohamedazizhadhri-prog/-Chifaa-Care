# Essential Code Changes for Working Call with Ringing

## File 1: doctor-doctor-messages.component.ts

### Add this property (line ~50, with other properties):
```typescript
private ringInterval: any = null;
```

### Replace the startRinging method (around line 700):
```typescript
private startRinging(outgoing: boolean): void {
  console.log('[Doctor Chat] 🔔 Starting ring tone:', outgoing ? 'outgoing' : 'incoming');
  
  this.stopRinging(); // Clean up any existing ring
  
  try {
    this.audioCtx = this.audioCtx || new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create two-tone ring pattern
    const freq1 = outgoing ? 480 : 520;
    const freq2 = outgoing ? 620 : 660;
    
    // Play pattern every 1-2 seconds
    const interval = outgoing ? 2000 : 1000;
    
    // Use interval to create repeating ring
    this.ringInterval = setInterval(() => {
      this.playTone(freq1, 0.2, 400);
      setTimeout(() => this.playTone(freq2, 0.2, 400), 400);
    }, interval);
    
  } catch (error) {
    console.error('[Doctor Chat] Error starting ring:', error);
  }
}
```

### Add this new method (after startRinging):
```typescript
private playTone(frequency: number, volume: number, duration: number): void {
  if (!this.audioCtx) return;
  
  const osc = this.audioCtx.createOscillator();
  const gain = this.audioCtx.createGain();
  
  osc.type = 'sine';
  osc.frequency.value = frequency;
  gain.gain.value = volume;
  
  osc.connect(gain);
  gain.connect(this.audioCtx.destination);
  
  osc.start();
  setTimeout(() => {
    try {
      osc.stop();
      osc.disconnect();
      gain.disconnect();
    } catch {}
  }, duration);
}
```

### Replace the stopRinging method (around line 720):
```typescript
private stopRinging(): void {
  console.log('[Doctor Chat] 🔕 Stopping ring tone');
  
  // Clear interval for repeating pattern
  if (this.ringInterval) {
    clearInterval(this.ringInterval);
    this.ringInterval = null;
  }
  
  // Clean up Web Audio API
  try {
    if (this.ringOsc) { 
      this.ringOsc.stop(); 
      this.ringOsc.disconnect(); 
    }
    if (this.ringGain) { 
      this.ringGain.disconnect(); 
    }
  } catch {}
  
  this.ringOsc = undefined as any;
  this.ringGain = undefined as any;
}
```

### Update initializeComponent (around line 100):
Change the setTimeout delay from 500 to 1000:
```typescript
setTimeout(() => {
  console.log('[Doctor Chat] Setting up listeners...');
  this.setupSocketListeners();
  this.setupSignalingListeners();
}, 1000); // <-- Changed from 500 to 1000
```

---

## File 2: doctor-doctor-messages.component.html

### Find the doctor-details div and add call status (around line 80):
```html
<div class="doctor-details">
  <strong>{{ selectedChat.doctorName || 'Doctor' }}</strong>
  <span class="doctor-status" [class.online]="selectedChat.isOnline">
    <i class="fa-solid fa-circle"></i>
    {{ selectedChat.isOnline ? 'Online' : 'Offline' }}
  </span>
  
  <!-- ADD THIS: Call status indicators -->
  <span *ngIf="dialing" class="call-status dialing">
    <i class="fa-solid fa-phone fa-shake"></i> Calling...
  </span>
  <span *ngIf="incomingCall" class="call-status ringing">
    <i class="fa-solid fa-phone fa-shake"></i> Ringing...
  </span>
  <span *ngIf="inCall" class="call-status connected">
    <i class="fa-solid fa-phone"></i> In Call
  </span>
</div>
```

---

## File 3: doctor-doctor-messages.component.scss

### Add at the end of the file:
```scss
/* Call Status Indicators */
.call-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  margin-left: 8px;
  animation: pulse 1.5s infinite;
}

.call-status.dialing {
  background: #fef3c7;
  color: #92400e;
}

.call-status.ringing {
  background: #dbeafe;
  color: #1e40af;
}

.call-status.connected {
  background: #d1fae5;
  color: #065f46;
  animation: none; /* Stop pulsing when connected */
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

/* Make call buttons more prominent */
.btn-call-audio,
.btn-call-video {
  transition: all 0.3s ease;
}

.btn-call-audio:hover:not(:disabled),
.btn-call-video:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.btn-call-audio:active:not(:disabled),
.btn-call-video:active:not(:disabled) {
  transform: translateY(0);
}
```

---

## File 4: socket.service.ts (Optional - only if needed)

### Add this method if it doesn't exist:
```typescript
isConnected(): boolean {
  return this.socket?.connected || false;
}
```

---

## Testing Steps

1. **Start your backend server**
   ```bash
   cd chifaacare-backend
   npm run start:dev
   ```

2. **Start your frontend**
   ```bash
   ng serve
   ```

3. **Open two browser windows:**
   - Window 1: Login as Doctor A
   - Window 2: Login as Doctor B

4. **In Window 1 (Doctor A):**
   - Go to Messages
   - Select Doctor B
   - Click the phone icon 📞

5. **Expected Result:**
   - ✅ Should see "Calling..." with pulsing animation
   - ✅ Should hear **repeating two-tone ring** (beep-beep, pause, beep-beep...)
   - ✅ Console shows: `[Doctor Chat] 🔔 Starting ring tone: outgoing`

6. **In Window 2 (Doctor B):**
   - ✅ Should see incoming call banner
   - ✅ Should hear **different repeating ring** (faster beep-beep-beep)
   - ✅ Can click Accept/Decline

7. **After accepting:**
   - ✅ Ringing stops on both sides
   - ✅ Shows "In Call" status
   - ✅ WebRTC connection established
   - ✅ Console shows: `[Doctor Chat] 🔕 Stopping ring tone`

---

## Troubleshooting

### If you don't hear ANY sound:
1. Check browser console for errors
2. Try clicking somewhere on the page first (browsers block audio until user interaction)
3. Make sure your volume is up 🔊

### If call doesn't connect:
1. Check console for: `[Doctor Chat] Call request sent`
2. If not there, socket isn't connected
3. Check backend is running on correct port
4. Check `environment.ts` has correct socket URL

### If sound cuts out:
The audio context might be suspended. Add this to startRinging:
```typescript
if (this.audioCtx.state === 'suspended') {
  this.audioCtx.resume();
}
```

---

## What You Get

✅ **Outgoing call**: Slower two-tone ring (beep-beep every 2 seconds)
✅ **Incoming call**: Faster two-tone ring (beep-beep every 1 second)
✅ **Visual feedback**: Color-coded status badges with animations
✅ **Proper cleanup**: Ring stops when call connects/ends

This is the **minimal working implementation** for calling with proper ringing sounds! 🎉
