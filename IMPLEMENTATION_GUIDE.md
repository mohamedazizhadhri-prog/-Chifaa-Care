# 🚀 ChifaaCare - Three Major Features Implementation

## Complete Implementation Roadmap

This document provides a complete, step-by-step guide to implement all three features:
1. Patient Payment System
2. Clinic-to-Doctor Payout System
3. Doctor Communication Platform

---

## 📋 Pre-Implementation Checklist

Before starting, complete these setup tasks:

### 1. Sign Up for Required Services

**Stripe Account (for Payments & Payouts)**
- Go to: https://stripe.com
- Create account
- Get API keys from Dashboard
- Enable Stripe Connect for payouts

**Agora Account (for Video/Voice)**
- Go to: https://www.agora.io
- Create account
- Create a project
- Get App ID and Certificate

### 2. Install Dependencies

```bash
# Backend dependencies
cd chifaacare-backend
npm install stripe agora-access-token uuid

# Frontend dependencies
cd ..
npm install @stripe/stripe-js @stripe/react-stripe-js agora-rtc-sdk-ng recordrtc
```

### 3. Update Environment Variables

**Backend** (`chifaacare-backend/.env`):
```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECT_CLIENT_ID=ca_...

# Agora Configuration  
AGORA_APP_ID=your_app_id
AGORA_APP_CERTIFICATE=your_certificate

# URLs
FRONTEND_URL=http://localhost:4200
```

**Frontend** (`src/environments/environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1',
  stripePublishableKey: 'pk_test_...',
  agoraAppId: 'your_app_id',
  socketUrl: 'http://localhost:3000'
};
```

---

## 🗄️ Database Migration

### Step 1: Update Prisma Schema

Add the new models from `schema-additions.prisma` to your `schema.prisma` file.

**Important:** Update these existing models:

**User model** - Add these relations:
```prisma
model User {
  // ... existing fields ...
  
  // NEW RELATIONS FOR FEATURES
  payments              Payment[]              @relation("PatientPayments")
  connectedAccount      DoctorConnectedAccount? @relation("DoctorStripeAccount")
  receivedPayouts       Payout[]               @relation("DoctorPayouts")
  initiatedPayouts      Payout[]               @relation("InitiatedPayouts")
  sentChatMessages      ChatMessage[]          @relation("SentChatMessages")
  receivedChatMessages  ChatMessage[]          @relation("ReceivedChatMessages")
  callerCalls           VideoCallLog[]         @relation("CallerCalls")
  calleeCalls           VideoCallLog[]         @relation("CalleeCalls")
}
```

**Appointment model** - Add this relation:
```prisma
model Appointment {
  // ... existing fields ...
  
  // NEW RELATION
  payment               Payment?
}
```

**Clinic model** - Add this relation:
```prisma
model Clinic {
  // ... existing fields ...
  
  // NEW RELATION
  payouts               Payout[]               @relation("ClinicPayouts")
}
```

### Step 2: Run Migration

```bash
cd chifaacare-backend

# Generate Prisma Client
npm run prisma:generate

# Create and apply migration
npx prisma migrate dev --name add_payment_payout_communication_features

# Verify migration
npx prisma migrate status
```

---

## 📁 Implementation Plan

I'll help you implement these features in phases. Here's what I'll create:

### Phase 1: Payment System (Files to Create)

**Backend:**
1. `src/services/stripe.service.ts` - Stripe integration
2. `src/controllers/payment.controller.ts` - Payment logic
3. `src/routes/payment.routes.ts` - Payment endpoints
4. `src/middleware/payment.middleware.ts` - Payment validation

**Frontend:**
5. `src/app/services/payment.service.ts` - Payment API calls
6. `src/app/portals/patient/payment/payment.component.ts` - Payment UI
7. `src/app/shared/components/stripe-form/stripe-form.component.ts` - Stripe Elements

### Phase 2: Payout System (Files to Create)

**Backend:**
8. `src/services/stripe-connect.service.ts` - Stripe Connect
9. `src/controllers/payout.controller.ts` - Payout logic
10. `src/routes/payout.routes.ts` - Payout endpoints

**Frontend:**
11. `src/app/services/payout.service.ts` - Payout API calls
12. `src/app/portals/clinic/payouts/payouts.component.ts` - Payout UI
13. `src/app/portals/doctor/onboarding/stripe-onboarding.component.ts` - Doctor setup

### Phase 3: Communication Platform (Files to Create)

**Backend:**
14. `src/services/agora.service.ts` - Agora integration
15. `src/services/socket.service.ts` - Socket.io setup (update existing)
16. `src/controllers/chat.controller.ts` - Chat logic
17. `src/controllers/video.controller.ts` - Video call logic
18. `src/routes/chat.routes.ts` - Chat endpoints
19. `src/routes/video.routes.ts` - Video endpoints

**Frontend:**
20. `src/app/services/chat.service.ts` - Chat API & Socket.io
21. `src/app/services/video.service.ts` - Video call service
22. `src/app/portals/doctor/chat/chat.component.ts` - Chat UI
23. `src/app/portals/doctor/chat/video-call.component.ts` - Video UI
24. `src/app/portals/doctor/chat/doctor-list.component.ts` - Doctor list

---

## 🎯 Feature 1: Payment System - Implementation Details

### User Flow:
1. Patient selects doctor and time slot
2. Patient enters appointment details
3. **NEW:** Patient proceeds to payment page
4. Patient enters card details (Stripe Elements)
5. Payment processed securely
6. Appointment confirmed only after successful payment
7. Patient receives confirmation email

### Key Implementation Points:

**1. Temporary Slot Reservation:**
- When user enters payment page, create appointment with status "PAYMENT_PENDING"
- Set expiration time (e.g., 15 minutes)
- If payment not completed, release slot

**2. Payment Intent Creation:**
- Create Stripe PaymentIntent on backend
- Return client secret to frontend
- Frontend confirms payment with Stripe Elements

**3. Webhook Handling:**
- Listen for `payment_intent.succeeded` webhook
- Update appointment status to "CONFIRMED"
- Update payment record to "SUCCEEDED"
- Send confirmation email

**4. Security:**
- Never store card details
- Use Stripe Elements for PCI compliance
- Verify webhook signatures
- Implement idempotency keys

---

## 🎯 Feature 2: Payout System - Implementation Details

### User Flow:
1. Doctor completes Stripe Connect onboarding
2. Doctor submits bank account information to Stripe
3. Clinic admin views list of doctors
4. Clinic admin initiates payout to doctor
5. Funds transferred to doctor's bank account
6. Both parties receive confirmation

### Key Implementation Points:

**1. Stripe Connect Setup:**
- Use "Express" or "Standard" Connect accounts
- Generate onboarding link for doctors
- Handle OAuth redirect after onboarding
- Check account status (payouts_enabled)

**2. Payout Initiation:**
- Verify clinic admin permissions
- Check doctor has connected account
- Create Stripe Transfer
- Record payout in database

**3. Payout Tracking:**
- Monitor transfer status
- Update payout record when completed
- Handle failures and retries
- Provide payout history

**4. Security:**
- Admin-only access to payout features
- Two-factor authentication recommended
- Audit logging for all payouts
- Email notifications for all parties

---

## 🎯 Feature 3: Communication Platform - Implementation Details

### User Flow:
1. Doctor logs in and accesses chat
2. Doctor sees list of other doctors with their clinic names
3. Doctor clicks on another doctor to start chat
4. Messages appear in real-time
5. Doctor can initiate voice/video call
6. Call connected using WebRTC (Agora)
7. Call ends, history saved

### Key Implementation Points:

**1. Real-Time Messaging:**
- Use Socket.io for WebSocket connections
- Authenticate socket connections with JWT
- Emit messages to specific recipients
- Store messages in database
- Show online/offline status

**2. Doctor Identification:**
- Display: "Dr. [Name] - [Clinic Name]"
- Pull clinic info from user.clinic relation
- Show doctor's specialization
- Display profile picture

**3. Video/Voice Calls:**
- Use Agora SDK for WebRTC
- Generate temporary tokens on backend
- Create unique channel for each call
- Handle call signaling through Socket.io
- Record call logs in database

**4. Security:**
- Doctor-only access (role check)
- Encrypted WebSocket connections (WSS)
- JWT authentication for sockets
- Rate limiting to prevent abuse
- Optional: End-to-end encryption for messages

---

## 📊 Database Schema Overview

### New Tables:

**Payment:**
- Tracks all appointment payments
- Links to Appointment and Patient
- Stores Stripe PaymentIntent ID
- Status: PENDING, SUCCEEDED, FAILED, etc.

**DoctorConnectedAccount:**
- Stores Stripe Connect account ID
- Tracks onboarding status
- One-to-one with Doctor (User)

**Payout:**
- Records all clinic-to-doctor payments
- Links to Doctor, Clinic, and Initiator
- Stores Stripe Transfer ID
- Status: PENDING, COMPLETED, FAILED, etc.

**ChatMessage:**
- Stores all doctor-to-doctor messages
- Links to Sender and Recipient
- Supports read receipts
- Indexed for fast retrieval

**VideoCallLog:**
- Records all video/voice calls
- Stores channel name and duration
- Links to Caller and Callee
- Status: initiated, ongoing, completed

---

## 🔧 API Endpoints Overview

### Payment Endpoints:
```
POST   /api/v1/payment/create-intent           - Create payment intent
POST   /api/v1/payment/confirm                 - Confirm payment
POST   /api/v1/payment/webhook                 - Stripe webhook
GET    /api/v1/payment/:appointmentId          - Get payment details
POST   /api/v1/payment/:paymentId/refund       - Refund payment
```

### Payout Endpoints:
```
POST   /api/v1/payout/onboarding-link          - Get Stripe onboarding link
GET    /api/v1/payout/account-status           - Check account status
POST   /api/v1/payout/create                   - Create payout
GET    /api/v1/payout/list                     - List payouts
GET    /api/v1/payout/:id                      - Get payout details
GET    /api/v1/payout/doctors                  - List doctors for payout
```

### Chat Endpoints:
```
GET    /api/v1/chat/doctors                    - List doctors for chat
GET    /api/v1/chat/messages/:doctorId         - Get message history
POST   /api/v1/chat/send                       - Send message
PUT    /api/v1/chat/mark-read/:messageId       - Mark as read
DELETE /api/v1/chat/:messageId                 - Delete message
```

### Video Endpoints:
```
POST   /api/v1/video/generate-token            - Get Agora token
POST   /api/v1/video/start-call                - Initiate call
POST   /api/v1/video/end-call                  - End call
GET    /api/v1/video/call-history              - Get call logs
```

### Socket.io Events:
```
// Client to Server
message:send          - Send chat message
message:read          - Mark message as read
call:initiate         - Start video call
call:accept           - Accept incoming call
call:reject           - Reject incoming call
call:end              - End active call

// Server to Client
message:new           - New message received
message:delivered     - Message delivered
call:incoming         - Incoming call notification
call:started          - Call successfully started
call:ended            - Call ended by other party
user:online           - Doctor came online
user:offline          - Doctor went offline
```

---

## 🔐 Security Considerations

### Payment Security:
✅ PCI DSS compliance via Stripe Elements
✅ No raw card data stored
✅ Webhook signature verification
✅ HTTPS only
✅ Idempotency keys for payment operations
✅ Rate limiting on payment endpoints

### Payout Security:
✅ Admin-only access with role verification
✅ Stripe handles sensitive banking data
✅ Audit logging for all payout operations
✅ Two-factor authentication recommended
✅ Email notifications for payouts
✅ Transaction limits and approval workflows

### Communication Security:
✅ JWT authentication for Socket.io
✅ Doctor-role verification
✅ WSS (encrypted WebSocket)
✅ Rate limiting on messages
✅ Content filtering for inappropriate messages
✅ Block/report functionality
✅ Secure token generation for video calls
✅ Time-limited Agora tokens

---

## 📝 Testing Checklist

### Payment System Tests:
- [ ] Create payment intent
- [ ] Complete successful payment
- [ ] Handle payment failure
- [ ] Test payment timeout
- [ ] Verify webhook handling
- [ ] Test refund process
- [ ] Check appointment confirmation
- [ ] Test with different card types

### Payout System Tests:
- [ ] Doctor onboarding flow
- [ ] Account status verification
- [ ] Create payout
- [ ] Verify payout completion
- [ ] Handle payout failures
- [ ] Test with different amounts
- [ ] Check audit logs
- [ ] Test email notifications

### Communication Tests:
- [ ] Send/receive messages
- [ ] Real-time message delivery
- [ ] Read receipts
- [ ] Online/offline status
- [ ] Initiate video call
- [ ] Accept/reject call
- [ ] Video/audio quality
- [ ] Call end handling
- [ ] Multiple concurrent calls
- [ ] Reconnection after disconnect

---

## 🚀 Deployment Considerations

### Environment Setup:
1. **Production Stripe Keys** - Use live keys, not test keys
2. **Webhook URLs** - Update to production domain
3. **Agora Production** - Use production Agora project
4. **SSL Certificates** - Required for Stripe and WebRTC
5. **Database Backups** - Before deploying new schema
6. **Environment Variables** - Set all production values

### Performance Optimization:
1. **Database Indexes** - Already included in schema
2. **Caching** - Cache doctor lists, clinic info
3. **CDN** - Serve static assets from CDN
4. **WebSocket Scaling** - Use Socket.io Redis adapter for multiple servers
5. **Message Queues** - For webhook processing
6. **Rate Limiting** - Protect all endpoints

### Monitoring:
1. **Payment Monitoring** - Track success/failure rates
2. **Payout Monitoring** - Monitor transfer status
3. **WebSocket Health** - Connection stability
4. **Error Logging** - Sentry or similar
5. **Performance Metrics** - Response times
6. **User Analytics** - Feature usage

---

## 📚 Next Steps

**Ready to start? Here's the recommended order:**

1. ✅ **Complete Pre-Implementation Checklist** (above)
2. ✅ **Run Database Migration**
3. 🔨 **Implement Phase 1: Payment System** (I'll help you build this)
4. 🔨 **Implement Phase 2: Payout System**
5. 🔨 **Implement Phase 3: Communication Platform**
6. 🧪 **Testing & QA**
7. 🚀 **Deployment**

---

## 💡 Development Tips

### For Payment System:
- Start with Stripe test mode
- Use test card: 4242 4242 4242 4242
- Test webhook locally with Stripe CLI
- Implement idempotency carefully
- Handle all payment states

### For Payout System:
- Use Stripe Connect Express accounts (easier)
- Test with Stripe test bank accounts
- Implement proper error handling
- Add approval workflows if needed
- Keep detailed audit logs

### For Communication:
- Test Socket.io connection stability
- Implement reconnection logic
- Handle network interruptions gracefully
- Test video calls on different networks
- Optimize for mobile devices
- Implement message pagination

---

## 📞 Support Resources

- **Stripe Documentation:** https://stripe.com/docs
- **Stripe Connect Guide:** https://stripe.com/docs/connect
- **Agora Documentation:** https://docs.agora.io
- **Socket.io Guide:** https://socket.io/docs/v4/
- **WebRTC Tutorial:** https://webrtc.org/getting-started/

---

**Ready to start implementing?** 

Let me know which feature you want to build first, and I'll create all the necessary code files with complete implementations!

**Recommended Start:** Payment System (most critical for revenue)
