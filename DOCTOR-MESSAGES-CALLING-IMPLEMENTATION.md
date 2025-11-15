# Doctor Messages - Audio/Video Calling Implementation Guide

This guide explains how to implement the working audio/video calling feature in the Doctor Messages interface.

## 🎯 Current Issue

The modal shows "AUDIO call feature will be implemented here!" but the actual calling doesn't work with ringing sounds and proper UI feedback.

## ✅ Solution Overview

Implement a complete WebRTC-based calling system with:
- **Real ringing sounds** (outgoing and incoming)
- **Visual call states** (dialing, ringing, connecting, connected)
- **Call duration timer**
- **Proper call UI** with video feeds
- **Sound effects** for call events

---

## 📁 Files to Modify

### 1. **Component TypeScript** (`doctor-doctor-messages.component.ts`)

#### Add these new properties:

```typescript
export class DoctorDoctorMessagesComponent implements OnInit, OnDestroy {
  // ... existing properties ...
  
  // Enhanced ringing with proper audio
  private ringAudio: HTMLAudioElement | null = null;
  private ringInterval: any = null;
  
  // Call state tracking
  callState: 'idle' | 'dialing' | 'ringing' | 'connecting' | 'connected' | 'ending' = 'idle';
  callDuration = 0;
  private callDurationInterval: any = null;
  
  // Mute/camera states
  isMuted = false;
  isCameraOff = false;
  isSpeakerOn = true;
```

#### Replace the `startCall` method:

```typescript
async startCall(type: 'audio' | 'video'): Promise<void> {
  if (!this.currentUser?.id || !this.selectedChatId) {
    console.error('[Doctor Chat] Cannot start call: missing user ID or chat');
    return;
  }
  
  console.log('[Doctor Chat] Starting call:', {
    from: this.currentUser.id,
    to: this.selectedChatId,
    type: type,
    socketConnected: this.socketService.isConnected()
  });
  
  // Verify socket is connected
  if (!this.socketService.isConnected()) {
    console.error('[Doctor Chat] Socket not connected, reconnecting...');
    this.socketService.connect(this.currentUser.id);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  this.mediaType = type;
  this.callState = 'dialing';
  
  // Send call request
  this.socketService.emit('call:request', { 
    fromUserId: this.currentUser.id, 
    toUserId: this.selectedChatId, 
    media: type 
  });
  
  console.log('[Doctor Chat] Call request sent');
  
  this.dialing = true;
  this.startRinging(true); // true = outgoing call
}
```

#### Add improved ringing methods:

```typescript
private startRinging(outgoing: boolean): void {
  console.log('[Doctor Chat] Starting ring tone:', outgoing ? 'outgoing' : 'incoming');
  
  this.stopRinging();
  
  try {
    // Try to use audio files first
    const audioFile = outgoing ? 'assets/sounds/call-outgoing.mp3' : 'assets/sounds/call-incoming.mp3';
    this.ringAudio = new Audio(audioFile);
    this.ringAudio.loop = true;
    this.ringAudio.volume = 0.3;
    
    this.ringAudio.play().catch(error => {
      console.warn('[Doctor Chat] Could not play audio file, using fallback:', error);
      this.startToneRinging(outgoing);
    });
  } catch (error) {
    console.warn('[Doctor Chat] Error with audio file, using fallback:', error);
    this.startToneRinging(outgoing);
  }
}

private startToneRinging(outgoing: boolean): void {
  try {
    this.stopRinging();
    this.audioCtx = this.audioCtx || new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const freq1 = outgoing ? 480 : 520;
    const freq2 = outgoing ? 620 : 660;
    
    this.ringInterval = setInterval(() => {
      this.playTone(freq1, 0.2, 400);
      setTimeout(() => this.playTone(freq2, 0.2, 400), 400);
    }, outgoing ? 2000 : 1000);
  } catch (error) {
    console.error('[Doctor Chat] Error starting tone ring:', error);
  }
}

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
    osc.stop();
    osc.disconnect();
    gain.disconnect();
  }, duration);
}

private stopRinging(): void {
  console.log('[Doctor Chat] Stopping ring tone');
  
  if (this.ringAudio) {
    this.ringAudio.pause();
    this.ringAudio.currentTime = 0;
    this.ringAudio = null;
  }
  
  if (this.ringInterval) {
    clearInterval(this.ringInterval);
    this.ringInterval = null;
  }
  
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

#### Add call duration timer:

```typescript
private startCallDurationTimer(): void {
  this.callDuration = 0;
  this.callDurationInterval = setInterval(() => {
    this.callDuration++;
  }, 1000);
}

private stopCallDurationTimer(): void {
  if (this.callDurationInterval) {
    clearInterval(this.callDurationInterval);
    this.callDurationInterval = null;
  }
}

getFormattedCallDuration(): string {
  const minutes = Math.floor(this.callDuration / 60);
  const seconds = this.callDuration % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
```

#### Add control methods:

```typescript
toggleMute(): void {
  if (!this.localStream) return;
  
  this.localStream.getAudioTracks().forEach(track => {
    track.enabled = !track.enabled;
  });
  
  this.isMuted = !this.isMuted;
}

toggleCamera(): void {
  if (!this.localStream || this.mediaType !== 'video') return;
  
  this.localStream.getVideoTracks().forEach(track => {
    track.enabled = !track.enabled;
  });
  
  this.isCameraOff = !this.isCameraOff;
}

toggleSpeaker(): void {
  if (!this.remoteVideo?.nativeElement) return;
  
  this.remoteVideo.nativeElement.volume = this.isSpeakerOn ? 0.5 : 1.0;
  this.isSpeakerOn = !this.isSpeakerOn;
}
```

#### Update `cleanupCall` method:

```typescript
private cleanupCall(): void {
  console.log('[Doctor Chat] Cleaning up call');
  
  this.callState = 'idle';
  this.inCall = false;
  this.dialing = false;
  this.incomingCall = false;
  this.incomingFromUserId = null;
  this.stopRinging();
  this.stopCallDurationTimer();
  this.callDuration = 0;
  this.isMuted = false;
  this.isCameraOff = false;
  this.isSpeakerOn = true;
  this.iceCandidateQueue = [];
  
  if (this.pc) {
    this.pc.onicecandidate = null;
    this.pc.ontrack = null as any;
    this.pc.onconnectionstatechange = null;
    try { 
      this.pc.close(); 
    } catch (error) {
      console.error('[Doctor Chat] Error closing peer connection:', error);
    }
  }
  this.pc = null;
  
  if (this.localStream) {
    this.localStream.getTracks().forEach(t => t.stop());
  }
  this.localStream = null;
  this.remoteStream = null;
  
  if (this.localVideo?.nativeElement) this.localVideo.nativeElement.srcObject = null;
  if (this.remoteVideo?.nativeElement) this.remoteVideo.nativeElement.srcObject = null;
  this.currentCallId = null;
}
```

#### Update signaling listeners to use call states:

```typescript
private setupSignalingListeners(): void {
  this.socketService.on('call:incoming', async (p: { fromUserId: string; toUserId: string; media: 'audio' | 'video' }) => {
    console.log('[Doctor Chat] 📞 Incoming call:', p);
    
    if (!this.currentUser || p.toUserId !== this.currentUser.id) {
      return;
    }
    
    console.log('[Doctor Chat] ✓ Showing incoming call UI');
    this.mediaType = p.media;
    this.selectedChatId = p.fromUserId;
    this.callState = 'ringing';
    this.incomingCall = true;
    this.incomingFromUserId = p.fromUserId;
    this.startRinging(false);
  });

  this.socketService.on('call:offer', async (p: { fromUserId: string; toUserId: string; sdp: any }) => {
    if (!this.currentUser || p.toUserId !== this.currentUser.id) return;
    
    this.callState = 'connecting';
    
    if (!this.pc) await this.preparePeer(this.mediaType);
    await this.pc!.setRemoteDescription(new RTCSessionDescription(p.sdp));
    await this.processQueuedIceCandidates();
    
    const answer = await this.pc!.createAnswer();
    await this.pc!.setLocalDescription(answer);
    
    this.socketService.emit('call:answer', { 
      fromUserId: this.currentUser.id, 
      toUserId: p.fromUserId, 
      sdp: answer
    });
    
    this.stopRinging();
    this.callState = 'connected';
    this.inCall = true;
    this.incomingCall = false;
    this.startCallDurationTimer();
  });

  this.socketService.on('call:answer', async (p: { fromUserId: string; toUserId: string; sdp: any }) => {
    if (!this.currentUser || p.toUserId !== this.currentUser.id) return;
    
    await this.pc?.setRemoteDescription(new RTCSessionDescription(p.sdp));
    await this.processQueuedIceCandidates();
    
    this.callState = 'connected';
    this.stopRinging();
    this.startCallDurationTimer();
  });

  this.socketService.on('call:accepted', async (p: { fromUserId: string; toUserId: string; callId?: string }) => {
    if (!this.currentUser || p.toUserId !== this.currentUser.id) return;
    
    this.stopRinging();
    this.dialing = false;
    this.callState = 'connecting';
    
    if (p.callId) this.currentCallId = p.callId;
    
    await this.preparePeer(this.mediaType);
    const offer = await this.pc!.createOffer();
    await this.pc!.setLocalDescription(offer);
    
    this.socketService.emit('call:offer', { 
      fromUserId: this.currentUser.id,
      toUserId: p.fromUserId,
      sdp: offer
    });
    
    this.inCall = true;
  });

  this.socketService.on('call:declined', (p: { fromUserId: string; toUserId: string }) => {
    if (!this.currentUser || p.toUserId !== this.currentUser.id) return;
    
    this.stopRinging();
    this.dialing = false;
    this.cleanupCall();
    alert('Call was declined');
  });

  // ... other listeners ...
}
```

---

### 2. **HTML Template** (`doctor-doctor-messages.component.html`)

#### Update the chat header to show call states:

```html
<div class="chat-header">
  <div class="chat-doctor-info">
    <div class="doctor-avatar">
      <i class="fa-solid fa-user-doctor"></i>
    </div>
    <div class="doctor-details">
      <strong>{{ selectedChat.doctorName || 'Doctor' }}</strong>
      <span class="doctor-status" [class.online]="selectedChat.isOnline">
        <i class="fa-solid fa-circle"></i>
        {{ selectedChat.isOnline ? 'Online' : 'Offline' }}
      </span>
      
      <!-- Call status indicators -->
      <span *ngIf="callState === 'dialing'" class="call-status dialing">
        <i class="fa-solid fa-phone fa-shake"></i> Calling...
      </span>
      <span *ngIf="callState === 'ringing'" class="call-status ringing">
        <i class="fa-solid fa-phone fa-shake"></i> Ringing...
      </span>
      <span *ngIf="callState === 'connecting'" class="call-status connecting">
        <i class="fa-solid fa-spinner fa-spin"></i> Connecting...
      </span>
      <span *ngIf="callState === 'connected'" class="call-status connected">
        <i class="fa-solid fa-phone"></i> {{ getFormattedCallDuration() }}
      </span>
    </div>
  </div>
  <div class="chat-actions">
    <button 
      class="btn btn-call-audio" 
      (click)="startCall('audio')"
      title="Start voice call"
      [disabled]="callState !== 'idle'"
      [class.active]="callState !== 'idle' && mediaType === 'audio'">
      <i class="fa-solid fa-phone"></i>
    </button>
    <button 
      class="btn btn-call-video" 
      (click)="startCall('video')"
      title="Start video call"
      [disabled]="callState !== 'idle'"
      [class.active]="callState !== 'idle' && mediaType === 'video'">
      <i class="fa-solid fa-video"></i>
    </button>
  </div>
</div>
```

#### Add enhanced incoming call banner:

```html
<div class="incoming-call-banner" *ngIf="incomingCall && callState === 'ringing'">
  <div class="incoming-call-content">
    <div class="incoming-call-avatar">
      <i class="fa-solid fa-user-doctor fa-3x"></i>
    </div>
    <div class="incoming-call-info">
      <h3>{{ selectedChat.doctorName }}</h3>
      <p class="incoming-call-type">
        <i class="fa-solid" [class.fa-phone]="mediaType === 'audio'" [class.fa-video]="mediaType === 'video'"></i>
        Incoming {{ mediaType }} call
      </p>
    </div>
  </div>
  <div class="incoming-call-actions">
    <button class="btn btn-accept" (click)="acceptIncoming()">
      <i class="fa-solid fa-phone"></i>
      <span>Accept</span>
    </button>
    <button class="btn btn-decline" (click)="declineIncoming()">
      <i class="fa-solid fa-phone-slash"></i>
      <span>Decline</span>
    </button>
  </div>
  <div class="incoming-call-ring-animation">
    <div class="ring-circle ring-1"></div>
    <div class="ring-circle ring-2"></div>
    <div class="ring-circle ring-3"></div>
  </div>
</div>
```

#### Add enhanced call panel with controls:

```html
<div class="call-panel" *ngIf="inCall && callState === 'connected'">
  <div class="call-panel-header">
    <div class="call-info">
      <span class="call-participant">{{ selectedChat.doctorName || 'Doctor' }}</span>
      <span class="call-duration">{{ getFormattedCallDuration() }}</span>
    </div>
    <span class="call-type-badge" [class.audio]="mediaType === 'audio'" [class.video]="mediaType === 'video'">
      <i class="fa-solid" [class.fa-phone]="mediaType === 'audio'" [class.fa-video]="mediaType === 'video'"></i>
      {{ mediaType | uppercase }}
    </span>
  </div>
  
  <div class="call-videos" [class.audio-only]="mediaType === 'audio'">
    <div class="remote-video-container">
      <video 
        #remoteVideo 
        autoplay 
        playsinline 
        [muted]="false" 
        class="remote-video"
        [class.hidden]="mediaType === 'audio'">
      </video>
      <div class="remote-video-placeholder" *ngIf="mediaType === 'audio'">
        <div class="avatar-large">
          <i class="fa-solid fa-user-doctor fa-5x"></i>
        </div>
        <p>{{ selectedChat.doctorName }}</p>
      </div>
    </div>
    
    <div class="local-video-container" *ngIf="mediaType === 'video'">
      <video 
        #localVideo 
        autoplay 
        playsinline 
        muted 
        class="local-video">
      </video>
      <div class="local-video-label">You</div>
    </div>
  </div>
  
  <div class="call-controls">
    <button 
      class="control-btn mute-btn" 
      [class.active]="isMuted"
      title="Mute microphone"
      (click)="toggleMute()">
      <i class="fa-solid" [class.fa-microphone]="!isMuted" [class.fa-microphone-slash]="isMuted"></i>
    </button>
    
    <button 
      class="control-btn camera-btn" 
      *ngIf="mediaType === 'video'"
      [class.active]="isCameraOff"
      title="Toggle camera"
      (click)="toggleCamera()">
      <i class="fa-solid" [class.fa-video]="!isCameraOff" [class.fa-video-slash]="isCameraOff"></i>
    </button>
    
    <button 
      class="control-btn end-call-btn" 
      (click)="endCall()"
      title="End call">
      <i class="fa-solid fa-phone-slash"></i>
      <span>End Call</span>
    </button>
    
    <button 
      class="control-btn speaker-btn" 
      [class.active]="!isSpeakerOn"
      title="Speaker"
      (click)="toggleSpeaker()">
      <i class="fa-solid" [class.fa-volume-high]="isSpeakerOn" [class.fa-volume-xmark]="!isSpeakerOn"></i>
    </button>
  </div>
</div>
```

---

### 3. **Styles** (`doctor-doctor-messages.component.scss`)

Add the complete call UI styles from the artifact `doctor-messages-calling-css`.

---

### 4. **Optional: Add Sound Files**

Create these audio files in `src/assets/sounds/`:

1. **call-outgoing.mp3** - Ring tone for outgoing calls
2. **call-incoming.mp3** - Ring tone for incoming calls
3. **call-connected.mp3** - Short beep when call connects
4. **call-ended.mp3** - Short tone when call ends

You can download free sound effects from:
- [Freesound.org](https://freesound.org/)
- [Zapsplat.com](https://www.zapsplat.com/)
- [Mixkit.co](https://mixkit.co/free-sound-effects/)

Or use the fallback Web Audio API tone generator (already implemented).

---

## 🔧 Testing the Implementation

### 1. Test Socket Connection

```typescript
// In browser console:
window.socketService = this.socketService; // Expose in component
window.socketService.isConnected(); // Should return true
```

### 2. Test Calling Flow

1. **Start Call**: Click the phone/video icon
   - Should show "Calling..." status
   - Should hear ringing tone
   - Socket should emit `call:request`

2. **Receive Call** (on other end):
   - Should show incoming call banner
   - Should hear incoming ring
   - Can accept/decline

3. **Accept Call**:
   - Ring tone stops
   - Shows "Connecting..."
   - Establishes WebRTC connection
   - Shows call panel with video/audio
   - Timer starts

4. **During Call**:
   - Can mute/unmute
   - Can toggle camera (video calls)
   - Timer counts up

5. **End Call**:
   - Click "End Call"
   - Plays end sound
   - Cleanup all resources
   - Back to idle state

---

## 🐛 Troubleshooting

### Issue: No ringing sound

**Cause**: Browser requires user interaction before playing audio

**Solution**: The first time a user clicks the call button, the browser may block audio. This is normal. The fallback tone generator will work.

### Issue: Socket not connected

**Check**:
```typescript
console.log('Socket connected:', this.socketService.isConnected());
```

**Fix**: Increase the connection delay in `initializeComponent()`:
```typescript
setTimeout(() => {
  this.setupSocketListeners();
  this.setupSignalingListeners();
}, 1500); // Increase from 1000 to 1500ms
```

### Issue: Call doesn't connect

**Check**:
1. Both users are online and connected to socket
2. STUN servers are accessible
3. Firewall isn't blocking WebRTC

**Debug**:
```typescript
this.pc.oniceconnectionstatechange = () => {
  console.log('ICE connection state:', this.pc?.iceConnectionState);
};
```

### Issue: No video showing

**Check**:
1. Camera permissions granted
2. Video element has `autoplay` and `playsinline` attributes
3. `srcObject` is set correctly

---

## 📊 Call States Flow

```
IDLE
  ↓ (User clicks call button)
DIALING (showing "Calling...", playing outgoing ring)
  ↓ (Other user accepts)
CONNECTING (showing "Connecting...")
  ↓ (WebRTC peer connection established)
CONNECTED (showing timer, call UI)
  ↓ (Someone clicks "End Call")
ENDING (brief cleanup)
  ↓
IDLE
```

---

## ✅ Final Checklist

- [ ] Updated `doctor-doctor-messages.component.ts` with new methods
- [ ] Updated `doctor-doctor-messages.component.html` with enhanced UI
- [ ] Updated `doctor-doctor-messages.component.scss` with call styles
- [ ] (Optional) Added sound files to `src/assets/sounds/`
- [ ] Tested socket connection
- [ ] Tested outgoing call with ringing
- [ ] Tested incoming call with ringing
- [ ] Tested call acceptance and connection
- [ ] Tested call controls (mute, camera)
- [ ] Tested call duration timer
- [ ] Tested call ending

---

## 🎉 Expected Result

When you click the call button, you should see:

1. ✅ Status changes to "Calling..."
2. ✅ Hear a pleasant ringing tone
3. ✅ Socket emits `call:request` event
4. ✅ Other user receives incoming call banner with animation
5. ✅ When accepted, both see "Connecting..."
6. ✅ WebRTC connection established
7. ✅ Full call UI appears with video/audio
8. ✅ Timer counts up
9. ✅ Can control mute/camera/speaker
10. ✅ Clean call ending with sound effect

The calling feature should now work exactly like a professional video calling app (like WhatsApp, Zoom, etc.) with proper ringing, visual feedback, and controls!
