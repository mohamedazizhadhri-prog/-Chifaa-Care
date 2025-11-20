import { Request, Response } from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const CURRENCY = (process.env.STRIPE_CURRENCY || 'usd').toLowerCase();
const APP_URL = process.env.APP_URL || 'http://localhost:4200';

function toMinorUnits(amount: number): number {
  // amount is in major units; convert to minor (e.g., 50.25 -> 5025)
  return Math.round(amount * 100);
}

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { appointmentId } = req.body as { appointmentId: string };
    if (!appointmentId) return res.status(400).json({ status: 'error', message: 'appointmentId required' });

    const appt = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        clinicService: { include: { clinic: true } },
        doctor: { include: { doctorProfile: true } },
        patient: true,
      },
    });
    if (!appt) return res.status(404).json({ status: 'error', message: 'Appointment not found' });

    // Determine amount: prefer clinic service basePrice, then doctor's consultationFee, else 50.00
    let amountMajor = 50;
    if (appt.clinicService?.basePrice) amountMajor = appt.clinicService.basePrice;
    else if (appt.doctor.doctorProfile?.consultationFee) amountMajor = appt.doctor.doctorProfile.consultationFee;
    const amount = toMinorUnits(amountMajor);

    const description = `Consultation payment for appointment ${appt.id}`;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: `${APP_URL}/patient/appointments?payment=success&appointmentId=${appt.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/patient/appointments?payment=cancelled&appointmentId=${appt.id}`,
      customer_email: appt.patient.email,
      line_items: [
        {
          price_data: {
            currency: CURRENCY,
            product_data: { name: 'Medical consultation', description },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        appointmentId: appt.id,
        clinicId: appt.clinicService?.clinicId || '',
        patientId: appt.patientId,
        doctorId: appt.doctorId,
      },
    });

    // Create a Payment record (use PaymentStatus enum values)
    await prisma.payment.create({
      data: {
        appointmentId: appt.id,
        patientId: appt.patientId,
        amount,
        currency: CURRENCY,
        // map to Prisma PaymentStatus enum - new payment starts as PENDING
        status: 'PENDING',
        // store stripe payment intent id if available
        stripePaymentIntentId: (session.payment_intent as string) || undefined,
        stripeClientSecret: undefined,
        // optionally store clinicId in metadata
        metadata: { clinicId: appt.clinicService?.clinicId || appt.doctor.clinicId || null },
      },
    });

    res.json({ status: 'success', data: { url: session.url, sessionId: session.id } });
  } catch (err: any) {
    console.error('createCheckoutSession error', err);
    res.status(500).json({ status: 'error', message: err.message || 'Failed to create checkout session' });
  }
};

export const verifySession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params as { sessionId: string };
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid = session.payment_status === 'paid';

    // Update Payment record (use appointmentId metadata to find the payment)
    const apptId = (session as any).metadata?.appointmentId as string | undefined;
    if (apptId) {
      await prisma.payment.updateMany({
        where: { appointmentId: apptId },
        data: {
          status: paid ? 'SUCCEEDED' : 'FAILED',
          stripePaymentIntentId: (session as any).payment_intent as string | null,
        },
      });
    }

    // If paid, optionally mark appointment as COMPLETED (if not already) or store flag
    if (paid && session.metadata?.appointmentId) {
      const apptId = session.metadata.appointmentId;
      await prisma.appointment.update({ where: { id: apptId }, data: { status: 'COMPLETED' } }).catch(() => {});
    }

    res.json({ status: 'success', data: { paid, session } });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message || 'Failed to verify session' });
  }
};
