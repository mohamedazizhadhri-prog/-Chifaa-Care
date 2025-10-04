import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';

const prisma = new PrismaClient();

// Create a treatment plan
export const createPlan = async (req: any, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ status: 'error', errors: errors.array() });

    if (req.user?.role !== 'DOCTOR' && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ status: 'error', message: 'Only doctors or admins can create plans' });
    }

    const { patientId, title, diagnosis, goals, carePlan, status, startDate, endDate } = req.body;
    const doctorId = req.user.role === 'DOCTOR' ? req.user.id : (req.body.doctorId || undefined);
    if (!doctorId) return res.status(400).json({ status: 'error', message: 'doctorId is required' });

    const plan = await prisma.treatmentPlan.create({
      data: {
        patientId,
        doctorId,
        title,
        diagnosis,
        goals,
        carePlan,
        status: status || 'ACTIVE',
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      }
    });

    return res.status(201).json({ status: 'success', data: { plan } });
  } catch (error) {
    console.error('Create plan error:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to create plan' });
  }
};

// List plans (filter by patientId, status)
export const listPlans = async (req: any, res: Response) => {
  try {
    const { patientId, status } = req.query;

    // Role-based scoping: doctor sees own patients; admin sees all
    const where: any = {};
    if (patientId) where.patientId = String(patientId);
    if (status) where.status = String(status);
    if (req.user?.role === 'DOCTOR') where.doctorId = req.user.id;

    const plans = await prisma.treatmentPlan.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });

    return res.status(200).json({ status: 'success', results: plans.length, data: { plans } });
  } catch (error) {
    console.error('List plans error:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to list plans' });
  }
};

export const getPlanById = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const plan = await prisma.treatmentPlan.findUnique({
      where: { id },
      include: {
        notes: true,
        medications: true,
        patient: { select: { id: true, firstName: true, lastName: true, email: true } },
        doctor: { select: { id: true, firstName: true, lastName: true, email: true } },
      }
    });
    if (!plan) return res.status(404).json({ status: 'error', message: 'Plan not found' });

    // Access control: doctor who owns, patient, or admin
    if (
      req.user?.role !== 'ADMIN' &&
      plan.doctorId !== req.user?.id &&
      plan.patientId !== req.user?.id
    ) {
      return res.status(403).json({ status: 'error', message: 'Forbidden' });
    }

    return res.status(200).json({ status: 'success', data: { plan } });
  } catch (error) {
    console.error('Get plan error:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to fetch plan' });
  }
};

export const updatePlan = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body || {};

    const existing = await prisma.treatmentPlan.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ status: 'error', message: 'Plan not found' });

    if (req.user?.role !== 'ADMIN' && existing.doctorId !== req.user?.id) {
      return res.status(403).json({ status: 'error', message: 'Only the owning doctor or admin can update the plan' });
    }

    const updated = await prisma.treatmentPlan.update({
      where: { id },
      data: {
        title: body.title ?? undefined,
        diagnosis: body.diagnosis ?? undefined,
        goals: body.goals ?? undefined,
        carePlan: body.carePlan ?? undefined,
        status: body.status ?? undefined,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
      }
    });

    return res.status(200).json({ status: 'success', data: { plan: updated } });
  } catch (error) {
    console.error('Update plan error:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to update plan' });
  }
};

export const addNote = async (req: any, res: Response) => {
  try {
    const { id } = req.params; // planId
    const { content, isImportant } = req.body;

    const plan = await prisma.treatmentPlan.findUnique({ where: { id } });
    if (!plan) return res.status(404).json({ status: 'error', message: 'Plan not found' });
    if (req.user?.role !== 'ADMIN' && plan.doctorId !== req.user?.id) {
      return res.status(403).json({ status: 'error', message: 'Only the owning doctor or admin can add notes' });
    }

    const note = await prisma.treatmentNote.create({
      data: {
        planId: id,
        doctorId: req.user.id,
        content,
        isImportant: !!isImportant
      }
    });

    return res.status(201).json({ status: 'success', data: { note } });
  } catch (error) {
    console.error('Add note error:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to add note' });
  }
};

export const listNotes = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const notes = await prisma.treatmentNote.findMany({ where: { planId: id }, orderBy: { createdAt: 'desc' } });
    return res.status(200).json({ status: 'success', results: notes.length, data: { notes } });
  } catch (error) {
    console.error('List notes error:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to list notes' });
  }
};

export const addMedication = async (req: any, res: Response) => {
  try {
    const { id } = req.params; // planId
    const { name, dose, frequency, route, instructions, startDate, endDate, isActive } = req.body;

    const plan = await prisma.treatmentPlan.findUnique({ where: { id } });
    if (!plan) return res.status(404).json({ status: 'error', message: 'Plan not found' });
    if (req.user?.role !== 'ADMIN' && plan.doctorId !== req.user?.id) {
      return res.status(403).json({ status: 'error', message: 'Only the owning doctor or admin can add medication' });
    }

    const med = await prisma.medication.create({
      data: {
        planId: id,
        name,
        dose,
        frequency,
        route,
        instructions,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        isActive: isActive !== undefined ? !!isActive : true
      }
    });

    return res.status(201).json({ status: 'success', data: { medication: med } });
  } catch (error) {
    console.error('Add medication error:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to add medication' });
  }
};

export const listMedications = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const meds = await prisma.medication.findMany({ where: { planId: id }, orderBy: { startDate: 'desc' } });
    return res.status(200).json({ status: 'success', results: meds.length, data: { medications: meds } });
  } catch (error) {
    console.error('List medications error:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to list medications' });
  }
};
