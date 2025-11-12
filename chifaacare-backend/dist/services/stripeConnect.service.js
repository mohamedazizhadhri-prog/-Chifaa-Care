"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeConnectService = void 0;
const stripe_1 = __importDefault(require("stripe"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Initialize Stripe only if API key is provided
if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_your_stripe_secret_key_here') {
    console.warn('[Stripe] Warning: STRIPE_SECRET_KEY not configured. Stripe features will be disabled.');
}
const stripe = process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_your_stripe_secret_key_here'
    ? new stripe_1.default(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-09-30.clover', typescript: true })
    : null;
class StripeConnectService {
    static async createAccountLinkForDoctor(userId, returnUrl, refreshUrl) {
        if (!stripe) {
            throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in your .env file.');
        }
        // Ensure doctor exists
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new Error('User not found');
        // Create Express account for the doctor (Stripe Connect)
        const account = await stripe.accounts.create({
            type: 'express',
            email: user.email,
            business_type: 'individual',
        });
        // Save account id on user record (non-invasive)
        await prisma.user.update({ where: { id: userId }, data: { stripeAccountId: account.id } }).catch(() => { });
        const accountLink = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: refreshUrl,
            return_url: returnUrl,
            type: 'account_onboarding',
        });
        return { account, accountLink };
    }
    static async createPayoutToDoctor(doctorStripeAccountId, amount, currency = 'usd') {
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
exports.StripeConnectService = StripeConnectService;
exports.default = StripeConnectService;
