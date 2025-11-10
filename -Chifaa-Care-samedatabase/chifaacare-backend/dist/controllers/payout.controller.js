"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPayout = exports.createDoctorOnboarding = exports.listClinicDoctors = void 0;
const client_1 = require("@prisma/client");
const stripeConnect_service_1 = __importDefault(require("../services/stripeConnect.service"));
const prisma = new client_1.PrismaClient();
const listClinicDoctors = async (req, res) => {
    var _a;
    try {
        const clinicId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.clinicId;
        if (!clinicId)
            return res.status(403).json({ status: 'error', message: 'No clinic associated' });
        const doctors = await prisma.user.findMany({
            where: { clinicId, role: 'DOCTOR' },
            select: { id: true, email: true, firstName: true, lastName: true, stripeAccountId: true },
        });
        res.status(200).json({ status: 'success', results: doctors.length, data: doctors });
    }
    catch (error) {
        console.error('Error listing clinic doctors:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.listClinicDoctors = listClinicDoctors;
const createDoctorOnboarding = async (req, res) => {
    try {
        const { doctorId, returnUrl, refreshUrl } = req.body;
        if (!doctorId || !returnUrl || !refreshUrl)
            return res.status(400).json({ status: 'error', message: 'doctorId, returnUrl and refreshUrl required' });
        const result = await stripeConnect_service_1.default.createAccountLinkForDoctor(doctorId, returnUrl, refreshUrl);
        res.status(200).json({ status: 'success', data: result });
    }
    catch (error) {
        console.error('Error creating onboarding link:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.createDoctorOnboarding = createDoctorOnboarding;
const createPayout = async (req, res) => {
    var _a;
    try {
        const clinicId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.clinicId;
        const { doctorId, amount, currency = 'usd' } = req.body;
        if (!clinicId)
            return res.status(403).json({ status: 'error', message: 'No clinic associated' });
        if (!doctorId || !amount)
            return res.status(400).json({ status: 'error', message: 'doctorId and amount required' });
        const doctor = await prisma.user.findUnique({ where: { id: doctorId } });
        if (!doctor || !doctor.stripeAccountId)
            return res.status(400).json({ status: 'error', message: 'Doctor not onboarded to payouts' });
        const transfer = await stripeConnect_service_1.default.createPayoutToDoctor(doctor.stripeAccountId, amount, currency);
        // Record payout in DB
        const payout = await prisma.payout.create({
            data: {
                clinicId,
                doctorId,
                amount,
                currency: currency.toUpperCase(),
                status: 'PROCESSING',
                stripeTransferId: transfer.id,
                metadata: {},
            },
        });
        res.status(200).json({ status: 'success', data: { payout, transfer } });
    }
    catch (error) {
        console.error('Error creating payout:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};
exports.createPayout = createPayout;
exports.default = { listClinicDoctors: exports.listClinicDoctors, createDoctorOnboarding: exports.createDoctorOnboarding, createPayout: exports.createPayout };
