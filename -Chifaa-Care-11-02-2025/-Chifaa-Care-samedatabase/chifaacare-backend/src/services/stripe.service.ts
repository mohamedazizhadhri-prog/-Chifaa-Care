import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Initialize Stripe only if API key is provided
if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_your_stripe_secret_key_here') {
  console.warn('[Stripe] Warning: STRIPE_SECRET_KEY not configured. Payment features will be disabled.');
}

const stripe = process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_your_stripe_secret_key_here'
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-09-30.clover', typescript: true })
  : null as any;

export class StripeService {
  /**
   * Create a payment intent for appointment payment
   */
  static async createPaymentIntent(
    appointmentId: string,
    patientId: string,
    amount: number,
    currency: string = 'usd',
    metadata?: Record<string, string>
  ) {
    if (!stripe) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in your .env file.');
    }
    
    try {
      // Check if payment already exists for this appointment
      const existingPayment = await prisma.payment.findUnique({
        where: { appointmentId },
      });

      if (existingPayment) {
        // If payment exists and is not failed/cancelled, return existing
        if (!['FAILED', 'CANCELLED'].includes(existingPayment.status)) {
          return {
            payment: existingPayment,
            clientSecret: existingPayment.stripeClientSecret,
          };
        }
      }

      // Create Stripe Payment Intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata: {
          appointmentId,
          patientId,
          ...metadata,
        },
        automatic_payment_methods: {
          enabled: true, // Enable all payment methods
        },
      });

      // Mark appointment as RESERVED temporarily while payment is in progress
      try {
        await prisma.appointment.update({
          where: { id: appointmentId },
          data: { status: 'RESERVED', updatedAt: new Date() },
        });
      } catch (e) {
        // non-fatal: log and continue
        console.warn('Failed to mark appointment as RESERVED:', (e as any)?.message || e);
      }

      // Create or update payment record in database
      const payment = await prisma.payment.upsert({
        where: { appointmentId },
        create: {
          appointmentId,
          patientId,
          amount,
          currency: currency.toUpperCase(),
          status: 'PENDING',
          stripePaymentIntentId: paymentIntent.id,
          stripeClientSecret: paymentIntent.client_secret,
          metadata: metadata || {},
        },
        update: {
          stripePaymentIntentId: paymentIntent.id,
          stripeClientSecret: paymentIntent.client_secret,
          status: 'PENDING',
          updatedAt: new Date(),
        },
      });

      return {
        payment,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }
  }

  /**
   * Confirm payment status from Stripe
   */
  static async confirmPayment(paymentIntentId: string) {
    if (!stripe) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in your .env file.');
    }
    
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      // Update payment record in database
      const payment = await prisma.payment.findFirst({
        where: { stripePaymentIntentId: paymentIntentId },
      });

      if (!payment) {
        throw new Error('Payment record not found');
      }

      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          // mapStripeStatusToPaymentStatus returns string; cast to any to satisfy Prisma enum typing
          status: this.mapStripeStatusToPaymentStatus(paymentIntent.status) as any,
          paymentMethod: paymentIntent.payment_method as string | null,
          updatedAt: new Date(),
        },
      });

      // If payment succeeded, update appointment status
      if (paymentIntent.status === 'succeeded') {
        await prisma.appointment.update({
          where: { id: payment.appointmentId },
          data: {
            status: 'CONFIRMED',
            updatedAt: new Date(),
          },
        });
      }

      return {
        payment: updatedPayment,
        stripeStatus: paymentIntent.status,
      };
    } catch (error: any) {
      console.error('Error confirming payment:', error);
      throw new Error(`Failed to confirm payment: ${error.message}`);
    }
  }

  /**
   * Handle Stripe webhook events
   */
  static async handleWebhook(signature: string, body: Buffer) {
    if (!stripe) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in your .env file.');
    }
    
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
      
      // Verify webhook signature
      const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

      console.log(`Webhook received: ${event.type}`);

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;
        
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
          break;
        
        case 'payment_intent.canceled':
          await this.handlePaymentCanceled(event.data.object as Stripe.PaymentIntent);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true, type: event.type };
    } catch (error: any) {
      console.error('Webhook error:', error);
      throw new Error(`Webhook error: ${error.message}`);
    }
  }

  /**
   * Handle successful payment
   */
  private static async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    try {
      const payment = await prisma.payment.findFirst({
        where: { stripePaymentIntentId: paymentIntent.id },
        include: { appointment: true },
      });

      if (!payment) {
        console.error('Payment record not found for PaymentIntent:', paymentIntent.id);
        return;
      }

      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCEEDED',
          paymentMethod: paymentIntent.payment_method as string | null,
          updatedAt: new Date(),
        },
      });

      // Confirm appointment
      await prisma.appointment.update({
        where: { id: payment.appointmentId },
        data: {
          status: 'CONFIRMED',
          updatedAt: new Date(),
        },
      });

      console.log(`Payment succeeded for appointment ${payment.appointmentId}`);

      // TODO: Send confirmation email to patient
      // TODO: Send notification to doctor
    } catch (error) {
      console.error('Error handling payment succeeded:', error);
    }
  }

  /**
   * Handle failed payment
   */
  private static async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    try {
      const payment = await prisma.payment.findFirst({
        where: { stripePaymentIntentId: paymentIntent.id },
      });

      if (!payment) {
        console.error('Payment record not found for PaymentIntent:', paymentIntent.id);
        return;
      }

      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          updatedAt: new Date(),
        },
      });

      // Update appointment status back to PENDING
      await prisma.appointment.update({
        where: { id: payment.appointmentId },
        data: {
          status: 'PENDING',
          updatedAt: new Date(),
        },
      });

      console.log(`Payment failed for appointment ${payment.appointmentId}`);

      // TODO: Send failure notification to patient
    } catch (error) {
      console.error('Error handling payment failed:', error);
    }
  }

  /**
   * Handle canceled payment
   */
  private static async handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
    try {
      const payment = await prisma.payment.findFirst({
        where: { stripePaymentIntentId: paymentIntent.id },
      });

      if (!payment) {
        console.error('Payment record not found for PaymentIntent:', paymentIntent.id);
        return;
      }

      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'CANCELLED',
          updatedAt: new Date(),
        },
      });

      // Release appointment slot (delete or mark as cancelled)
      await prisma.appointment.update({
        where: { id: payment.appointmentId },
        data: {
          status: 'CANCELLED',
          updatedAt: new Date(),
        },
      });

      console.log(`Payment canceled for appointment ${payment.appointmentId}`);
    } catch (error) {
      console.error('Error handling payment canceled:', error);
    }
  }

  /**
   * Create a refund for a payment
   */
  static async createRefund(paymentId: string, amount?: number, reason?: string) {
    if (!stripe) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in your .env file.');
    }
    
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
      });

      if (!payment || !payment.stripePaymentIntentId) {
        throw new Error('Payment not found or no Stripe payment intent');
      }

      if (payment.status !== 'SUCCEEDED') {
        throw new Error('Can only refund succeeded payments');
      }

      // Create refund in Stripe
      const refund = await stripe.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined, // Partial or full refund
        reason: reason as any,
      });

      // Update payment status
      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'REFUNDED',
          updatedAt: new Date(),
        },
      });

      return {
        payment: updatedPayment,
        refund,
      };
    } catch (error: any) {
      console.error('Error creating refund:', error);
      throw new Error(`Failed to create refund: ${error.message}`);
    }
  }

  /**
   * Get payment by appointment ID
   */
  static async getPaymentByAppointment(appointmentId: string) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { appointmentId },
        include: {
          patient: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          appointment: {
            select: {
              id: true,
              appointmentDate: true,
              status: true,
              doctor: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

      return payment;
    } catch (error: any) {
      console.error('Error getting payment:', error);
      throw new Error(`Failed to get payment: ${error.message}`);
    }
  }

  /**
   * Get payment history for a patient
   */
  static async getPaymentHistory(patientId: string, limit: number = 50) {
    try {
      const payments = await prisma.payment.findMany({
        where: { patientId },
        include: {
          appointment: {
            select: {
              id: true,
              appointmentDate: true,
              status: true,
              doctor: {
                select: {
                  firstName: true,
                  lastName: true,
                  doctorProfile: {
                    select: {
                      specialization: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return payments;
    } catch (error: any) {
      console.error('Error getting payment history:', error);
      throw new Error(`Failed to get payment history: ${error.message}`);
    }
  }

  /**
   * Map Stripe payment status to our PaymentStatus enum
   */
  private static mapStripeStatusToPaymentStatus(stripeStatus: string): string {
    const statusMap: Record<string, string> = {
      'requires_payment_method': 'PENDING',
      'requires_confirmation': 'PENDING',
      'requires_action': 'PROCESSING',
      'processing': 'PROCESSING',
      'succeeded': 'SUCCEEDED',
      'canceled': 'CANCELLED',
      'requires_capture': 'PROCESSING',
    };

    return statusMap[stripeStatus] || 'PENDING';
  }

  /**
   * Cancel a payment intent
   */
  static async cancelPaymentIntent(paymentIntentId: string) {
    if (!stripe) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in your .env file.');
    }
    
    try {
      const canceled = await stripe.paymentIntents.cancel(paymentIntentId);

      const payment = await prisma.payment.findFirst({
        where: { stripePaymentIntentId: paymentIntentId },
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'CANCELLED',
            updatedAt: new Date(),
          },
        });
      }

      return canceled;
    } catch (error: any) {
      console.error('Error canceling payment intent:', error);
      throw new Error(`Failed to cancel payment: ${error.message}`);
    }
  }
}

export default StripeService;
