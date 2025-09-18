import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Import the custom Express type declaration
import { AuthenticatedRequest } from '../types/express';

// Ensure list-like inputs are stored as JSON strings in the DB
function normalizeJsonList(input: any): string | undefined {
  if (input === undefined || input === null) return undefined;
  if (Array.isArray(input)) return JSON.stringify(input);
  if (typeof input === 'string') {
    // If already a JSON string, keep as-is; otherwise, try to parse CSV-like
    try {
      const parsed = JSON.parse(input);
      return JSON.stringify(parsed);
    } catch {
      // treat as comma-separated string
      const arr = input
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);
      return JSON.stringify(arr);
    }
  }
  // Fallback: convert to string
  return JSON.stringify([String(input)]);
}

export const getMyProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Base user query
    const userQuery = {
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        dateOfBirth: true,
        gender: true,
        profileImage: true,
        role: true,
        isEmailVerified: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    };

    // Include profile based on role
    if (userRole === 'DOCTOR') {
      // For doctors, we'll handle the profile in a separate query
      const doctorProfile = await prisma.doctorProfile.findUnique({
        where: { userId },
        select: {
          id: true,
          specialization: true,
          bio: true,
          licenseNumber: true,
          experience: true,
          consultationFee: true,
          availableDays: true,
          availableHours: true,
          languages: true,
          education: true,
        },
      });
      
      const user = await prisma.user.findUnique({
        ...userQuery
      });
      
      return res.status(200).json({
        status: 'success',
        data: {
          ...user,
          doctorProfile,
        },
      });
    } else if (userRole === 'PATIENT') {
      // For patients, we'll handle the profile in a separate query
      const patientProfile = await prisma.patientProfile.findUnique({
        where: { userId },
        select: {
          id: true,
          bloodType: true,
          height: true,
          weight: true,
          allergies: true,
          medications: true,
          medicalHistory: true,
          emergencyContacts: true,
          insuranceInfo: true,
        },
      });
      
      const user = await prisma.user.findUnique({
        ...userQuery
      });
      
      return res.status(200).json({
        status: 'success',
        data: {
          ...user,
          patientProfile,
        },
      });
    }

    // For users with other roles or no specific role
    const user = await prisma.user.findUnique(userQuery);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while fetching your profile',
    });
  }
};

export const updateMyProfile = async (req: any, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const userRole = req.user.role;
    const updateData = req.body;

    // Update basic user info
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        phone: updateData.phone,
        dateOfBirth: updateData.dateOfBirth ? new Date(updateData.dateOfBirth) : undefined,
        gender: updateData.gender,
        profileImage: updateData.profileImage,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        dateOfBirth: true,
        gender: true,
        profileImage: true,
        role: true,
      },
    });

    // Update role-specific profile
    if (userRole === 'DOCTOR' && updateData.doctorProfile) {
      await prisma.doctorProfile.upsert({
        where: { userId },
        update: {
          specialization: updateData.doctorProfile.specialization,
          bio: updateData.doctorProfile.bio,
          licenseNumber: updateData.doctorProfile.licenseNumber,
          experience: updateData.doctorProfile.experience,
          consultationFee: updateData.doctorProfile.consultationFee,
          availableDays: normalizeJsonList(updateData.doctorProfile.availableDays),
          availableHours: normalizeJsonList(updateData.doctorProfile.availableHours),
          languages: normalizeJsonList(updateData.doctorProfile.languages),
        },
        create: {
          userId,
          specialization: updateData.doctorProfile.specialization || '',
          bio: updateData.doctorProfile.bio,
          licenseNumber: updateData.doctorProfile.licenseNumber,
          experience: updateData.doctorProfile.experience,
          consultationFee: updateData.doctorProfile.consultationFee,
          availableDays: normalizeJsonList(updateData.doctorProfile.availableDays) ?? JSON.stringify([]),
          availableHours: normalizeJsonList(updateData.doctorProfile.availableHours) ?? JSON.stringify([]),
          languages: normalizeJsonList(updateData.doctorProfile.languages) ?? JSON.stringify([]),
        },
      });
    } else if (userRole === 'PATIENT' && updateData.patientProfile) {
      await prisma.patientProfile.upsert({
        where: { userId },
        update: {
          bloodType: updateData.patientProfile.bloodType,
          height: updateData.patientProfile.height,
          weight: updateData.patientProfile.weight,
          allergies: normalizeJsonList(updateData.patientProfile.allergies),
          medications: normalizeJsonList(updateData.patientProfile.medications),
        },
        create: {
          userId,
          bloodType: updateData.patientProfile.bloodType,
          height: updateData.patientProfile.height,
          weight: updateData.patientProfile.weight,
          allergies: normalizeJsonList(updateData.patientProfile.allergies) ?? JSON.stringify([]),
          medications: normalizeJsonList(updateData.patientProfile.medications) ?? JSON.stringify([]),
        },
      });
    }

    // Get the updated user with profile
    const userWithProfile = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        doctorProfile: userRole === 'DOCTOR',
        patientProfile: userRole === 'PATIENT',
      },
    });

    res.status(200).json({
      status: 'success',
      data: {
        user: userWithProfile,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while updating your profile',
    });
  }
};

export const updatePassword = async (req: any, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Current password is incorrect',
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while updating your password',
    });
  }
};
