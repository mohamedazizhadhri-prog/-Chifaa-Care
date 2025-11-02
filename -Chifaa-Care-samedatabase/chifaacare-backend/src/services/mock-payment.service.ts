import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Mock Payment Service for Development
 * Use this when Stripe is not configured
 * 
 * 🚀 TO ENABLE REAL CREDIT CARD PAYMENTS:
 * 1. Sign up at https://dashboard.stripe.com/register
 * 2. Get your API keys from Developers > API keys
 * 3. Update .env file with real keys:
 *    STRIPE_SECRET_KEY="sk_test_your_real_key"
 *    STRIPE_PUBLISHABLE_KEY="pk_test_your_real_key"
 * 4. Restart backend - payments will automatically use real Stripe!
 * 
 * Test Cards: 4242 4242 4242 4242 (success), 4000 0000 0000 0002 (decline)
 */
export class MockPaymentService {
  
  /**
   * Create a mock payment intent
   */
  static async createPaymentIntent(
    appointmentId: string,
    patientId: string,
    amount: number,
    currency: string = 'usd',
    metadata?: Record<string, string>
  ) {
    console.log('[MockPayment] Creating mock payment intent');
    
    try {
      // Check if payment already exists
      const existingPayment = await prisma.payment.findUnique({
        where: { appointmentId },
      });

      if (existingPayment && !['FAILED', 'CANCELLED'].includes(existingPayment.status)) {
        return {
          payment: existingPayment,
          clientSecret: existingPayment.stripeClientSecret || 'mock_client_secret',
        };
      }

      // Generate mock payment intent ID
      const mockPaymentIntentId = `pi_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const mockClientSecret = `${mockPaymentIntentId}_secret_${Math.random().toString(36).substr(2, 9)}`;

      // Create or update payment record
      const payment = await prisma.payment.upsert({
        where: { appointmentId },
        create: {
          appointmentId,
          patientId,
          amount,
          currency: currency.toUpperCase(),
          status: 'PENDING',
          stripePaymentIntentId: mockPaymentIntentId,
          stripeClientSecret: mockClientSecret,
          metadata: { ...metadata, mock: 'true' },
        },
        update: {
          stripePaymentIntentId: mockPaymentIntentId,
          stripeClientSecret: mockClientSecret,
          status: 'PENDING',
          updatedAt: new Date(),
        },
      });

      console.log('[MockPayment] Mock payment intent created:', payment.id);

      return {
        payment,
        clientSecret: mockClientSecret,
        paymentIntentId: mockPaymentIntentId,
      };
    } catch (error: any) {
      console.error('[MockPayment] Error creating payment intent:', error);
      throw new Error(`Failed to create mock payment intent: ${error.message}`);
    }
  }

  /**
   * Confirm mock payment
   */
  static async confirmPayment(paymentIntentId: string) {
    console.log('[MockPayment] Confirming mock payment');
    
    try {
      const payment = await prisma.payment.findFirst({
        where: { stripePaymentIntentId: paymentIntentId },
      });

      if (!payment) {
        throw new Error('Payment record not found');
      }

      // Auto-succeed the payment
      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCEEDED',
          paymentMethod: 'mock_card',
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

      console.log('[MockPayment] Payment confirmed successfully');

      return {
        payment: updatedPayment,
        stripeStatus: 'succeeded',
      };
    } catch (error: any) {
      console.error('[MockPayment] Error confirming payment:', error);
      throw new Error(`Failed to confirm mock payment: ${error.message}`);
    }
  }

  /**
   * Get payment by appointment
   */
  static async getPaymentByAppointment(appointmentId: string) {
    return prisma.payment.findUnique({
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
  }

  /**
   * Get payment history
   */
  static async getPaymentHistory(patientId: string, limit: number = 50) {
    return prisma.payment.findMany({
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
  }

  /**
   * Cancel payment
   */
  static async cancelPaymentIntent(paymentIntentId: string) {
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

    return { status: 'canceled' };
  }
}

export default MockPaymentService;
