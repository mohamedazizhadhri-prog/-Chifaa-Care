import express from 'express';
import { body, param } from 'express-validator';
import { protect, restrictTo } from '../controllers/auth.controller';
import { 
  createAppointment, 
  getAppointments, 
  updateAppointmentStatus, 
  deleteAppointment,
  getDoctorSchedule,
  getDoctorPending,
  getDoctorUpcoming,
  createAppointmentAsDoctor,
  getAvailableSlots,
  updateAppointment
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

// Doctor's schedule
router.get('/doctor/schedule', restrictTo('DOCTOR', 'ADMIN'), getDoctorSchedule);

// Doctor's pending requests
router.get('/doctor/pending', restrictTo('DOCTOR', 'ADMIN'), getDoctorPending);

// Doctor's upcoming confirmed consultations
router.get('/doctor/upcoming', restrictTo('DOCTOR', 'ADMIN'), getDoctorUpcoming);

// Public endpoint to get available slots for a doctor (authenticated users)
router.get('/doctors/:id/availability', getAvailableSlots);

// Doctor creates appointment for a patient (defaults to CONFIRMED)
router.post(
  '/doctor/create',
  restrictTo('DOCTOR', 'ADMIN'),
  [
    body('patientId').isString().notEmpty().withMessage('patientId is required'),
    body('appointmentDate').isISO8601().toDate().withMessage('Valid appointment date is required'),
    body('endTime').isISO8601().toDate().withMessage('Valid end time is required'),
    body('reason').optional().isString(),
    body('notes').optional().isString(),
  ],
  createAppointmentAsDoctor
);

router
  .route('/:id/status')
  .patch(validateUpdateStatus, updateAppointmentStatus);

router
  .route('/:id')
  .patch(
    [
      param('id').isString().notEmpty(),
      body('appointmentDate').optional().isISO8601().toDate(),
      body('endTime').optional().isISO8601().toDate(),
      body('reason').optional().isString(),
      body('notes').optional().isString(),
    ],
    updateAppointment
  )
  .delete(deleteAppointment);

export default router;
