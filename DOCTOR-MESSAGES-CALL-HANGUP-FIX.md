# Doctor Messages - Call Hang-Up Fix

## Issue Description
When a doctor initiated a call (audio or video) to a patient from the messages section (`/doctor/messages`), if the patient didn't answer, the call would keep ringing indefinitely with no option to hang up or cancel the call. This only affected the doctor messages section - the hang-up functionality worked correctly in all other parts of the application.

## Root Cause
The template was missing a hang-up button that should appear during the "dialing" (ringing) state. The call buttons were disabled during dialing (`[disabled]="inCall || dialing"`), but there was no alternative way to cancel the outgoing call.

## Solution Implemented

### 1. Added Hang-Up Button in Template
**File:** `src/app/portals/doctor/messages/doctor-messages-patient.template.html`

Added a new hang-up button that appears when either `dialing` or `inCall` states are active:

```html
<!-- Hang up button for dialing/in-call states -->
<button 
  *ngIf="dialing || inCall"
  class="btn btn-danger" 
  (click)="endCall()"
  title="End call"
  style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;">
  <i class="fa-solid fa-phone-slash"></i>
</button>
```

**Location:** Added in the chat header actions area, right after the call status indicators.

### 2. Enhanced endCall() Method
**File:** `src/app/portals/doctor/messages/doctor-messages.component.ts`

Updated the `endCall()` method to properly handle both dialing and active call states:

```typescript
endCall(): void {
  console.log('[Doctor Messages] Ending call. State:', { dialing: this.dialing, inCall: this.inCall });
  
  // If we're dialing, send cancel signal
  if (this.dialing && this.currentDoctorId && this.selectedChatId) {
    this.socketService.emit('call:cancel', { 
      fromUserId: this.currentDoctorId, 
      toUserId: this.selectedChatId
    });
  }
  
  // If in active call, send end signal
  if (this.inCall && this.currentDoctorId && this.selectedChatId) {
    this.socketService.emit('call:end', { 
      fromUserId: this.currentDoctorId, 
      toUserId: this.selectedChatId, 
      callId: this.currentCallId 
    });
  }
  
  this.cleanupCall();
}
```

**Changes:**
- Added separate handling for dialing state (sends `call:cancel` event)
- Retained existing handling for active calls (sends `call:end` event)
- Added console logging for debugging
- Always calls `cleanupCall()` to ensure proper cleanup

### 3. Added Socket Event Listeners
**File:** `src/app/portals/doctor/messages/doctor-messages.component.ts`

Added listeners for call cancellation events in the `setupSignalingListeners()` method:

```typescript
this.socketService.on('call:cancelled', (p: { fromUserId: string; toUserId: string }) => {
  if (!this.currentDoctorId || p.toUserId !== this.currentDoctorId) return;
  console.log('[Doctor Messages] Call cancelled by other party');
  this.cleanupCall();
});

this.socketService.on('call:cancel', (p: { fromUserId: string; toUserId: string }) => {
  if (!this.currentDoctorId || p.toUserId !== this.currentDoctorId) return;
  console.log('[Doctor Messages] Call cancel received');
  this.cleanupCall();
});
```

**Purpose:** Ensures that if a call is cancelled by either party, both sides properly clean up their call state.

## How It Works

### Call Flow with Hang-Up

1. **Initiating Call:**
   - Doctor clicks audio/video call button
   - `startCall()` is triggered
   - `dialing` state is set to `true`
   - Ringing sound starts
   - Hang-up button appears (red phone-slash icon)

2. **Cancelling Call (Before Answer):**
   - Doctor clicks the hang-up button
   - `endCall()` detects `dialing === true`
   - Emits `call:cancel` socket event
   - Calls `cleanupCall()` which:
     - Stops ringing sound
     - Resets all call states
     - Closes peer connection if any
     - Stops media streams

3. **Ending Call (After Answer):**
   - Doctor clicks the hang-up button during active call
   - `endCall()` detects `inCall === true`
   - Emits `call:end` socket event with call ID
   - Calls `cleanupCall()` for full cleanup

## Visual Changes

### Before Fix
- Call buttons (audio/video) were visible
- When dialing: buttons disabled, "Calling..." indicator shown
- **No way to cancel the call** ❌

### After Fix
- Call buttons (audio/video) are visible
- When dialing: buttons disabled, "Calling..." indicator shown
- **Red hang-up button appears** ✅
- When in call: hang-up button remains visible
- Hang-up button works in both dialing and active call states

## Testing Checklist

- [x] Doctor can initiate audio call
- [x] Doctor can initiate video call
- [x] Hang-up button appears when dialing
- [x] Hang-up button stops the call while dialing
- [x] Ringing sound stops when call is cancelled
- [x] Hang-up button appears when in active call
- [x] Hang-up button ends active call properly
- [x] Call state is properly cleaned up after hang-up
- [x] Other calling features still work (other sections of the app)

## Files Modified

1. `src/app/portals/doctor/messages/doctor-messages-patient.template.html`
   - Added hang-up button in chat header actions

2. `src/app/portals/doctor/messages/doctor-messages.component.ts`
   - Enhanced `endCall()` method with separate dialing/active call handling
   - Added `call:cancelled` and `call:cancel` event listeners

## Notes

- The fix only affects the doctor messages section (`/doctor/messages`)
- No changes were needed to the backend - all socket events are already supported
- The hang-up button uses the same styling as the danger button for consistency
- Console logging added for easier debugging of call states
- The fix maintains backward compatibility with existing call functionality

## Related Files

- Socket Service: `src/app/services/socket.service.ts`
- Message Service: `src/app/services/message.service.ts`
- Auth Service: `src/app/services/auth.service.ts`

## Status
✅ **FIXED** - Hang-up functionality now works correctly in the doctor messages section during both dialing and active call states.
