"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictTo = exports.protect = exports.login = exports.signup = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const prisma = new client_1.PrismaClient();
// Generate JWT Token
const generateToken = (id, role) => {
    const secret = process.env.JWT_SECRET || 'your_jwt_secret';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    // Set JWT expiration to 7 days in seconds
    const options = { expiresIn: 60 * 60 * 24 * 7 }; // 7 days in seconds
    return jsonwebtoken_1.default.sign({ id, role }, secret, options);
};
const signup = async (req, res) => {
    try {
        // Validate request
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password, firstName, lastName, phone, role = 'PATIENT' } = req.body;
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }
        // Hash password
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                phone,
                role: role, // Type assertion since we've validated the role
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
            },
        });
        // Create profile based on role
        if (role === 'DOCTOR') {
            await prisma.doctorProfile.create({
                data: {
                    userId: user.id,
                    specialization: req.body.specialization || '',
                },
            });
        }
        else if (role === 'PATIENT') {
            await prisma.patientProfile.create({
                data: {
                    userId: user.id,
                },
            });
        }
        // Generate token
        const token = generateToken(user.id, user.role);
        res.status(201).json({
            status: 'success',
            token,
            data: {
                user,
            },
        });
    }
    catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            status: 'error',
            message: 'An error occurred during signup',
        });
    }
};
exports.signup = signup;
const login = async (req, res) => {
    console.log('[Auth] Login attempt for:', req.body.email);
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            console.log('[Auth] Missing credentials');
            return res.status(400).json({ message: 'Email and password required' });
        }
        console.log('[Auth] Searching user in database');
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                password: true,
                role: true,
                isActive: true
            }
        });
        if (!user) {
            console.log('[Auth] User not found');
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        console.log('[Auth] Comparing passwords');
        const validPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!validPassword) {
            console.log('[Auth] Password mismatch');
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        if (!user.isActive) {
            console.log('[Auth] Inactive account');
            return res.status(401).json({ message: 'Account deactivated' });
        }
        console.log('[Auth] Generating JWT token');
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
        console.log('[Auth] Login successful for:', user.email);
        res.json({
            status: 'success',
            token,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role
                }
            }
        });
    }
    catch (error) {
        console.error('[Auth] Critical login error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Login failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
exports.login = login;
const protect = async (req, res, next) => {
    try {
        // 1) Getting token and check if it's there
        let token;
        if (req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'You are not logged in! Please log in to get access.',
            });
        }
        // 2) Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        // 3) Check if user still exists
        const currentUser = await prisma.user.findUnique({
            where: { id: decoded.id },
        });
        if (!currentUser) {
            return res.status(401).json({
                status: 'error',
                message: 'The user belonging to this token no longer exists.',
            });
        }
        // 4) Check if user is active
        if (!currentUser.isActive) {
            return res.status(401).json({
                status: 'error',
                message: 'Your account has been deactivated.',
            });
        }
        // GRANT ACCESS TO PROTECTED ROUTE
        req.user = currentUser;
        next();
    }
    catch (error) {
        console.error('Protect middleware error:', error);
        return res.status(401).json({
            status: 'error',
            message: 'Invalid token or token expired',
        });
    }
};
exports.protect = protect;
const restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles ['admin', 'doctor']. role='user'
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: 'You do not have permission to perform this action',
            });
        }
        next();
    };
};
exports.restrictTo = restrictTo;
