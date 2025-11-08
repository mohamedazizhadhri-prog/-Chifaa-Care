import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Error handling utility
const handleError = (res: Response, status: number, message: string, error?: any) => {
  console.error(message, error);
  return res.status(status).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { error: error?.message || error })
  });
};

// Get patients for the authenticated doctor that have at least one CONFIRMED appointment with them
export const getDoctorPatients = async (req: any, res: Response) => {
  try {
    if (req.user?.role !== 'DOCTOR' && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ status: 'error', message: 'Only doctors or admins can view this resource' });
    }
    const doctorId = req.user.role === 'DOCTOR' ? req.user.id : (req.query.doctorId || undefined);
    if (!doctorId) {
      return res.status(400).json({ status: 'error', message: 'doctorId is required for admins' });
    }

    const patients = await prisma.user.findMany({
      where: {
        role: 'PATIENT',
        patientAppointments: {
          some: {
            doctorId: doctorId,
            status: 'CONFIRMED'
          }
        }
      },
      include: {
        patientProfile: true,
        // include last confirmed appointment with this doctor
        patientAppointments: {
          where: { doctorId: doctorId, status: 'CONFIRMED' },
          orderBy: { appointmentDate: 'desc' },
          take: 1,
          select: {
            id: true,
            appointmentDate: true,
            status: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Map to a clean shape if needed
    return res.status(200).json({ status: 'success', results: patients.length, data: { patients } });
  } catch (error) {
    console.error('Error fetching doctor patients:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to fetch doctor patients' });
  }
};

export const getAllPatients = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const patients = await prisma.user.findMany({
      where: { role: 'PATIENT' },
      include: { 
        patientProfile: true,
        // Include basic appointment info for doctor's reference
        patientAppointments: {
          select: {
            id: true,
            appointmentDate: true,
            status: true,
            doctor: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: {
            appointmentDate: 'desc'
          },
          take: 5 // Only get the 5 most recent appointments
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      status: 'success',
      results: patients.length,
      data: { patients },
    });
  } catch (error) {
    next(error);
  }
};

export const getPatientById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verify the patient exists and is actually a patient
    const patient = await prisma.user.findUnique({
      where: { 
        id,
        role: 'PATIENT' 
      },
      include: {
        patientProfile: {
          include: {
            // medicalHistory is on PatientProfile per schema
            medicalHistory: {
              orderBy: { diagnosisDate: 'desc' },
              take: 10,
            }
          }
        },
        // Include upcoming appointments from the patient's perspective
        patientAppointments: {
          where: {
            status: { in: ['PENDING', 'CONFIRMED'] },
            appointmentDate: { gte: new Date() }
          },
          include: {
            doctor: { select: { id: true, firstName: true, lastName: true } }
          },
          orderBy: { appointmentDate: 'asc' }
        }
      }
    });

    if (!patient) {
      return handleError(res, 404, 'Patient not found');
    }

    res.status(200).json({
      status: 'success',
      data: { patient }
    });
  } catch (error) {
    handleError(res, 500, 'Error fetching patient details', error);
  }
};
