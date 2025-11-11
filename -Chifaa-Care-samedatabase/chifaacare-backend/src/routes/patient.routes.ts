import express from 'express';
import { getAllPatients, getPatientById, getDoctorPatients } from '../controllers/patient.controller';
import { protect, restrictTo } from '../controllers/auth.controller';

const router = express.Router();

// Protect and restrict to doctors or admins
router.use(protect);

// Get all patients (for doctors/admins/clinics)
router.get('/', restrictTo('DOCTOR', 'ADMIN', 'CLINIC'), getAllPatients);

// Get patients for the authenticated doctor that have confirmed appointments with them
router.get('/doctor/mine', restrictTo('DOCTOR', 'ADMIN', 'CLINIC'), getDoctorPatients);

// Get a single patient's profile (for doctors/admins/clinics)
router.get('/:id', restrictTo('DOCTOR', 'ADMIN', 'CLINIC'), getPatientById);

export default router;
