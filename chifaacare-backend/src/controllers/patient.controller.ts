import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';


export const getAllPatients = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const patients = await prisma.user.findMany({
      where: { role: 'PATIENT' },
      include: { patientProfile: true },
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
