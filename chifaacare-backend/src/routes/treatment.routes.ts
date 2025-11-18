import express from 'express';
import { body, param, query } from 'express-validator';
import { protect, restrictTo } from '../controllers/auth.controller';
import {
  createPlan,
  listPlans,
  getPlanById,
  updatePlan,
  addNote,
  listNotes,
  addMedication,
  listMedications,
} from '../controllers/treatment.controller';

const router = express.Router();

// All routes protected
router.use(protect);

// Plans
router
  .route('/plan')
  .get(
    [
      query('patientId').optional().isString(),
      query('status').optional().isString(),
    ],
    listPlans
  )
  .post(
    restrictTo('DOCTOR', 'ADMIN'),
    [
      body('patientId').isString().notEmpty(),
      body('title').isString().notEmpty(),
      body('diagnosis').optional().isString(),
      body('goals').optional().isString(),
      body('carePlan').optional().isString(),
      body('status').optional().isIn(['ACTIVE', 'ON_HOLD', 'COMPLETED']),
      body('startDate').optional().isISO8601(),
      body('endDate').optional().isISO8601(),
    ],
    createPlan
  );

router
  .route('/plan/:id')
  .get([param('id').isString().notEmpty()], getPlanById)
  .patch(
    restrictTo('DOCTOR', 'ADMIN'),
    [param('id').isString().notEmpty()],
    updatePlan
  );

// Notes
router
  .route('/plan/:id/notes')
  .get([param('id').isString().notEmpty()], listNotes)
  .post(
    restrictTo('DOCTOR', 'ADMIN'),
    [
      param('id').isString().notEmpty(),
      body('content').isString().notEmpty(),
      body('isImportant').optional().isBoolean(),
    ],
    addNote
  );

// Medications
router
  .route('/plan/:id/medications')
  .get([param('id').isString().notEmpty()], listMedications)
  .post(
    restrictTo('DOCTOR', 'ADMIN'),
    [
      param('id').isString().notEmpty(),
      body('name').isString().notEmpty(),
      body('dose').optional().isString(),
      body('frequency').optional().isString(),
      body('route').optional().isString(),
      body('instructions').optional().isString(),
      body('startDate').optional().isISO8601(),
      body('endDate').optional().isISO8601(),
      body('isActive').optional().isBoolean(),
    ],
    addMedication
  );

export default router;
