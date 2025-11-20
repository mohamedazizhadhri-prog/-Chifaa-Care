# Patient Calling Implementation Plan

## Overview
Add WebRTC calling feature to doctor-patient messages (similar to doctor-doctor messages).

## Current Status
- ✅ Doctor-to-doctor calling: IMPLEMENTED
- ❌ Doctor-to-patient calling: NOT IMPLEMENTED

## What Needs to Be Added

### 1. Component Changes (doctor-messages.component.ts)

#### Properties to Add
```typescript
// WebRTC call state
@ViewChild('localVideo') localVideo?: ElementRef<HTMLVideoElement>;
@ViewChild('remoteVideo') remoteVideo?: ElementRef<HTMLVideoElement>;

inCall = false;
dialing = false;
incomingCall = false;
incomingFromUserId: string | null = null;
mediaType: 'audio' | 'video' = 'audio';
private pc: RTCPeerConnection | null = null;
private localStream: MediaStream | null = null;
private remoteStream: MediaStream | null = null;
private currentCallId: string | null = null;
private iceCandidateQueue: RTCIceCandidate[] = [];
private audioCtx?: AudioContext;
private ringOsc?: OscillatorNode;
private ringGain?: GainNode;
```

#### Methods to Add
```typescript
// Call signaling
setupSignalingListeners(): void
async startCall(type: 'audio' | 'video'): Promise<void>
endCall(): void
acceptIncoming(): void
declineIncoming(): void

// WebRTC peer management
private async preparePeer(type: 'audio' | 'video'): Promise<void>
private cleanupCall(): void
private async processQueuedIceCandidates(): Promise<void>

// Audio feedback
private startRinging(outgoing: boolean): void
private stopRinging(): void
```

### 2. Template Changes

#### Call Buttons in Header
```html
<div class="chat-actions">
  <!-- Quick action buttons -->
  <button 
    class="btn btn-call-audio" 
    (click)="startCall('audio')"
    title="Start voice call"
    [disabled]="inCall || dialing">
    <i class="fa-solid fa-phone"></i>
  </button>
  <button 
    class="btn btn-call-video" 
    (click)="startCall('video')"
    title="Start video call"
    [disabled]="inCall || dialing">
    <i class="fa-solid fa-video"></i>
  </button>
  
  <!-- Call status indicator -->
  <span *ngIf="dialing" class="call-indicator dialing">
    <i class="fa-solid fa-phone fa-shake"></i> Calling...
  </span>
  <span *ngIf="inCall" class="call-indicator active">
    <i class="fa-solid fa-phone"></i> In Call
  </span>
</div>
```

#### Incoming Call Banner
```html
<div class="incoming-banner" *ngIf="incomingCall">
  <div>
    <strong>Incoming {{ mediaType }} call from {{ selectedChat.patientName }}</strong>
  </div>
  <div class="incoming-actions">
    <button class="btn btn-success" (click)="acceptIncoming()">
      <i class="fa-solid fa-phone"></i> Accept
    </button>
    <button class="btn btn-danger" (click)="declineIncoming()">
      <i class="fa-solid fa-phone-slash"></i> Decline
    </button>
  </div>
</div>
```

#### Call Panel
```html
<div class="call-panel card" *ngIf="inCall">
  <div class="call-header">
    <strong>Call with {{ selectedChat.patientName }}</strong>
    <span class="badge" [class.badge-video]="mediaType==='video'" [class.badge-audio]="mediaType==='audio'">
      {{ mediaType | uppercase }}
    </span>
  </div>
  <div class="videos" [class.audio-only]="mediaType==='audio'">
    <video #localVideo autoplay playsinline muted class="local-video"></video>
    <video #remoteVideo autoplay playsinline [muted]="false" class="remote-video"></video>
  </div>
  <div class="call-actions">
    <button class="btn btn-danger" (click)="endCall()">
      <i class="fa-solid fa-phone-slash"></i> End Call
    </button>
  </div>
</div>
```

### 3. Styles to Add

Copy from doctor-doctor-messages.component.scss:
- `.btn-call-audio`, `.btn-call-video`
- `.call-indicator` (with animations)
- `.incoming-banner` (with animations)
- `.call-panel`
- `.videos`, `.local-video`, `.remote-video`
- `@keyframes` animations (fadeIn, shake, pulse, ring)

### 4. Socket Events

The component needs to listen for/emit:
- `call:request` - Initiate call
- `call:incoming` - Receive call notification
- `call:accept` - Accept call
- `call:decline` - Decline call
- `call:offer` - WebRTC offer
- `call:answer` - WebRTC answer
- `call:ice-candidate` - ICE candidates
- `call:end` - End call
- `call:started` - Call started confirmation

### 5. Backend Support

Check if backend supports doctor-patient calls:
- Socket.io room management
- Call state tracking
- ICE candidate relay
- Call end notifications

## Implementation Steps

### Phase 1: Add WebRTC Infrastructure
1. Add ViewChild references for videos
2. Add call state properties
3. Add WebRTC configuration

### Phase 2: Add Call Methods
1. Implement preparePeer()
2. Implement setupSignalingListeners()
3. Implement startCall(), endCall()
4. Implement acceptIncoming(), declineIncoming()
5. Implement cleanup methods

### Phase 3: Update Template
1. Add call buttons to chat header
2. Add incoming call banner
3. Add call panel with videos
4. Add status indicators

### Phase 4: Add Styles
1. Copy call-related styles from doctor-doctor component
2. Adjust colors/spacing if needed
3. Test responsiveness

### Phase 5: Testing
1. Test voice calls
2. Test video calls
3. Test incoming/outgoing scenarios
4. Test call end scenarios
5. Test error handling

## Files to Modify

1. **src/app/portals/doctor/messages/doctor-messages.component.ts**
   - Add WebRTC properties and methods
   - Add signaling listeners

2. **Inline template in doctor-messages.component.ts**
   - Add call UI elements

3. **Inline styles in doctor-messages.component.ts**
   - Add call styling

## Estimated Effort
- Code changes: 2-3 hours
- Testing: 1-2 hours
- Bug fixes: 1 hour
- **Total: 4-6 hours**

## Risks & Considerations

1. **Backend Compatibility**: Ensure backend supports doctor-patient calls
2. **Permission Handling**: Browser permissions for camera/mic
3. **Network Issues**: Handle poor connections gracefully
4. **Mobile Support**: Test on mobile devices
5. **Security**: Ensure calls are secure and private

## Success Criteria

- ✅ Doctors can call patients (voice and video)
- ✅ Patients can call doctors (if implemented on patient side)
- ✅ Incoming calls show clear UI
- ✅ Call quality is acceptable
- ✅ Call ends cleanly
- ✅ No memory leaks
- ✅ Works across modern browsers

## Next Steps

1. Review this plan
2. Get approval to proceed
3. Implement Phase 1
4. Test incrementally
5. Deploy when ready

---

**Note**: This will make doctor-patient calling consistent with doctor-doctor calling, providing a unified communication experience across the platform.
