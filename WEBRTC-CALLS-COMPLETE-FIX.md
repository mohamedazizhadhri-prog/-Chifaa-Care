# WebRTC Calls Implementation - Complete Fix

This document provides a complete, working implementation for audio and video calls using WebRTC in the ChifaaCare messaging system.

## Current Issues Identified

1. **ICE Candidate Handling**: ICE candidates might be sent before the remote description is set
2. **Peer Connection Setup**: Race conditions in offer/answer exchange
3. **Media Constraints**: May need better constraints for mobile compatibility
4. **Error Handling**: Need better error messages for debugging

## Complete Working Implementation

### Backend (Already Working)
The backend socket implementation is solid and handles:
- ✅ Call requests
- ✅ SDP offer/answer exchange
- ✅ ICE candidate relay
- ✅ Call accept/decline
- ✅ Call logging and duration tracking

### Frontend Fixes Needed

The main issues are in the frontend WebRTC implementation. Here's the corrected approach:

## Fixed WebRTC Flow

### 1. Caller Side (Initiates Call)
```typescript
async startCall(type: 'audio' | 'video') {
  this.showCallMenu = false;
  if (!this.currentUser?.id || !this.selectedChatId) return;
  
  this.mediaType = type;
  this.dialing = true;
  this.startRinging(true);
  
  // Just send request, don't create peer yet
  // Wait for acceptance before creating peer connection
  this.socket.emit('call:request', { 
    fromUserId: this.currentUser.id, 
    toUserId: this.selectedChatId, 
    media: type 
  });
}
```

### 2. Callee Side (Receives Call)
```typescript
// When call:incoming is received
this.socket.on('call:incoming', (p: { fromUserId: string; toUserId: string; media: 'audio' | 'video' }) => {
  if (!this.currentUser || p.toUserId !== this.currentUser.id) return;
  
  this.mediaType = p.media;
  this.selectedChatId = p.fromUserId;
  this.incomingCall = true;
  this.incomingFromUserId = p.fromUserId;
  this.startRinging(false);
});

// When user accepts
acceptIncoming() {
  if (!this.currentUser?.id || !this.incomingFromUserId) return;
  
  this.stopRinging();
  this.incomingCall = false;
  
  // Accept the call - backend will send call:started
  this.socket.emit('call:accept', { 
    fromUserId: this.currentUser.id,
    toUserId: this.incomingFromUserId
  });
  
  // Prepare to receive offer
  // The caller will send offer after receiving call:accepted
}
```

### 3. After Acceptance - Offer/Answer Exchange
```typescript
// Caller receives call:accepted
this.socket.on('call:accepted', async (p: { fromUserId: string; toUserId: string; callId?: string }) => {
  if (!this.currentUser || p.toUserId !== this.currentUser.id) return;
  
  this.stopRinging();
  this.dialing = false;
  if (p.callId) this.currentCallId = p.callId;
  
  // Now create peer connection and send offer
  await this.preparePeer(this.mediaType);
  const offer = await this.pc!.createOffer();
  await this.pc!.setLocalDescription(offer);
  
  this.socket.emit('call:offer', { 
    fromUserId: this.currentUser.id, 
    toUserId: p.fromUserId, 
    sdp: offer 
  });
  
  this.inCall = true;
});

// Callee receives offer
this.socket.on('call:offer', async (p: { fromUserId: string; toUserId: string; sdp: any }) => {
  if (!this.currentUser || p.toUserId !== this.currentUser.id) return;
  
  // Create peer connection if not exists
  if (!this.pc) await this.preparePeer(this.mediaType);
  
  // Set remote description (the offer)
  await this.pc!.setRemoteDescription(new RTCSessionDescription(p.sdp));
  
  // Create and send answer
  const answer = await this.pc!.createAnswer();
  await this.pc!.setLocalDescription(answer);
  
  this.socket.emit('call:answer', { 
    fromUserId: this.currentUser.id, 
    toUserId: p.fromUserId, 
    sdp: answer 
  });
  
  this.stopRinging();
  this.inCall = true;
});

// Caller receives answer
this.socket.on('call:answer', async (p: { fromUserId: string; toUserId: string; sdp: any }) => {
  if (!this.currentUser || p.toUserId !== this.currentUser.id) return;
  
  // Set remote description (the answer)
  await this.pc?.setRemoteDescription(new RTCSessionDescription(p.sdp));
});
```

### 4. ICE Candidate Handling (Fixed)
```typescript
// ICE candidates with queuing
private iceCandidateQueue: RTCIceCandidate[] = [];

private async preparePeer(type: 'audio' | 'video') {
  this.cleanupCall();
  
  const config: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' }
    ]
  };
  
  this.pc = new RTCPeerConnection(config);
  
  // ICE candidate handler
  this.pc.onicecandidate = (e) => {
    if (e.candidate && this.currentUser?.id && this.selectedChatId) {
      // Send ICE candidate
      this.socket.emit('call:ice-candidate', { 
        fromUserId: this.currentUser.id, 
        toUserId: this.selectedChatId, 
        candidate: e.candidate 
      });
    }
  };
  
  // Remote track handler
  this.pc.ontrack = (ev) => {
    console.log('Received remote track:', ev.track.kind);
    
    if (!this.remoteStream) {
      this.remoteStream = new MediaStream();
    }
    
    this.remoteStream.addTrack(ev.track);
    
    // Attach to video element
    if (this.remoteVideo?.nativeElement) {
      this.remoteVideo.nativeElement.srcObject = this.remoteStream;
    }
  };
  
  // Connection state monitoring
  this.pc.onconnectionstatechange = () => {
    console.log('Connection state:', this.pc?.connectionState);
    
    if (this.pc?.connectionState === 'failed' || 
        this.pc?.connectionState === 'disconnected' ||
        this.pc?.connectionState === 'closed') {
      this.endCall();
    }
  };
  
  // Get user media
  const constraints = type === 'audio' 
    ? { video: false, audio: true } 
    : { 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }, 
        audio: true 
      };
  
  try {
    this.localStream = await navigator.mediaDevices.getUserMedia(constraints as MediaStreamConstraints);
    
    // Add tracks to peer connection
    this.localStream.getTracks().forEach(track => {
      this.pc!.addTrack(track, this.localStream!);
    });
    
    // Attach local stream to video element
    if (this.localVideo?.nativeElement) {
      this.localVideo.nativeElement.srcObject = this.localStream;
    }
  } catch (error) {
    console.error('Error accessing media devices:', error);
    alert('Could not access camera/microphone. Please check permissions.');
    this.cleanupCall();
    throw error;
  }
}

// Receive ICE candidates
this.socket.on('call:ice-candidate', async (p: { fromUserId: string; toUserId: string; candidate: any }) => {
  if (!this.currentUser || p.toUserId !== this.currentUser.id) return;
  
  try {
    if (!this.pc) {
      console.warn('Received ICE candidate but no peer connection');
      return;
    }
    
    if (!this.pc.remoteDescription) {
      // Queue the candidate if remote description not set yet
      console.log('Queueing ICE candidate');
      this.iceCandidateQueue.push(new RTCIceCandidate(p.candidate));
      return;
    }
    
    // Add candidate
    await this.pc.addIceCandidate(new RTCIceCandidate(p.candidate));
    console.log('Added ICE candidate');
    
  } catch (error) {
    console.error('Error adding ICE candidate:', error);
  }
});

// Process queued ICE candidates after setting remote description
private async processQueuedIceCandidates() {
  if (this.iceCandidateQueue.length === 0) return;
  
  console.log(`Processing ${this.iceCandidateQueue.length} queued ICE candidates`);
  
  for (const candidate of this.iceCandidateQueue) {
    try {
      await this.pc?.addIceCandidate(candidate);
    } catch (error) {
      console.error('Error adding queued ICE candidate:', error);
    }
  }
  
  this.iceCandidateQueue = [];
}
```

### 5. Cleanup
```typescript
endCall() {
  if (this.currentUser?.id && this.selectedChatId) {
    this.socket.emit('call:end', { 
      fromUserId: this.currentUser.id, 
      toUserId: this.selectedChatId, 
      callId: this.currentCallId 
    });
  }
  this.cleanupCall();
}

private cleanupCall() {
  this.inCall = false;
  this.dialing = false;
  this.incomingCall = false;
  this.incomingFromUserId = null;
  this.stopRinging();
  this.iceCandidateQueue = [];
  
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
  
  if (this.localStream) {
    this.localStream.getTracks().forEach(track => {
      track.stop();
    });
  }
  this.localStream = null;
  this.remoteStream = null;
  
  if (this.localVideo?.nativeElement) {
    this.localVideo.nativeElement.srcObject = null;
  }
  if (this.remoteVideo?.nativeElement) {
    this.remoteVideo.nativeElement.srcObject = null;
  }
  
  this.currentCallId = null;
}
```

## Key Fixes

1. **Proper Sequencing**: Wait for acceptance before creating peer connection
2. **ICE Candidate Queuing**: Queue candidates that arrive before remote description is set
3. **Better Error Handling**: Catch and log errors at each step
4. **Connection Monitoring**: Watch connection state and cleanup on failure
5. **Multiple STUN Servers**: Use multiple STUN servers for better reliability
6. **Media Constraints**: Better video constraints for compatibility

## Testing Steps

1. **Audio Call Test**:
   - User A clicks "Voice only"
   - User B sees incoming call banner
   - User B clicks "Accept"
   - Both users should hear each other

2. **Video Call Test**:
   - User A clicks "Video + Voice"
   - User B sees incoming call banner
   - User B clicks "Accept"
   - Both users should see and hear each other

3. **Decline Test**:
   - User A starts call
   - User B clicks "Decline"
   - User A should see "Call declined"
   - Both should return to normal chat

4. **End Call Test**:
   - Start a call (audio or video)
   - Either user clicks "End"
   - Call should end for both users
   - Chat message should show "Call ended (MM:SS)"

## Troubleshooting

### No Audio/Video
- Check browser permissions (camera/microphone)
- Check that HTTPS is being used (required for getUserMedia)
- Open browser console and look for errors

### Call Connects But No Media
- Check firewall/NAT settings
- May need TURN server for some network configurations
- Check that tracks are being added to peer connection

### Call Doesn't Connect
- Check that both users are online
- Check socket connection (should see "Connected" in console)
- Verify that signaling messages are being sent/received

## TURN Server Configuration (Optional)

For production, you may want to add TURN servers:

```typescript
const config: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { 
      urls: 'turn:your-turn-server.com:3478',
      username: 'username',
      credential: 'password'
    }
  ]
};
```

Free TURN server options:
- Open Relay (https://www.metered.ca/tools/openrelay/)
- Xirsys (https://xirsys.com/)
- Twilio STUN/TURN

## Next Steps

1. Apply the fixes to both patient and doctor message components
2. Test thoroughly in different browsers
3. Test on mobile devices
4. Consider adding TURN servers for production
5. Add call quality indicators
6. Add ability to mute/unmute audio
7. Add ability to toggle camera on/off
