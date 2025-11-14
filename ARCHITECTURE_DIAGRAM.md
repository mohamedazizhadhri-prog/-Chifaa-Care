# System Architecture Diagram

## Doctor-to-Doctor Messaging with Video/Audio Calling

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Angular)                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │           Doctor Portal (/doctor/messages)                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                  │                                            │
│                                  ▼                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │        DoctorMessagesWrapperComponent (Tab Navigation)               │   │
│  │  ┌───────────────────────┬──────────────────────────────────────┐  │   │
│  │  │  Patient Messages Tab │  Doctor Messages Tab (NEW)           │  │   │
│  │  │  (Existing)           │                                        │  │   │
│  │  └───────────────────────┴──────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                  │                                            │
│                                  ▼                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │       DoctorDoctorMessagesComponent (Main Component)                 │   │
│  │                                                                       │   │
│  │  ┌─────────────┐  ┌──────────────────┐  ┌──────────────────────┐  │   │
│  │  │  Chat List  │  │  Message Area    │  │  Call Panel (WebRTC) │  │   │
│  │  │  Sidebar    │  │                  │  │                      │  │   │
│  │  │             │  │  ┌────────────┐  │  │  ┌──────────────┐  │  │   │
│  │  │  • Doctor 1 │  │  │ Messages   │  │  │  │ Local Video  │  │  │   │
│  │  │  • Doctor 2 │  │  │ Display    │  │  │  ├──────────────┤  │  │   │
│  │  │  • Doctor 3 │  │  └────────────┘  │  │  │ Remote Video │  │  │   │
│  │  │  • ...      │  │                  │  │  └──────────────┘  │  │   │
│  │  │             │  │  ┌────────────┐  │  │                      │  │   │
│  │  │  [Search]   │  │  │ Input Box  │  │  │  [End Call]          │  │   │
│  │  │  [New Chat] │  │  └────────────┘  │  │                      │  │   │
│  │  └─────────────┘  └──────────────────┘  └──────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│           │                    │                         │                   │
│           ├────────────────────┼─────────────────────────┤                  │
│           ▼                    ▼                         ▼                   │
│  ┌─────────────────┐  ┌──────────────┐  ┌────────────────────────────┐   │
│  │  AuthService    │  │ MessageService│  │  SocketService             │   │
│  │  (User Auth)    │  │  (HTTP API)  │  │  (WebSocket + Signaling)   │   │
│  └─────────────────┘  └──────────────┘  └────────────────────────────┘   │
│           │                    │                         │                   │
└───────────┼────────────────────┼─────────────────────────┼──────────────────┘
            │                    │                         │
            │                    │                         │
════════════╪════════════════════╪═════════════════════════╪══════════════════
            │                    │                         │
            ▼                    ▼                         ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                       BACKEND (NestJS/Express)                             │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                    REST API Endpoints                                │ │
│  │                                                                       │ │
│  │  GET    /api/v1/messages/conversations/:userId                       │ │
│  │  GET    /api/v1/messages/thread?userId=&otherUserId=                │ │
│  │  POST   /api/v1/messages/send                                        │ │
│  │  PATCH  /api/v1/messages/mark-read                                   │ │
│  │  GET    /api/v1/doctors                                              │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│           │                                                                 │
│           ▼                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │               Message Controller & Service                           │ │
│  │  • getConversations()                                                │ │
│  │  • getThread()                                                       │ │
│  │  • sendMessage()                                                     │ │
│  │  • markThreadRead()                                                  │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│           │                                                                 │
│           ▼                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                    WebSocket Server (Socket.io)                      │ │
│  │                                                                       │ │
│  │  Messaging Events:               Call Signaling Events:              │ │
│  │  • message:new                   • call:request                      │ │
│  │  • message:sent                  • call:incoming                     │ │
│  │  • presence:update               • call:accept / call:decline        │ │
│  │                                  • call:offer / call:answer          │ │
│  │                                  • call:ice-candidate                │ │
│  │                                  • call:started / call:ended         │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│           │                                                                 │
│           ▼                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                      Database Layer (Prisma)                         │ │
│  │                                                                       │ │
│  │  Tables:                                                             │ │
│  │  • users (doctors)                                                   │ │
│  │  • messages                                                          │ │
│  │  • doctorProfiles                                                    │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│           │                                                                 │
└───────────┼─────────────────────────────────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                       DATABASE (PostgreSQL)                                │
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐                  │
│  │   users     │  │  messages   │  │ doctorProfiles   │                  │
│  ├─────────────┤  ├─────────────┤  ├──────────────────┤                  │
│  │ id          │  │ id          │  │ id               │                  │
│  │ email       │  │ senderId    │  │ userId           │                  │
│  │ firstName   │  │ recipientId │  │ specialization   │                  │
│  │ lastName    │  │ content     │  │ licenseNumber    │                  │
│  │ role        │  │ createdAt   │  │ ...              │                  │
│  │ ...         │  │ isRead      │  └──────────────────┘                  │
│  └─────────────┘  └─────────────┘                                         │
└───────────────────────────────────────────────────────────────────────────┘


════════════════════════════════════════════════════════════════════════════
                        WEBRTC P2P CONNECTION
════════════════════════════════════════════════════════════════════════════

 Doctor A Browser                                    Doctor B Browser
┌─────────────────┐                                ┌─────────────────┐
│                 │  1. call:request              │                 │
│  Click "Call"   │───────────────────────────────▶│ Incoming Banner │
│                 │      (via Socket.io)           │                 │
└─────────────────┘                                └─────────────────┘
        │                                                   │
        │ 3. Prepare WebRTC                                │ 2. Click Accept
        ▼                                                   ▼
┌─────────────────┐                                ┌─────────────────┐
│ RTCPeerConnection│  4. call:offer (SDP)          │RTCPeerConnection│
│ • Create Offer  │───────────────────────────────▶│ • Set Remote    │
│ • Get LocalDesc │      (via Socket.io)           │ • Create Answer │
└─────────────────┘                                └─────────────────┘
        │                                                   │
        │ 6. Set RemoteDesc                                │ 5. call:answer
        ▼                                                   │
┌─────────────────┐  ◀────────────────────────────────────┘
│  ICE Candidates │      (via Socket.io)
│  Exchange       │  ────────────────────────────────────▶
│                 │  ◀────────────────────────────────────
└─────────────────┘   7. call:ice-candidate (both ways)
        │
        │ 8. P2P Connection Established
        ▼
┌─────────────────┐                                ┌─────────────────┐
│  Media Streams  │  ═══════════════════════════▶  │  Media Streams  │
│  • Audio        │   Direct P2P Media Flow        │  • Audio        │
│  • Video        │  ◀═══════════════════════════  │  • Video        │
└─────────────────┘    (Not via backend!)          └─────────────────┘


════════════════════════════════════════════════════════════════════════════
                         DATA FLOW DIAGRAMS
════════════════════════════════════════════════════════════════════════════

1. SENDING A MESSAGE
───────────────────────
Doctor A Browser                Backend                   Doctor B Browser
     │                             │                             │
     │ 1. Type & Send              │                             │
     ├──────────────────────────▶  │                             │
     │   POST /messages/send       │                             │
     │                             │ 2. Save to DB               │
     │                             │ ───────────▶ [Database]     │
     │                             │                             │
     │ ◀──────────────────────────┤                             │
     │   200 OK                    │ 3. Emit Socket Event        │
     │                             ├──────────────────────────▶  │
     │                             │   message:new               │
     │                             │                             │
     │                             │                             │ 4. Display
     │                             │                             │ ────────▶
     │                             │                             │  (UI Update)


2. STARTING A VIDEO CALL
─────────────────────────
Doctor A                      Backend (Socket.io)              Doctor B
   │                                 │                             │
   │ 1. Click "Video Call"           │                             │
   ├──────────────────────────────▶  │                             │
   │   call:request                  │ 2. Relay                    │
   │   {from: A, to: B, media: vid}  ├──────────────────────────▶  │
   │                                 │   call:incoming             │
   │                                 │                             │
   │ 3. Start Ringing                │                             │ 4. Show Banner
   │ 🔊 Ring...                      │                             │ 🔔 Incoming...
   │                                 │                             │
   │                                 │   call:accept               │ 5. Click Accept
   │   call:accepted                 │ ◀──────────────────────────┤
   │ ◀──────────────────────────────┤                             │
   │                                 │                             │
   │ 6. Stop Ring                    │                             │
   │ 7. Setup WebRTC                 │                             │ 8. Setup WebRTC
   │ ────────────────────────────────┼──────────────────────────▶  │
   │        Exchange SDP & ICE       │                             │
   │ ◀───────────────────────────────┼──────────────────────────── │
   │                                 │                             │
   │ 9. Direct P2P Connection ═══════════════════════════════════▶ │
   │                                 │                             │
   │    (Video/Audio flows directly) │                             │


3. REAL-TIME MESSAGE SYNC
──────────────────────────
Backend receives message from Doctor A:

  ┌─────────────────────────────────────────────────┐
  │ 1. HTTP Request arrives                          │
  │    POST /api/v1/messages/send                    │
  │    Body: { senderId: A, recipientId: B, content }│
  └───────────────────┬─────────────────────────────┘
                      │
                      ▼
  ┌─────────────────────────────────────────────────┐
  │ 2. Save to Database                              │
  │    message = prisma.message.create(...)          │
  └───────────────────┬─────────────────────────────┘
                      │
          ┌───────────┴───────────┐
          │                       │
          ▼                       ▼
  ┌──────────────┐       ┌──────────────┐
  │ 3a. Emit to  │       │ 3b. Emit to  │
  │ Recipient    │       │ Sender       │
  │ Room         │       │ Room         │
  │              │       │              │
  │ io.to(user:B)│       │ io.to(user:A)│
  │ .emit(       │       │ .emit(       │
  │ 'message:new'│       │ 'message:sent'
  │ )            │       │ )            │
  └──────┬───────┘       └──────┬───────┘
         │                      │
         │                      │
         ▼                      ▼
  [Doctor B gets]        [Doctor A gets]
  [message instantly]    [confirmation]


════════════════════════════════════════════════════════════════════════════
                         COMPONENT HIERARCHY
════════════════════════════════════════════════════════════════════════════

PortalLayoutComponent (Parent)
│
└── DoctorMessagesWrapperComponent
    │
    ├── Tab 1: DoctorMessagesComponent (Patient Messages)
    │   ├── Chat Sidebar
    │   ├── Message Area
    │   └── Call Controls
    │
    └── Tab 2: DoctorDoctorMessagesComponent (Doctor Messages) ★ NEW
        ├── Chat Sidebar
        │   ├── Header with Unread Count
        │   ├── "New Chat" Button
        │   ├── Doctor Picker Dropdown
        │   ├── Search Input
        │   └── Conversation List
        │       └── ChatItem (foreach conversation)
        │
        ├── Message Area (when chat selected)
        │   ├── Chat Header
        │   │   ├── Doctor Info
        │   │   └── Call Controls
        │   ├── Incoming Call Banner (conditional)
        │   ├── Call Panel (conditional)
        │   │   ├── Call Header
        │   │   ├── Video Display
        │   │   │   ├── Local Video
        │   │   │   └── Remote Video
        │   │   └── End Call Button
        │   ├── Messages Container
        │   │   └── Message (foreach message)
        │   └── Message Input Area
        │       ├── Textarea
        │       ├── Attach Button
        │       └── Send Button
        │
        └── Empty State (when no chat selected)
            ├── Icon
            ├── Title
            ├── Description
            └── "New Chat" Button


════════════════════════════════════════════════════════════════════════════
                         STATE MANAGEMENT
════════════════════════════════════════════════════════════════════════════

Component State Variables:
─────────────────────────
• currentUser              → Logged-in doctor
• conversations[]          → All doctor conversations
• filteredChats[]          → Filtered by search
• selectedChatId           → Currently open chat
• selectedChat            → Full chat object
• currentMessages[]       → Messages in selected chat
• newMessage              → Input field value
• searchQuery             → Search input value
• showDoctorPicker        → Dropdown visibility
• otherDoctors[]          → Available doctors
• showCallMenu            → Call dropdown visibility

Call State:
───────────
• inCall                  → Boolean: In active call
• dialing                 → Boolean: Waiting for answer
• incomingCall           → Boolean: Receiving call
• incomingFromUserId     → Who's calling
• mediaType              → 'audio' | 'video'
• pc                     → RTCPeerConnection
• localStream            → MediaStream (camera/mic)
• remoteStream           → MediaStream (other party)
• currentCallId          → Call tracking ID


State Transitions:
──────────────────
Idle → Dialing → InCall → Idle
  ↓                ↑
  └─→ Incoming ──→─┘


════════════════════════════════════════════════════════════════════════════
                         FILE SIZES & METRICS
════════════════════════════════════════════════════════════════════════════

Component Files:
───────────────
• doctor-doctor-messages.component.ts     ~650 lines  (Logic)
• doctor-doctor-messages.component.html   ~190 lines  (Template)
• doctor-doctor-messages.component.scss   ~580 lines  (Styles)
  ─────────────────────────────────────────────────
  TOTAL:                                 ~1,420 lines

Documentation Files:
───────────────────
• DOCTOR_MESSAGING_README.md             ~450 lines
• QUICK_START.md                         ~250 lines
• IMPLEMENTATION_SUMMARY.md              ~380 lines
• TESTING_CHECKLIST.md                   ~450 lines
  ─────────────────────────────────────────────────
  TOTAL:                                 ~1,530 lines

Grand Total:                             ~2,950 lines


════════════════════════════════════════════════════════════════════════════
```

## Key Takeaways

1. **Three-Layer Architecture**: Frontend (Angular) ↔ Backend (NestJS) ↔ Database (PostgreSQL)

2. **Dual Communication Channels**:
   - HTTP REST for messages (reliable, persistent)
   - WebSocket for real-time (instant updates)
   - WebRTC for media (peer-to-peer, low latency)

3. **Separation of Concerns**:
   - UI Components (presentation)
   - Services (business logic)
   - Backend Controllers (API)
   - Database (persistence)

4. **WebRTC Signaling**: Backend acts as signaling server, but media flows directly between browsers (P2P)

5. **Real-Time Updates**: Socket.io ensures instant message delivery and presence updates

6. **Scalable Design**: Can easily add features like group chats, file sharing, screen sharing
