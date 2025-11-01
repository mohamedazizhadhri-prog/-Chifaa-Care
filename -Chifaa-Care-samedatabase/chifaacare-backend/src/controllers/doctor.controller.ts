import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllDoctors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('[getAllDoctors] Fetching doctors from database...');
    
    const doctors = await prisma.user.findMany({
      where: {
        role: 'DOCTOR',
      },
      include: {
        doctorProfile: {
          include: {
            education: true,
          },
        },
        clinic: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    console.log(`[getAllDoctors] Found ${doctors.length} doctors`);

    // Add friendly display name used by the chat UI: "Dr. Name - Clinic"
    // Handle cases where doctorProfile or clinic might be null
    const doctorsWithClinic = doctors.map((d) => {
      const displayName = `Dr. ${d.firstName || ''} ${d.lastName || ''}${d.clinic ? ` - ${d.clinic.name}` : ''}`.trim();
      
      return {
        ...d,
        displayName,
        // Ensure doctorProfile exists with defaults if null
        doctorProfile: d.doctorProfile ? {
          ...d.doctorProfile,
          // Ensure nested education array exists
          education: d.doctorProfile.education || []
        } : {
          id: '',
          userId: d.id,
          specialization: 'General Practitioner',
          bio: null,
          licenseNumber: null,
          experience: 0,
          consultationFee: null,
          availableDays: '[]',
          availableHours: '[]',
          languages: '[]',
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
          education: []
        }
      };
    });

    console.log('[getAllDoctors] Successfully processed doctors, sending response');

    res.status(200).json({
      status: 'success',
      results: doctors.length,
      data: {
        doctors: doctorsWithClinic,
      },
    });
  } catch (error: any) {
    console.error('[getAllDoctors] Error:', error.message);
    console.error('[getAllDoctors] Stack:', error.stack);
    next(error);
  }
};
