import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authGuard } from '../middlewares/auth.guard';
import { roleGuard } from '../middlewares/role.guard';

const router = Router();

// Public routes (no authentication required)
router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.post('/verify-email', AuthController.verifyEmail);
router.post('/resend-verification', AuthController.resendVerificationEmail);

// Protected routes (authentication required)
router.post('/refresh', AuthController.refreshToken);
router.post('/logout', AuthController.logout);
router.get('/profile', authGuard, AuthController.getProfile);

// Role-based routes
router.get('/patient-dashboard', authGuard, roleGuard('PATIENT'), AuthController.getPatientDashboard);
router.get('/doctor-dashboard', authGuard, roleGuard('DOCTOR'), AuthController.getDoctorDashboard);

export default router;
