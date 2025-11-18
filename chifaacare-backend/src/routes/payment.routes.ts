import express from 'express';
import {
  createPaymentIntent,
  confirmPayment,
  handleWebhook,
  getPayment,
  getPaymentHistory,
  createRefund,
  cancelPayment,
  getConfig,
} from '../controllers/payment.controller';
import { protect, restrictTo } from '../controllers/auth.controller';

const router = express.Router();

// Public route - Get Stripe config (publishable key)
router.get('/config', getConfig);

// Webhook route - No auth required, but signature verified
// IMPORTANT: This must use raw body, not JSON parsed body
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
);

// Protected routes - Require authentication
router.use(protect); // All routes below require authentication

// Create payment intent
router.post('/create-intent', createPaymentIntent);

// Confirm payment
router.post('/confirm', confirmPayment);

// Get payment by appointment ID
router.get('/:appointmentId', getPayment);

// Get payment history (for patients)
router.get('/history', restrictTo('PATIENT'), getPaymentHistory);

// Cancel payment intent
router.post('/:paymentIntentId/cancel', cancelPayment);

// Create refund (admin and doctor only)
router.post(
  '/:paymentId/refund',
  restrictTo('ADMIN', 'DOCTOR'),
  createRefund
);

export default router;
