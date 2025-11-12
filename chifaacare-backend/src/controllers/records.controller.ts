import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';
import { Readable } from 'stream';

const prisma = new PrismaClient();

// GET /api/v1/records?patientId=...
export const listRecords = async (req: any, res: Response) => {
  try {
    const { patientId } = req.query as { patientId?: string };
    if (!patientId) return res.status(400).json({ status: 'error', message: 'patientId is required' });

    // Authorization: patient themself, their doctor (with at least one appointment), or admin
    if (req.user?.role !== 'ADMIN' && req.user?.id !== patientId) {
      const hasRelationship = await prisma.appointment.findFirst({
        where: { patientId, doctorId: req.user?.id || '' }
      });
      if (!hasRelationship) return res.status(403).json({ status: 'error', message: 'Forbidden' });
    }

    const history = await prisma.medicalHistory.findMany({
      where: { patientProfile: { userId: patientId } },
      orderBy: { diagnosisDate: 'desc' },
    });

    return res.status(200).json({ status: 'success', results: history.length, data: { records: history } });
  } catch (error) {
    console.error('List records error:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to list records' });
  }
};

// GET /api/v1/records/export/csv?patientId=...
export const exportRecordsCsv = async (req: any, res: Response) => {
  try {
    const { patientId } = req.query as { patientId?: string };
    if (!patientId) return res.status(400).send('patientId is required');

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
        (() => { try { return JSON.parse(r.attachments || '[]').length; } catch { return 0; } })(),
      ])
    ];
    const csv = rows.map(cols => cols.map(v => String(v).includes(',') ? `"${String(v).replace(/"/g,'""')}"` : String(v)).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=medical-records-${patientId}.csv`);
    return res.status(200).send(csv);
  } catch (error) {
    console.error('Export records CSV error:', error);
    return res.status(500).send('Failed to export CSV');
  }
};

// GET /api/v1/records/export/pdf?patientId=...
export const exportRecordsPdf = async (req: any, res: Response) => {
  try {
    const { patientId } = req.query as { patientId?: string };
    if (!patientId) return res.status(400).send('patientId is required');

    // Lazy require to avoid build errors if dependency not installed yet
    let PDFDocument: any;
    try { PDFDocument = require('pdfkit'); } catch {
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
      if (r.notes) doc.text(`Notes: ${r.notes}`);
      let count = 0; try { count = JSON.parse(r.attachments || '[]').length; } catch {}
      doc.text(`Attachments: ${count}`);
      doc.moveDown();
    }
    doc.end();
  } catch (error) {
    console.error('Export records PDF error:', error);
    return res.status(500).send('Failed to export PDF');
  }
};

// POST /api/v1/records
export const createRecord = async (req: any, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ status: 'error', errors: errors.array() });

    const { patientId, condition, diagnosisDate, status, notes } = req.body as {
      patientId: string; condition: string; diagnosisDate: string; status: string; notes?: string;
    };

    // Only doctor or admin can create
    if (req.user?.role !== 'DOCTOR' && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ status: 'error', message: 'Only doctors or admins can create records' });
    }

    const patient = await prisma.user.findFirst({ where: { id: patientId, role: 'PATIENT' } });
    if (!patient) return res.status(404).json({ status: 'error', message: 'Patient not found' });

    const patientProfile = await prisma.patientProfile.findFirst({ where: { userId: patientId } });
    if (!patientProfile) return res.status(404).json({ status: 'error', message: 'Patient profile not found' });

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
  } catch (error) {
    console.error('Create record error:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to create record' });
  }
};

// POST /api/v1/records/:id/attachments
export const addAttachment = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { url, name } = req.body as { url: string; name?: string };
    if (!url) return res.status(400).json({ status: 'error', message: 'url is required' });

    const record = await prisma.medicalHistory.findUnique({ where: { id } });
    if (!record) return res.status(404).json({ status: 'error', message: 'Record not found' });

    // Only doctor/admin or the patient can attach
    const patientProfile = await prisma.patientProfile.findUnique({ where: { id: record.patientProfileId } });
    const patientUserId = patientProfile?.userId;
    if (req.user?.role !== 'ADMIN' && req.user?.id !== patientUserId && req.user?.role !== 'DOCTOR') {
      return res.status(403).json({ status: 'error', message: 'Forbidden' });
    }

    let attachments: any[] = [];
    try { attachments = JSON.parse(record.attachments || '[]'); } catch {}
    attachments.push({ url, name: name || 'Attachment', addedAt: new Date().toISOString() });

    const updated = await prisma.medicalHistory.update({
      where: { id },
      data: { attachments: JSON.stringify(attachments) }
    });

    return res.status(200).json({ status: 'success', data: { record: updated } });
  } catch (error) {
    console.error('Add attachment error:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to add attachment' });
  }
};
