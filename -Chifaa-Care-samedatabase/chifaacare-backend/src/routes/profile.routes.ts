import express, { RequestHandler } from 'express';
import multer from 'multer';
import { body } from 'express-validator';
import { protect } from '../controllers/auth.controller';
import { getMyProfile, updateMyProfile, updatePassword, uploadAvatar } from '../controllers/profile.controller';
import { AuthenticatedRequest } from '../types/express';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Protect all routes after this middleware
router.use(protect);

// Validation for updating profile
const validateUpdateProfile = [
  body('firstName')
    .optional()
    .customSanitizer((v) => (v === '' ? undefined : v))
    .isString()
    .trim(),
  body('lastName')
    .optional()
    .customSanitizer((v) => (v === '' ? undefined : v))
    .isString()
    .trim(),
  body('phone')
    .optional()
    .customSanitizer((v) => (v === '' ? undefined : v))
    .isString()
    .trim(),
  body('dateOfBirth')
    .optional()
    .customSanitizer((v) => (v === '' ? undefined : v))
    .isISO8601()
    .toDate(),
  body('gender')
    .optional()
    .isString()
    .customSanitizer((v) => (typeof v === 'string' ? v.toUpperCase() : v))
    .isIn(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']),
  body('profileImage').optional().customSanitizer((v) => (v === '' ? undefined : v)).isString(),
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

// Upload avatar (multipart/form-data with field name 'avatar')
router
  .route('/me/avatar')
  .post(upload.single('avatar'), asyncHandler(uploadAvatar));

router
  .route('/update-password')
  .patch(validateUpdatePassword, asyncHandler(updatePassword));

export default router;
