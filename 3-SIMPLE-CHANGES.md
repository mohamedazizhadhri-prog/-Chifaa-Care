# 3 SIMPLE CHANGES TO FIX CALLING

## Change 1: Add ringInterval property (line ~68)

Find this line:
```typescript
private ringGain?: GainNode;
```

Add AFTER it:
```typescript
private ringInterval: any = null;
```

---

## Change 2: Replace startRinging method (around line 700)

Find:
```typescript
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
```

Replace with:
```typescript
private startRinging(outgoing: boolean): void {
  console.log('[Doctor Chat] 🔔 Starting ring tone:', outgoing ? 'outgoing' : 'incoming');
  this.stopRinging();
  
  try {
    this.audioCtx = this.audioCtx || new (window.AudioContext || (window as any).webkitAudioContext)();
    
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    
    const freq1 = outgoing ? 480 : 520;
    const freq2 = outgoing ? 620 : 660;
    const interval = outgoing ? 2000 : 1000;
    
    this.ringInterval = setInterval(() => {
      this.playTone(freq1, 0.2, 400);
      setTimeout(() => this.playTone(freq2, 0.2, 400), 400);
    }, interval);
    
  } catch (error) {
    console.error('[Doctor Chat] Error starting ring:', error);
  }
}

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
```

---

## Change 3: Replace stopRinging method (after startRinging)

Find:
```typescript
private stopRinging(): void {
  try {
    if (this.ringOsc) { this.ringOsc.stop(); this.ringOsc.disconnect(); }
    if (this.ringGain) { this.ringGain.disconnect(); }
  } catch {}
  this.ringOsc = undefined as any;
  this.ringGain = undefined as any;
}
```

Replace with:
```typescript
private stopRinging(): void {
  console.log('[Doctor Chat] 🔕 Stopping ring tone');
  
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

---

## Change 4: Update ngOnDestroy (around line 105)

Find:
```typescript
ngOnDestroy(): void {
  this.cleanupCall();
  this.destroy$.next();
  this.destroy$.complete();
}
```

Replace with:
```typescript
ngOnDestroy(): void {
  this.cleanupCall();
  this.stopRinging();
  this.destroy$.next();
  this.destroy$.complete();
}
```

---

## Change 5: Update initializeComponent timeout (around line 110)

Find:
```typescript
setTimeout(() => {
  console.log('[Doctor Chat] Setting up listeners...');
  this.setupSocketListeners();
  this.setupSignalingListeners();
}, 500);
```

Replace with:
```typescript
setTimeout(() => {
  console.log('[Doctor Chat] Setting up listeners...');
  const isConnected = this.socketService.isConnected();
  console.log('[Doctor Chat] Socket connected:', isConnected);
  
  this.setupSocketListeners();
  this.setupSignalingListeners();
}, 1500); // Increased timeout
```

---

## THAT'S IT! 

Now just:
1. Save the file
2. Clear browser cache (Ctrl+Shift+Delete)
3. Restart `ng serve`
4. Test in Incognito mode (Ctrl+Shift+N)

You should now hear **beep-beep...beep-beep** repeating sounds when calling! 🎵
