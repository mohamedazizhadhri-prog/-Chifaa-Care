import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';
import { APPOINTMENT_STATUS, isValidAppointmentStatus } from '../types/appointment';
import GoogleCalendarService from '../services/google-calendar.service';
import StripeService from '../services/stripe.service';
import MockPaymentService from '../services/mock-payment.service';

// Helper function to handle errors consistently
const handleError = (res: Response, status: number, message: string, error?: any) => {
  console.error(message, error);
  return res.status(status).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { error: error?.message || error })
  });
};

// Update an appointment's core fields (reschedule, edit notes/reason)
export const updateAppointment = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { appointmentDate, endTime, reason, notes } = req.body as {
      appointmentDate?: string | Date;
      endTime?: string | Date;
      reason?: string;
      notes?: string;
    };

    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment) {
      return res.status(404).json({ status: 'error', message: 'Appointment not found' });
    }

    // Permission: doctor, patient, or admin
    if (
      appointment.doctorId !== req.user?.id &&
      appointment.patientId !== req.user?.id &&
      req.user?.role !== 'ADMIN'
    ) {
      return res.status(403).json({ status: 'error', message: 'Forbidden' });
    }

    // If rescheduling, ensure no conflict with other appointments for the doctor
    let newStart = appointmentDate ? new Date(appointmentDate) : undefined;
    let newEnd = endTime ? new Date(endTime) : undefined;

    // Use existing values if not provided
    newStart = newStart ?? new Date(appointment.appointmentDate);
    newEnd = newEnd ?? new Date(appointment.endTime);

    // Basic sanity
    if (newEnd <= newStart) {
      return res.status(400).json({ status: 'error', message: 'endTime must be after appointmentDate' });
    }

    // Conflict check against other active appointments for this doctor
    const conflicting = await prisma.appointment.findFirst({
      where: {
        id: { not: id },
        doctorId: appointment.doctorId,
        status: { in: [APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.CONFIRMED] },
        appointmentDate: { lte: newEnd },
        endTime: { gte: newStart },
      },
    });
    if (conflicting) {
      return res.status(400).json({ status: 'error', message: 'Selected time slot conflicts with another appointment' });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        appointmentDate: newStart,
        endTime: newEnd,
        ...(reason !== undefined ? { reason } : {}),
        ...(notes !== undefined ? { notes } : {}),
        // If user reschedules and current status is CONFIRMED, we can optionally set to PENDING for re-confirmation
        // Leave as-is if admin/doctor prefers
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, email: true } },
        doctor: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    return res.status(200).json({ status: 'success', data: { appointment: updated } });
  } catch (error) {
    console.error('Update appointment error:', error);
    return res.status(500).json({ status: 'error', message: 'An error occurred while updating the appointment' });
  }
};

// Compute available time slots for a doctor on a given date
export const getAvailableSlots = async (req: any, res: Response) => {
  try {
    const doctorId = req.params.id || req.query.doctorId;
    const { date, duration = '30', tz } = req.query as { date?: string; duration?: string; tz?: string };
    if (!doctorId) return res.status(400).json({ status: 'error', message: 'doctorId is required' });
    if (!date) return res.status(400).json({ status: 'error', message: 'date is required (ISO string)' });

    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ status: 'error', message: 'Invalid date' });
    }
    const slotMinutes = Math.max(5, parseInt(String(duration), 10) || 30);

    // Fetch doctor profile for availability (stored as JSON strings)
    const doctorProfile = await prisma.doctorProfile.findFirst({ where: { userId: doctorId } });

    // Determine working windows for the day. Default 09:00-17:00 if none configured.
    // If availableHours is JSON array of ranges like ["09:00-12:00","13:00-17:00"], use those.
    let ranges: { start: string; end: string }[] = [
      { start: '09:00', end: '17:00' },
    ];
    try {
      if (doctorProfile?.availableHours) {
        const parsed = JSON.parse(doctorProfile.availableHours);
        if (Array.isArray(parsed) && parsed.length > 0) {
          ranges = parsed.map((r: any) => {
            if (typeof r === 'string' && r.includes('-')) {
              const [s, e] = r.split('-');
              return { start: s.trim(), end: e.trim() };
            }
            if (r && typeof r === 'object' && r.start && r.end) return { start: r.start, end: r.end };
            return null;
          }).filter(Boolean) as { start: string; end: string }[];
        }
      }
    } catch (_) {
      // ignore parse errors, fall back to default
    }

    // Build candidate slots in UTC based on provided date and optional tz.
    // We treat date as the local day in tz (if provided), else in server local/UTC.
    const dayStart = new Date(targetDate);
    dayStart.setUTCHours(0, 0, 0, 0);
    const slots: { start: Date; end: Date }[] = [];

    const toDateOnDay = (timeHHMM: string) => {
      const [hh, mm] = timeHHMM.split(':').map((v) => parseInt(v, 10));
      const d = new Date(dayStart);
      d.setUTCHours(hh, mm || 0, 0, 0);
      return d;
    };

    for (const r of ranges) {
      let cursor = toDateOnDay(r.start);
      const windowEnd = toDateOnDay(r.end);
      while (cursor < windowEnd) {
        const end = new Date(cursor.getTime() + slotMinutes * 60 * 1000);
        if (end > windowEnd) break;
        slots.push({ start: new Date(cursor), end });
        cursor = end;
      }
    }

    // Fetch existing appointments to filter conflicts
    const existing = await prisma.appointment.findMany({
      where: {
        doctorId,
        status: { in: [APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.CONFIRMED] },
        appointmentDate: { gte: new Date(dayStart), lt: new Date(dayStart.getTime() + 24 * 60 * 60 * 1000) },
      },
      select: { appointmentDate: true, endTime: true },
    });

    const available = slots.filter((s) => {
      return !existing.some((e) => !(s.end <= e.appointmentDate || s.start >= e.endTime));
    }).map((s) => ({ start: s.start.toISOString(), end: s.end.toISOString() }));

    // Return raw array for frontend convenience
    return res.status(200).json(available);
  } catch (error) {
    console.error('Get available slots error:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to compute available slots' });
  }
};

// Doctor creates an appointment for a patient
export const createAppointmentAsDoctor = async (req: any, res: Response) => {
  try {
    if (req.user?.role !== 'DOCTOR' && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ status: 'error', message: 'Only doctors or admins can create appointments here' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'error', message: 'Validation failed', errors: errors.array() });
    }

    const { patientId, appointmentDate, endTime, reason, notes } = req.body;
    const doctorId = req.user.role === 'DOCTOR' ? req.user.id : (req.body.doctorId || undefined);
    if (!doctorId) {
      return res.status(400).json({ status: 'error', message: 'doctorId is required' });
    }

    // Validate entities
    const [doctor, patient] = await Promise.all([
      prisma.user.findFirst({ where: { id: doctorId, role: 'DOCTOR' } }),
      prisma.user.findFirst({ where: { id: patientId, role: 'PATIENT' } }),
    ]);

    if (!doctor) return res.status(404).json({ status: 'error', message: 'Doctor not found' });
    if (!patient) return res.status(404).json({ status: 'error', message: 'Patient not found' });

    // Conflict check
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId,
        appointmentDate: { lte: endTime },
        endTime: { gte: appointmentDate },
        status: { in: [APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.CONFIRMED] },
      },
    });
    if (conflictingAppointment) {
      return res.status(400).json({ status: 'error', message: 'The selected time slot is not available' });
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        appointmentDate: new Date(appointmentDate),
        endTime: new Date(endTime),
        reason,
        notes,
        status: APPOINTMENT_STATUS.CONFIRMED, // doctor-created defaults to confirmed
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, email: true } },
        doctor: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    return res.status(201).json({ status: 'success', data: { appointment } });
  } catch (error) {
    console.error('[createAppointmentAsDoctor] error:', error);
    return res.status(500).json({ status: 'error', message: 'An error occurred while creating the appointment' });
  }
};

const prisma = new PrismaClient();

export const createAppointment = async (req: any, res: Response) => {
  try {
    console.log('[createAppointment] incoming body:', req.body);
    console.log('[createAppointment] user from token:', req.user);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.warn('[createAppointment] validation errors:', errors.array());
      return res.status(400).json({ status: 'error', message: 'Validation failed', errors: errors.array() });
    }

    const { doctorId, appointmentDate, endTime, reason, notes } = req.body;
    if (!req.user || !req.user.id) {
      console.error('[createAppointment] Missing authenticated user');
      return res.status(401).json({ status: 'error', message: 'Unauthorized: missing or invalid token' });
    }
    const patientId = req.user.id;
    
    // Validate dates
    const startDate = new Date(appointmentDate);
    const endDate = new Date(endTime);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid date format',
      });
    }
    
    if (endDate <= startDate) {
      return res.status(400).json({
        status: 'error',
        message: 'End time must be after start time',
      });
    }
    
    // Check if appointment is in the past
    const now = new Date();
    if (startDate < now) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot book appointments in the past',
      });
    }

    // Check if doctor exists
    const doctor = await prisma.user.findFirst({
      where: { id: doctorId, role: 'DOCTOR' },
    }).catch((error: Error) => {
      console.error('[createAppointment] error fetching doctor:', error);
      throw error;
    });

    // Check if patient exists
    const patient = await prisma.user.findFirst({
      where: { id: patientId, role: 'PATIENT' },
    }).catch((error: Error) => {
      console.error('[createAppointment] error fetching patient:', error);
      throw error;
    });

    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor not found',
      });
    }

    // Check for time conflicts
    // Two appointments conflict if:
    // - Appointment A starts before B ends AND
    // - Appointment A ends after B starts
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId,
        status: {
          in: [APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.CONFIRMED],
        },
        AND: [
          {
            appointmentDate: {
              lt: endDate, // Existing appointment starts before new appointment ends
            },
          },
          {
            endTime: {
              gt: startDate, // Existing appointment ends after new appointment starts
            },
          },
        ],
      },
    }).catch((e) => {
      console.error('[createAppointment] error checking conflicts:', e);
      throw e;
    });

    if (conflictingAppointment) {
      const conflictInfo = {
        requestedStart: startDate.toISOString(),
        requestedEnd: endDate.toISOString(),
        conflictingStart: conflictingAppointment.appointmentDate.toISOString(),
        conflictingEnd: conflictingAppointment.endTime.toISOString(),
        conflictingStatus: conflictingAppointment.status,
      };
      console.log('[createAppointment] Conflict found:', conflictInfo);
      
      return res.status(409).json({
        status: 'error',
        message: 'The selected time slot is not available. Please choose a different time.',
        code: 'TIME_SLOT_CONFLICT',
        details: {
          conflictingAppointment: {
            start: conflictingAppointment.appointmentDate.toISOString(),
            end: conflictingAppointment.endTime.toISOString(),
          }
        }
      });
    }
    
    console.log('[createAppointment] No conflicts found. Creating appointment...');

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        appointmentDate: startDate,
        endTime: endDate,
        reason,
        notes,
        status: 'PENDING',
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      status: 'success',
      data: {
        appointment,
      },
    });
  } catch (error) {
    console.error('[createAppointment] error:', error);
    // Surface detailed error info for debugging
    const message = (error as any)?.message || 'An error occurred while creating the appointment';
    const code = (error as any)?.code;
    const meta = (error as any)?.meta;
    res.status(500).json({ status: 'error', message, code, meta });
  }
};

export const getAppointments = async (req: any, res: Response) => {
  try {
    const { status, startDate, endDate, patientId, doctorId } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Build the where clause based on user role and query parameters
    const whereClause: any = {};

    // Filter by status if provided
    if (status && isValidAppointmentStatus(status)) {
      whereClause.status = status;
    }

    // Date range filter
    if (startDate && endDate) {
      whereClause.OR = [
        {
          // Appointments that start within the range
          appointmentDate: {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string),
          },
        },
        {
          // Appointments that end within the range
          endTime: {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string),
          },
        },
        {
          // Appointments that span the entire range
          AND: [
            { appointmentDate: { lte: new Date(startDate as string) } },
            { endTime: { gte: new Date(endDate as string) } },
          ],
        },
      ];
    }

    // Handle filtering by patient or doctor for admins
    if (userRole === 'ADMIN') {
      if (patientId) whereClause.patientId = patientId;
      if (doctorId) whereClause.doctorId = doctorId;
    } 
    // For doctors, they can only see their own appointments or filter by patient
    else if (userRole === 'DOCTOR') {
      whereClause.doctorId = userId;
      if (patientId) whereClause.patientId = patientId;
    } 
    // For patients, they can only see their own appointments
    else if (userRole === 'PATIENT') {
      whereClause.patientId = userId;
      if (doctorId) whereClause.doctorId = doctorId;
    } 
    // No role or invalid role
    else {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized: Only doctors, patients, and admins can view appointments',
      });
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            dateOfBirth: true,
            gender: true,
          },
        },
      },
      orderBy: {
        appointmentDate: 'asc',
      },
    });

    res.status(200).json({
      status: 'success',
      results: appointments.length,
      data: { appointments },
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while fetching appointments',
    });
  }
};

// Get all pending appointment requests for the authenticated doctor
export const getDoctorPending = async (req: any, res: Response) => {
  try {
    if (req.user?.role !== 'DOCTOR' && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ status: 'error', message: 'Only doctors or admins can view this resource' });
    }
    const doctorId = req.user.role === 'DOCTOR' ? req.user.id : (req.query.doctorId || undefined);
    if (!doctorId) {
      return res.status(400).json({ status: 'error', message: 'doctorId is required for admins' });
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        status: APPOINTMENT_STATUS.PENDING,
      },
      include: {
        patient: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true }
        }
      },
      orderBy: { appointmentDate: 'asc' },
    });

    return res.status(200).json({ status: 'success', results: appointments.length, data: { appointments } });
  } catch (error) {
    console.error('Error fetching doctor pending appointments:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to fetch pending appointments' });
  }
};

// Get upcoming confirmed appointments for the authenticated doctor (future only)
export const getDoctorUpcoming = async (req: any, res: Response) => {
  try {
    if (req.user?.role !== 'DOCTOR' && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ status: 'error', message: 'Only doctors or admins can view this resource' });
    }
    const doctorId = req.user.role === 'DOCTOR' ? req.user.id : (req.query.doctorId || undefined);
    if (!doctorId) {
      return res.status(400).json({ status: 'error', message: 'doctorId is required for admins' });
    }

    const now = new Date();
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        status: APPOINTMENT_STATUS.CONFIRMED,
        appointmentDate: { gte: now },
      },
      include: {
        patient: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true }
        }
      },
      orderBy: { appointmentDate: 'asc' },
    });

    return res.status(200).json({ status: 'success', results: appointments.length, data: { appointments } });
  } catch (error) {
    console.error('Error fetching doctor upcoming appointments:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to fetch upcoming appointments' });
  }
};

/**
 * Get a doctor's schedule with patient details for each appointment
 */
export const getDoctorSchedule = async (req: any, res: Response) => {
  try {
    const { startDate, endDate, status } = req.query;
    const doctorId = req.user.role === 'ADMIN' ? req.query.doctorId : req.user.id;

    // Validate that the authenticated user is either the doctor or an admin
    if (req.user.role !== 'ADMIN' && req.user.id !== doctorId) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized: You can only view your own schedule',
      });
    }

    // Build the where clause
    const whereClause: any = {
      doctorId,
    };

    // Filter by status if provided
    if (status && isValidAppointmentStatus(status)) {
      whereClause.status = status;
    } else {
      // Default to showing upcoming appointments
      whereClause.OR = [
        { status: 'PENDING' },
        { status: 'CONFIRMED' },
      ];
    }

    // Date range filter (default to next 30 days if not specified)
    const start = startDate ? new Date(startDate as string) : new Date();
    const end = endDate 
      ? new Date(endDate as string)
      : new Date(new Date().setDate(new Date().getDate() + 30));

    whereClause.OR = [
      {
        // Appointments that start within the range
        appointmentDate: {
          gte: start,
          lte: end,
        },
      },
      {
        // Appointments that end within the range
        endTime: {
          gte: start,
          lte: end,
        },
      },
      {
        // Appointments that span the entire range
        AND: [
          { appointmentDate: { lte: start } },
          { endTime: { gte: end } },
        ],
      },
    ];

    // Get the doctor's appointments with patient details
    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            dateOfBirth: true,
            gender: true,
            profileImage: true,
          },
        },
      },
      orderBy: {
        appointmentDate: 'asc',
      },
    });

    // Format the response
    const schedule = {
      doctorId,
      startDate: start,
      endDate: end,
      appointments: appointments.map((apt: any) => ({
        id: apt.id,
        title: `${apt.patient.firstName} ${apt.patient.lastName}`,
        start: apt.appointmentDate,
        end: apt.endTime,
        status: apt.status,
        reason: apt.reason,
        notes: apt.notes,
        patient: apt.patient,
      })),
    };

    res.status(200).json({
      status: 'success',
      data: { schedule },
    });
  } catch (error) {
    console.error('Error fetching doctor schedule:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while fetching the doctor\'s schedule',
    });
  }
};

export const updateAppointmentStatus = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!isValidAppointmentStatus(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status value. Must be one of: ' + Object.values(APPOINTMENT_STATUS).join(', '),
      });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found',
      });
    }

    // Check if user has permission to update this appointment
    if (
      appointment.doctorId !== req.user.id &&
      appointment.patientId !== req.user.id &&
      req.user.role !== 'ADMIN'
    ) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to update this appointment',
      });
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: { status },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json({
      status: 'success',
      data: {
        appointment: updatedAppointment,
      },
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while updating the appointment status',
    });
  }
};

export const deleteAppointment = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found',
      });
    }

    // Only allow admin or the patient who created the appointment to delete it
    if (appointment.patientId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to delete this appointment',
      });
    }

    await prisma.appointment.delete({
      where: { id },
    });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while deleting the appointment',
    });
  }
};

/**
 * Doctor accepts a pending appointment
 * POST /api/v1/appointments/:id/accept
 */
export const acceptAppointment = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const doctorId = req.user.id;

    // Verify appointment exists and is pending
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        payment: true,
      },
    });

    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found',
      });
    }

    // Verify doctor owns this appointment
    if (appointment.doctorId !== doctorId && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized to accept this appointment',
      });
    }

    // Verify appointment is pending
    if (appointment.status !== APPOINTMENT_STATUS.PENDING) {
      return res.status(400).json({
        status: 'error',
        message: `Cannot accept appointment with status ${appointment.status}`,
      });
    }

    // Verify payment is completed
    if (!appointment.payment || appointment.payment.status !== 'SUCCEEDED') {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot accept appointment without successful payment',
      });
    }

    // Update appointment status to CONFIRMED
    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: APPOINTMENT_STATUS.CONFIRMED },
      include: {
        patient: true,
        doctor: true,
        payment: true,
      },
    });

    // Try to add to Google Calendar (don't fail if calendar not connected)
    let calendarEvent = null;
    try {
      const isConnected = await GoogleCalendarService.isConnected(doctorId);
      if (isConnected) {
        calendarEvent = await GoogleCalendarService.createAppointmentEvent(id, doctorId);
      }
    } catch (calendarError: any) {
      console.error('Failed to create calendar event:', calendarError);
      // Continue even if calendar fails
    }

    res.status(200).json({
      status: 'success',
      data: {
        appointment: updated,
        calendarEvent,
      },
      message: 'Appointment accepted successfully' + (calendarEvent ? ' and added to calendar' : ''),
    });
  } catch (error: any) {
    console.error('Error accepting appointment:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to accept appointment',
    });
  }
};

/**
 * Doctor rejects a pending appointment
 * POST /api/v1/appointments/:id/reject
 */
export const rejectAppointment = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const doctorId = req.user.id;

    // Verify appointment exists and is pending
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        payment: true,
      },
    });

    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found',
      });
    }

    // Verify doctor owns this appointment
    if (appointment.doctorId !== doctorId && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized to reject this appointment',
      });
    }

    // Verify appointment is pending
    if (appointment.status !== APPOINTMENT_STATUS.PENDING) {
      return res.status(400).json({
        status: 'error',
        message: `Cannot reject appointment with status ${appointment.status}`,
      });
    }

    // Update appointment status to CANCELLED
    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        status: APPOINTMENT_STATUS.CANCELLED,
        notes: `${appointment.notes || ''}\nRejected by doctor: ${reason || 'No reason provided'}`.trim(),
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    // Initiate refund if payment exists
    let refundResult = null;
    if (appointment.payment && appointment.payment.status === 'SUCCEEDED') {
      try {
        // Check if Stripe is configured
        const isStripeConfigured = process.env.STRIPE_SECRET_KEY &&
          process.env.STRIPE_SECRET_KEY !== 'sk_test_your_stripe_secret_key';

        if (isStripeConfigured && appointment.payment.stripePaymentIntentId) {
          refundResult = await StripeService.createRefund(
            appointment.payment.id,
            undefined,
            `Appointment rejected by doctor: ${reason || 'Not specified'}`
          );
        } else {
          // Mock refund
          refundResult = await MockPaymentService.createRefund(
            appointment.payment.id,
            undefined,
            `Appointment rejected by doctor: ${reason || 'Not specified'}`
          );
        }
      } catch (refundError: any) {
        console.error('Failed to initiate refund:', refundError);
        // Continue even if refund fails - can be handled manually
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        appointment: updated,
        refund: refundResult,
      },
      message: 'Appointment rejected' + (refundResult ? ' and refund initiated' : ''),
    });
  } catch (error: any) {
    console.error('Error rejecting appointment:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to reject appointment',
    });
  }
};
