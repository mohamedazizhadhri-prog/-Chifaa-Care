import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';
import { APPOINTMENT_STATUS, isValidAppointmentStatus } from '../types/appointment';

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

    // Check if doctor exists
    const doctor = await prisma.user.findFirst({
      where: { id: doctorId, role: 'DOCTOR' },
    }).catch((e) => {
      console.error('[createAppointment] error fetching doctor:', e);
      throw e;
    });

    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor not found',
      });
    }

    // Check for time conflicts
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId,
        appointmentDate: {
          lte: endTime,
        },
        endTime: {
          gte: appointmentDate,
        },
        status: {
          in: [APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.CONFIRMED],
        },
      },
    }).catch((e) => {
      console.error('[createAppointment] error checking conflicts:', e);
      throw e;
    });

    if (conflictingAppointment) {
      return res.status(400).json({
        status: 'error',
        message: 'The selected time slot is not available',
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        appointmentDate: new Date(appointmentDate),
        endTime: new Date(endTime),
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
    const { status, startDate, endDate } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    const whereClause: any = {};

    // Filter based on user role
    if (userRole === 'PATIENT') {
      whereClause.patientId = userId;
    } else if (userRole === 'DOCTOR') {
      whereClause.doctorId = userId;
    }

    // Additional filters
    if (status) {
      whereClause.status = status;
    }

    if (startDate && endDate) {
      whereClause.OR = [
        {
          appointmentDate: {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string),
          },
        },
        {
          endTime: {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string),
          },
        },
      ];
    }

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
      orderBy: {
        appointmentDate: 'asc',
      },
    });

    res.status(200).json({
      status: 'success',
      results: appointments.length,
      data: {
        appointments,
      },
    });
  } catch (error) {
    console.error('[getAppointments] error:', error);
    const message = (error as any)?.message || 'An error occurred while fetching appointments';
    const code = (error as any)?.code;
    res.status(500).json({ status: 'error', message, code });
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
