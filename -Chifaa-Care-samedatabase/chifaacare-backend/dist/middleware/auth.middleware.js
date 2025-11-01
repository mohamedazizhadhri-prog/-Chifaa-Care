"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.attachUserFromAuth0 = exports.validateJWT = exports.checkJwt = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_oauth2_jwt_bearer_1 = require("express-oauth2-jwt-bearer");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Avoid augmenting Express global types here to prevent conflicts with other declaration files.
// We'll use local casts (req as any) when attaching/reading auth info below.
// Auth0 JWT validation middleware
exports.checkJwt = (0, express_oauth2_jwt_bearer_1.auth)({
    audience: process.env.AUTH0_AUDIENCE || 'https://api.chifaacare.com',
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
    tokenSigningAlg: 'RS256'
});
// Custom JWT validation for local JWT tokens (fallback)
const validateJWT = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                status: 'error',
                message: 'No token provided'
            });
        }
        const token = authHeader.substring(7);
        // Try to verify as local JWT first
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
            // Fetch user from database
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                include: {
                    userRoles: {
                        include: {
                            role: {
                                include: {
                                    rolePermissions: {
                                        include: {
                                            permission: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            if (!user || !user.isActive) {
                return res.status(401).json({
                    status: 'error',
                    message: 'User not found or inactive'
                });
            }
            // Extract permissions
            const permissions = user.userRoles.flatMap((ur) => ur.role.rolePermissions.map((rp) => rp.permission.name));
            req.user = {
                id: user.id,
                email: user.email,
                role: user.role,
                auth0Id: user.auth0Id || undefined,
                permissions
            };
            next();
        }
        catch (jwtError) {
            // If local JWT fails, it might be an Auth0 token
            // Let it pass to Auth0 middleware if configured
            return res.status(401).json({
                status: 'error',
                message: 'Invalid token'
            });
        }
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Authentication error'
        });
    }
};
exports.validateJWT = validateJWT;
// Middleware to attach user info from Auth0 token
const attachUserFromAuth0 = async (req, res, next) => {
    var _a;
    try {
        if (!((_a = req.auth) === null || _a === void 0 ? void 0 : _a.payload)) {
            return next();
        }
        const auth0Id = req.auth.payload.sub;
        const email = req.auth.payload.email;
        // Find or create user based on Auth0 ID
        let user = await prisma.user.findUnique({
            where: { auth0Id },
            include: {
                userRoles: {
                    include: {
                        role: {
                            include: {
                                rolePermissions: {
                                    include: {
                                        permission: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        // If user doesn't exist, create them
        if (!user && email) {
            user = await prisma.user.create({
                data: {
                    email,
                    auth0Id,
                    firstName: req.auth.payload.given_name || 'User',
                    lastName: req.auth.payload.family_name || '',
                    password: '', // No password for OAuth users
                    role: 'PATIENT', // Default role
                    isEmailVerified: req.auth.payload.email_verified || false
                },
                include: {
                    userRoles: {
                        include: {
                            role: {
                                include: {
                                    rolePermissions: {
                                        include: {
                                            permission: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
        }
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'User not found'
            });
        }
        // Extract permissions
        const permissions = user.userRoles.flatMap((ur) => ur.role.rolePermissions.map((rp) => rp.permission.name));
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            auth0Id: user.auth0Id || undefined,
            permissions
        };
        next();
    }
    catch (error) {
        console.error('Error attaching user from Auth0:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Authentication error'
        });
    }
};
exports.attachUserFromAuth0 = attachUserFromAuth0;
// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }
        const token = authHeader.substring(7);
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                include: {
                    userRoles: {
                        include: {
                            role: {
                                include: {
                                    rolePermissions: {
                                        include: {
                                            permission: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            if (user && user.isActive) {
                const permissions = user.userRoles.flatMap((ur) => ur.role.rolePermissions.map((rp) => rp.permission.name));
                req.user = {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    auth0Id: user.auth0Id || undefined,
                    permissions
                };
            }
        }
        catch (error) {
            // Silently fail for optional auth
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
