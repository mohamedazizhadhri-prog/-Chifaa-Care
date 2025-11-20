# Patient-Doctor Video/Audio Calling Implementation Guide

## Overview
This guide shows how to add video and audio calling functionality between patients and doctors in the ChifaaCare messaging system.

## Files Created
1. **PATIENT-DOCTOR-CALLS-PART1.ts** - Component structure and properties
2. **PATIENT-DOCTOR-CALLS-PART2.ts** - Socket listeners and messaging methods
3. **PATIENT-DOCTOR-CALLS-PART3.ts** - WebRTC call signaling and control
4. **PATIENT-DOCTOR-CALLS-PART4.ts** - Data loading methods

## Implementation Steps

### Step 1: Backup Current File
```bash
cd src/app/portals/doctor/messages
cp doctor-messages.component.ts doctor-messages.component.ts.backup
```

### Step 2: Update TypeScript Component

Merge all 4 parts into the `doctor-messages.component.ts` file:

1. Start with PART1 (basic structure)
2. Add methods from PART2 (socket listeners and messaging)
3. Add methods from PART3 (WebRTC calls)
4. Add methods from PART4 (data loading)

The complete component should look like this structure:

```typescript
// Imports (from PART1)
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
// ... other imports

// Interfaces (from PART1)
interface Message { ... }
interface Chat { ... }

@Component({
  selector: 'app-doctor-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './doctor-messages.component.html',
  styleUrls: ['./doctor-messages.component.scss']
})
export class DoctorMessagesComponent implements OnInit, OnDestroy, AfterViewChecked {
  // Properties from PART1
  private subscriptions: Subscription[] = [];
  // ... all properties including WebRTC properties
  
  // Constructor and lifecycle hooks from PART1
  constructor(...) { }
  ngOnInit() { ... }
  ngAfterViewChecked() { ... }
  ngOnDestroy() { ... }
  
  // Methods from PART2 (Socket and Messaging)
  private setupSocketListeners() { ... }
  sendMessage() { ... }
  selectChat() { ... }
  // ... other messaging methods
  
  // Methods from PART3 (WebRTC Calls)
  private setupSignalingListeners() { ... }
  async startCall() { ... }
  acceptIncoming() { ... }
  declineIncoming() { ... }
  endCall() { ... }
  toggleMicrophone() { ... }
  toggleCamera() { ... }
  // ... other call methods
  
  // Methods from PART4 (Data Loading)
  private loadConversations() { ... }
  private loadPatients() { ... }
  // ... other data methods
}
```

### Step 3: Update HTML Template

Add the call UI to `doctor-messages.component.html`. Insert this after the chat header and before the messages area:

```html
<!-- Add these sections to the chat-window -->

<!-- Call Buttons in Header (update chat-actions div) -->
<div class="chat-actions">
  <button class="btn btn-outline" (click)="viewPatientProfile()">
    <i class="fa-solid fa-user"></i> Profile
  </button>
  <!-- NEW: Call Buttons -->
  <button class="btn btn-outline" (click)="startCall('audio')" title="Audio call">
    <i class="fa-solid fa-phone"></i>
  </button>
  <button class="btn btn-outline" (click)="startCall('video')" title="Video call">
    <i class="fa-solid fa-video"></i>
  </button>
</div>

<!-- NEW: Call UI Overlays (add after chat-header) -->
<!-- Outgoing Call (Dialing) -->
<div *ngIf="dialing" class="call-overlay">
  <div class="call-card">
    <div class="call-avatar">
      <i class="fa-solid fa-user"></i>
    </div>
    <h3>{{ selectedChat.patientName }}</h3>
    <p class="call-status">Calling...</p>
    <div class="call-controls">
      <button class="btn btn-danger" (click)="endCall()">
        <i class="fa-solid fa-phone-slash"></i> Cancel
      </button>
    </div>
  </div>
</div>

<!-- Incoming Call -->
<div *ngIf="incomingCall" class="call-overlay">
  <div class="call-card">
    <div class="call-avatar">
      <i class="fa-solid fa-user"></i>
    </div>
    <h3>{{ getPatientName(incomingFromUserId) }}</h3>
    <p class="call-status">Incoming {{ mediaType }} call...</p>
    <div class="call-controls">
      <button class="btn btn-success" (click)="acceptIncoming()">
        <i class="fa-solid fa-phone"></i> Accept
      </button>
      <button class="btn btn-danger" (click)="declineIncoming()">
        <i class="fa-solid fa-phone-slash"></i> Decline
      </button>
    </div>
  </div>
</div>

<!-- Active Call -->
<div *ngIf="inCall" class="call-overlay">
  <div class="call-video-container">
    <!-- Remote Video (Patient) -->
    <video #remoteVideo autoplay playsinline class="remote-video"></video>
    
    <!-- Local Video (Doctor) -->
    <video #localVideo autoplay playsinline muted class="local-video"></video>
    
    <!-- Call Controls -->
    <div class="call-controls active-call">
      <button class="btn btn-outline" (click)="toggleMicrophone()">
        <i class="fa-solid" [class.fa-microphone]="!isMuted" [class.fa-microphone-slash]="isMuted"></i>
      </button>
      <button class="btn btn-danger" (click)="endCall()">
        <i class="fa-solid fa-phone-slash"></i> End Call
      </button>
      <button class="btn btn-outline" *ngIf="mediaType === 'video'" (click)="toggleCamera()">
        <i class="fa-solid" [class.fa-video]="!isCameraOff" [class.fa-video-slash]="isCameraOff"></i>
      </button>
    </div>
  </div>
</div>

<!-- Update messages-area to hide during call -->
<div class="messages-area" #messagesContainer *ngIf="!inCall && !dialing && !incomingCall">
  <!-- existing message list -->
</div>

<!-- Update message-input-area to hide during call -->
<div class="message-input-area" *ngIf="!inCall && !dialing && !incomingCall">
  <!-- existing input -->
</div>
```

### Step 4: Update SCSS Styles

Add call-related styles to `doctor-messages.component.scss`:

```scss
// Call UI Styles
.call-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.call-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  max-width: 400px;
  
  h3 {
    margin: 16px 0;
    font-size: 1.5rem;
  }
}

.call-avatar {
  width: 80px;
  height: 80px;
  background: #3498db;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  margin: 0 auto 20px;
}

.call-status {
  color: #64748b;
  margin: 16px 0;
  font-size: 1.1rem;
}

.call-controls {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 24px;
  
  &.active-call {
    position: absolute;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.5);
    padding: 16px;
    border-radius: 50px;
  }
  
  button {
    min-width: 120px;
  }
}

.call-video-container {
  width: 100%;
  height: 100%;
  position: relative;
  background: #000;
}

.remote-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.local-video {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 200px;
  height: 150px;
  border-radius: 12px;
  object-fit: cover;
  border: 2px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

// Responsive adjustments
@media (max-width: 768px) {
  .local-video {
    width: 120px;
    height: 90px;
    top: 10px;
    right: 10px;
  }
  
  .call-controls.active-call {
    bottom: 20px;
    padding: 12px;
  }
}
```

### Step 5: Verify Backend Support

Ensure your backend has these socket events:
- `call:request` - Initiate call
- `call:accept` - Accept incoming call
- `call:decline` - Decline incoming call
- `call:offer` - Send WebRTC offer
- `call:answer` - Send WebRTC answer
- `call:ice-candidate` - Exchange ICE candidates
- `call:end` - End call
- `call:incoming` - Notify incoming call
- `call:accepted` - Notify call accepted
- `call:declined` - Notify call declined
- `call:started` - Call has started
- `call:ended` - Call has ended

## Features Included

### ✅ For Doctor Dashboard:
1. **Audio Calls** - Voice-only calls with patients
2. **Video Calls** - Video calls with patients
3. **Incoming Call UI** - Accept/Decline incoming calls from patients
4. **Active Call Controls**:
   - Mute/Unmute microphone
   - Turn camera on/off (video calls)
   - End call button
5. **Call Status Indicators**:
   - Dialing state with ringing tone
   - Incoming call with ringing tone
   - Active call with video streams
6. **Integrated with Messages** - Call buttons in each patient chat

### 📱 Call Flow:
1. **Doctor initiates**: Click phone/video icon → Patient receives call notification
2. **Patient initiates**: Doctor receives incoming call notification with Accept/Decline
3. **During call**: Both parties see video (if video call) and can control mic/camera
4. **End call**: Either party can end, cleans up resources

## Testing Checklist

- [ ] Audio call from doctor to patient works
- [ ] Video call from doctor to patient works
- [ ] Incoming call notification appears correctly
- [ ] Accept call connects properly
- [ ] Decline call works
- [ ] Mute/unmute microphone works
- [ ] Camera on/off works (video calls)
- [ ] End call cleans up properly
- [ ] Multiple patients can be called
- [ ] Call UI doesn't interfere with messages

## Troubleshooting

### Issue: Calls not connecting
- Check that both users are connected to socket
- Verify STUN servers are accessible
- Check browser console for WebRTC errors

### Issue: No video/audio
- Verify camera/microphone permissions
- Check getUserMedia constraints
- Test with different browsers

### Issue: ICE candidates not working
- Ensure ICE candidate queue is processing
- Check network/firewall settings
- Verify STUN/TURN server configuration

## Next Steps

1. Add call history/logs
2. Implement TURN server for NAT traversal
3. Add screen sharing capability
4. Add call recording (with consent)
5. Add call quality indicators
6. Implement group calls

## Notes
- This implementation reuses the same WebRTC logic as doctor-to-doctor calls
- The backend socket events should work for both doctor-patient and doctor-doctor calls
- Camera permissions must be granted by the browser for video calls
- The component handles cleanup automatically when destroyed
