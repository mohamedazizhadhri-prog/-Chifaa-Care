"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = exports.cancelPayment = exports.createRefund = exports.getPaymentHistory = exports.getPayment = exports.handleWebhook = exports.confirmPayment = exports.createPaymentIntent = void 0;
const client_1 = require("@prisma/client");
const stripe_service_1 = __importDefault(require("../services/stripe.service"));
const prisma = new client_1.PrismaClient();
/**
 * Create payment intent for appointment
 * POST /api/v1/payment/create-intent
 */
const createPaymentIntent = async (req, res) => {
    var _a, _b;
    try {
        const { appointmentId, amount, currency = 'usd' } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // From auth middleware
        if (!appointmentId || !amount) {
            return res.status(400).json({
                status: 'error',
                message: 'Appointment ID and amount are required',
            });
        }
        // Verify appointment exists and belongs to the patient
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: {
                doctor: {
                    include: {
                        doctorProfile: true,
                    },
                },
            },
        });
        if (!appointment) {
            return res.status(404).json({
                status: 'error',
                message: 'Appointment not found',
            });
        }
        if (appointment.patientId !== userId) {
            return res.status(403).json({
                status: 'error',
                message: 'Unauthorized to create payment for this appointment',
            });
        }
        // Check if appointment is already confirmed
        if (appointment.status === 'CONFIRMED') {
            return res.status(400).json({
                status: 'error',
                message: 'Appointment is already confirmed',
            });
        }
        // Create payment intent
        const result = await stripe_service_1.default.createPaymentIntent(appointmentId, userId, amount, currency, {
            doctorName: `${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
            specialization: ((_b = appointment.doctor.doctorProfile) === null || _b === void 0 ? void 0 : _b.specialization) || 'General',
        });
        res.status(200).json({
            status: 'success',
            data: {
                clientSecret: result.clientSecret,
                paymentId: result.payment.id,
                amount: result.payment.amount,
                currency: result.payment.currency,
            },
        });
    }
    catch (error) {
        console.error('Error in createPaymentIntent:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to create payment intent',
        });
    }
};
exports.createPaymentIntent = createPaymentIntent;
/**
 * Confirm payment status
 * POST /api/v1/payment/confirm
 */
const confirmPayment = async (req, res) => {
    var _a;
    try {
        const { paymentIntentId } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!paymentIntentId) {
            return res.status(400).json({
                status: 'error',
                message: 'Payment intent ID is required',
            });
        }
        // Confirm payment with Stripe
        const result = await stripe_service_1.default.confirmPayment(paymentIntentId);
        // Verify user owns this payment
        if (result.payment.patientId !== userId) {
            return res.status(403).json({
                status: 'error',
                message: 'Unauthorized',
            });
        }
        res.status(200).json({
            status: 'success',
            data: {
                payment: result.payment,
                stripeStatus: result.stripeStatus,
            },
        });
    }
    catch (error) {
        console.error('Error in confirmPayment:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to confirm payment',
        });
    }
};
exports.confirmPayment = confirmPayment;
/**
 * Stripe webhook handler
 * POST /api/v1/payment/webhook
 */
const handleWebhook = async (req, res) => {
    try {
        const signature = req.headers['stripe-signature'];
        if (!signature) {
            return res.status(400).json({
                status: 'error',
                message: 'No signature provided',
            });
        }
        // Handle webhook event
        const result = await stripe_service_1.default.handleWebhook(signature, req.body);
        res.status(200).json({
            status: 'success',
            received: true,
            type: result.type,
        });
    }
    catch (error) {
        console.error('Webhook error:', error);
        res.status(400).json({
            status: 'error',
            message: error.message || 'Webhook handling failed',
        });
    }
};
exports.handleWebhook = handleWebhook;
/**
 * Get payment details
 * GET /api/v1/payment/:appointmentId
 */
const getPayment = async (req, res) => {
    var _a;
    try {
        const { appointmentId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const payment = await stripe_service_1.default.getPaymentByAppointment(appointmentId);
        if (!payment) {
            return res.status(404).json({
                status: 'error',
                message: 'Payment not found',
            });
        }
        // Verify user is authorized (patient or doctor)
        if (payment.patientId !== userId && payment.appointment.doctor.id !== userId) {
            return res.status(403).json({
                status: 'error',
                message: 'Unauthorized',
            });
        }
        res.status(200).json({
            status: 'success',
            data: payment,
        });
    }
    catch (error) {
        console.error('Error in getPayment:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to get payment',
        });
    }
};
exports.getPayment = getPayment;
/**
 * Get payment history for patient
 * GET /api/v1/payment/history
 */
const getPaymentHistory = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const limit = parseInt(req.query.limit) || 50;
        const payments = await stripe_service_1.default.getPaymentHistory(userId, limit);
        res.status(200).json({
            status: 'success',
            data: payments,
        });
    }
    catch (error) {
        console.error('Error in getPaymentHistory:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to get payment history',
        });
    }
};
exports.getPaymentHistory = getPaymentHistory;
/**
 * Create refund for payment
 * POST /api/v1/payment/:paymentId/refund
 */
const createRefund = async (req, res) => {
    var _a, _b;
    try {
        const { paymentId } = req.params;
        const { amount, reason } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
        // Only admins and doctors can create refunds
        if (!['ADMIN', 'DOCTOR'].includes(userRole)) {
            return res.status(403).json({
                status: 'error',
                message: 'Unauthorized to create refunds',
            });
        }
        const result = await stripe_service_1.default.createRefund(paymentId, amount, reason);
        res.status(200).json({
            status: 'success',
            data: result,
            message: 'Refund created successfully',
        });
    }
    catch (error) {
        console.error('Error in createRefund:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to create refund',
        });
    }
};
exports.createRefund = createRefund;
/**
 * Cancel payment intent
 * POST /api/v1/payment/:paymentIntentId/cancel
 */
const cancelPayment = async (req, res) => {
    var _a;
    try {
        const { paymentIntentId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        // Verify payment belongs to user
        const payment = await prisma.payment.findFirst({
            where: { stripePaymentIntentId: paymentIntentId },
        });
        if (!payment) {
            return res.status(404).json({
                status: 'error',
                message: 'Payment not found',
            });
        }
        if (payment.patientId !== userId) {
            return res.status(403).json({
                status: 'error',
                message: 'Unauthorized',
            });
        }
        const canceled = await stripe_service_1.default.cancelPaymentIntent(paymentIntentId);
        res.status(200).json({
            status: 'success',
            data: canceled,
            message: 'Payment canceled successfully',
        });
    }
    catch (error) {
        console.error('Error in cancelPayment:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to cancel payment',
        });
    }
};
exports.cancelPayment = cancelPayment;
/**
 * Get Stripe publishable key
 * GET /api/v1/payment/config
 */
const getConfig = async (req, res) => {
    try {
        res.status(200).json({
            status: 'success',
            data: {
                publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
            },
        });
    }
    catch (error) {
        console.error('Error in getConfig:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get config',
        });
    }
};
exports.getConfig = getConfig;
