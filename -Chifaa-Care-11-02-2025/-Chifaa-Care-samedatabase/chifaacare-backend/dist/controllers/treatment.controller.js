"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listMedications = exports.addMedication = exports.listNotes = exports.addNote = exports.updatePlan = exports.getPlanById = exports.listPlans = exports.createPlan = void 0;
const client_1 = require("@prisma/client");
const express_validator_1 = require("express-validator");
const prisma = new client_1.PrismaClient();
// Create a treatment plan
const createPlan = async (req, res) => {
    var _a, _b;
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            return res.status(400).json({ status: 'error', errors: errors.array() });
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'DOCTOR' && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== 'ADMIN') {
            return res.status(403).json({ status: 'error', message: 'Only doctors or admins can create plans' });
        }
        const { patientId, title, diagnosis, goals, carePlan, status, startDate, endDate } = req.body;
        const doctorId = req.user.role === 'DOCTOR' ? req.user.id : (req.body.doctorId || undefined);
        if (!doctorId)
            return res.status(400).json({ status: 'error', message: 'doctorId is required' });
        const plan = await prisma.treatmentPlan.create({
            data: {
                patientId,
                doctorId,
                title,
                diagnosis,
                goals,
                carePlan,
                status: status || 'ACTIVE',
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
            }
        });
        return res.status(201).json({ status: 'success', data: { plan } });
    }
    catch (error) {
        console.error('Create plan error:', error);
        return res.status(500).json({ status: 'error', message: 'Failed to create plan' });
    }
};
exports.createPlan = createPlan;
// List plans (filter by patientId, status)
const listPlans = async (req, res) => {
    var _a;
    try {
        const { patientId, status } = req.query;
        // Role-based scoping: doctor sees own patients; admin sees all
        const where = {};
        if (patientId)
            where.patientId = String(patientId);
        if (status)
            where.status = String(status);
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === 'DOCTOR')
            where.doctorId = req.user.id;
        const plans = await prisma.treatmentPlan.findMany({
            where,
            orderBy: { updatedAt: 'desc' },
        });
        return res.status(200).json({ status: 'success', results: plans.length, data: { plans } });
    }
    catch (error) {
        console.error('List plans error:', error);
        return res.status(500).json({ status: 'error', message: 'Failed to list plans' });
    }
};
exports.listPlans = listPlans;
const getPlanById = async (req, res) => {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const plan = await prisma.treatmentPlan.findUnique({
            where: { id },
            include: {
                notes: true,
                medications: true,
                patient: { select: { id: true, firstName: true, lastName: true, email: true } },
                doctor: { select: { id: true, firstName: true, lastName: true, email: true } },
            }
        });
        if (!plan)
            return res.status(404).json({ status: 'error', message: 'Plan not found' });
        // Access control: doctor who owns, patient, or admin
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'ADMIN' &&
            plan.doctorId !== ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) &&
            plan.patientId !== ((_c = req.user) === null || _c === void 0 ? void 0 : _c.id)) {
            return res.status(403).json({ status: 'error', message: 'Forbidden' });
        }
        return res.status(200).json({ status: 'success', data: { plan } });
    }
    catch (error) {
        console.error('Get plan error:', error);
        return res.status(500).json({ status: 'error', message: 'Failed to fetch plan' });
    }
};
exports.getPlanById = getPlanById;
const updatePlan = async (req, res) => {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
        const { id } = req.params;
        const body = req.body || {};
        const existing = await prisma.treatmentPlan.findUnique({ where: { id } });
        if (!existing)
            return res.status(404).json({ status: 'error', message: 'Plan not found' });
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'ADMIN' && existing.doctorId !== ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id)) {
            return res.status(403).json({ status: 'error', message: 'Only the owning doctor or admin can update the plan' });
        }
        const updated = await prisma.treatmentPlan.update({
            where: { id },
            data: {
                title: (_c = body.title) !== null && _c !== void 0 ? _c : undefined,
                diagnosis: (_d = body.diagnosis) !== null && _d !== void 0 ? _d : undefined,
                goals: (_e = body.goals) !== null && _e !== void 0 ? _e : undefined,
                carePlan: (_f = body.carePlan) !== null && _f !== void 0 ? _f : undefined,
                status: (_g = body.status) !== null && _g !== void 0 ? _g : undefined,
                startDate: body.startDate ? new Date(body.startDate) : undefined,
                endDate: body.endDate ? new Date(body.endDate) : undefined,
            }
        });
        return res.status(200).json({ status: 'success', data: { plan: updated } });
    }
    catch (error) {
        console.error('Update plan error:', error);
        return res.status(500).json({ status: 'error', message: 'Failed to update plan' });
    }
};
exports.updatePlan = updatePlan;
const addNote = async (req, res) => {
    var _a, _b;
    try {
        const { id } = req.params; // planId
        const { content, isImportant } = req.body;
        const plan = await prisma.treatmentPlan.findUnique({ where: { id } });
        if (!plan)
            return res.status(404).json({ status: 'error', message: 'Plan not found' });
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'ADMIN' && plan.doctorId !== ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id)) {
            return res.status(403).json({ status: 'error', message: 'Only the owning doctor or admin can add notes' });
        }
        const note = await prisma.treatmentNote.create({
            data: {
                planId: id,
                doctorId: req.user.id,
                content,
                isImportant: !!isImportant
            }
        });
        return res.status(201).json({ status: 'success', data: { note } });
    }
    catch (error) {
        console.error('Add note error:', error);
        return res.status(500).json({ status: 'error', message: 'Failed to add note' });
    }
};
exports.addNote = addNote;
const listNotes = async (req, res) => {
    try {
        const { id } = req.params;
        const notes = await prisma.treatmentNote.findMany({ where: { planId: id }, orderBy: { createdAt: 'desc' } });
        return res.status(200).json({ status: 'success', results: notes.length, data: { notes } });
    }
    catch (error) {
        console.error('List notes error:', error);
        return res.status(500).json({ status: 'error', message: 'Failed to list notes' });
    }
};
exports.listNotes = listNotes;
const addMedication = async (req, res) => {
    var _a, _b;
    try {
        const { id } = req.params; // planId
        const { name, dose, frequency, route, instructions, startDate, endDate, isActive } = req.body;
        const plan = await prisma.treatmentPlan.findUnique({ where: { id } });
        if (!plan)
            return res.status(404).json({ status: 'error', message: 'Plan not found' });
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'ADMIN' && plan.doctorId !== ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id)) {
            return res.status(403).json({ status: 'error', message: 'Only the owning doctor or admin can add medication' });
        }
        const med = await prisma.medication.create({
            data: {
                planId: id,
                name,
                dose,
                frequency,
                route,
                instructions,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                isActive: isActive !== undefined ? !!isActive : true
            }
        });
        return res.status(201).json({ status: 'success', data: { medication: med } });
    }
    catch (error) {
        console.error('Add medication error:', error);
        return res.status(500).json({ status: 'error', message: 'Failed to add medication' });
    }
};
exports.addMedication = addMedication;
const listMedications = async (req, res) => {
    try {
        const { id } = req.params;
        const meds = await prisma.medication.findMany({ where: { planId: id }, orderBy: { startDate: 'desc' } });
        return res.status(200).json({ status: 'success', results: meds.length, data: { medications: meds } });
    }
    catch (error) {
        console.error('List medications error:', error);
        return res.status(500).json({ status: 'error', message: 'Failed to list medications' });
    }
};
exports.listMedications = listMedications;
