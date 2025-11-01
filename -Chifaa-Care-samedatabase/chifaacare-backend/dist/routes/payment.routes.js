"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payment_controller_1 = require("../controllers/payment.controller");
const auth_controller_1 = require("../controllers/auth.controller");
const router = express_1.default.Router();
// Public route - Get Stripe config (publishable key)
router.get('/config', payment_controller_1.getConfig);
// Webhook route - No auth required, but signature verified
// IMPORTANT: This must use raw body, not JSON parsed body
router.post('/webhook', express_1.default.raw({ type: 'application/json' }), payment_controller_1.handleWebhook);
// Protected routes - Require authentication
router.use(auth_controller_1.protect); // All routes below require authentication
// Create payment intent
router.post('/create-intent', payment_controller_1.createPaymentIntent);
// Confirm payment
router.post('/confirm', payment_controller_1.confirmPayment);
// Get payment by appointment ID
router.get('/:appointmentId', payment_controller_1.getPayment);
// Get payment history (for patients)
router.get('/history', (0, auth_controller_1.restrictTo)('PATIENT'), payment_controller_1.getPaymentHistory);
// Cancel payment intent
router.post('/:paymentIntentId/cancel', payment_controller_1.cancelPayment);
// Create refund (admin and doctor only)
router.post('/:paymentId/refund', (0, auth_controller_1.restrictTo)('ADMIN', 'DOCTOR'), payment_controller_1.createRefund);
exports.default = router;
