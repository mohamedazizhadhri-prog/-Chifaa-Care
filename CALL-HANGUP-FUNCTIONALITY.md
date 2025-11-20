# Call Hang-Up / Decline Functionality

## Overview
Added prominent hang-up and decline call functionality to both Patient and Doctor messaging dashboards. Users can now easily end calls (both audio and video) with a single click.

## Features Implemented

### 1. **Hang Up Button During Active Calls**
- **Location**: Visible in the call panel when a call is active (`inCall = true`)
- **Functionality**: Ends the current call immediately
- **Available for**: Both audio and video calls
- **Styling**: Large, prominent red button with gradient background and hover effects

### 2. **Decline Button for Incoming Calls**
- **Location**: Visible in the incoming call banner when receiving a call (`incomingCall = true`)
- **Functionality**: Rejects the incoming call before it's answered
- **Available for**: Both audio and video call requests

## Implementation Details

### Patient Dashboard
**File**: `src/app/portals/patient/messages/messages.component.ts`

#### HTML Template Changes:
```html
<!-- During active call -->
<div class="call-actions">
  <button class="btn btn-danger btn-hang-up" (click)="endCall()" title="Hang up call">
    <i class="fa-solid fa-phone-slash"></i> Hang Up
  </button>
</div>

<!-- During incoming call -->
<div class="incoming-actions">
  <button class="btn btn-success" (click)="acceptIncoming()">
    <i class="fa-solid fa-phone"></i> Accept
  </button>
  <button class="btn btn-danger" (click)="declineIncoming()">
    <i class="fa-solid fa-phone-slash"></i> Decline
  </button>
</div>
```

#### CSS Styling:
```css
.btn-hang-up {
  padding: 0.875rem 1.75rem !important;
  font-size: 1.05rem !important;
  font-weight: 600 !important;
  border-radius: 50px !important;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.35) !important;
  transition: all 0.3s ease !important;
}
```

### Doctor Dashboard
**File**: `src/app/portals/doctor/doctor-messages/doctor-doctor-messages.component.html`
**File**: `src/app/portals/doctor/doctor-messages/doctor-doctor-messages.component.scss`

#### HTML Template Changes:
```html
<!-- During active call -->
<div class="call-actions">
  <button class="btn btn-danger btn-hang-up" (click)="endCall()" title="Hang up call">
    <i class="fa-solid fa-phone-slash"></i> Hang Up
  </button>
</div>

<!-- During incoming call -->
<div class="incoming-actions">
  <button class="btn btn-success" (click)="acceptIncoming()">
    <i class="fa-solid fa-phone"></i> Accept
  </button>
  <button class="btn btn-danger" (click)="declineIncoming()">
    <i class="fa-solid fa-phone-slash"></i> Decline
  </button>
</div>
```

#### SCSS Styling:
```scss
.btn-hang-up {
  padding: 0.875rem 1.75rem !important;
  font-size: 1.05rem !important;
  font-weight: 600 !important;
  border-radius: 50px !important;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.35) !important;
  transition: all 0.3s ease !important;
  border: none !important;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%) !important;
    box-shadow: 0 6px 16px rgba(239, 68, 68, 0.45) !important;
    transform: translateY(-2px) !important;
  }
  
  &:active:not(:disabled) {
    transform: translateY(0) !important;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3) !important;
  }
  
  i {
    margin-right: 0.5rem;
    font-size: 1.1rem;
  }
}
```

## Method Implementations (Both Components)

### `endCall()`
Ends the current active call and cleans up resources:
```typescript
endCall(): void {
  if (this.currentUser?.id && this.selectedOtherUserId) {
    this.socket.emit('call:end', { 
      fromUserId: this.currentUser.id, 
      toUserId: this.selectedOtherUserId, 
      callId: this.currentCallId 
    });
  }
  this.cleanupCall();
}
```

### `declineIncoming()`
Declines an incoming call before answering:
```typescript
declineIncoming(): void {
  if (!this.currentUser?.id || !this.incomingFromUserId) return;
  this.socket.emit('call:decline', { 
    fromUserId: this.currentUser.id, 
    toUserId: this.incomingFromUserId 
  });
  this.cleanupCall();
}
```

### `cleanupCall()`
Cleans up all call-related resources:
```typescript
private cleanupCall(): void {
  this.inCall = false;
  this.dialing = false;
  this.incomingCall = false;
  this.incomingFromUserId = null;
  this.stopRinging();
  this.iceCandidateQueue = [];
  
  // Close peer connection
  if (this.pc) {
    this.pc.onicecandidate = null;
    this.pc.ontrack = null;
    this.pc.onconnectionstatechange = null;
    try { 
      this.pc.close(); 
    } catch (error) {
      console.error('Error closing peer connection:', error);
    }
  }
  this.pc = null;
  
  // Stop media streams
  if (this.localStream) {
    this.localStream.getTracks().forEach(t => t.stop());
  }
  this.localStream = null;
  this.remoteStream = null;
  
  // Clear video elements
  if (this.localVideo?.nativeElement) this.localVideo.nativeElement.srcObject = null;
  if (this.remoteVideo?.nativeElement) this.remoteVideo.nativeElement.srcObject = null;
  this.currentCallId = null;
}
```

## User Experience Flow

### Starting a Call
1. User clicks audio/video call button in chat header
2. System sends `call:request` to other user
3. Caller sees "Calling..." status and hears ringing tone
4. **Caller can cancel at any time** by clicking another button (not implemented) or waiting for answer/decline

### Receiving a Call
1. Incoming call banner appears with doctor/patient name and call type (audio/video)
2. User sees two prominent buttons:
   - **Accept** (green) - Answers the call
   - **Decline** (red) - Rejects the call
3. Ringing sound plays until action is taken

### During Active Call
1. Call panel appears showing:
   - Call participant name
   - Badge showing call type (AUDIO/VIDEO)
   - Video feeds (if video call)
   - **Prominent "Hang Up" button** (large, red, centered)
2. Clicking "Hang Up" immediately:
   - Ends the call
   - Stops all media streams
   - Closes peer connection
   - Notifies the other user
   - Removes call UI

## Visual Design

### Hang Up Button
- **Color**: Red gradient (`#ef4444` to `#dc2626`)
- **Size**: Large padding (`0.875rem x 1.75rem`)
- **Shape**: Rounded pill (`border-radius: 50px`)
- **Icon**: Phone slash icon with margin
- **Effects**:
  - Drop shadow for depth
  - Hover: Darker gradient + lift effect
  - Active: Subtle press-down effect
  - Smooth transitions (0.3s)

### Decline Button (Incoming Call)
- Same styling as regular danger button
- Clearly labeled "Decline"
- Positioned next to "Accept" button
- Red color to indicate rejection

## Socket Events

### Emitted Events
- `call:end` - When hanging up an active call
- `call:decline` - When declining an incoming call

### Listened Events
- `call:ended` - When the other user hangs up
- `call:declined` - When the other user declines (for caller)

## Benefits

1. **Clear User Control**: Users have obvious, one-click control over calls
2. **Consistent Experience**: Same functionality in both patient and doctor dashboards
3. **Visual Prominence**: Large, distinctive button that's easy to find and click
4. **Proper Cleanup**: All resources are properly released when call ends
5. **Real-time Sync**: Both parties are immediately notified when a call ends

## Testing Checklist

- [ ] Click "Hang Up" during audio call as patient
- [ ] Click "Hang Up" during video call as patient
- [ ] Click "Hang Up" during audio call as doctor
- [ ] Click "Hang Up" during video call as doctor
- [ ] Click "Decline" on incoming call as patient
- [ ] Click "Decline" on incoming call as doctor
- [ ] Verify media streams stop after hang up
- [ ] Verify other user receives call ended notification
- [ ] Verify UI returns to normal chat state
- [ ] Test button hover effects
- [ ] Test button disabled states
- [ ] Verify no console errors after ending calls

## Future Enhancements

1. **Call Timer**: Show call duration while in call
2. **Cancel Outgoing Call**: Add button to cancel while dialing
3. **Call History**: Log all calls in message history
4. **Confirmation Dialog**: Ask for confirmation before ending long calls
5. **Keyboard Shortcuts**: Allow Esc key to end calls
6. **Call Quality Indicator**: Show connection quality
7. **Mute/Unmute**: Add audio control buttons
8. **Camera Toggle**: Add camera on/off for video calls

## Files Modified

### Patient Dashboard
- `src/app/portals/patient/messages/messages.component.ts`
  - Updated HTML template with hang-up button
  - Added hang-up button CSS styling

### Doctor Dashboard  
- `src/app/portals/doctor/doctor-messages/doctor-doctor-messages.component.html`
  - Updated HTML template with hang-up button
- `src/app/portals/doctor/doctor-messages/doctor-doctor-messages.component.scss`
  - Added hang-up button SCSS styling

## Summary

The hang-up functionality provides users with clear, immediate control over voice and video calls in both patient and doctor messaging interfaces. The implementation ensures proper cleanup of WebRTC resources, real-time synchronization between users, and a consistent, intuitive user experience with prominent visual design that makes the hang-up action obvious and accessible.
