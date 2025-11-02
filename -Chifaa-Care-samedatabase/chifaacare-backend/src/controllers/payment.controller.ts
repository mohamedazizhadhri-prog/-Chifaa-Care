import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import StripeService from '../services/stripe.service';
import MockPaymentService from '../services/mock-payment.service';

const prisma = new PrismaClient();

// Check if Stripe is configured
const isStripeConfigured = () => {
  return process.env.STRIPE_SECRET_KEY && 
         process.env.STRIPE_SECRET_KEY !== 'sk_test_your_stripe_secret_key' &&
         process.env.STRIPE_SECRET_KEY !== 'sk_test_your_stripe_secret_key_here';
};

// Get the appropriate payment service
const getPaymentService = () => {
  if (isStripeConfigured()) {
    console.log('[Payment] Using Stripe payment service');
    return StripeService;
  } else {
    console.log('[Payment] Using Mock payment service (Stripe not configured)');
    return MockPaymentService;
  }
};

/**
 * Create payment intent for appointment
 * POST /api/v1/payment/create-intent
 */
export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const { appointmentId, amount, currency = 'usd' } = req.body;
    const userId = (req as any).user?.id; // From auth middleware

    console.log('[createPaymentIntent] Request:', { appointmentId, amount, currency, userId });

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

    // Get appropriate payment service
    const PaymentService = getPaymentService();

    // Create payment intent
    const result = await PaymentService.createPaymentIntent(
      appointmentId,
      userId,
      amount,
      currency,
      {
        doctorName: `${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
        specialization: appointment.doctor.doctorProfile?.specialization || 'General',
      }
    );

    console.log('[createPaymentIntent] Success:', result.payment.id);

    res.status(200).json({
      status: 'success',
      data: {
        clientSecret: result.clientSecret,
        paymentId: result.payment.id,
        amount: result.payment.amount,
        currency: result.payment.currency,
        useMock: !isStripeConfigured(),
      },
    });
  } catch (error: any) {
    console.error('Error in createPaymentIntent:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to create payment intent',
    });
  }
};

/**
 * Confirm payment status
 * POST /api/v1/payment/confirm
 */
export const confirmPayment = async (req: Request, res: Response) => {
  try {
    const { paymentIntentId } = req.body;
    const userId = (req as any).user?.id;

    console.log('[confirmPayment] Request:', { paymentIntentId, userId });

    if (!paymentIntentId) {
      return res.status(400).json({
        status: 'error',
        message: 'Payment intent ID is required',
      });
    }

    // Get appropriate payment service
    const PaymentService = getPaymentService();

    // Confirm payment
    const result = await PaymentService.confirmPayment(paymentIntentId);

    // Verify user owns this payment
    if (result.payment.patientId !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized',
      });
    }

    console.log('[confirmPayment] Success:', result.payment.id);

    res.status(200).json({
      status: 'success',
      data: {
        payment: result.payment,
        stripeStatus: result.stripeStatus,
      },
    });
  } catch (error: any) {
    console.error('Error in confirmPayment:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to confirm payment',
    });
  }
};

/**
 * Stripe webhook handler
 * POST /api/v1/payment/webhook
 */
export const handleWebhook = async (req: Request, res: Response) => {
  if (!isStripeConfigured()) {
    return res.status(400).json({
      status: 'error',
      message: 'Stripe webhooks are not available in mock mode',
    });
  }

  try {
    const signature = req.headers['stripe-signature'] as string;

    if (!signature) {
      return res.status(400).json({
        status: 'error',
        message: 'No signature provided',
      });
    }

    // Handle webhook event
    const result = await StripeService.handleWebhook(signature, req.body);

    res.status(200).json({
      status: 'success',
      received: true,
      type: result.type,
    });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Webhook handling failed',
    });
  }
};

/**
 * Get payment details
 * GET /api/v1/payment/:appointmentId
 */
export const getPayment = async (req: Request, res: Response) => {
  try {
    const { appointmentId } = req.params;
    const userId = (req as any).user?.id;

    const PaymentService = getPaymentService();
    const payment = await PaymentService.getPaymentByAppointment(appointmentId);

    if (!payment) {
      return res.status(404).json({
        status: 'error',
        message: 'Payment not found',
      });
    }

    // Verify user is authorized (patient or doctor)
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { doctorId: true, patientId: true },
    });

    if (!appointment || (payment.patientId !== userId && appointment.doctorId !== userId)) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized',
      });
    }

    res.status(200).json({
      status: 'success',
      data: payment,
    });
  } catch (error: any) {
    console.error('Error in getPayment:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to get payment',
    });
  }
};

/**
 * Get payment history for patient
 * GET /api/v1/payment/history
 */
export const getPaymentHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const limit = parseInt(req.query.limit as string) || 50;

    const PaymentService = getPaymentService();
    const payments = await PaymentService.getPaymentHistory(userId, limit);

    res.status(200).json({
      status: 'success',
      data: payments,
    });
  } catch (error: any) {
    console.error('Error in getPaymentHistory:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to get payment history',
    });
  }
};

/**
 * Create refund for payment
 * POST /api/v1/payment/:paymentId/refund
 */
export const createRefund = async (req: Request, res: Response) => {
  if (!isStripeConfigured()) {
    return res.status(400).json({
      status: 'error',
      message: 'Refunds are not available in mock payment mode',
    });
  }

  try {
    const { paymentId } = req.params;
    const { amount, reason } = req.body;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    // Only admins and doctors can create refunds
    if (!['ADMIN', 'DOCTOR'].includes(userRole)) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized to create refunds',
      });
    }

    const result = await StripeService.createRefund(paymentId, amount, reason);

    res.status(200).json({
      status: 'success',
      data: result,
      message: 'Refund created successfully',
    });
  } catch (error: any) {
    console.error('Error in createRefund:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to create refund',
    });
  }
};

/**
 * Cancel payment intent
 * POST /api/v1/payment/:paymentIntentId/cancel
 */
export const cancelPayment = async (req: Request, res: Response) => {
  try {
    const { paymentIntentId } = req.params;
    const userId = (req as any).user?.id;

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

    const PaymentService = getPaymentService();
    const canceled = await PaymentService.cancelPaymentIntent(paymentIntentId);

    res.status(200).json({
      status: 'success',
      data: canceled,
      message: 'Payment canceled successfully',
    });
  } catch (error: any) {
    console.error('Error in cancelPayment:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to cancel payment',
    });
  }
};

/**
 * Get Stripe publishable key
 * GET /api/v1/payment/config
 */
export const getConfig = async (req: Request, res: Response) => {
  try {
    const publishableKey = isStripeConfigured() 
      ? process.env.STRIPE_PUBLISHABLE_KEY 
      : 'pk_mock_test_key';

    res.status(200).json({
      status: 'success',
      data: {
        publishableKey,
        useMock: !isStripeConfigured(),
      },
    });
  } catch (error: any) {
    console.error('Error in getConfig:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get config',
    });
  }
};
