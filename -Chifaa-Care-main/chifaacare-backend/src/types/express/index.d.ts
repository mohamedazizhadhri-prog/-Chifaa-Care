import { User } from '@prisma/client';
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        email: string;
        firstName: string;
        lastName: string;
        isEmailVerified: boolean;
        isActive: boolean;
        [key: string]: any; // For any additional properties
      };
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    role: string;
    email: string;
    firstName: string;
    lastName: string;
    isEmailVerified: boolean;
    isActive: boolean;
    [key: string]: any; // For any additional properties
  };
}
