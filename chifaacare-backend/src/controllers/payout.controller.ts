import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import StripeConnectService from '../services/stripeConnect.service';

const prisma = new PrismaClient();

export const listClinicDoctors = async (req: Request, res: Response) => {
  try {
    const clinicId = (req as any).user?.clinicId;
    if (!clinicId) return res.status(403).json({ status: 'error', message: 'No clinic associated' });

    const doctors = await prisma.user.findMany({
      where: { clinicId, role: 'DOCTOR' },
      select: { id: true, email: true, firstName: true, lastName: true, stripeAccountId: true },
    });

    res.status(200).json({ status: 'success', results: doctors.length, data: doctors });
  } catch (error: any) {
    console.error('Error listing clinic doctors:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const createDoctorOnboarding = async (req: Request, res: Response) => {
  try {
    const { doctorId, returnUrl, refreshUrl } = req.body;
    if (!doctorId || !returnUrl || !refreshUrl) return res.status(400).json({ status: 'error', message: 'doctorId, returnUrl and refreshUrl required' });

    const result = await StripeConnectService.createAccountLinkForDoctor(doctorId, returnUrl, refreshUrl);
    res.status(200).json({ status: 'success', data: result });
  } catch (error: any) {
    console.error('Error creating onboarding link:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const createPayout = async (req: Request, res: Response) => {
  try {
    const clinicId = (req as any).user?.clinicId;
    const { doctorId, amount, currency = 'usd' } = req.body;
    if (!clinicId) return res.status(403).json({ status: 'error', message: 'No clinic associated' });
    if (!doctorId || !amount) return res.status(400).json({ status: 'error', message: 'doctorId and amount required' });

    const doctor = await prisma.user.findUnique({ where: { id: doctorId } });
    if (!doctor || !doctor.stripeAccountId) return res.status(400).json({ status: 'error', message: 'Doctor not onboarded to payouts' });

    const transfer = await StripeConnectService.createPayoutToDoctor(doctor.stripeAccountId, amount, currency);

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
  } catch (error: any) {
    console.error('Error creating payout:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export default { listClinicDoctors, createDoctorOnboarding, createPayout };
