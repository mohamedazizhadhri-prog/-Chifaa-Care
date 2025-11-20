# Doctor Messages - Calling Flow Diagram

## 📞 Complete Call Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    DOCTOR A (Caller)                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1. Clicks phone icon 📞
                              ▼
                    ┌─────────────────────┐
                    │   startCall('audio') │
                    │   State: IDLE        │
                    │        ↓             │
                    │   State: DIALING     │
                    └─────────────────────┘
                              │
                              │ 2. Emit: call:request
                              │    {from: A, to: B, media: audio}
                              │
                    🔊 Start Ringing (outgoing)
                    🎵 Beep-beep... (every 2 sec)
                    💬 Shows: "Calling..."
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SOCKET SERVER                              │
│  Routes: call:request from A → to B                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 3. Emit: call:incoming
                              │    {from: A, to: B, media: audio}
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DOCTOR B (Callee)                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                    Receives call:incoming
                              │
                    🔔 Start Ringing (incoming)
                    🎵 Beep-beep-beep... (every 1 sec)
                    🪟 Shows: Incoming Call Banner
                    ┌─────────────────────┐
                    │  [Accept] [Decline] │
                    └─────────────────────┘
                              │
                              │ 4. Doctor B clicks [Accept]
                              ▼
                    Emit: call:accept
                    {from: B, to: A}
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SOCKET SERVER                              │
│  1. Creates CallLog in database                                 │
│  2. Emits call:accepted to A                                   │
│  3. Emits call:started to B                                    │
└─────────────────────────────────────────────────────────────────┘
                    │                    │
        call:accepted│                    │call:started
                    │                    │
                    ▼                    ▼
            ┌─────────────┐      ┌─────────────┐
            │  DOCTOR A   │      │  DOCTOR B   │
            │             │      │             │
            │ 🔇 Stop ring│      │ 🔇 Stop ring│
            │ State:      │      │ State:      │
            │ CONNECTING  │      │ CONNECTING  │
            └─────────────┘      └─────────────┘
                    │                    │
                    │ 5. WebRTC Setup    │
                    │◄──────────────────►│
                    │                    │
                    │ A creates offer    │
                    │ (SDP)              │
                    │─────────────────►  │
                    │   call:offer       │
                    │                    │
                    │ B creates answer   │
                    │ (SDP)              │
                    │  ◄─────────────────│
                    │   call:answer      │
                    │                    │
                    │ Exchange ICE       │
                    │ candidates         │
                    │◄──────────────────►│
                    │ call:ice-candidate │
                    │                    │
                    ▼                    ▼
            ┌─────────────┐      ┌─────────────┐
            │  CONNECTED  │      │  CONNECTED  │
            │             │◄────►│             │
            │ 🎙️ Audio    │      │ 🎙️ Audio    │
            │ 📹 Video    │  OR  │ 📹 Video    │
            │ (if video)  │      │ (if video)  │
            │             │      │             │
            │ 💬 "In Call"│      │ 💬 "In Call"│
            │ ⏱️ Timer    │      │ ⏱️ Timer    │
            │             │      │             │
            │ [End Call]  │      │ [End Call]  │
            └─────────────┘      └─────────────┘
                    │                    │
                    │ 6. Someone clicks  │
                    │    [End Call]      │
                    │                    │
                    ▼                    │
            Emit: call:end               │
            {from: A, to: B,             │
             callId: xxx}                │
                    │                    │
                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SOCKET SERVER                              │
│  1. Updates CallLog with endedAt                               │
│  2. Calculates duration                                         │
│  3. Emits call:ended to both                                   │
└─────────────────────────────────────────────────────────────────┘
                    │                    │
                    ▼                    ▼
            ┌─────────────┐      ┌─────────────┐
            │  DOCTOR A   │      │  DOCTOR B   │
            │             │      │             │
            │ cleanupCall()│      │ cleanupCall()│
            │ Stop streams│      │ Stop streams│
            │ Close peer  │      │ Close peer  │
            │ State: IDLE │      │ State: IDLE │
            └─────────────┘      └─────────────┘
```

---

## 🎵 Audio States

### Outgoing Call (Doctor A)
```
State: DIALING
Sound: 🔊 Beep-beep... (pause 2 sec) ...Beep-beep...
Frequency: 480 Hz + 620 Hz
Visual: "Calling..." with yellow badge
```

### Incoming Call (Doctor B)
```
State: RINGING  
Sound: 🔔 Beep-beep-beep... (pause 1 sec) ...Beep-beep-beep...
Frequency: 520 Hz + 660 Hz  
Visual: Incoming call banner with animation
```

### Connected (Both)
```
State: CONNECTED
Sound: 🔇 Silence (audio stream active)
Visual: "In Call" with green badge + timer
```

---

## 🎨 Visual States

### 1. Idle (No Call)
```
┌─────────────────────────────────┐
│ Dr. Smith          [Online]     │
│                    📞 🎥         │  ← Enabled buttons
└─────────────────────────────────┘
```

### 2. Dialing (Outgoing)
```
┌─────────────────────────────────┐
│ Dr. Smith          [Online]     │
│ 📞 Calling... (pulsing)         │  ← Yellow badge
│                    🚫 🚫         │  ← Disabled buttons
└─────────────────────────────────┘
```

### 3. Ringing (Incoming)
```
┌─────────────────────────────────────────────┐
│           📞 Incoming Audio Call            │
│                                             │
│              👨‍⚕️ Dr. Smith                  │
│                                             │
│       [✓ Accept]        [✗ Decline]        │
│                                             │
│  ⭕ ⭕ ⭕ (ripple animation)                 │
└─────────────────────────────────────────────┘
```

### 4. Connected
```
┌─────────────────────────────────┐
│ Dr. Smith          [Online]     │
│ 📞 In Call ⏱️ 02:34             │  ← Green badge with timer
│                                 │
│ ┌─────────────────────────────┐│
│ │   🎙️ Audio Stream Active   ││  ← Call panel
│ │                             ││
│ │   [🎤] [📞 End] [🔊]        ││  ← Controls
│ └─────────────────────────────┘│
└─────────────────────────────────┘
```

---

## 🔊 Sound Implementation

### Two-Tone Pattern
```javascript
// Outgoing (slower, calmer)
Tone 1: 480 Hz for 400ms
Wait:   200ms
Tone 2: 620 Hz for 400ms  
Wait:   2000ms (2 seconds)
Repeat...

// Incoming (faster, urgent)
Tone 1: 520 Hz for 400ms
Wait:   200ms
Tone 2: 660 Hz for 400ms
Wait:   1000ms (1 second)
Repeat...
```

### Code Structure
```
startRinging(outgoing: boolean)
  ↓
  Creates AudioContext
  ↓
  Sets up interval timer
  ↓
  Each interval calls:
    playTone(freq1, 0.2, 400ms)
    wait 400ms
    playTone(freq2, 0.2, 400ms)
  ↓
  Repeats until stopRinging()
```

---

## 🐛 Debug Checkpoints

### Checkpoint 1: Call Initiated
```
✅ Console: "[Doctor Chat] Starting call: {from:..., to:..., type:...}"
✅ Sound: Hear outgoing ring
✅ Visual: "Calling..." badge appears
✅ Socket: Emits call:request
```

### Checkpoint 2: Call Received
```
✅ Console: "[Doctor Chat] 📞 Incoming call: {from:..., to:..., media:...}"
✅ Sound: Hear incoming ring (different from outgoing)
✅ Visual: Incoming call banner with Accept/Decline
✅ Socket: Receives call:incoming
```

### Checkpoint 3: Call Accepted
```
✅ Console: "[Doctor Chat] 🔕 Stopping ring tone"
✅ Sound: Ringing stops
✅ Visual: "Connecting..." then "In Call"
✅ Socket: Emits call:accept, receives call:offer
```

### Checkpoint 4: Call Connected
```
✅ Console: "Received remote track: audio"
✅ Sound: Can hear other person
✅ Visual: Call panel with controls
✅ WebRTC: Peer connection state = "connected"
```

### Checkpoint 5: Call Ended
```
✅ Console: "[Doctor Chat] Cleaning up call"
✅ Sound: Audio streams stopped
✅ Visual: Back to idle state
✅ Socket: Emits call:end
```

---

## 📝 Key Points

1. **Ringing is automatic**: Starts as soon as you click call
2. **Different sounds**: Outgoing vs incoming have different tones
3. **Visual feedback**: Color-coded badges show call state
4. **Socket events**: All communication goes through Socket.IO
5. **WebRTC for audio/video**: Peer-to-peer connection for media
6. **Cleanup is important**: Always stop streams and close connections

---

## 🎯 Success Criteria

Your implementation is working correctly when:

✅ **Outgoing call**: You hear a ring tone immediately
✅ **Incoming call**: Other person sees banner and hears different ring
✅ **Connection**: Ring stops, shows "In Call", audio works
✅ **Ending**: Cleans up properly, no hanging connections
✅ **Multiple calls**: Can make/receive multiple calls without issues

---

## 🚨 Common Mistakes to Avoid

❌ **Don't** create peer connection before call is accepted
❌ **Don't** forget to stop ringing when call connects
❌ **Don't** use same ring tone for incoming/outgoing
❌ **Don't** forget to cleanup on unmount
❌ **Don't** start ringing in preparePeer() - start in startCall()

✅ **Do** start ringing immediately in startCall()
✅ **Do** use different tones for incoming/outgoing
✅ **Do** stop ringing before preparePeer()
✅ **Do** cleanup all resources in cleanupCall()
✅ **Do** handle errors gracefully

---

That's it! Your calling feature should now work with proper ringing! 🎉
