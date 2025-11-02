# 🚀 New Features Implementation Guide

## Features to Implement

1. **Patient Payment System** - Stripe integration for appointment payments
2. **Clinic Payout System** - Stripe Connect for doctor payouts
3. **Doctor Communication** - Real-time chat with WebRTC video/voice

---

## 📦 Step 1: Install Dependencies

### Backend Dependencies

```bash
cd chifaacare-backend

# Payment & Payout (Stripe)
npm install stripe

# Real-time Communication
npm install socket.io@4.8.1

# WebRTC Signaling (already have socket.io)
# Video/Voice API - We'll use Agora SDK
npm install agora-access-token

# Additional utilities
npm install uuid
```

### Frontend Dependencies

```bash
# From project root

# Stripe Elements (payment UI)
npm install @stripe/stripe-js @stripe/react-stripe-js

# Socket.io Client (already installed)
# npm install socket.io-client

# Agora WebRTC SDK
npm install agora-rtc-sdk-ng

# Media recording & utilities
npm install recordrtc
```

---

## 🗄️ Step 2: Database Schema Updates

We need to add new tables/models to Prisma schema for:
- Payment transactions
- Payout records
- Doctor connected accounts (Stripe Connect)
- Chat messages
- Video call logs

### Schema Changes Required:

```prisma
// Add to schema.prisma

model Payment {
  id                String   @id @default(uuid())
  appointmentId     String   @unique
  patientId         String
  amount            Float
  currency          String   @default("USD")
  status            PaymentStatus @default(PENDING)
  stripePaymentId   String?
  stripeClientSecret String?
  paymentMethod     String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  appointment       Appointment @relation(fields: [appointmentId], references: [id])
  patient          User        @relation("PatientPayments", fields: [patientId], references: [id])
}

model DoctorConnectedAccount {
  id              String   @id @default(uuid())
  doctorId        String   @unique
  stripeAccountId String   @unique
  accountStatus   String   @default("pending")
  onboardingComplete Boolean @default(false)
  payoutsEnabled  Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  doctor          User     @relation("DoctorAccount", fields: [doctorId], references: [id])
}

model Payout {
  id              String   @id @default(uuid())
  doctorId        String
  clinicId        String
  amount          Float
  currency        String   @default("USD")
  status          PayoutStatus @default(PENDING)
  stripePayoutId  String?
  initiatedBy     String
  notes           String?
  createdAt       DateTime @default(now())
  completedAt     DateTime?
  
  doctor          User     @relation("DoctorPayouts", fields: [doctorId], references: [id])
  clinic          Clinic   @relation("ClinicPayouts", fields: [clinicId], references: [id])
}

model ChatMessage {
  id          String   @id @default(uuid())
  senderId    String
  recipientId String
  content     String
  messageType String   @default("text") // text, file, system
  isRead      Boolean  @default(false)
  readAt      DateTime?
  createdAt   DateTime @default(now())
  
  sender      User     @relation("SentChatMessages", fields: [senderId], references: [id])
  recipient   User     @relation("ReceivedChatMessages", fields: [recipientId], references: [id])
  
  @@index([senderId, recipientId])
  @@index([createdAt])
}

model VideoCallLog {
  id          String    @id @default(uuid())
  callerId    String
  calleeId    String
  channelName String
  startedAt   DateTime  @default(now())
  endedAt     DateTime?
  duration    Int?      // in seconds
  status      String    @default("initiated") // initiated, ongoing, completed, failed
  
  caller      User      @relation("CallerCalls", fields: [callerId], references: [id])
  callee      User      @relation("CalleeCalls", fields: [calleeId], references: [id])
}

enum PaymentStatus {
  PENDING
  PROCESSING
  SUCCEEDED
  FAILED
  REFUNDED
}

enum PayoutStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  CANCELLED
}
```

---

## 🔑 Step 3: Environment Variables

Add to `chifaacare-backend/.env`:

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Stripe Connect (for payouts)
STRIPE_CONNECT_CLIENT_ID=ca_your_client_id_here

# Agora (for video/voice calls)
AGORA_APP_ID=your_agora_app_id_here
AGORA_APP_CERTIFICATE=your_agora_certificate_here

# Frontend URL (for redirects)
FRONTEND_URL=http://localhost:4200
```

Add to frontend `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1',
  stripePublishableKey: 'pk_test_your_publishable_key_here',
  agoraAppId: 'your_agora_app_id_here',
  socketUrl: 'http://localhost:3000'
};
```

---

## 📁 Step 4: Project Structure

New files to be created:

### Backend Structure
```
chifaacare-backend/src/
├── controllers/
│   ├── payment.controller.ts          (NEW)
│   ├── payout.controller.ts           (NEW)
│   ├── chat.controller.ts             (NEW)
│   └── video.controller.ts            (NEW)
├── routes/
│   ├── payment.routes.ts              (NEW)
│   ├── payout.routes.ts               (NEW)
│   ├── chat.routes.ts                 (NEW)
│   └── video.routes.ts                (NEW)
├── services/
│   ├── stripe.service.ts              (NEW)
│   ├── agora.service.ts               (NEW)
│   └── socket.service.ts              (UPDATE)
├── middleware/
│   └── payment.middleware.ts          (NEW)
└── types/
    └── payment.types.ts               (NEW)
```

### Frontend Structure
```
src/app/
├── services/
│   ├── payment.service.ts             (NEW)
│   ├── payout.service.ts              (NEW)
│   ├── chat.service.ts                (NEW)
│   └── video.service.ts               (NEW)
├── portals/
│   ├── patient/
│   │   └── payment/
│   │       ├── payment.component.ts   (NEW)
│   │       └── payment-success.component.ts (NEW)
│   ├── clinic/
│   │   └── payouts/
│   │       ├── payouts.component.ts   (NEW)
│   │       └── doctor-onboarding.component.ts (NEW)
│   └── doctor/
│       └── communication/
│           ├── chat.component.ts      (NEW)
│           ├── video-call.component.ts (NEW)
│           └── doctor-list.component.ts (NEW)
└── shared/
    └── components/
        ├── payment-form/              (NEW)
        └── video-player/              (NEW)
```

---

## 🎯 Implementation Priority

### Phase 1: Payment System (Week 1)
1. Update database schema
2. Create Stripe service
3. Add payment controller & routes
4. Build payment UI component
5. Test payment flow

### Phase 2: Payout System (Week 2)
1. Set up Stripe Connect
2. Create doctor onboarding flow
3. Build payout admin interface
4. Test payout transactions

### Phase 3: Communication Platform (Week 2-3)
1. Implement real-time chat with Socket.io
2. Add Agora WebRTC integration
3. Build chat UI
4. Build video call UI
5. Test communication features

---

## 🔒 Security Considerations

### Payment Security
- ✅ Never store raw card data
- ✅ Use Stripe Elements for PCI compliance
- ✅ Implement webhook signature verification
- ✅ Add idempotency keys for payments

### Payout Security
- ✅ Admin-only access to payout features
- ✅ Two-factor authentication recommended
- ✅ Audit logging for all payout actions
- ✅ Stripe Connect handles sensitive bank data

### Communication Security
- ✅ JWT authentication for Socket.io
- ✅ Doctor-only access verification
- ✅ End-to-end encryption for messages (optional)
- ✅ Secure WebRTC signaling

---

## 📝 Next Steps

1. **Review this plan** - Make sure it aligns with your requirements
2. **Get API keys** - Sign up for Stripe and Agora accounts
3. **Run database migration** - Apply schema changes
4. **Install dependencies** - Run the npm install commands
5. **Start implementation** - I'll help you build each feature step by step

---

Would you like me to start implementing any specific feature first?

**Recommended order:**
1. Payment System (most critical for revenue)
2. Payout System (important for doctor satisfaction)
3. Communication Platform (enhances collaboration)

Let me know which one you'd like to start with, and I'll begin creating the code!
