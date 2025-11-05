import express from 'express';
import { listClinicDoctors, createDoctorOnboarding, createPayout } from '../controllers/payout.controller';
import { protect, restrictTo } from '../controllers/auth.controller';

const router = express.Router();

router.use(protect);
router.use(restrictTo('ADMIN'));

router.get('/doctors', listClinicDoctors);
router.post('/onboard', createDoctorOnboarding);
router.post('/payout', createPayout);

export default router;
