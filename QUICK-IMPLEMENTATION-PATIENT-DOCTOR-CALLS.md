# Quick Implementation Steps - Patient-Doctor Video Calls

## ⚡ Quick Start (5 Minutes)

### 1. Backup Current File
```bash
cd src/app/portals/doctor/messages
cp doctor-messages.component.ts doctor-messages.component.ts.backup
```

### 2. Copy Methods to Component

Open `doctor-messages.component.ts` and add these sections:

#### A. Add WebRTC Properties (after existing properties around line 50)
```typescript
// WebRTC call state properties
inCall = false;
dialing = false;
incomingCall = false;
incomingFromUserId: string | null = null;
mediaType: 'audio' | 'video' = 'audio';
isMuted = false;
isCameraOff = false;

private pc: RTCPeerConnection | null = null;
private localStream: MediaStream | null = null;
private remoteStream: MediaStream | null = null;
private currentCallId: string | null = null;
private iceCandidateQueue: RTCIceCandidate[] = [];
private audioCtx?: AudioContext;
private ringOsc?: OscillatorNode;
private ringGain?: GainNode;

@ViewChild('localVideo') localVideo?: ElementRef<HTMLVideoElement>;
@ViewChild('remoteVideo') remoteVideo?: ElementRef<HTMLVideoElement>;
```

#### B. Update ngOnInit (around line 80)
Add this line after `this.setupSocketListeners();`:
```typescript
this.setupSignalingListeners(); // ADD THIS LINE
```

#### C. Update ngOnDestroy (around line 95)
Add this as the FIRST line:
```typescript
this.cleanupCall(); // ADD THIS LINE AT THE TOP
```

#### D. Add All Methods from Part Files

Copy all methods from these files IN ORDER:
1. `PATIENT-DOCTOR-CALLS-PART2.ts` - After existing methods
2. `PATIENT-DOCTOR-CALLS-PART3.ts` - After Part 2 methods  
3. `PATIENT-DOCTOR-CALLS-PART4.ts` - Use to replace or enhance existing loadConversations/loadPatients

### 3. Update HTML Template

Open `doctor-messages.component.html`:

#### A. Update Call Buttons in Header (find `<div class="chat-actions">`)
```html
<div class="chat-actions">
  <button class="btn btn-outline" (click)="viewPatientProfile()">
    <i class="fa-solid fa-user"></i> Profile
  </button>
  <!-- ADD THESE TWO BUTTONS -->
  <button class="btn btn-outline" (click)="startCall('audio')" title="Audio call">
    <i class="fa-solid fa-phone"></i>
  </button>
  <button class="btn btn-outline" (click)="startCall('video')" title="Video call">
    <i class="fa-solid fa-video"></i>
  </button>
</div>
```

#### B. Add Call Overlays (after `<!-- Chat Header -->` section)
```html
<!-- ADD THESE THREE OVERLAYS -->

<!-- Outgoing Call -->
<div *ngIf="dialing" class="call-overlay">
  <div class="call-card">
    <div class="call-avatar"><i class="fa-solid fa-user"></i></div>
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
    <div class="call-avatar"><i class="fa-solid fa-user"></i></div>
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
    <video #remoteVideo autoplay playsinline class="remote-video"></video>
    <video #localVideo autoplay playsinline muted class="local-video"></video>
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
```

#### C. Update Messages & Input Areas (find these sections and add `*ngIf`)
```html
<!-- Change this line -->
<div class="messages-area" #messagesContainer>
<!-- To this -->
<div class="messages-area" #messagesContainer *ngIf="!inCall && !dialing && !incomingCall">

<!-- And change this line -->
<div class="message-input-area">
<!-- To this -->
<div class="message-input-area" *ngIf="!inCall && !dialing && !incomingCall">
```

### 4. Update SCSS Styles

Open `doctor-messages.component.scss` and ADD at the end:

```scss
// Call UI Styles
.call-overlay {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}

.call-card {
  background: white; border-radius: 16px;
  padding: 40px; text-align: center; max-width: 400px;
}

.call-avatar {
  width: 80px; height: 80px; background: #3498db;
  border-radius: 50%; display: flex;
  align-items: center; justify-content: center;
  color: white; font-size: 2rem; margin: 0 auto 20px;
}

.call-status { color: #64748b; margin: 16px 0; }

.call-controls {
  display: flex; gap: 12px; justify-content: center; margin-top: 24px;
  &.active-call {
    position: absolute; bottom: 40px; left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.5);
    padding: 16px; border-radius: 50px;
  }
}

.call-video-container {
  width: 100%; height: 100%; position: relative; background: #000;
}

.remote-video {
  width: 100%; height: 100%; object-fit: cover;
}

.local-video {
  position: absolute; top: 20px; right: 20px;
  width: 200px; height: 150px; border-radius: 12px;
  object-fit: cover; border: 2px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

@media (max-width: 768px) {
  .local-video { width: 120px; height: 90px; top: 10px; right: 10px; }
}
```

## 🧪 Testing

1. Start your app: `npm start`
2. Login as a doctor
3. Go to Messages
4. Select a patient
5. Click phone icon for audio call OR video icon for video call
6. Test with another browser/device as the patient

## ✅ Verification Checklist

- [ ] Phone and video icons appear in chat header
- [ ] Clicking phone icon shows "Calling..." overlay
- [ ] Clicking video icon shows "Calling..." with video request
- [ ] End call button cancels the call
- [ ] No errors in browser console
- [ ] Camera/mic permissions are requested

## 🐛 Common Issues & Fixes

### Issue: "getPatientName is not defined"
**Fix:** Add this method to your component (from PART2):
```typescript
getPatientName(userId: string | null): string {
  if (!userId) return 'Unknown';
  const chat = this.allChats.find(c => c.id === userId);
  return chat ? chat.patientName : 'Unknown Patient';
}
```

### Issue: Camera not working
**Fix:** Check browser permissions (chrome://settings/content/camera)

### Issue: Calls not connecting
**Fix:** Ensure socket.io is connected (check Network tab in DevTools)

## 📁 Files You Modified

1. ✏️ `src/app/portals/doctor/messages/doctor-messages.component.ts`
2. ✏️ `src/app/portals/doctor/messages/doctor-messages.component.html`
3. ✏️ `src/app/portals/doctor/messages/doctor-messages.component.scss`

## 🔄 Rollback (if needed)

```bash
cd src/app/portals/doctor/messages
cp doctor-messages.component.ts.backup doctor-messages.component.ts
```

## 📚 Full Documentation

See `PATIENT-DOCTOR-CALLS-IMPLEMENTATION-GUIDE.md` for complete details.

---

**Need Help?** Check the console for errors and compare your code with the PART files.
