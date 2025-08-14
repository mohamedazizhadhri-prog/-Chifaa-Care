"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
class AuthController {
    static async signup(req, res) {
        try {
            // Validate input
            const validatedData = auth_service_1.signupSchema.parse(req.body);
            // Create user
            const result = await auth_service_1.AuthService.signup(validatedData);
            // Set refresh token as httpOnly cookie
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });
            // Return success response
            res.status(201).json({
                success: true,
                message: 'User created successfully',
                data: {
                    user: result.user,
                    accessToken: result.accessToken,
                },
            });
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('already exists')) {
                    return res.status(409).json({
                        success: false,
                        message: error.message,
                    });
                }
            }
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Signup failed',
            });
        }
    }
    static async login(req, res) {
        try {
            // Validate input
            const validatedData = auth_service_1.loginSchema.parse(req.body);
            // Authenticate user
            const result = await auth_service_1.AuthService.login(validatedData);
            // Set refresh token as httpOnly cookie
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });
            // Return success response
            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    user: result.user,
                    accessToken: result.accessToken,
                },
            });
        }
        catch (error) {
            res.status(401).json({
                success: false,
                message: error instanceof Error ? error.message : 'Login failed',
            });
        }
    }
    static async refreshToken(req, res) {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return res.status(401).json({
                    success: false,
                    message: 'Refresh token is required',
                });
            }
            // Generate new tokens
            const result = await auth_service_1.AuthService.refreshToken(refreshToken);
            // Set new refresh token as httpOnly cookie
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });
            // Return new access token
            res.status(200).json({
                success: true,
                message: 'Token refreshed successfully',
                data: {
                    accessToken: result.accessToken,
                },
            });
        }
        catch (error) {
            res.status(401).json({
                success: false,
                message: 'Invalid refresh token',
            });
        }
    }
    static async logout(req, res) {
        // Clear refresh token cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
        res.status(200).json({
            success: true,
            message: 'Logout successful',
        });
    }
    static async getProfile(req, res) {
        try {
            // This will be called after authGuard middleware
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
            }
            const user = await auth_service_1.AuthService.getUserById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
            }
            res.status(200).json({
                success: true,
                data: { user },
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to get user profile',
            });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map