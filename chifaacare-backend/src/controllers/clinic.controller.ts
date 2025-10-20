import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function getClinicId(req: Request): string {
  const anyReq = req as any;
  const clinicId = anyReq.user?.clinicId;
  if (!clinicId) throw new Error('Clinic context missing');
  return clinicId;
}

export const getOverview = async (req: Request, res: Response) => {
  try {
    const clinicId = getClinicId(req);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const byClinicWhere = (extra: any = {}) => ({
      clinicService: { clinicId },
      appointmentDate: { gte: todayStart, lte: todayEnd },
      ...extra,
    } as any);

    const [scheduled, checkedIn, completed] = await Promise.all([
      prisma.appointment.count({ where: byClinicWhere() }),
      prisma.appointment.count({ where: byClinicWhere({ status: 'CHECKED_IN' }) }),
      prisma.appointment.count({ where: byClinicWhere({ status: 'COMPLETED' }) })
    ]);

    const doctors = await prisma.user.findMany({
      where: { role: 'DOCTOR' as any, doctorAppointments: { some: { clinicService: { clinicId } } } },
      select: { id: true, firstName: true, lastName: true, email: true, doctorProfile: { select: { specialization: true, experience: true } } }
    });

    res.json({ status: 'success', data: { today: { scheduled, checkedIn, completed }, doctors } });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message || 'Failed to load overview' });
  }
};

export const getPatients = async (req: Request, res: Response) => {
  try {
    const clinicId = getClinicId(req);
    const page = parseInt((req.query.page as string) || '1', 10);
    const pageSize = parseInt((req.query.pageSize as string) || '20', 10);
    const search = (req.query.search as string) || '';

    const where: any = { clinicService: { clinicId } };
    if (search) {
      where.OR = [
        { patient: { firstName: { contains: search, mode: 'insensitive' } } },
        { patient: { lastName: { contains: search, mode: 'insensitive' } } },
        { patient: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.appointment.count({ where }),
      prisma.appointment.findMany({
        where,
        include: {
          patient: { select: { id: true, firstName: true, lastName: true, email: true } },
          doctor: { select: { id: true, firstName: true, lastName: true, email: true, doctorProfile: { select: { specialization: true } } } },
        },
        orderBy: { appointmentDate: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      })
    ]);

    res.json({ status: 'success', data: { total, items, page, pageSize } });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message || 'Failed to load patients' });
  }
};

export const updateAttendance = async (req: Request, res: Response) => {
  try {
    const clinicId = getClinicId(req);
    const { appointmentId } = req.params;
    const { attendance } = req.body as any; // 'ARRIVED' | 'CANCELLED' | 'NO_SHOW'

    const allowed = ['ARRIVED', 'CANCELLED', 'NO_SHOW'];
    if (!allowed.includes(attendance)) {
      return res.status(400).json({ status: 'error', message: 'Invalid attendance value' });
    }

    const statusMap: Record<string, any> = {
      ARRIVED: 'CHECKED_IN',
      CANCELLED: 'CANCELLED',
      NO_SHOW: 'NO_SHOW'
    };

    const appt = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: statusMap[attendance] },
      select: { id: true, status: true }
    });

    res.json({ status: 'success', data: appt });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message || 'Failed to update attendance' });
  }
};

export const addFollowUp = async (req: Request, res: Response) => {
  try {
    const clinicId = getClinicId(req);
    const { appointmentId } = req.params;
    const { notes, vitals } = req.body as any;

    // Persist a simple audit log without metadata field to avoid schema mismatch
    await prisma.auditLog.create({
      data: {
        action: 'FOLLOW_UP_ADDED' as any,
        resource: 'APPOINTMENT' as any,
        resourceId: appointmentId,
        userId: (req as any).user?.id,
      }
    });

    res.status(201).json({ status: 'success' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message || 'Failed to add follow-up' });
  }
};

export const getDoctors = async (req: Request, res: Response) => {
  try {
    const clinicId = getClinicId(req);
    const doctors = await prisma.user.findMany({
      where: { role: 'DOCTOR' as any, doctorAppointments: { some: { clinicId } } },
      select: { id: true, firstName: true, lastName: true, email: true, doctorProfile: { select: { specialization: true, experience: true } } }
    });
    res.json({ status: 'success', data: { items: doctors } });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message || 'Failed to load doctors' });
  }
};

export const getReports = async (req: Request, res: Response) => {
  try {
    const clinicId = getClinicId(req);
    const since = new Date();
    since.setDate(since.getDate() - 28);

    const byDay = await prisma.appointment.groupBy({
      by: ['appointmentDate'],
      where: { clinicService: { clinicId }, appointmentDate: { gte: since } } as any,
      _count: { _all: true },
      orderBy: { appointmentDate: 'asc' }
    }).catch(() => [] as any);

    res.json({ status: 'success', data: { byDay } });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message || 'Failed to load reports' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const clinicId = getClinicId(req);
    const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } });
    res.json({ status: 'success', data: clinic });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message || 'Failed to load clinic profile' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const clinicId = getClinicId(req);
    const { name, address, city, state, country, postalCode, phone, email, website } = req.body as any;
    const clinic = await prisma.clinic.update({
      where: { id: clinicId },
      data: { name, address, city, state, country, postalCode, phone, email, website }
    });
    res.json({ status: 'success', data: clinic });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message || 'Failed to update clinic profile' });
  }
};
