import express, { Request, Response, NextFunction } from 'express';
// Define a custom User type for the request object
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  dateOfBirth?: Date | null;
  gender?: string | null;
  profileImage?: string | null;
  role: string;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLogin?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
import { body } from 'express-validator';
import { signup, login, protect } from '../controllers/auth.controller';

const router = express.Router();

// Input validation for signup
const validateSignup = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('role')
    .optional()
    .isIn(['PATIENT', 'DOCTOR'])
    .withMessage('Invalid role. Must be PATIENT or DOCTOR'),
];

// Input validation for login
const validateLogin = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').exists().withMessage('Please provide a password'),
];

// Routes
router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);

// Extend the Express Request type to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// Protected route example
router.get('/me', protect, (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
    },
  });
});

export default router;
