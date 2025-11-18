import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Initialize Stripe only if API key is provided
if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_your_stripe_secret_key_here') {
  console.warn('[Stripe] Warning: STRIPE_SECRET_KEY not configured. Stripe features will be disabled.');
}

const stripe = process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_your_stripe_secret_key_here'
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-09-30.clover', typescript: true })
  : null as any;

export class StripeConnectService {
  static async createAccountLinkForDoctor(userId: string, returnUrl: string, refreshUrl: string) {
    if (!stripe) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in your .env file.');
    }
    
    // Ensure doctor exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    // Create Express account for the doctor (Stripe Connect)
    const account = await stripe.accounts.create({
      type: 'express',
      email: user.email,
      business_type: 'individual',
    });

    // Save account id on user record (non-invasive)
    await prisma.user.update({ where: { id: userId }, data: { stripeAccountId: account.id as any } as any }).catch(() => {});

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return { account, accountLink };
  }

  static async createPayoutToDoctor(doctorStripeAccountId: string, amount: number, currency = 'usd') {
    if (!stripe) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in your .env file.');
    }
    
    // For Connect transfers, we can create a Transfer to the connected account or use PaymentIntents with destination
    // Note: This operation requires that the platform balance has funds and is properly configured.
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      destination: doctorStripeAccountId,
    });

    return transfer;
  }
}

export default StripeConnectService;
