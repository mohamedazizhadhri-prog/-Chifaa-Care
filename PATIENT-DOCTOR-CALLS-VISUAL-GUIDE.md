# Patient-Doctor Call Architecture - Visual Guide

## 🏗️ Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│           DoctorMessagesComponent (Main)                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐  ┌─────────────────────────────────┐ │
│  │  Chat Sidebar    │  │     Chat Window / Call UI       │ │
│  │                  │  │                                 │ │
│  │  • Patient List  │  │  ┌──────────────────────────┐  │ │
│  │  • Search        │  │  │   Chat Header            │  │ │
│  │  • New Chat Btn  │  │  │   • Profile | 📞 | 📹   │  │ │
│  │                  │  │  └──────────────────────────┘  │ │
│  │  [Patient 1]     │  │                                 │ │
│  │  [Patient 2] ✓   │  │  ┌──────────────────────────┐  │ │
│  │  [Patient 3] (2) │  │  │   Messages Area          │  │ │
│  │                  │  │  │   or Call Overlay        │  │ │
│  └──────────────────┘  │  └──────────────────────────┘  │ │
│                        │                                 │ │
│                        │  ┌──────────────────────────┐  │ │
│                        │  │   Message Input          │  │ │
│                        │  │   📎 [Type...] ➤         │  │ │
│                        │  └──────────────────────────┘  │ │
│                        └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 📱 Call UI States

### State 1: Normal Chat (No Call)
```
┌────────────────────────────────┐
│ Patient Name          | 📞 | 📹 │ ← Click to start call
├────────────────────────────────┤
│                                 │
│  [Message bubbles here]         │
│                                 │
├────────────────────────────────┤
│  📎 [Type message...] ➤        │
└────────────────────────────────┘
```

### State 2: Dialing (Outgoing Call)
```
┌────────────────────────────────┐
│    ╔══════════════════════╗    │
│    ║    🎭 Patient         ║    │
│    ║                      ║    │
│    ║    Calling...        ║    │
│    ║                      ║    │
│    ║   [Cancel Call] 🔴   ║    │
│    ╚══════════════════════╝    │
│                                 │
│     🔊 Ring... Ring...          │
└────────────────────────────────┘
dialing = true
```

### State 3: Incoming Call
```
┌────────────────────────────────┐
│    ╔══════════════════════╗    │
│    ║    🎭 Patient         ║    │
│    ║                      ║    │
│    ║  Incoming video call ║    │
│    ║                      ║    │
│    ║  [Accept] 🟢  [✖] 🔴 ║    │
│    ╚══════════════════════╝    │
│                                 │
│     🔔 Ring... Ring...          │
└────────────────────────────────┘
incomingCall = true
```

### State 4: Active Call
```
┌────────────────────────────────┐
│  ╔════════════════════════════╗│
│  ║                            ║│
│  ║   📹 PATIENT VIDEO         ║│
│  ║        (remote)            ║│
│  ║                            ║│
│  ║                    ┌──────┐║│
│  ║                    │ YOU  │║│
│  ║                    │(me)  │║│
│  ║                    └──────┘║│
│  ║                            ║│
│  ║  ╔════════════════════╗    ║│
│  ║  ║ 🎤  [End] 🔴  📹  ║    ║│
│  ║  ╚════════════════════╝    ║│
│  ╚════════════════════════════╝│
└────────────────────────────────┘
inCall = true
```

## 🔄 Call Flow Sequence

### Outgoing Call (Doctor → Patient)
```
DOCTOR APP                    BACKEND                    PATIENT APP
    │                            │                            │
    │─── startCall('video') ────▶│                            │
    │    dialing = true          │                            │
    │    🔊 ringing tone         │                            │
    │                            │                            │
    │                            │──── call:incoming ────────▶│
    │                            │                            │ incomingCall = true
    │                            │                            │ 🔔 ringing tone
    │                            │                            │
    │                            │◀──── call:accept ──────────│
    │◀─── call:accepted ─────────│                            │
    │    stop ringing            │                            │
    │    preparePeer()           │                            │
    │                            │                            │
    │──── call:offer ───────────▶│──── call:offer ───────────▶│
    │                            │                            │
    │◀──── call:answer ──────────│◀──── call:answer ──────────│
    │                            │                            │
    │◀─── ice-candidate ─────────│◀─── ice-candidate ─────────│
    │──── ice-candidate ─────────▶│──── ice-candidate ─────────▶│
    │                            │                            │
    ╞════ WebRTC Connected ══════╪════════════════════════════╡
    │    inCall = true           │                            │
    │    📹 Video streaming      │      📹 Video streaming    │
    │                            │                            │
```

### Incoming Call (Patient → Doctor)
```
PATIENT APP                   BACKEND                    DOCTOR APP
    │                            │                            │
    │─── call:request ──────────▶│                            │
    │    dialing = true          │                            │
    │                            │──── call:incoming ────────▶│
    │                            │                            │ incomingCall = true
    │                            │                            │ 🔔 ringing tone
    │                            │                            │
    │                            │◀──── call:accept ──────────│
    │◀─── call:accepted ─────────│                            │ acceptIncoming()
    │                            │                            │
    │   [WebRTC exchange...]     │                            │
    │                            │                            │
    ╞════ Connected ═════════════╪════════════════════════════╡
```

## 🧩 Code Structure Map

```
doctor-messages.component.ts
│
├── Properties
│   ├── Basic Chat Props (allChats, selectedChat, etc.)
│   └── WebRTC Props (pc, localStream, remoteStream, etc.)
│
├── Lifecycle Hooks
│   ├── ngOnInit() → setupSocketListeners() + setupSignalingListeners()
│   ├── ngAfterViewChecked() → scrollToBottom()
│   └── ngOnDestroy() → cleanupCall() + disconnect()
│
├── Socket Listeners (PART 2)
│   ├── setupSocketListeners()
│   │   ├── message:new
│   │   ├── presence:update
│   │   └── message:read
│   │
│   └── setupSignalingListeners() (PART 3)
│       ├── call:incoming
│       ├── call:offer
│       ├── call:answer
│       ├── call:ice-candidate
│       ├── call:accepted
│       ├── call:declined
│       └── call:ended
│
├── Messaging Methods (PART 2)
│   ├── sendMessage()
│   ├── selectChat()
│   ├── loadMessages()
│   └── filterChats()
│
├── Call Control Methods (PART 3)
│   ├── startCall(type) → initiate call
│   ├── acceptIncoming() → accept call
│   ├── declineIncoming() → decline call
│   ├── endCall() → terminate call
│   ├── toggleMicrophone()
│   └── toggleCamera()
│
├── WebRTC Helper Methods (PART 3)
│   ├── preparePeer() → setup RTCPeerConnection
│   ├── cleanupCall() → cleanup resources
│   ├── processQueuedIceCandidates()
│   ├── startRinging()
│   └── stopRinging()
│
└── Data Loading Methods (PART 4)
    ├── loadConversations()
    ├── loadPatients()
    ├── togglePatientPicker()
    └── startChatWithPatient()
```

## 🎬 Call State Machine

```
                    [IDLE]
                      │
                      │ Click 📞 or 📹
                      ▼
                  [DIALING] ────────────┐
                      │                 │
            Accept    │                 │ Decline/Timeout
                      ▼                 │
             [PREPARING PEER]           │
                      │                 │
         offer/answer │                 │
          ice exchange│                 │
                      ▼                 │
                [IN CALL] ──────────────┤
                      │                 │
              End Call│                 │
                      ▼                 ▼
                   [CLEANUP]
                      │
                      ▼
                   [IDLE]


         Incoming Call Path:
         
                    [IDLE]
                      │
             call:incoming received
                      ▼
              [INCOMING CALL]
                 │         │
         Accept  │         │ Decline
                 ▼         ▼
          [PREPARING]   [CLEANUP]
                 │         │
                 ▼         ▼
             [IN CALL]  [IDLE]
```

## 🔌 Socket Event Flow

```
┌────────────────────────────────────────────────────────┐
│                    Doctor Component                     │
└─────────────┬──────────────────────────────┬───────────┘
              │                              │
              │ emit                         │ on
              ▼                              ▼
┌─────────────────────────────────────────────────────────┐
│                    Socket.IO Backend                     │
│  • Manages connections                                   │
│  • Routes messages between users                         │
│  • Handles signaling for WebRTC                         │
└─────────────┬──────────────────────────────┬───────────┘
              │                              │
              │ on                           │ emit
              ▼                              ▼
┌────────────────────────────────────────────────────────┐
│                    Patient Component                    │
└────────────────────────────────────────────────────────┘
```

## 📦 Data Flow

```
USER ACTION                    COMPONENT                     BACKEND
    │                             │                            │
    │ Click 📹 button            │                            │
    └──────────────────────────▶ │                            │
                                  │ startCall('video')        │
                                  │ • Set dialing = true      │
                                  │ • Start ringing           │
                                  │                            │
                                  │ socket.emit('call:request')│
                                  └──────────────────────────▶ │
                                                               │ Route to patient
                                                               │
                                  ┌──────────────────────────┐ │
                                  │ socket.on('call:accepted')│ │
                                  │◀──────────────────────────┘ │
                                  │                            │
                                  │ preparePeer()              │
                                  │ • Create RTCPeerConnection │
                                  │ • Get user media           │
                                  │ • Create offer             │
                                  │                            │
                                  │ socket.emit('call:offer')  │
                                  └──────────────────────────▶ │
                                                               │
                                  ┌──────────────────────────┐ │
                                  │ socket.on('call:answer') │ │
                                  │◀──────────────────────────┘ │
                                  │                            │
                                  │ setRemoteDescription()     │
                                  │                            │
                        ┌─────────┴──────────────────────────┐│
                        │  ICE Candidate Exchange            ││
                        │  (multiple back-and-forth)         ││
                        └─────────┬──────────────────────────┘│
                                  │                            │
                                  │ Connection established!    │
                                  │ inCall = true              │
                                  │                            │
    ┌──────────────────────────── │ 📹 Video streaming        │
    │ See video feed               │ 🎤 Audio streaming        │
    └──────────────────────────── │                            │
```

## 🎨 UI Component Hierarchy

```
doctor-messages.component.html
│
├── <div class="messages-container">
│   │
│   └── <div class="messages-layout">
│       │
│       ├── <aside class="chat-sidebar">      [Patient List]
│       │   ├── Chat header
│       │   ├── New chat button
│       │   ├── Search input
│       │   ├── Patient picker
│       │   └── Chat list (conversations)
│       │
│       ├── <section class="chat-window">     [Main Chat Area]
│       │   │
│       │   ├── <div class="chat-header">     [Name + Actions]
│       │   │   ├── Patient info
│       │   │   └── Action buttons: Profile | 📞 | 📹
│       │   │
│       │   ├── *ngIf="dialing"               [Call State 1]
│       │   │   └── Dialing overlay
│       │   │
│       │   ├── *ngIf="incomingCall"          [Call State 2]
│       │   │   └── Incoming call overlay
│       │   │
│       │   ├── *ngIf="inCall"                [Call State 3]
│       │   │   └── Active call overlay
│       │   │       ├── <video #remoteVideo>  [Patient video]
│       │   │       ├── <video #localVideo>   [Doctor video]
│       │   │       └── Call controls bar
│       │   │
│       │   ├── <div *ngIf="!inCall && !dialing && !incomingCall">
│       │   │   └── Messages area             [Normal State]
│       │   │
│       │   └── <div *ngIf="!inCall && !dialing && !incomingCall">
│       │       └── Message input             [Normal State]
│       │
│       └── <div *ngIf="!selectedChat">       [Empty State]
│           └── "Select a conversation" message
```

## 🔐 Security & Permissions Flow

```
1. User clicks video call button
   │
   ▼
2. Browser requests permissions
   ┌────────────────────────────────┐
   │  Allow camera and microphone?  │
   │  [Block]  [Allow]              │
   └────────────────────────────────┘
   │
   ├─ Allow ─▶ getUserMedia() succeeds ─▶ Start call
   │
   └─ Block ─▶ getUserMedia() fails ─▶ Show error ─▶ cleanupCall()
```

## 🌐 Network Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Doctor    │         │    Backend   │         │   Patient   │
│   Browser   │◀───────▶│  Socket.IO   │◀───────▶│   Browser   │
└─────────────┘         └──────────────┘         └─────────────┘
      │                                                  │
      │                                                  │
      │             ┌──────────────┐                    │
      └────────────▶│  STUN Server │◀───────────────────┘
                    └──────────────┘
                          │
                          │ (NAT traversal)
                          │
                    Direct P2P Connection
                    (if possible)
```

---

This visual guide helps you understand:
- How components are structured
- What happens during each call state
- How data flows through the system
- The sequence of events
- UI layout and hierarchy

Use this alongside the implementation files for better understanding! 🎓
