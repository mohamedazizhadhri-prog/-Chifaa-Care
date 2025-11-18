// PART 1: Add these methods at the END of doctor-doctor-messages.component.ts
// After the processQueuedIceCandidates method

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

  // IMPROVED RINGING - Repeating two-tone pattern
  private startRinging(outgoing: boolean): void {
    console.log('[Doctor Chat] 🔔 Starting ring tone:', outgoing ? 'outgoing' : 'incoming');
    
    this.stopRinging(); // Clean up any existing ring
    
    try {
      this.audioCtx = this.audioCtx || new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume if suspended
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      
      // Different frequencies for incoming/outgoing
      const freq1 = outgoing ? 480 : 520;
      const freq2 = outgoing ? 620 : 660;
      
      // Different intervals (slower for outgoing, faster for incoming)
      const interval = outgoing ? 2000 : 1000;
      
      // Create repeating pattern
      this.ringInterval = setInterval(() => {
        this.playTone(freq1, 0.2, 400);
        setTimeout(() => this.playTone(freq2, 0.2, 400), 400);
      }, interval);
      
    } catch (error) {
      console.error('[Doctor Chat] Error starting ring:', error);
    }
  }

  // Helper to play a single tone
  private playTone(frequency: number, volume: number, duration: number): void {
    if (!this.audioCtx) return;
    
    try {
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
    } catch (error) {
      console.error('[Doctor Chat] Error playing tone:', error);
    }
  }

  private stopRinging(): void {
    console.log('[Doctor Chat] 🔕 Stopping ring tone');
    
    // Clear interval
    if (this.ringInterval) {
      clearInterval(this.ringInterval);
      this.ringInterval = null;
    }
    
    // Clean up Web Audio
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

  acceptIncoming(): void {
    console.log('[Doctor Chat] ✅ Accepting incoming call');
    if (!this.currentUser?.id || !this.incomingFromUserId) return;
    this.socketService.emit('call:accept', { 
      fromUserId: this.currentUser.id,
      toUserId: this.incomingFromUserId
    });
  }

  declineIncoming(): void {
    console.log('[Doctor Chat] ❌ Declining incoming call');
    if (!this.currentUser?.id || !this.incomingFromUserId) return;
    this.socketService.emit('call:decline', { 
      fromUserId: this.currentUser.id, 
      toUserId: this.incomingFromUserId 
    });
    this.cleanupCall();
  }

  cleanupInactiveConversations(): void {
    if (!this.currentUser?.id || this.isCleaningUp) return;
    
    this.isCleaningUp = true;
    this.cleanupMessage = '';
    
    this.messageService.cleanupInactiveMessages(this.currentUser.id).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          const { deleted, inactiveUserCount } = response.data;
          
          if (deleted > 0) {
            console.log(`[Doctor Chat] Cleaned up ${deleted} messages from ${inactiveUserCount} inactive doctors`);
            this.cleanupMessage = `Removed ${deleted} messages from ${inactiveUserCount} inactive doctor(s)`;
            this.loadConversations();
            setTimeout(() => {
              this.cleanupMessage = '';
            }, 5000);
          }
        }
        this.isCleaningUp = false;
      },
      error: (error) => {
        console.error('[Doctor Chat] Error cleaning up:', error);
        this.cleanupMessage = 'Error cleaning up conversations';
        this.isCleaningUp = false;
        setTimeout(() => {
          this.cleanupMessage = '';
        }, 5000);
      }
    });
  }

  refreshConversations(): void {
    this.cleanupInactiveConversations();
  }
}
