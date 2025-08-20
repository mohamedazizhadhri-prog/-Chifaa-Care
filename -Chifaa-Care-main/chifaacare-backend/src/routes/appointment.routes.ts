import express from 'express';
import { body, param } from 'express-validator';
import { protect } from '../controllers/auth.controller';
import { 
  createAppointment, 
  getAppointments, 
  updateAppointmentStatus, 
  deleteAppointment 
} from '../controllers/appointment.controller';

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// Validation for creating an appointment
const validateCreateAppointment = [
  body('doctorId').isString().notEmpty().withMessage('Doctor ID is required'),
  body('appointmentDate').isISO8601().toDate().withMessage('Valid appointment date is required'),
  body('endTime').isISO8601().toDate().withMessage('Valid end time is required'),
  body('reason').isString().notEmpty().withMessage('Reason for appointment is required'),
  body('notes').optional().isString(),
];

// Validation for updating appointment status
const validateUpdateStatus = [
  param('id').isString().withMessage('Valid appointment ID is required'),
  body('status').isIn(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED', 'NO_SHOW'])
    .withMessage('Invalid status value'),
];

// Routes
router
  .route('/')
  .get(getAppointments)
  .post(validateCreateAppointment, createAppointment);

router
  .route('/:id/status')
  .patch(validateUpdateStatus, updateAppointmentStatus);

router
  .route('/:id')
  .delete(deleteAppointment);

export default router;
