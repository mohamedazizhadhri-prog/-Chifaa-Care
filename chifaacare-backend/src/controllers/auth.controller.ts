import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { MEDICAL_SPECIALIZATIONS } from '../constants/specializations';

const prisma = new PrismaClient();

// Export for backward compatibility
export { MEDICAL_SPECIALIZATIONS };

// Generate JWT Token
const generateToken = (id: string, role: string) => {
  const secret = process.env.JWT_SECRET || 'your_jwt_secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  
  // Set JWT expiration to 7 days in seconds
  const options: jwt.SignOptions = { expiresIn: 60 * 60 * 24 * 7 }; // 7 days in seconds
  
  return jwt.sign(
    { id, role },
    secret,
    options
  );
};

export const signup = async (req: Request, res: Response) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, phone, role = 'PATIENT' } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Prepare profile payloads (support nested or flat shapes)
    const doctorProfileBody = req.body.doctorProfile || req.body;
    const patientProfileBody = req.body.patientProfile || req.body;

    // Validate specialization early for doctors to avoid creating a user then deleting it
    if (role === 'DOCTOR') {
      const specialization = doctorProfileBody.specialization || req.body.specialization;
      if (!specialization) {
        return res.status(400).json({
          message: 'Specialization is required for doctor registration',
          availableSpecializations: MEDICAL_SPECIALIZATIONS
        });
      }
      if (!MEDICAL_SPECIALIZATIONS.includes(specialization)) {
        return res.status(400).json({
          message: 'Invalid specialization. Please choose from the available specializations.',
          providedSpecialization: specialization,
          availableSpecializations: MEDICAL_SPECIALIZATIONS
        });
      }
    }

    // Use a transaction to create user and related profile atomically so there's
    // never a user without a corresponding profile (for doctors/patients)
    let user: any;
    if (role === 'DOCTOR') {
      const specialization = doctorProfileBody.specialization || req.body.specialization;
      const bio = doctorProfileBody.bio || req.body.bio || '';
      const licenseNumber = doctorProfileBody.licenseNumber || req.body.licenseNumber || '';
      const experience = doctorProfileBody.experience ? parseInt(doctorProfileBody.experience) : (req.body.experience ? parseInt(req.body.experience) : 0);
      const consultationFee = doctorProfileBody.consultationFee ? parseFloat(doctorProfileBody.consultationFee) : (req.body.consultationFee ? parseFloat(req.body.consultationFee) : 50.0);

      user = await prisma.$transaction(async (tx) => {
        const u = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            firstName,
            lastName,
            phone,
            role: role as any,
          },
          select: { id: true, email: true, firstName: true, lastName: true, role: true }
        });

        await tx.doctorProfile.create({
          data: {
            userId: u.id,
            specialization,
            bio,
            licenseNumber,
            experience,
            consultationFee,
            rating: 0.0,
          }
        });

        return u;
      });
    } else if (role === 'PATIENT') {
      const patientData: any = {
        bloodType: patientProfileBody.bloodType || req.body.bloodType || null,
        height: patientProfileBody.height ? parseFloat(patientProfileBody.height) : (req.body.height ? parseFloat(req.body.height) : null),
        weight: patientProfileBody.weight ? parseFloat(patientProfileBody.weight) : (req.body.weight ? parseFloat(req.body.weight) : null),
      };

      user = await prisma.$transaction(async (tx) => {
        const u = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            firstName,
            lastName,
            phone,
            role: role as any,
          },
          select: { id: true, email: true, firstName: true, lastName: true, role: true }
        });

        await tx.patientProfile.create({
          data: {
            userId: u.id,
            bloodType: patientData.bloodType,
            height: patientData.height,
            weight: patientData.weight,
          }
        });

        return u;
      });
    } else {
      // Non-doctor/patient roles: just create user
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phone,
          role: role as any,
        },
        select: { id: true, email: true, firstName: true, lastName: true, role: true }
      });
    }

    // Generate token
    const token = generateToken(user.id, user.role);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during signup',
    });
  }
};

export const login = async (req: Request, res: Response) => {
  console.log('[Auth] Login attempt for:', req.body.email);
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('[Auth] Missing credentials');
      return res.status(400).json({ message: 'Email and password required' });
    }

    console.log('[Auth] Searching user in database');
    const user = await prisma.user.findUnique({
      where: { email },
      select: { 
        id: true, 
        email: true, 
        password: true, 
        role: true, 
        isActive: true 
      }
    });

    if (!user) {
      console.log('[Auth] User not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('[Auth] Comparing passwords');
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log('[Auth] Password mismatch');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      console.log('[Auth] Inactive account');
      return res.status(401).json({ message: 'Account deactivated' });
    }

    console.log('[Auth] Generating JWT token');
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    console.log('[Auth] Login successful for:', user.email);
    res.json({ 
      status: 'success',
      token,
      data: { 
        user: { 
          id: user.id, 
          email: user.email, 
          role: user.role 
        } 
      }
    });

  } catch (error) {
    console.error('[Auth] Critical login error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? (error as any).message : undefined
    });
  }
};

export const protect = async (req: any, res: any, next: any) => {
  try {
    // 1) Getting token and check if it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'You are not logged in! Please log in to get access.',
      });
    }

    // 2) Verify token
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

    // 3) Check if user still exists
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!currentUser) {
      return res.status(401).json({
        status: 'error',
        message: 'The user belonging to this token no longer exists.',
      });
    }

    // 4) Check if user is active
    if (!currentUser.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Your account has been deactivated.',
      });
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
  } catch (error) {
    console.error('Protect middleware error:', error);
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token or token expired',
    });
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: any, res: any, next: any) => {
    // roles ['admin', 'doctor']. role='user'
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action',
      });
    }
    next();
  };
};

// Get available medical specializations
export const getSpecializations = async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      status: 'success',
      data: {
        specializations: MEDICAL_SPECIALIZATIONS
      }
    });
  } catch (error) {
    console.error('Error fetching specializations:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch specializations'
    });
  }
};
