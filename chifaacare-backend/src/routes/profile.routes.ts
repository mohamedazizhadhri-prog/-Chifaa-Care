import express, { RequestHandler } from 'express';
import { body } from 'express-validator';
import { protect } from '../controllers/auth.controller';
import { getMyProfile, updateMyProfile, updatePassword } from '../controllers/profile.controller';
import { AuthenticatedRequest } from '../types/express';

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// Validation for updating profile
const validateUpdateProfile = [
  body('firstName').optional().isString().trim().notEmpty(),
  body('lastName').optional().isString().trim().notEmpty(),
  body('phone').optional().isString().trim(),
  body('dateOfBirth').optional().isISO8601().toDate(),
  body('gender').optional().isIn(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']),
  body('profileImage').optional().isString(),
  body('doctorProfile').optional().isObject(),
  body('patientProfile').optional().isObject(),
];

// Validation for updating password
const validateUpdatePassword = [
  body('currentPassword').isString().notEmpty(),
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
];

// Custom request handler type for authenticated routes
type AuthenticatedRequestHandler = (
  req: AuthenticatedRequest,
  res: express.Response,
  next: express.NextFunction
) => Promise<express.Response | void> | express.Response | void;

const asyncHandler = (fn: AuthenticatedRequestHandler): RequestHandler => 
  async (req, res, next) => {
    try {
      const result = await fn(req as AuthenticatedRequest, res, next);
      if (result && !res.headersSent) {
        return result;
      }
    } catch (error) {
      next(error);
    }
  };

// Routes
router
  .route('/me')
  .get(asyncHandler(getMyProfile))
  .patch(validateUpdateProfile, asyncHandler(updateMyProfile));

router
  .route('/update-password')
  .patch(validateUpdatePassword, asyncHandler(updatePassword));

export default router;
