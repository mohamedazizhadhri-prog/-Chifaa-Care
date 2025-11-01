"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAttachment = exports.createRecord = exports.exportRecordsPdf = exports.exportRecordsCsv = exports.listRecords = void 0;
const client_1 = require("@prisma/client");
const express_validator_1 = require("express-validator");
const prisma = new client_1.PrismaClient();
// GET /api/v1/records?patientId=...
const listRecords = async (req, res) => {
    var _a, _b, _c;
    try {
        const { patientId } = req.query;
        if (!patientId)
            return res.status(400).json({ status: 'error', message: 'patientId is required' });
        // Authorization: patient themself, their doctor (with at least one appointment), or admin
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'ADMIN' && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) !== patientId) {
            const hasRelationship = await prisma.appointment.findFirst({
                where: { patientId, doctorId: ((_c = req.user) === null || _c === void 0 ? void 0 : _c.id) || '' }
            });
            if (!hasRelationship)
                return res.status(403).json({ status: 'error', message: 'Forbidden' });
        }
        const history = await prisma.medicalHistory.findMany({
            where: { patientProfile: { userId: patientId } },
            orderBy: { diagnosisDate: 'desc' },
        });
        return res.status(200).json({ status: 'success', results: history.length, data: { records: history } });
    }
    catch (error) {
        console.error('List records error:', error);
        return res.status(500).json({ status: 'error', message: 'Failed to list records' });
    }
};
exports.listRecords = listRecords;
// GET /api/v1/records/export/csv?patientId=...
const exportRecordsCsv = async (req, res) => {
    try {
        const { patientId } = req.query;
        if (!patientId)
            return res.status(400).send('patientId is required');
        const history = await prisma.medicalHistory.findMany({
            where: { patientProfile: { userId: String(patientId) } },
            orderBy: { diagnosisDate: 'desc' },
        });
        const rows = [
            ['condition', 'diagnosisDate', 'status', 'notes', 'attachmentsCount'],
            ...history.map((r) => [
                r.condition,
                new Date(r.diagnosisDate).toISOString(),
                r.status,
                (r.notes || '').replace(/\n/g, ' '),
                (() => { try {
                    return JSON.parse(r.attachments || '[]').length;
                }
                catch (_a) {
                    return 0;
                } })(),
            ])
        ];
        const csv = rows.map(cols => cols.map(v => String(v).includes(',') ? `"${String(v).replace(/"/g, '""')}"` : String(v)).join(',')).join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=medical-records-${patientId}.csv`);
        return res.status(200).send(csv);
    }
    catch (error) {
        console.error('Export records CSV error:', error);
        return res.status(500).send('Failed to export CSV');
    }
};
exports.exportRecordsCsv = exportRecordsCsv;
// GET /api/v1/records/export/pdf?patientId=...
const exportRecordsPdf = async (req, res) => {
    try {
        const { patientId } = req.query;
        if (!patientId)
            return res.status(400).send('patientId is required');
        // Lazy require to avoid build errors if dependency not installed yet
        let PDFDocument;
        try {
            PDFDocument = require('pdfkit');
        }
        catch (_a) {
            return res.status(501).json({ status: 'error', message: 'PDF export requires pdfkit. Please `npm install pdfkit` in backend.' });
        }
        const history = await prisma.medicalHistory.findMany({
            where: { patientProfile: { userId: String(patientId) } },
            orderBy: { diagnosisDate: 'desc' },
        });
        const doc = new PDFDocument({ margin: 40 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=medical-records-${patientId}.pdf`);
        doc.pipe(res);
        doc.fontSize(18).text('Medical Records Export', { underline: true });
        doc.moveDown();
        for (const r of history) {
            doc.fontSize(12).text(`Condition: ${r.condition}`);
            doc.text(`Diagnosis Date: ${new Date(r.diagnosisDate).toLocaleString()}`);
            doc.text(`Status: ${r.status}`);
            if (r.notes)
                doc.text(`Notes: ${r.notes}`);
            let count = 0;
            try {
                count = JSON.parse(r.attachments || '[]').length;
            }
            catch (_b) { }
            doc.text(`Attachments: ${count}`);
            doc.moveDown();
        }
        doc.end();
    }
    catch (error) {
        console.error('Export records PDF error:', error);
        return res.status(500).send('Failed to export PDF');
    }
};
exports.exportRecordsPdf = exportRecordsPdf;
// POST /api/v1/records
const createRecord = async (req, res) => {
    var _a, _b;
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            return res.status(400).json({ status: 'error', errors: errors.array() });
        const { patientId, condition, diagnosisDate, status, notes } = req.body;
        // Only doctor or admin can create
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'DOCTOR' && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== 'ADMIN') {
            return res.status(403).json({ status: 'error', message: 'Only doctors or admins can create records' });
        }
        const patient = await prisma.user.findFirst({ where: { id: patientId, role: 'PATIENT' } });
        if (!patient)
            return res.status(404).json({ status: 'error', message: 'Patient not found' });
        const patientProfile = await prisma.patientProfile.findFirst({ where: { userId: patientId } });
        if (!patientProfile)
            return res.status(404).json({ status: 'error', message: 'Patient profile not found' });
        const record = await prisma.medicalHistory.create({
            data: {
                patientProfileId: patientProfile.id,
                condition,
                diagnosisDate: new Date(diagnosisDate),
                status,
                notes: notes || null,
                attachments: JSON.stringify([]),
            }
        });
        return res.status(201).json({ status: 'success', data: { record } });
    }
    catch (error) {
        console.error('Create record error:', error);
        return res.status(500).json({ status: 'error', message: 'Failed to create record' });
    }
};
exports.createRecord = createRecord;
// POST /api/v1/records/:id/attachments
const addAttachment = async (req, res) => {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const { url, name } = req.body;
        if (!url)
            return res.status(400).json({ status: 'error', message: 'url is required' });
        const record = await prisma.medicalHistory.findUnique({ where: { id } });
        if (!record)
            return res.status(404).json({ status: 'error', message: 'Record not found' });
        // Only doctor/admin or the patient can attach
        const patientProfile = await prisma.patientProfile.findUnique({ where: { id: record.patientProfileId } });
        const patientUserId = patientProfile === null || patientProfile === void 0 ? void 0 : patientProfile.userId;
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'ADMIN' && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) !== patientUserId && ((_c = req.user) === null || _c === void 0 ? void 0 : _c.role) !== 'DOCTOR') {
            return res.status(403).json({ status: 'error', message: 'Forbidden' });
        }
        let attachments = [];
        try {
            attachments = JSON.parse(record.attachments || '[]');
        }
        catch (_d) { }
        attachments.push({ url, name: name || 'Attachment', addedAt: new Date().toISOString() });
        const updated = await prisma.medicalHistory.update({
            where: { id },
            data: { attachments: JSON.stringify(attachments) }
        });
        return res.status(200).json({ status: 'success', data: { record: updated } });
    }
    catch (error) {
        console.error('Add attachment error:', error);
        return res.status(500).json({ status: 'error', message: 'Failed to add attachment' });
    }
};
exports.addAttachment = addAttachment;
