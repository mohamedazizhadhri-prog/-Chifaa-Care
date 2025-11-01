"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateClinicStatus = exports.deleteClinic = exports.updateClinic = exports.createClinic = exports.getClinic = exports.getClinics = exports.removeRoleFromUser = exports.addRoleToUser = exports.getUserRoles = exports.removePermissionFromRole = exports.addPermissionToRole = exports.getRolePermissions = exports.deletePermission = exports.updatePermission = exports.createPermission = exports.listPermissions = exports.deleteRole = exports.updateRole = exports.createRole = exports.listRoles = exports.updateUser = exports.getUsers = exports.getAdminStats = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAdminStats = async (req, res) => {
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
            } });
    }
    catch (err) {
        res.status(500).json({ status: 'error', message: err.message || 'Failed to load stats' });
    }
};
exports.getAdminStats = getAdminStats;
const getUsers = async (req, res) => {
    try {
        const { query, role, active, page = '1', pageSize = '20' } = req.query;
        const take = Math.min(Math.max(parseInt(pageSize || '20', 10), 1), 100);
        const skip = (Math.max(parseInt(page || '1', 10), 1) - 1) * take;
        const where = {};
        if (query) {
            where.OR = [
                { email: { contains: query, mode: 'insensitive' } },
                { firstName: { contains: query, mode: 'insensitive' } },
                { lastName: { contains: query, mode: 'insensitive' } }
            ];
        }
        if (role)
            where.role = role.toUpperCase();
        if (active === 'true' || active === 'false')
            where.isActive = active === 'true';
        const [items, total] = await Promise.all([
            prisma.user.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
            prisma.user.count({ where })
        ]);
        res.json({ status: 'success', data: { items, total, page: Number(page), pageSize: take } });
    }
    catch (err) {
        res.status(500).json({ status: 'error', message: err.message || 'Failed to fetch users' });
    }
};
exports.getUsers = getUsers;
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive, role } = req.body;
        const data = {};
        if (typeof isActive === 'boolean')
            data.isActive = isActive;
        if (role)
            data.role = role.toUpperCase();
        const user = await prisma.user.update({ where: { id }, data });
        res.json({ status: 'success', data: { user } });
    }
    catch (err) {
        res.status(500).json({ status: 'error', message: err.message || 'Failed to update user' });
    }
};
exports.updateUser = updateUser;
// Roles CRUD
const listRoles = async (req, res) => {
    try {
        const roles = await prisma.role.findMany({ orderBy: { name: 'asc' } });
        res.json({ status: 'success', data: { items: roles } });
    }
    catch (err) {
        res.status(500).json({ status: 'error', message: err.message || 'Failed to list roles' });
    }
};
exports.listRoles = listRoles;
const createRole = async (req, res) => {
    try {
        const { name, description } = req.body;
        const role = await prisma.role.create({ data: { name, description } });
        res.status(201).json({ status: 'success', data: { role } });
    }
    catch (err) {
        res.status(500).json({ status: 'error', message: err.message || 'Failed to create role' });
    }
};
exports.createRole = createRole;
const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const role = await prisma.role.update({ where: { id }, data: { name, description } });
        res.json({ status: 'success', data: { role } });
    }
    catch (err) {
        res.status(500).json({ status: 'error', message: err.message || 'Failed to update role' });
    }
};
exports.updateRole = updateRole;
const deleteRole = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.role.delete({ where: { id } });
        res.json({ status: 'success' });
    }
    catch (err) {
        res.status(500).json({ status: 'error', message: err.message || 'Failed to delete role' });
    }
};
exports.deleteRole = deleteRole;
// Permissions CRUD
const listPermissions = async (req, res) => {
    try {
        const items = await prisma.permission.findMany({ orderBy: { name: 'asc' } });
        res.json({ status: 'success', data: { items } });
    }
    catch (err) {
        res.status(500).json({ status: 'error', message: err.message || 'Failed to list permissions' });
    }
};
exports.listPermissions = listPermissions;
const createPermission = async (req, res) => {
    try {
        const { name, resource, action, description } = req.body;
        const permission = await prisma.permission.create({ data: { name, resource, action, description } });
        res.status(201).json({ status: 'success', data: { permission } });
    }
    catch (err) {
        res.status(500).json({ status: 'error', message: err.message || 'Failed to create permission' });
    }
};
exports.createPermission = createPermission;
const updatePermission = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, resource, action, description } = req.body;
        const permission = await prisma.permission.update({ where: { id }, data: { name, resource, action, description } });
        res.json({ status: 'success', data: { permission } });
    }
    catch (err) {
        res.status(500).json({ status: 'error', message: err.message || 'Failed to update permission' });
    }
};
exports.updatePermission = updatePermission;
const deletePermission = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.permission.delete({ where: { id } });
        res.json({ status: 'success' });
    }
    catch (err) {
        res.status(500).json({ status: 'error', message: err.message || 'Failed to delete permission' });
    }
};
exports.deletePermission = deletePermission;
// Assign/Remove permissions to role
const getRolePermissions = async (req, res) => {
    try {
        const { id } = req.params; // roleId
        const rolePerms = await prisma.rolePermission.findMany({ where: { roleId: id }, include: { permission: true } });
        res.json({ status: 'success', data: { items: rolePerms } });
    }
    catch (err) {
        res.status(500).json({ status: 'error', message: err.message || 'Failed to get role permissions' });
    }
};
exports.getRolePermissions = getRolePermissions;
const addPermissionToRole = async (req, res) => {
    try {
        const { id } = req.params; // roleId
        const { permissionId } = req.body;
        const rp = await prisma.rolePermission.create({ data: { roleId: id, permissionId } });
        res.status(201).json({ status: 'success', data: { rolePermission: rp } });
    }
    catch (err) {
        res.status(500).json({ status: 'error', message: err.message || 'Failed to add permission to role' });
    }
};
exports.addPermissionToRole = addPermissionToRole;
const removePermissionFromRole = async (req, res) => {
    try {
        const { id, permissionId } = req.params; // roleId, permissionId
        await prisma.rolePermission.delete({ where: { roleId_permissionId: { roleId: id, permissionId } } });
        res.json({ status: 'success' });
    }
    catch (err) {
        res.status(500).json({ status: 'error', message: err.message || 'Failed to remove permission from role' });
    }
};
exports.removePermissionFromRole = removePermissionFromRole;
// Assign/Remove roles to user
const getUserRoles = async (req, res) => {
    try {
        const { id } = req.params; // userId
        const items = await prisma.userRole.findMany({ where: { userId: id }, include: { role: true } });
        res.json({ status: 'success', data: { items } });
    }
    catch (err) {
        res.status(500).json({ status: 'error', message: err.message || 'Failed to get user roles' });
    }
};
exports.getUserRoles = getUserRoles;
const addRoleToUser = async (req, res) => {
    try {
        const { id } = req.params; // userId
        const { roleId } = req.body;
        const ur = await prisma.userRole.create({ data: { userId: id, roleId } });
        res.status(201).json({ status: 'success', data: { userRole: ur } });
    }
    catch (err) {
        res.status(500).json({ status: 'error', message: err.message || 'Failed to add role to user' });
    }
};
exports.addRoleToUser = addRoleToUser;
const removeRoleFromUser = async (req, res) => {
    try {
        const { id, roleId } = req.params; // userId, roleId
        await prisma.userRole.delete({ where: { userId_roleId: { userId: id, roleId } } });
        res.json({ status: 'success' });
    }
    catch (err) {
        res.status(500).json({ status: 'error', message: err.message || 'Failed to remove role from user' });
    }
};
exports.removeRoleFromUser = removeRoleFromUser;
// Clinic CRUD Operations
const getClinics = async (req, res) => {
    try {
        const { page = '1', pageSize = '50', status, search } = req.query;
        const take = Math.min(Math.max(parseInt(pageSize || '50', 10), 1), 100);
        const skip = (Math.max(parseInt(page || '1', 10), 1) - 1) * take;
        const where = {};
        if (status)
            where.status = status.toUpperCase();
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
    }
    catch (err) {
        console.error('Error fetching clinics:', err);
        res.status(500).json({ status: 'error', message: err.message || 'Failed to fetch clinics' });
    }
};
exports.getClinics = getClinics;
const getClinic = async (req, res) => {
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
    }
    catch (err) {
        console.error('Error fetching clinic:', err);
        res.status(500).json({ status: 'error', message: err.message || 'Failed to fetch clinic' });
    }
};
exports.getClinic = getClinic;
const createClinic = async (req, res) => {
    try {
        const { name, description, address, city, state, country, postalCode, phone, email, website, taxId, status, onboardingStep, ehrSystem, ehrApiKey, ehrApiUrl, ehrConnected, billingEmail, billingAddress, billingCity, billingCountry, billingPostalCode } = req.body;
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
    }
    catch (err) {
        console.error('Error creating clinic:', err);
        res.status(500).json({ status: 'error', message: err.message || 'Failed to create clinic' });
    }
};
exports.createClinic = createClinic;
const updateClinic = async (req, res) => {
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
    }
    catch (err) {
        console.error('Error updating clinic:', err);
        if (err.code === 'P2025') {
            return res.status(404).json({ status: 'error', message: 'Clinic not found' });
        }
        res.status(500).json({ status: 'error', message: err.message || 'Failed to update clinic' });
    }
};
exports.updateClinic = updateClinic;
const deleteClinic = async (req, res) => {
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
    }
    catch (err) {
        console.error('Error deleting clinic:', err);
        if (err.code === 'P2025') {
            return res.status(404).json({ status: 'error', message: 'Clinic not found' });
        }
        res.status(500).json({ status: 'error', message: err.message || 'Failed to delete clinic' });
    }
};
exports.deleteClinic = deleteClinic;
const updateClinicStatus = async (req, res) => {
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
    }
    catch (err) {
        console.error('Error updating clinic status:', err);
        if (err.code === 'P2025') {
            return res.status(404).json({ status: 'error', message: 'Clinic not found' });
        }
        res.status(500).json({ status: 'error', message: err.message || 'Failed to update clinic status' });
    }
};
exports.updateClinicStatus = updateClinicStatus;
