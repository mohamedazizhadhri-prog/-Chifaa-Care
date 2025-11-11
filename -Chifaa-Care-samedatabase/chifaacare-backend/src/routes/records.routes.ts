import express from 'express';
import { body, query, param } from 'express-validator';
import { protect, restrictTo } from '../controllers/auth.controller';
import { listRecords, createRecord, addAttachment, exportRecordsCsv, exportRecordsPdf } from '../controllers/records.controller';

const router = express.Router();

// All routes protected
router.use(protect);

// List records for a patient
router.get(
  '/',
  [query('patientId').isString().notEmpty()],
  listRecords
);

// Export CSV/PDF
router.get('/export/csv', [query('patientId').isString().notEmpty()], exportRecordsCsv);
router.get('/export/pdf', [query('patientId').isString().notEmpty()], exportRecordsPdf);

// Create a record (doctor/admin)
router.post(
  '/',
  restrictTo('DOCTOR', 'ADMIN'),
  [
    body('patientId').isString().notEmpty(),
    body('condition').isString().notEmpty(),
    body('diagnosisDate').isISO8601(),
    body('status').isString().notEmpty(),
    body('notes').optional().isString(),
  ],
  createRecord
);

// Add attachment to a record
router.post(
  '/:id/attachments',
  [param('id').isString().notEmpty(), body('url').isString().notEmpty(), body('name').optional().isString()],
  addAttachment
);

export default router;
