"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSettings = exports.getSettings = exports.getLogs = exports.listPatients = exports.updateClinic = exports.createClinic = exports.listClinics = exports.approveDoctor = exports.listDoctors = exports.createUser = exports.listUsers = exports.getOverview = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const audit_logger_1 = require("../utils/audit-logger");
const prisma = new client_1.PrismaClient();
// Helpers
const parsePagination = (req) => {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize || '20', 10)));
    const skip = (page - 1) * pageSize;
    return { page, pageSize, skip };
};
// 1) Overview
const getOverview = async (req, res) => {
    try {
        const [patients, doctors, clinics, appointments] = await Promise.all([
            prisma.user.count({ where: { role: 'PATIENT', isActive: true } }),
            prisma.user.count({ where: { role: 'DOCTOR', isActive: true } }),
            prisma.clinic.count({ where: { status: { in: ['ACTIVE', 'PENDING'] } } }),
            prisma.appointment.count({})
        ]);
        // Simple weekly activity: last 7 days appointment counts
        const since = new Date();
        since.setDate(since.getDate() - 6);
        const weekly = await prisma.appointment.groupBy({
            by: ['appointmentDate'],
            where: { appointmentDate: { gte: since } },
            _count: { _all: true },
            orderBy: { appointmentDate: 'asc' }
        }).catch(() => []);
        const alerts = {
            newClinicRequests: await prisma.clinic.count({ where: { status: 'PENDING' } }),
            inactiveAccounts: await prisma.user.count({ where: { isActive: false } }),
            failedLogins: await prisma.auditLog.count({ where: { action: 'ACCESS_DENIED' } })
        };
        return res.json({
            status: 'success',
            data: {
                stats: { patients, doctors, clinics, appointments },
                weeklyActivity: weekly,
                alerts
            }
        });
    }
    catch (error) {
        return res.status(500).json({ status: 'error', message: error.message || 'Failed to load overview' });
    }
};
exports.getOverview = getOverview;
// 2) Users
const listUsers = async (req, res) => {
    try {
        const { page, pageSize, skip } = parsePagination(req);
        const role = req.query.role || undefined;
        const where = role ? { role } : {};
        const [items, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, createdAt: true
                }
            }),
            prisma.user.count({ where })
        ]);
        res.json({ status: 'success', data: { items, total, page, pageSize } });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to list users' });
    }
};
exports.listUsers = listUsers;
const createUser = async (req, res) => {
    var _a, _b, _c;
    try {
        const { firstName, lastName, email, role, password } = req.body;
        if (!firstName || !lastName || !email || !role || !password) {
            return res.status(400).json({ status: 'error', message: 'Missing required fields' });
        }
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(400).json({ status: 'error', message: 'Email already in use' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma.user.create({
            data: { firstName, lastName, email, role, password: hashedPassword, isActive: true }
        });
        // TODO: optional email sending
        await (0, audit_logger_1.logAudit)({
            userId: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 'admin',
            userEmail: (_b = req.user) === null || _b === void 0 ? void 0 : _b.email,
            userRole: (_c = req.user) === null || _c === void 0 ? void 0 : _c.role,
            action: audit_logger_1.AuditAction.CREATE,
            resource: audit_logger_1.AuditResource.USER,
            resourceId: user.id,
            success: true
        });
        res.status(201).json({ status: 'success', data: user });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to create user' });
    }
};
exports.createUser = createUser;
// 3) Doctors
const listDoctors = async (req, res) => {
    try {
        const { page, pageSize, skip } = parsePagination(req);
        const [items, total] = await Promise.all([
            prisma.user.findMany({
                where: { role: 'DOCTOR' },
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true, email: true, firstName: true, lastName: true, isActive: true,
                    doctorProfile: { select: { specialization: true, experience: true, licenseNumber: true, consultationFee: true } }
                }
            }),
            prisma.user.count({ where: { role: 'DOCTOR' } })
        ]);
        res.json({ status: 'success', data: { items, total, page, pageSize } });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to list doctors' });
    }
};
exports.listDoctors = listDoctors;
const approveDoctor = async (req, res) => {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const user = await prisma.user.update({
            where: { id },
            data: { isActive: true },
            select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true }
        });
        await (0, audit_logger_1.logAudit)({
            userId: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 'admin',
            userEmail: (_b = req.user) === null || _b === void 0 ? void 0 : _b.email,
            userRole: (_c = req.user) === null || _c === void 0 ? void 0 : _c.role,
            action: audit_logger_1.AuditAction.UPDATE,
            resource: audit_logger_1.AuditResource.USER,
            resourceId: id,
            success: true
        });
        res.json({ status: 'success', data: user });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to approve doctor' });
    }
};
exports.approveDoctor = approveDoctor;
// 4) Clinics
const listClinics = async (req, res) => {
    try {
        const { page, pageSize, skip } = parsePagination(req);
        const [items, total] = await Promise.all([
            prisma.clinic.findMany({
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true, name: true, address: true, phone: true, email: true, status: true,
                    users: { select: { id: true } }
                }
            }),
            prisma.clinic.count()
        ]);
        res.json({ status: 'success', data: { items, total, page, pageSize } });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to list clinics' });
    }
};
exports.listClinics = listClinics;
const createClinic = async (req, res) => {
    var _a, _b, _c;
    try {
        const { name, address, phone, email, password, logo, city, state, country, postalCode, website } = req.body;
        if (!name || !address || !city || !state || !country || !postalCode || !phone || !email || !password) {
            return res.status(400).json({ status: 'error', message: 'Missing required fields (name, address, city, state, country, postalCode, phone, email, password)' });
        }
        const existing = await prisma.clinic.findFirst({ where: { OR: [{ name }, { email }] } });
        if (existing) {
            return res.status(400).json({ status: 'error', message: 'Clinic with this name or email already exists' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Create clinic and a clinic admin user
        const clinic = await prisma.clinic.create({
            data: {
                name,
                address,
                city,
                state,
                country,
                postalCode,
                phone,
                email,
                website: website || null,
                status: 'ACTIVE',
            }
        });
        const clinicAdminUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName: name,
                lastName: 'Clinic',
                role: 'CLINIC_ADMIN',
                clinicId: clinic.id,
                isActive: true,
            }
        });
        await (0, audit_logger_1.logAudit)({
            userId: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 'admin',
            userEmail: (_b = req.user) === null || _b === void 0 ? void 0 : _b.email,
            userRole: (_c = req.user) === null || _c === void 0 ? void 0 : _c.role,
            action: audit_logger_1.AuditAction.CREATE,
            resource: audit_logger_1.AuditResource.BILLING,
            resourceId: clinic.id,
            success: true
        });
        // TODO: Auto-send credentials via email
        res.status(201).json({ status: 'success', data: { clinic, clinicAdminUser } });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to create clinic' });
    }
};
exports.createClinic = createClinic;
const updateClinic = async (req, res) => {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const { name, address, phone, email, status } = req.body;
        const clinic = await prisma.clinic.update({
            where: { id },
            data: { name, address, phone, email, status },
        });
        await (0, audit_logger_1.logAudit)({
            userId: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 'admin',
            userEmail: (_b = req.user) === null || _b === void 0 ? void 0 : _b.email,
            userRole: (_c = req.user) === null || _c === void 0 ? void 0 : _c.role,
            action: audit_logger_1.AuditAction.UPDATE,
            resource: audit_logger_1.AuditResource.BILLING,
            resourceId: id,
            success: true
        });
        res.json({ status: 'success', data: clinic });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to update clinic' });
    }
};
exports.updateClinic = updateClinic;
// 5) Patients
const listPatients = async (req, res) => {
    try {
        const { page, pageSize, skip } = parsePagination(req);
        const search = req.query.search || '';
        const doctorId = req.query.doctorId || undefined;
        const clinicId = req.query.clinicId || undefined;
        const where = {
            role: 'PATIENT',
            AND: [
                search
                    ? { OR: [
                            { firstName: { contains: search, mode: 'insensitive' } },
                            { lastName: { contains: search, mode: 'insensitive' } },
                            { email: { contains: search, mode: 'insensitive' } },
                        ] }
                    : {},
                clinicId ? { clinicId } : {},
            ],
        };
        const [items, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
                select: { id: true, email: true, firstName: true, lastName: true, clinicId: true, isActive: true }
            }),
            prisma.user.count({ where })
        ]);
        res.json({ status: 'success', data: { items, total, page, pageSize } });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to list patients' });
    }
};
exports.listPatients = listPatients;
// 6) Logs & Analytics
const getLogs = async (req, res) => {
    try {
        const { page, pageSize, skip } = parsePagination(req);
        const role = req.query.role || undefined;
        const start = req.query.start ? new Date(req.query.start) : undefined;
        const end = req.query.end ? new Date(req.query.end) : undefined;
        const where = {
            ...(role && { userRole: role }),
            ...(start && end && { timestamp: { gte: start, lte: end } })
        };
        const [items, total, onlineUsers] = await Promise.all([
            prisma.auditLog.findMany({ where, skip, take: pageSize, orderBy: { timestamp: 'desc' } }),
            prisma.auditLog.count({ where }),
            prisma.user.count({ where: { lastLogin: { gte: new Date(Date.now() - 15 * 60 * 1000) } } })
        ]);
        res.json({ status: 'success', data: { items, total, page, pageSize, onlineUsers } });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to get logs' });
    }
};
exports.getLogs = getLogs;
// 7) Settings
const getSettings = async (req, res) => {
    try {
        // Use raw SQL to avoid requiring a regenerated Prisma Client on Windows/OneDrive
        const items = await prisma.$queryRawUnsafe('SELECT id, key, value, "createdAt", "updatedAt" FROM "SystemSetting" ORDER BY key ASC');
        res.json({ status: 'success', data: items });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to get settings' });
    }
};
exports.getSettings = getSettings;
const updateSettings = async (req, res) => {
    var _a, _b, _c, _d;
    try {
        const settings = req.body;
        if (!settings || typeof settings !== 'object') {
            return res.status(400).json({ status: 'error', message: 'Invalid settings payload' });
        }
        const entries = Object.entries(settings);
        if (entries.length === 0) {
            return res.json({ status: 'success', data: [] });
        }
        // Upsert using raw SQL with ON CONFLICT(key)
        const results = [];
        await prisma.$transaction(async (tx) => {
            for (const [key, value] of entries) {
                await tx.$executeRawUnsafe('INSERT INTO "SystemSetting" (id, key, value, "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2::jsonb, NOW(), NOW())\n           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, "updatedAt" = NOW()', key, JSON.stringify(value));
            }
        });
        // Return the updated list
        const latest = await prisma.$queryRawUnsafe('SELECT id, key, value, "createdAt", "updatedAt" FROM "SystemSetting" ORDER BY key ASC');
        await (0, audit_logger_1.logAudit)({
            userId: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 'admin',
            userEmail: (_b = req.user) === null || _b === void 0 ? void 0 : _b.email,
            userRole: (_c = req.user) === null || _c === void 0 ? void 0 : _c.role,
            action: audit_logger_1.AuditAction.UPDATE,
            resource: audit_logger_1.AuditResource.USER,
            resourceId: (_d = req.user) === null || _d === void 0 ? void 0 : _d.id,
            success: true
        });
        res.json({ status: 'success', data: latest });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: error.message || 'Failed to update settings' });
    }
};
exports.updateSettings = updateSettings;
