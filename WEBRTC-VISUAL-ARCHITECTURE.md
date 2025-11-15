# WebRTC Call System - Visual Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         ChifaaCare System                        │
└─────────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│   Patient    │        │   Backend    │        │   Doctor     │
│   (Browser)  │        │   (Node.js)  │        │   (Browser)  │
└──────────────┘        └──────────────┘        └──────────────┘
```

## Message Flow Sequence

### 1. Call Initiation

```
Patient Browser                Backend Socket.IO              Doctor Browser
─────────────────              ──────────────────             ──────────────
       │                              │                              │
       │  call:request                │                              │
       │  { fromUserId, toUserId,     │                              │
       │    media: 'video' }           │                              │
       ├─────────────────────────────>│                              │
       │                              │  call:incoming               │
       │                              │  { fromUserId, toUserId,     │
       │                              │    media: 'video' }           │
       │                              ├─────────────────────────────>│
       │                              │                              │
       │                              │                         Show incoming
       │                              │                         call banner
       │                              │                              │
```

### 2. Call Acceptance & Peer Setup

```
Patient                          Backend                         Doctor
───────                          ───────                         ──────
       │                              │  call:accept               │
       │                              │<────────────────────────────┤
       │  call:accepted               │                              │
       │  { callId: 'abc123' }        │                         Create peer
       │<─────────────────────────────┤                         Get media
Create peer                            │                              │
Get media                              │                              │
       │                              │                              │
       │  call:offer                  │                              │
       │  { sdp: {...} }              │                              │
       ├─────────────────────────────>│  call:offer                 │
       │                              ├─────────────────────────────>│
       │                              │                         Set remote SDP
       │                              │                         Create answer
       │                              │                              │
       │                              │  call:answer                │
       │  call:answer                 │<─────────────────────────────┤
       │  { sdp: {...} }              │                              │
       │<─────────────────────────────┤                              │
Set remote SDP                         │                              │
       │                              │                              │
```

### 3. ICE Candidate Exchange (The Fix!)

```
Patient                          Backend                         Doctor
───────                          ───────                         ──────
       │                              │                              │
       │  ICE candidates start        │                              │
       ├────────────────────────────> │ ────────────────────────────>│
       │     (Queued if early!)       │     (Queued if early!)       │
       │                              │                              │
       │<──────────────────────────── │ <────────────────────────────┤
       │                              │                              │
After remote SDP set:                 │                After remote SDP set:
Process queued candidates              │                Process queued candidates
       │                              │                              │
       │  More ICE candidates         │                              │
       ├────────────────────────────> │ ────────────────────────────>│
       │  (Added immediately)         │  (Added immediately)         │
       │                              │                              │
       │<──────────────────────────── │ <────────────────────────────┤
       │                              │                              │
```

### 4. Connection Established

```
Patient                                                          Doctor
───────                                                          ──────
       │                                                             │
       │ ◄───────────────────────────────────────────────────────► │
       │              WebRTC Peer-to-Peer Connection                │
       │              (Audio/Video streams directly)                │
       │                                                             │
       │         ┌───────────────────────────────┐                  │
       │         │  Audio Stream  (bidirectional)│                  │
       │ ◄───────┤                               ├─────────────────►│
       │         │  Video Stream  (bidirectional)│                  │
       │         └───────────────────────────────┘                  │
       │                                                             │
```

### 5. Call Termination

```
Patient                          Backend                         Doctor
───────                          ───────                         ──────
       │  call:end                    │                              │
       │  { callId: 'abc123' }        │                              │
       ├─────────────────────────────>│                              │
       │                              │  call:ended                  │
       │                              ├─────────────────────────────>│
       │  call:ended                  │                              │
       │<─────────────────────────────┤                         Cleanup
Cleanup│                              │                         Stop media
Stop media                            │                         Close peer
Close peer                            │                              │
       │                              │                              │
```

## Component Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                        Frontend Components                       │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         PatientMessagesComponent                         │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  - selectedChatId                                        │  │
│  │  - inCall: boolean                                       │  │
│  │  - mediaType: 'audio' | 'video'                          │  │
│  │  - pc: RTCPeerConnection                                 │  │
│  │  - localStream: MediaStream                              │  │
│  │  - remoteStream: MediaStream                             │  │
│  │  - iceCandidateQueue: RTCIceCandidate[]  ◄── NEW!       │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  Methods:                                                │  │
│  │  - startCall(type)                                       │  │
│  │  - acceptIncoming()                                      │  │
│  │  - declineIncoming()                                     │  │
│  │  - preparePeer(type)          ◄── IMPROVED!             │  │
│  │  - processQueuedIceCandidates()  ◄── NEW!               │  │
│  │  - endCall()                                             │  │
│  │  - cleanupCall()              ◄── IMPROVED!             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         DoctorDoctorMessagesComponent                    │  │
│  │         (Same structure as above)                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         SocketService                                    │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  - socket: Socket                                        │  │
│  │  - connect(userId)                                       │  │
│  │  - emit(event, payload)                                  │  │
│  │  - on(event, handler)                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
                               │
                               │ WebSocket
                               │
┌────────────────────────────────────────────────────────────────┐
│                        Backend Services                          │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Socket.IO Server (socket.ts)                     │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  Events Handled:                                         │  │
│  │  - join(userId)                                          │  │
│  │  - call:request                                          │  │
│  │  - call:accept                                           │  │
│  │  - call:decline                                          │  │
│  │  - call:offer                                            │  │
│  │  - call:answer                                           │  │
│  │  - call:ice-candidate                                    │  │
│  │  - call:end                                              │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  Events Emitted:                                         │  │
│  │  - call:incoming                                         │  │
│  │  - call:accepted                                         │  │
│  │  - call:started                                          │  │
│  │  - call:declined                                         │  │
│  │  - call:offer                                            │  │
│  │  - call:answer                                           │  │
│  │  - call:ice-candidate                                    │  │
│  │  - call:ended                                            │  │
│  │  - message:new (for call logs)                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Prisma Database                                  │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  Tables:                                                 │  │
│  │  - CallLog (id, callerId, calleeId, startedAt,          │  │
│  │             endedAt, durationSec, status)                │  │
│  │  - Message (for call start/end messages)                │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

## State Machine

```
┌─────────────┐
│    IDLE     │ ◄──── Initial state
└──────┬──────┘
       │
       │ User clicks "Request Call"
       │
       ▼
┌─────────────┐
│   DIALING   │ ◄──── Ringing sound plays
└──────┬──────┘
       │
       ├─────────────────┐
       │                 │
       │ Accepted        │ Declined
       │                 │
       ▼                 ▼
┌─────────────┐   ┌─────────────┐
│ CONNECTING  │   │    IDLE     │
└──────┬──────┘   └─────────────┘
       │
       │ ICE candidates exchanged
       │ Media tracks established
       │
       ▼
┌─────────────┐
│  CONNECTED  │ ◄──── Audio/Video flowing
└──────┬──────┘
       │
       │ User clicks "End" OR
       │ Connection fails
       │
       ▼
┌─────────────┐
│   CLEANUP   │ ◄──── Stopping media, closing peer
└──────┬──────┘
       │
       │ All resources released
       │
       ▼
┌─────────────┐
│    IDLE     │ ◄──── Ready for next call
└─────────────┘
```

## ICE Candidate Queue (The Critical Fix)

```
┌──────────────────────────────────────────────────────────┐
│              ICE Candidate Processing                     │
└──────────────────────────────────────────────────────────┘

Before Remote Description Set:
═══════════════════════════════
┌─────────────┐
│ICE Candidate│
│   Arrives   │
└──────┬──────┘
       │
       ▼
   ┌───────┐
   │ Queue?│
   └───┬───┘
       │
       ├─── NO (remote description exists) ───┐
       │                                       │
       │                                       ▼
       │                              ┌────────────────┐
       │                              │Add Immediately │
       │                              └────────────────┘
       │
       └─── YES (no remote description) ──┐
                                          │
                                          ▼
                                  ┌───────────────┐
                                  │ Add to Queue  │
                                  └───────────────┘


After Remote Description Set:
══════════════════════════════
┌───────────────────┐
│Remote Description │
│      Set          │
└─────────┬─────────┘
          │
          ▼
┌──────────────────────┐
│Process Queued        │
│ICE Candidates        │
│                      │
│ for each candidate:  │
│   addIceCandidate()  │
└──────────────────────┘
          │
          ▼
┌──────────────────────┐
│ Clear Queue          │
└──────────────────────┘
```

## Network Topology

```
                     Internet
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        │               │               │
   ┌────▼─────┐    ┌────▼─────┐   ┌────▼─────┐
   │  STUN 1  │    │  STUN 2  │   │  STUN 3  │
   │  Server  │    │  Server  │   │  Server  │
   └──────────┘    └──────────┘   └──────────┘
        │               │               │
        └───────────────┼───────────────┘
                        │
        Discovers public IP and port
                        │
        ┌───────────────┼───────────────┐
        │               │               │
   ┌────▼────┐                     ┌────▼────┐
   │ Patient │                     │ Doctor  │
   │  NAT    │                     │  NAT    │
   └────┬────┘                     └────┬────┘
        │                               │
   ┌────▼────┐                     ┌────▼────┐
   │ Patient │                     │ Doctor  │
   │ Browser │◄────────────────────┤ Browser │
   └─────────┘   WebRTC P2P Media  └─────────┘
               (audio/video streams)


For Difficult Networks (needs TURN):
═══════════════════════════════════

   ┌─────────┐                     ┌─────────┐
   │ Patient │                     │ Doctor  │
   │  (NAT)  │                     │  (NAT)  │
   └────┬────┘                     └────┬────┘
        │                               │
        │         ┌──────────┐          │
        └────────►│   TURN   │◄─────────┘
                  │  Server  │
                  └──────────┘
                       │
                  Relay media
                 when direct
                 P2P fails
```

## Performance Monitoring Points

```
┌────────────────────────────────────────────────────┐
│               Call Quality Monitoring               │
├────────────────────────────────────────────────────┤
│                                                     │
│  Connection Setup Time:                            │
│  ┌──────────────────────────────────────┐          │
│  │ call:request → CONNECTED             │          │
│  │ ⏱️  Target: < 5 seconds              │          │
│  └──────────────────────────────────────┘          │
│                                                     │
│  ICE Gathering:                                    │
│  ┌──────────────────────────────────────┐          │
│  │ ICE gathering complete                │          │
│  │ ⏱️  Target: < 3 seconds              │          │
│  └──────────────────────────────────────┘          │
│                                                     │
│  Audio Quality:                                    │
│  ┌──────────────────────────────────────┐          │
│  │ Latency: < 300ms                     │          │
│  │ Packet Loss: < 1%                    │          │
│  │ Jitter: < 30ms                       │          │
│  └──────────────────────────────────────┘          │
│                                                     │
│  Video Quality:                                    │
│  ┌──────────────────────────────────────┐          │
│  │ Frame Rate: > 15 fps                 │          │
│  │ Resolution: 640x480                  │          │
│  │ Bitrate: 500-1500 kbps               │          │
│  └──────────────────────────────────────┘          │
│                                                     │
│  Connection State:                                 │
│  ┌──────────────────────────────────────┐          │
│  │ Monitor: pc.connectionState          │          │
│  │ Monitor: pc.iceConnectionState       │          │
│  │ Alert if: "failed" or "disconnected" │          │
│  └──────────────────────────────────────┘          │
└────────────────────────────────────────────────────┘
```

## Browser Compatibility Matrix

```
┌─────────────────────────────────────────────────────┐
│           WebRTC Feature Support                     │
├──────────────┬──────────┬──────────┬───────────────┤
│   Browser    │  Audio   │  Video   │  Screen Share │
├──────────────┼──────────┼──────────┼───────────────┤
│ Chrome 80+   │    ✅    │    ✅    │      ✅       │
│ Firefox 75+  │    ✅    │    ✅    │      ✅       │
│ Safari 14+   │    ✅    │    ✅    │      ✅       │
│ Edge 80+     │    ✅    │    ✅    │      ✅       │
│ Mobile Chrome│    ✅    │    ✅    │      ❌       │
│ Mobile Safari│    ✅    │    ✅    │      ❌       │
│ Opera        │    ✅    │    ✅    │      ✅       │
│ IE 11        │    ❌    │    ❌    │      ❌       │
└──────────────┴──────────┴──────────┴───────────────┘

Note: All browsers require HTTPS (except localhost)
```

## Error States & Recovery

```
┌────────────────────────────────────────────────┐
│           Error Handling Flow                   │
└────────────────────────────────────────────────┘

getUserMedia Error:
═══════════════════
┌────────────────┐
│ Permission     │
│ Denied         │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ Show Alert     │
│ "Please allow  │
│  camera/mic"   │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ Call Cleanup   │
└────────────────┘


Connection Failed:
══════════════════
┌────────────────┐
│ Connection     │
│ State: failed  │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ Auto End Call  │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ Show Message   │
│ "Call failed"  │
└────────────────┘


ICE Gathering Failed:
═════════════════════
┌────────────────┐
│ No ICE         │
│ Candidates     │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ Timeout (30s)  │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ End Call       │
│ Show Error     │
└────────────────┘
```

---

## Summary

This visual guide shows:
1. ✅ Complete system architecture
2. ✅ Message flow sequences
3. ✅ Component relationships
4. ✅ State machine transitions
5. ✅ ICE candidate queue mechanism
6. ✅ Network topology
7. ✅ Performance monitoring
8. ✅ Browser compatibility
9. ✅ Error handling flows

The system is now fully documented and working! 🎉
