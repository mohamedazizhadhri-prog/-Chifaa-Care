"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySession = exports.createCheckoutSession = void 0;
const stripe_1 = __importDefault(require("stripe"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || '');
const CURRENCY = (process.env.STRIPE_CURRENCY || 'usd').toLowerCase();
const APP_URL = process.env.APP_URL || 'http://localhost:4200';
function toMinorUnits(amount) {
    // amount is in major units; convert to minor (e.g., 50.25 -> 5025)
    return Math.round(amount * 100);
}
const createCheckoutSession = async (req, res) => {
    var _a, _b, _c, _d;
    try {
        const { appointmentId } = req.body;
        if (!appointmentId)
            return res.status(400).json({ status: 'error', message: 'appointmentId required' });
        const appt = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: {
                clinicService: { include: { clinic: true } },
                doctor: { include: { doctorProfile: true } },
                patient: true,
            },
        });
        if (!appt)
            return res.status(404).json({ status: 'error', message: 'Appointment not found' });
        // Determine amount: prefer clinic service basePrice, then doctor's consultationFee, else 50.00
        let amountMajor = 50;
        if ((_a = appt.clinicService) === null || _a === void 0 ? void 0 : _a.basePrice)
            amountMajor = appt.clinicService.basePrice;
        else if ((_b = appt.doctor.doctorProfile) === null || _b === void 0 ? void 0 : _b.consultationFee)
            amountMajor = appt.doctor.doctorProfile.consultationFee;
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
                clinicId: ((_c = appt.clinicService) === null || _c === void 0 ? void 0 : _c.clinicId) || '',
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
                stripePaymentIntentId: session.payment_intent || undefined,
                stripeClientSecret: undefined,
                // optionally store clinicId in metadata
                metadata: { clinicId: ((_d = appt.clinicService) === null || _d === void 0 ? void 0 : _d.clinicId) || appt.doctor.clinicId || null },
            },
        });
        res.json({ status: 'success', data: { url: session.url, sessionId: session.id } });
    }
    catch (err) {
        console.error('createCheckoutSession error', err);
        res.status(500).json({ status: 'error', message: err.message || 'Failed to create checkout session' });
    }
};
exports.createCheckoutSession = createCheckoutSession;
const verifySession = async (req, res) => {
    var _a, _b;
    try {
        const { sessionId } = req.params;
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const paid = session.payment_status === 'paid';
        // Update Payment record (use appointmentId metadata to find the payment)
        const apptId = (_a = session.metadata) === null || _a === void 0 ? void 0 : _a.appointmentId;
        if (apptId) {
            await prisma.payment.updateMany({
                where: { appointmentId: apptId },
                data: {
                    status: paid ? 'SUCCEEDED' : 'FAILED',
                    stripePaymentIntentId: session.payment_intent,
                },
            });
        }
        // If paid, optionally mark appointment as COMPLETED (if not already) or store flag
        if (paid && ((_b = session.metadata) === null || _b === void 0 ? void 0 : _b.appointmentId)) {
            const apptId = session.metadata.appointmentId;
            await prisma.appointment.update({ where: { id: apptId }, data: { status: 'COMPLETED' } }).catch(() => { });
        }
        res.json({ status: 'success', data: { paid, session } });
    }
    catch (err) {
        res.status(500).json({ status: 'error', message: err.message || 'Failed to verify session' });
    }
};
exports.verifySession = verifySession;
