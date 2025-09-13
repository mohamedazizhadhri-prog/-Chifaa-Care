import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Import the custom Express type declaration
import { AuthenticatedRequest } from '../types/express';

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
          availableDays: updateData.doctorProfile.availableDays,
          availableHours: updateData.doctorProfile.availableHours,
          languages: updateData.doctorProfile.languages,
        },
        create: {
          userId,
          specialization: updateData.doctorProfile.specialization || '',
          bio: updateData.doctorProfile.bio,
          licenseNumber: updateData.doctorProfile.licenseNumber,
          experience: updateData.doctorProfile.experience,
          consultationFee: updateData.doctorProfile.consultationFee,
          availableDays: updateData.doctorProfile.availableDays || [],
          availableHours: updateData.doctorProfile.availableHours || [],
          languages: updateData.doctorProfile.languages || [],
        },
      });
    } else if (userRole === 'PATIENT' && updateData.patientProfile) {
      await prisma.patientProfile.upsert({
        where: { userId },
        update: {
          bloodType: updateData.patientProfile.bloodType,
          height: updateData.patientProfile.height,
          weight: updateData.patientProfile.weight,
          allergies: updateData.patientProfile.allergies,
          medications: updateData.patientProfile.medications,
        },
        create: {
          userId,
          bloodType: updateData.patientProfile.bloodType,
          height: updateData.patientProfile.height,
          weight: updateData.patientProfile.weight,
          allergies: updateData.patientProfile.allergies || [],
          medications: updateData.patientProfile.medications || [],
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
        passwordChangedAt: new Date(),
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
