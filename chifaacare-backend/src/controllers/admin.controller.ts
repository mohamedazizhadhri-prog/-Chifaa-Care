import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const [totalUsers, totalPatients, totalDoctors, totalClinics, totalAdmins, totalAppointments, todayAppointments] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'PATIENT' } }),
      prisma.user.count({ where: { role: 'DOCTOR' } }),
      prisma.user.count({ where: { role: 'CLINIC' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.appointment.count(),
      prisma.appointment.count({ where: { appointmentDate: { gte: new Date(new Date().toDateString()) } } })
    ]);

    const clinics = await prisma.clinic.count();

    res.json({ status: 'success', data: {
      users: { total: totalUsers, patients: totalPatients, doctors: totalDoctors, clinics: totalClinics, admins: totalAdmins },
      appointments: { total: totalAppointments, today: todayAppointments },
      clinics: { total: clinics }
    }});
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message || 'Failed to load stats' });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { query, role, active, page = '1', pageSize = '20' } = req.query as Record<string,string>;
    const take = Math.min(Math.max(parseInt(pageSize || '20', 10), 1), 100);
    const skip = (Math.max(parseInt(page || '1', 10), 1) - 1) * take;

    const where: any = {};
    if (query) {
      where.OR = [
        { email: { contains: query, mode: 'insensitive' } },
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } }
      ];
    }
    if (role) where.role = role.toUpperCase();
    if (active === 'true' || active === 'false') where.isActive = active === 'true';

    const [items, total] = await Promise.all([
      prisma.user.findMany({ 
        where, 
        skip, 
        take, 
        orderBy: { createdAt: 'desc' },
        include: { doctorProfile: true }
      }),
      prisma.user.count({ where })
    ]);

    // Transform items to include specialty and licenseNumber at root level for doctors
    const transformedItems = items.map(user => {
      if (user.role === 'DOCTOR' && user.doctorProfile) {
        return {
          ...user,
          specialty: user.doctorProfile.specialization,
          licenseNumber: user.doctorProfile.licenseNumber
        };
      }
      return user;
    });

    res.json({ status: 'success', data: { items: transformedItems, total, page: Number(page), pageSize: take } });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message || 'Failed to fetch users' });
  }
};

export const getSpecialties = async (req: Request, res: Response) => {
  try {
    // Get unique specializations from doctor profiles
    const specialties = await prisma.doctorProfile.findMany({
      where: {
        specialization: { not: null }
      },
      select: {
        specialization: true
      },
      distinct: ['specialization']
    });

    const uniqueSpecialties = specialties
      .map(s => s.specialization)
      .filter((s): s is string => s !== null)
      .sort();

    res.json({ status: 'success', data: uniqueSpecialties });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message || 'Failed to fetch specialties' });
  }
};

export const createDoctor = async (req: Request, res: Response) => {
  try {
    const { email, firstName, lastName, phone, specialty, licenseNumber, password = 'Doctor@123' } = req.body;
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ status: 'error', message: 'User with this email already exists' });
    }

    // Hash password
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and doctor profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          firstName,
          lastName,
          phone,
          password: hashedPassword,
          role: 'DOCTOR',
          isActive: true
        }
      });

      const doctorProfile = await tx.doctorProfile.create({
        data: {
          userId: user.id,
          specialization: specialty,
          licenseNumber
        }
      });

      return { user, doctorProfile };
    });

    res.status(201).json({ status: 'success', data: result });
  } catch (err: any) {
    console.error('Error creating doctor:', err);
    res.status(500).json({ status: 'error', message: err.message || 'Failed to create doctor' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive, role, firstName, lastName, phone, specialty, licenseNumber } = req.body;

    const data: any = {};
    if (typeof isActive === 'boolean') data.isActive = isActive;
    if (role) data.role = role.toUpperCase();
    if (firstName) data.firstName = firstName;
    if (lastName) data.lastName = lastName;
    if (phone) data.phone = phone;

    // Update user
    const user = await prisma.user.update({ where: { id }, data });

    // If doctor and has specialty/license info, update doctor profile
    if (user.role === 'DOCTOR' && (specialty !== undefined || licenseNumber !== undefined)) {
      const profileData: any = {};
      if (specialty !== undefined) profileData.specialization = specialty;
      if (licenseNumber !== undefined) profileData.licenseNumber = licenseNumber;

      await prisma.doctorProfile.upsert({
        where: { userId: id },
        update: profileData,
        create: {
          userId: id,
          specialization: specialty,
          licenseNumber
        }
      });
    }

    // Fetch updated user with doctor profile
    const updatedUser = await prisma.user.findUnique({
      where: { id },
      include: { doctorProfile: true }
    });

    res.json({ status: 'success', data: { user: updatedUser } });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message || 'Failed to update user' });
  }
};

// Roles CRUD
export const listRoles = async (req: Request, res: Response) => {
  try {
    const roles = await prisma.role.findMany({ orderBy: { name: 'asc' } });
    res.json({ status: 'success', data: { items: roles } });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message || 'Failed to list roles' });
  }
};

export const createRole = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body as { name: string; description?: string };
    const role = await prisma.role.create({ data: { name, description } });
    res.status(201).json({ status: 'success', data: { role } });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message || 'Failed to create role' });
  }
};

export const updateRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body as { name?: string; description?: string };
    const role = await prisma.role.update({ where: { id }, data: { name, description } });
    res.json({ status: 'success', data: { role } });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message || 'Failed to update role' });
  }
};

export const deleteRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.role.delete({ where: { id } });
    res.json({ status: 'success' });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message || 'Failed to delete role' });
  }
};

// Permissions CRUD
export const listPermissions = async (req: Request, res: Response) => {
  try {
    const items = await prisma.permission.findMany({ orderBy: { name: 'asc' } });
    res.json({ status: 'success', data: { items } });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message || 'Failed to list permissions' });
  }
};

export const createPermission = async (req: Request, res: Response) => {
  try {
    const { name, resource, action, description } = req.body as { name: string; resource: string; action: string; description?: string };
    const permission = await prisma.permission.create({ data: { name, resource, action, description } });
    res.status(201).json({ status: 'success', data: { permission } });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message || 'Failed to create permission' });
  }
};

export const updatePermission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, resource, action, description } = req.body as { name?: string; resource?: string; action?: string; description?: string };
    const permission = await prisma.permission.update({ where: { id }, data: { name, resource, action, description } });
    res.json({ status: 'success', data: { permission } });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message || 'Failed to update permission' });
  }
};

export const deletePermission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.permission.delete({ where: { id } });
    res.json({ status: 'success' });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message || 'Failed to delete permission' });
  }
};

// Assign/Remove permissions to role
export const getRolePermissions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // roleId
    const rolePerms = await prisma.rolePermission.findMany({ where: { roleId: id }, include: { permission: true } });
    res.json({ status: 'success', data: { items: rolePerms } });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message || 'Failed to get role permissions' });
  }
};

export const addPermissionToRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // roleId
    const { permissionId } = req.body as { permissionId: string };
    const rp = await prisma.rolePermission.create({ data: { roleId: id, permissionId } });
    res.status(201).json({ status: 'success', data: { rolePermission: rp } });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message || 'Failed to add permission to role' });
  }
};

export const removePermissionFromRole = async (req: Request, res: Response) => {
  try {
    const { id, permissionId } = req.params; // roleId, permissionId
    await prisma.rolePermission.delete({ where: { roleId_permissionId: { roleId: id, permissionId } } });
    res.json({ status: 'success' });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message || 'Failed to remove permission from role' });
  }
};

// Assign/Remove roles to user
export const getUserRoles = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // userId
    const items = await prisma.userRole.findMany({ where: { userId: id }, include: { role: true } });
    res.json({ status: 'success', data: { items } });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message || 'Failed to get user roles' });
  }
};

export const addRoleToUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // userId
    const { roleId } = req.body as { roleId: string };
    const ur = await prisma.userRole.create({ data: { userId: id, roleId } });
    res.status(201).json({ status: 'success', data: { userRole: ur } });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message || 'Failed to add role to user' });
  }
};

export const removeRoleFromUser = async (req: Request, res: Response) => {
  try {
    const { id, roleId } = req.params; // userId, roleId
    await prisma.userRole.delete({ where: { userId_roleId: { userId: id, roleId } } });
    res.json({ status: 'success' });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message || 'Failed to remove role from user' });
  }
};

// Clinic CRUD Operations
export const getClinics = async (req: Request, res: Response) => {
  try {
    const { page = '1', pageSize = '50', status, search } = req.query as Record<string, string>;
    const take = Math.min(Math.max(parseInt(pageSize || '50', 10), 1), 100);
    const skip = (Math.max(parseInt(page || '1', 10), 1) - 1) * take;

    const where: any = {};
    if (status) where.status = status.toUpperCase();
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [clinics, total] = await Promise.all([
      prisma.clinic.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { users: true, services: true }
          }
        }
      }),
      prisma.clinic.count({ where })
    ]);

    res.json({ 
      status: 'success', 
      data: clinics,
      pagination: { 
        total, 
        page: Number(page), 
        pageSize: take,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (err: any) {
    console.error('Error fetching clinics:', err);
    res.status(500).json({ status: 'error', message: err.message || 'Failed to fetch clinics' });
  }
};

export const getClinic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clinic = await prisma.clinic.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            clinicRole: true
          }
        },
        services: true,
        documents: true,
        _count: {
          select: { users: true, services: true, documents: true }
        }
      }
    });

    if (!clinic) {
      return res.status(404).json({ status: 'error', message: 'Clinic not found' });
    }

    res.json({ status: 'success', data: clinic });
  } catch (err: any) {
    console.error('Error fetching clinic:', err);
    res.status(500).json({ status: 'error', message: err.message || 'Failed to fetch clinic' });
  }
};

export const createClinic = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      address,
      city,
      state,
      country,
      postalCode,
      phone,
      email,
      website,
      taxId,
      status,
      onboardingStep,
      ehrSystem,
      ehrApiKey,
      ehrApiUrl,
      ehrConnected,
      billingEmail,
      billingAddress,
      billingCity,
      billingCountry,
      billingPostalCode
    } = req.body;

    // Check if clinic with same email exists
    const existingClinic = await prisma.clinic.findUnique({ where: { email } });
    if (existingClinic) {
      return res.status(400).json({ status: 'error', message: 'Clinic with this email already exists' });
    }

    const clinic = await prisma.clinic.create({
      data: {
        name,
        description,
        address,
        city,
        state: state || '',
        country,
        postalCode,
        phone,
        email,
        website,
        taxId,
        status: status || 'PENDING',
        onboardingStep: onboardingStep || 'REGISTRATION',
        ehrSystem,
        ehrApiKey,
        ehrApiUrl,
        ehrConnected: ehrConnected || false,
        billingEmail,
        billingAddress,
        billingCity,
        billingCountry,
        billingPostalCode
      }
    });

    res.status(201).json({ status: 'success', data: clinic });
  } catch (err: any) {
    console.error('Error creating clinic:', err);
    res.status(500).json({ status: 'error', message: err.message || 'Failed to create clinic' });
  }
};

export const updateClinic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove id from update data if present
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const clinic = await prisma.clinic.update({
      where: { id },
      data: updateData
    });

    res.json({ status: 'success', data: clinic });
  } catch (err: any) {
    console.error('Error updating clinic:', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ status: 'error', message: 'Clinic not found' });
    }
    res.status(500).json({ status: 'error', message: err.message || 'Failed to update clinic' });
  }
};

export const deleteClinic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if clinic has associated users
    const usersCount = await prisma.user.count({ where: { clinicId: id } });
    if (usersCount > 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: `Cannot delete clinic with ${usersCount} associated user(s). Please reassign or remove users first.` 
      });
    }

    await prisma.clinic.delete({ where: { id } });
    res.json({ status: 'success', message: 'Clinic deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting clinic:', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ status: 'error', message: 'Clinic not found' });
    }
    res.status(500).json({ status: 'error', message: err.message || 'Failed to delete clinic' });
  }
};

export const updateClinicStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED', 'INACTIVE'].includes(status)) {
      return res.status(400).json({ status: 'error', message: 'Invalid status value' });
    }

    const clinic = await prisma.clinic.update({
      where: { id },
      data: { status }
    });

    res.json({ status: 'success', data: clinic });
  } catch (err: any) {
    console.error('Error updating clinic status:', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ status: 'error', message: 'Clinic not found' });
    }
    res.status(500).json({ status: 'error', message: err.message || 'Failed to update clinic status' });
  }
};
