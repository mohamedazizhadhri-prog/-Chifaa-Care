import { Router } from 'express';
import { validateJWT } from '../middleware/auth.middleware';
import { 
  requireRole, 
  requirePermission, 
  requireAdmin,
  requireDoctor,
  requirePatient,
  requireDoctorOrAdmin,
  requireOwnership
} from '../middleware/rbac.middleware';

const router = Router();

/**
 * Example protected routes demonstrating RBAC implementation
 */

// Public route - no authentication required
router.get('/public', (req, res) => {
  res.json({
    status: 'success',
    message: 'This is a public endpoint'
  });
});

// Protected route - requires authentication
router.get('/protected', validateJWT, (req, res) => {
  res.json({
    status: 'success',
    message: 'You are authenticated',
    user: req.user
  });
});

// Admin only route
router.get('/admin-only', validateJWT, requireAdmin, (req, res) => {
  res.json({
    status: 'success',
    message: 'Admin access granted',
    user: req.user
  });
});

// Doctor only route
router.get('/doctor-only', validateJWT, requireDoctor, (req, res) => {
  res.json({
    status: 'success',
    message: 'Doctor access granted',
    user: req.user
  });
});

// Patient only route
router.get('/patient-only', validateJWT, requirePatient, (req, res) => {
  res.json({
    status: 'success',
    message: 'Patient access granted',
    user: req.user
  });
});

// Multiple roles allowed
router.get('/doctor-or-admin', validateJWT, requireDoctorOrAdmin, (req, res) => {
  res.json({
    status: 'success',
    message: 'Doctor or Admin access granted',
    user: req.user
  });
});

// Permission-based access
router.get('/read-appointments', 
  validateJWT, 
  requirePermission('appointments:read'), 
  (req, res) => {
    res.json({
      status: 'success',
      message: 'You have permission to read appointments',
      user: req.user
    });
  }
);

// Multiple permissions (user needs at least one)
router.post('/manage-records', 
  validateJWT, 
  requirePermission('medical_records:write', 'medical_records:manage'), 
  (req, res) => {
    res.json({
      status: 'success',
      message: 'You can manage medical records',
      user: req.user
    });
  }
);

// Resource ownership check
router.get('/users/:userId/profile', 
  validateJWT, 
  requireOwnership('userId'),
  (req, res) => {
    res.json({
      status: 'success',
      message: 'Access to user profile granted',
      userId: req.params.userId,
      user: req.user
    });
  }
);

// Complex authorization - role OR permission
router.get('/analytics', 
  validateJWT,
  (req, res, next) => {
    // Custom logic: Admin, Project Team, or users with analytics:read permission
    if (
      req.user?.role === 'ADMIN' || 
      req.user?.role === 'PROJECT_TEAM' ||
      req.user?.permissions?.includes('analytics:read')
    ) {
      return next();
    }
    return res.status(403).json({
      status: 'error',
      message: 'Insufficient permissions to view analytics'
    });
  },
  (req, res) => {
    res.json({
      status: 'success',
      message: 'Analytics data',
      user: req.user
    });
  }
);

export default router;
