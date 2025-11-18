// PART 3: WebRTC Call Signaling Listeners and Call Control Methods
// Add these methods to the DoctorMessagesComponentWithCalls class

private setupSignalingListeners(): void {
  console.log('[Doctor Messages] Setting up call signaling listeners...');
  
  this.socketService.on('call:incoming', async (p: { fromUserId: string; toUserId: string; media: 'audio' | 'video' }) => {
    console.log('[Doctor Messages] Incoming call:', p);
    if (!this.currentDoctorId || p.toUserId !== this.currentDoctorId) {
      return;
    }
    this.mediaType = p.media;
    this.selectedChatId = p.fromUserId;
    this.incomingCall = true;
    this.incomingFromUserId = p.fromUserId;
    this.startRinging(false);
  });

  this.socketService.on('call:offer', async (p: { fromUserId: string; toUserId: string; sdp: any }) => {
    if (!this.currentDoctorId || p.toUserId !== this.currentDoctorId) return;
    if (!this.pc) await this.preparePeer(this.mediaType);
    await this.pc!.setRemoteDescription(new RTCSessionDescription(p.sdp));
    await this.processQueuedIceCandidates();
    const answer = await this.pc!.createAnswer();
    await this.pc!.setLocalDescription(answer);
    this.socketService.emit('call:answer', { 
      fromUserId: this.currentDoctorId, 
      toUserId: p.fromUserId, 
      sdp: answer
    });
    this.stopRinging();
    this.inCall = true;
    this.incomingCall = false;
  });

  this.socketService.on('call:answer', async (p: { fromUserId: string; toUserId: string; sdp: any }) => {
    if (!this.currentDoctorId || p.toUserId !== this.currentDoctorId) return;
    await this.pc?.setRemoteDescription(new RTCSessionDescription(p.sdp));
    await this.processQueuedIceCandidates();
  });

  this.socketService.on('call:ice-candidate', async (p: { fromUserId: string; toUserId: string; candidate: any }) => {
    if (!this.currentDoctorId || p.toUserId !== this.currentDoctorId) return;
    try {
      if (!this.pc) {
        console.warn('Received ICE candidate but no peer connection');
        return;
      }
      if (!this.pc.remoteDescription) {
        console.log('Queueing ICE candidate');
        this.iceCandidateQueue.push(new RTCIceCandidate(p.candidate));
        return;
      }
      await this.pc.addIceCandidate(new RTCIceCandidate(p.candidate));
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  });

  this.socketService.on('call:ended', (p: { fromUserId: string; toUserId: string }) => {
    if (!this.currentDoctorId || p.toUserId !== this.currentDoctorId) return;
    this.cleanupCall();
  });

  this.socketService.on('call:accepted', async (p: { fromUserId: string; toUserId: string; callId?: string }) => {
    if (!this.currentDoctorId || p.toUserId !== this.currentDoctorId) return;
    this.stopRinging();
    this.dialing = false;
    if (p.callId) this.currentCallId = p.callId;
    await this.preparePeer(this.mediaType);
    const offer = await this.pc!.createOffer();
    await this.pc!.setLocalDescription(offer);
    this.socketService.emit('call:offer', { 
      fromUserId: this.currentDoctorId,
      toUserId: p.fromUserId,
      sdp: offer
    });
    this.inCall = true;
  });

  this.socketService.on('call:declined', (p: { fromUserId: string; toUserId: string }) => {
    if (!this.currentDoctorId || p.toUserId !== this.currentDoctorId) return;
    this.stopRinging();
    this.dialing = false;
    this.cleanupCall();
  });

  this.socketService.on('call:started', (p: { callId: string; startedAt: string }) => {
    if (p?.callId) this.currentCallId = p.callId;
  });
}

// Public call control methods
async startCall(type: 'audio' | 'video'): Promise<void> {
  if (!this.currentDoctorId || !this.selectedChatId) return;
  this.mediaType = type;
  
  console.log('[Doctor Messages] Starting call:', {
    from: this.currentDoctorId,
    to: this.selectedChatId,
    type: type
  });
  
  this.socketService.emit('call:request', { 
    fromUserId: this.currentDoctorId, 
    toUserId: this.selectedChatId, 
    media: type 
  });
  this.dialing = true;
  this.startRinging(true);
}

acceptIncoming(): void {
  if (!this.currentDoctorId || !this.incomingFromUserId) return;
  this.socketService.emit('call:accept', { 
    fromUserId: this.currentDoctorId,
    toUserId: this.incomingFromUserId
  });
}

declineIncoming(): void {
  if (!this.currentDoctorId || !this.incomingFromUserId) return;
  this.socketService.emit('call:decline', { 
    fromUserId: this.currentDoctorId, 
    toUserId: this.incomingFromUserId 
  });
  this.cleanupCall();
}

endCall(): void {
  if (this.currentDoctorId && this.selectedChatId) {
    this.socketService.emit('call:end', { 
      fromUserId: this.currentDoctorId, 
      toUserId: this.selectedChatId, 
      callId: this.currentCallId 
    });
  }
  this.cleanupCall();
}

toggleMicrophone(): void {
  if (!this.localStream) return;
  const audioTrack = this.localStream.getAudioTracks()[0];
  if (audioTrack) {
    audioTrack.enabled = !audioTrack.enabled;
    this.isMuted = !audioTrack.enabled;
  }
}

toggleCamera(): void {
  if (!this.localStream) return;
  const videoTrack = this.localStream.getVideoTracks()[0];
  if (videoTrack) {
    videoTrack.enabled = !videoTrack.enabled;
    this.isCameraOff = !videoTrack.enabled;
  }
}

// Private WebRTC helper methods
private async preparePeer(type: 'audio' | 'video'): Promise<void> {
  this.cleanupCall();
  
  const config: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' }
    ]
  };
  
  this.pc = new RTCPeerConnection(config);
  
  this.pc.onicecandidate = (e) => {
    if (e.candidate && this.currentDoctorId && this.selectedChatId) {
      this.socketService.emit('call:ice-candidate', { 
        fromUserId: this.currentDoctorId,
        toUserId: this.selectedChatId,
        candidate: e.candidate 
      });
    }
  };
  
  this.pc.ontrack = (ev) => {
    console.log('Received remote track:', ev.track.kind);
    if (!this.remoteStream) this.remoteStream = new MediaStream();
    this.remoteStream.addTrack(ev.track);
    if (this.remoteVideo?.nativeElement) {
      this.remoteVideo.nativeElement.srcObject = this.remoteStream;
    }
  };
  
  this.pc.onconnectionstatechange = () => {
    console.log('Connection state:', this.pc?.connectionState);
    if (this.pc?.connectionState === 'failed' || 
        this.pc?.connectionState === 'disconnected' ||
        this.pc?.connectionState === 'closed') {
      this.endCall();
    }
  };
  
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
    this.localStream.getTracks().forEach(t => this.pc!.addTrack(t, this.localStream!));
    
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

private cleanupCall(): void {
  this.inCall = false;
  this.dialing = false;
  this.incomingCall = false;
  this.incomingFromUserId = null;
  this.isMuted = false;
  this.isCameraOff = false;
  this.stopRinging();
  this.iceCandidateQueue = [];
  
  if (this.pc) {
    this.pc.onicecandidate = null;
    this.pc.ontrack = null as any;
    this.pc.onconnectionstatechange = null;
    try { 
      this.pc.close(); 
    } catch (error) {
      console.error('Error closing peer connection:', error);
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

private startRinging(outgoing: boolean): void {
  try {
    this.stopRinging();
    this.audioCtx = this.audioCtx || new (window.AudioContext || (window as any).webkitAudioContext)();
    this.ringOsc = this.audioCtx.createOscillator();
    this.ringGain = this.audioCtx.createGain();
    this.ringOsc.type = 'sine';
    this.ringOsc.frequency.value = outgoing ? 440 : 480;
    this.ringGain.gain.value = 0.05;
    this.ringOsc.connect(this.ringGain).connect(this.audioCtx.destination);
    this.ringOsc.start();
  } catch {}
}

private stopRinging(): void {
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
