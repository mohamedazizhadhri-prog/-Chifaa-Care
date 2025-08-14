"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = exports.loginSchema = exports.signupSchema = void 0;
const database_1 = require("../database");
const hash_1 = require("../utils/hash");
const jwt_1 = require("../utils/jwt");
const zod_1 = require("zod");
// Validation schemas
exports.signupSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2, 'Full name must be at least 2 characters'),
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: zod_1.z.string(),
    role: zod_1.z.enum(['PATIENT', 'DOCTOR']),
    licenseNumber: zod_1.z.string().optional(),
    specialty: zod_1.z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
}).refine((data) => {
    if (data.role === 'DOCTOR') {
        return data.licenseNumber && data.specialty;
    }
    return true;
}, {
    message: "License number and specialty are required for doctors",
    path: ["licenseNumber"],
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(1, 'Password is required'),
    role: zod_1.z.enum(['PATIENT', 'DOCTOR']),
});
class AuthService {
    static async signup(data) {
        // Check if user already exists
        const existingUser = await database_1.database.query('SELECT id FROM users WHERE email = ?', [data.email]);
        if (existingUser.length > 0) {
            throw new Error('User with this email already exists');
        }
        // Hash password
        const hashedPassword = await hash_1.Hash.hashPassword(data.password);
        // Insert user
        const result = await database_1.database.execute('INSERT INTO users (full_name, email, password_hash, role, license_number, specialty) VALUES (?, ?, ?, ?, ?, ?)', [data.fullName, data.email, hashedPassword, data.role, data.licenseNumber || null, data.specialty || null]);
        const userId = result.insertId;
        // Generate tokens
        const payload = {
            userId,
            email: data.email,
            role: data.role,
        };
        const accessToken = jwt_1.JWT.generateAccessToken(payload);
        const refreshToken = jwt_1.JWT.generateRefreshToken(payload);
        // Get created user
        const [user] = await database_1.database.query('SELECT id, full_name, email, role, license_number, specialty, created_at FROM users WHERE id = ?', [userId]);
        return {
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role: user.role,
                license_number: user.license_number,
                specialty: user.specialty,
                created_at: user.created_at,
            },
            accessToken,
            refreshToken,
        };
    }
    static async login(data) {
        // Find user
        const users = await database_1.database.query('SELECT * FROM users WHERE email = ? AND role = ?', [data.email, data.role]);
        if (users.length === 0) {
            throw new Error('Invalid credentials');
        }
        const user = users[0];
        // Verify password
        const isValidPassword = await hash_1.Hash.comparePassword(data.password, user.password_hash);
        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }
        // Generate tokens
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };
        const accessToken = jwt_1.JWT.generateAccessToken(payload);
        const refreshToken = jwt_1.JWT.generateRefreshToken(payload);
        return {
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role: user.role,
                license_number: user.license_number,
                specialty: user.specialty,
                created_at: user.created_at,
            },
            accessToken,
            refreshToken,
        };
    }
    static async refreshToken(refreshToken) {
        try {
            const payload = jwt_1.JWT.verifyRefreshToken(refreshToken);
            // Generate new tokens
            const newAccessToken = jwt_1.JWT.generateAccessToken(payload);
            const newRefreshToken = jwt_1.JWT.generateRefreshToken(payload);
            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            };
        }
        catch (error) {
            throw new Error('Invalid refresh token');
        }
    }
    static async getUserById(userId) {
        const users = await database_1.database.query('SELECT id, full_name, email, role, license_number, specialty, created_at FROM users WHERE id = ?', [userId]);
        return users.length > 0 ? users[0] : null;
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map