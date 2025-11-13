import express from 'express';
import { protect, restrictTo } from '../controllers/auth.controller';
import { createCheckoutSession, verifySession } from '../controllers/payments.controller';

const router = express.Router();

// Patient must be authenticated to pay. Admin/Clinic could also create sessions on behalf.
router.use(protect);

// Create a Stripe Checkout session for an appointment
router.post('/checkout', restrictTo('PATIENT', 'ADMIN', 'CLINIC', 'DOCTOR'), createCheckoutSession);

// Verify a session status (after redirect), optional
router.get('/session/:sessionId', verifySession);

export default router;
