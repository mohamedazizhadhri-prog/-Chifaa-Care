import express from 'express';
import { getAllPatients } from '../controllers/patient.controller';
import { protect, restrictTo } from '../controllers/auth.controller';

const router = express.Router();

// Protect and restrict to doctors or admins
router.use(protect);
router.get('/', restrictTo('DOCTOR', 'ADMIN'), getAllPatients);

export default router;
