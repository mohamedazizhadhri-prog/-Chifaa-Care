import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllDoctors = async (req: Request, res: Response, next: NextFunction) => {
  try {
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
      },
    });

    res.status(200).json({
      status: 'success',
      results: doctors.length,
      data: {
        doctors,
      },
    });
  } catch (error) {
    next(error);
  }
};
