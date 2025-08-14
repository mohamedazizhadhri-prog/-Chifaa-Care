import { database } from '../database';
import { Hash } from '../utils/hash';
import { JWT, JWTPayload } from '../utils/jwt';
import { z } from 'zod';

// Validation schemas
const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['PATIENT', 'DOCTOR']),
  licenseNumber: z.string().optional(),
  specialty: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['PATIENT', 'DOCTOR']),
});

// Interfaces
export interface SignupData {
  fullName: string;
  email: string;
  password: string;
  role: 'PATIENT' | 'DOCTOR';
  licenseNumber?: string;
  specialty?: string;
}

export interface LoginData {
  email: string;
  password: string;
  role: 'PATIENT' | 'DOCTOR';
}

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: 'PATIENT' | 'DOCTOR';
  license_number?: string;
  specialty?: string;
  email_verified: boolean;
  verification_token?: string;
  created_at: Date;
  updated_at: Date;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: Omit<User, 'password_hash' | 'verification_token'>;
    accessToken: string;
    refreshToken: string;
  };
}

export class AuthService {
  static async signup(data: SignupData): Promise<AuthResponse> {
    try {
      // Validate input
      const validatedData = signupSchema.parse(data);
      
      // Check if user already exists
      const existingUser = await database.query<User>('SELECT id FROM users WHERE email = ?', [validatedData.email]);
      if (existingUser.length > 0) {
        return {
          success: false,
          message: 'An account with this email already exists'
        };
      }

      // Hash password
      const hashedPassword = await Hash.hashPassword(validatedData.password);
      
      // Generate verification token
      const verificationToken = this.generateVerificationToken();
      
      // Insert user
      const result = await database.execute(
        'INSERT INTO users (full_name, email, password_hash, role, license_number, specialty, email_verified, verification_token) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          validatedData.fullName, 
          validatedData.email, 
          hashedPassword, 
          validatedData.role, 
          validatedData.licenseNumber || null, 
          validatedData.specialty || null,
          false, // email not verified initially
          verificationToken
        ]
      );

      if (result.affectedRows === 0) {
        return {
          success: false,
          message: 'Failed to create account'
        };
      }

      // Send verification email (in production, this would use a real email service)
      await this.sendVerificationEmail(validatedData.email, verificationToken);

      return {
        success: true,
        message: 'Account created successfully! Please check your email for verification.'
      };

    } catch (error) {
      console.error('Signup error:', error);
      if (error instanceof z.ZodError) {
        return {
          success: false,
          message: error.errors[0].message
        };
      }
      return {
        success: false,
        message: 'Internal server error'
      };
    }
  }

  static async login(data: LoginData): Promise<AuthResponse> {
    try {
      // Validate input
      const validatedData = loginSchema.parse(data);
      
      // Find user
      const users = await database.query<User & { password_hash: string }>(
        'SELECT * FROM users WHERE email = ? AND role = ?', 
        [validatedData.email, validatedData.role]
      );

      if (users.length === 0) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      const user = users[0];

      // Check if email is verified
      if (!user.email_verified) {
        return {
          success: false,
          message: 'Please verify your email before logging in. Check your inbox for the verification link.'
        };
      }

      // Verify password
      const isValidPassword = await Hash.comparePassword(validatedData.password, user.password_hash);
      if (!isValidPassword) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Generate tokens
      const payload: JWTPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
      };

      const accessToken = JWT.generateAccessToken(payload);
      const refreshToken = JWT.generateRefreshToken(payload);

      // Store refresh token in database
      await database.execute(
        'UPDATE users SET refresh_token = ? WHERE id = ?',
        [refreshToken, user.id]
      );

      return {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            license_number: user.license_number,
            specialty: user.specialty,
            email_verified: user.email_verified,
            created_at: user.created_at,
            updated_at: user.updated_at
          },
          accessToken,
          refreshToken
        }
      };

    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof z.ZodError) {
        return {
          success: false,
          message: error.errors[0].message
        };
      }
      return {
        success: false,
        message: 'Internal server error'
      };
    }
  }

  static async verifyEmail(token: string): Promise<AuthResponse> {
    try {
      // Find user by verification token
      const users = await database.query<User>('SELECT * FROM users WHERE verification_token = ?', [token]);
      
      if (users.length === 0) {
        return {
          success: false,
          message: 'Invalid verification token'
        };
      }

      const user = users[0];

      // Update user as verified
      await database.execute(
        'UPDATE users SET email_verified = true, verification_token = NULL WHERE id = ?',
        [user.id]
      );

      return {
        success: true,
        message: 'Email verified successfully! You can now log in.'
      };

    } catch (error) {
      console.error('Email verification error:', error);
      return {
        success: false,
        message: 'Failed to verify email'
      };
    }
  }

  static async resendVerificationEmail(email: string): Promise<AuthResponse> {
    try {
      // Find user
      const users = await database.query<User>('SELECT * FROM users WHERE email = ?', [email]);
      
      if (users.length === 0) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      const user = users[0];

      if (user.email_verified) {
        return {
          success: false,
          message: 'Email is already verified'
        };
      }

      // Generate new verification token
      const verificationToken = this.generateVerificationToken();
      
      // Update user with new token
      await database.execute(
        'UPDATE users SET verification_token = ? WHERE id = ?',
        [verificationToken, user.id]
      );

      // Send new verification email
      await this.sendVerificationEmail(email, verificationToken);

      return {
        success: true,
        message: 'Verification email sent successfully'
      };

    } catch (error) {
      console.error('Resend verification error:', error);
      return {
        success: false,
        message: 'Failed to send verification email'
      };
    }
  }

  static async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      // Verify refresh token
      const payload = JWT.verifyRefreshToken(refreshToken);
      
      // Check if token exists in database
      const users = await database.query<User>('SELECT * FROM users WHERE id = ? AND refresh_token = ?', [payload.userId, refreshToken]);
      
      if (users.length === 0) {
        return {
          success: false,
          message: 'Invalid refresh token'
        };
      }

      // Generate new tokens
      const newAccessToken = JWT.generateAccessToken(payload);
      const newRefreshToken = JWT.generateRefreshToken(payload);

      // Update refresh token in database
      await database.execute(
        'UPDATE users SET refresh_token = ? WHERE id = ?',
        [newRefreshToken, payload.userId]
      );

      return {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          user: {
            id: users[0].id,
            full_name: users[0].full_name,
            email: users[0].email,
            role: users[0].role,
            license_number: users[0].license_number,
            specialty: users[0].specialty,
            email_verified: users[0].email_verified,
            created_at: users[0].created_at,
            updated_at: users[0].updated_at
          },
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        }
      };

    } catch (error) {
      console.error('Token refresh error:', error);
      return {
        success: false,
        message: 'Invalid refresh token'
      };
    }
  }

  static async getUserById(userId: number): Promise<Omit<User, 'password_hash' | 'verification_token'> | null> {
    try {
      const users = await database.query<User>(
        'SELECT id, full_name, email, role, license_number, specialty, email_verified, created_at, updated_at FROM users WHERE id = ?', 
        [userId]
      );
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  private static generateVerificationToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private static async sendVerificationEmail(email: string, token: string): Promise<void> {
    // In production, this would use a real email service like SendGrid, AWS SES, etc.
    // For now, we'll just log the verification link
    const verificationUrl = `http://localhost:4200/verify-email?token=${token}`;
    console.log(`Verification email sent to ${email}`);
    console.log(`Verification URL: ${verificationUrl}`);
    
    // TODO: Implement real email sending
    // Example with SendGrid:
    // const msg = {
    //   to: email,
    //   from: 'noreply@chifaacare.com',
    //   subject: 'Verify your ChifaaCare account',
    //   html: `<p>Click <a href="${verificationUrl}">here</a> to verify your account.</p>`
    // };
    // await sgMail.send(msg);
  }
}
