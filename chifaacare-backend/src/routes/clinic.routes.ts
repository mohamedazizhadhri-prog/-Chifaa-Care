import { Router } from 'express';
import { protect, restrictTo } from '../controllers/auth.controller';
import * as clinicCtrl from '../controllers/clinic.controller';

const router = Router();

router.use(protect, restrictTo('CLINIC'));

router.get('/overview', clinicCtrl.getOverview);
router.get('/patients', clinicCtrl.getPatients);
router.patch('/patients/:appointmentId/attendance', clinicCtrl.updateAttendance);
router.post('/patients/:appointmentId/follow-up', clinicCtrl.addFollowUp);
router.get('/doctors', clinicCtrl.getDoctors);
router.get('/reports', clinicCtrl.getReports);
router.get('/me', clinicCtrl.getProfile);
router.patch('/me', clinicCtrl.updateProfile);

export default router;
