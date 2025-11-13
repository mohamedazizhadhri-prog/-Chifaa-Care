"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAvatar = exports.updatePassword = exports.updateMyProfile = exports.getMyProfile = void 0;
const client_1 = require("@prisma/client");
const express_validator_1 = require("express-validator");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const prisma = new client_1.PrismaClient();
// Ensure list-like inputs are stored as JSON strings in the DB
function normalizeJsonList(input) {
    if (input === undefined || input === null)
        return undefined;
    if (Array.isArray(input))
        return JSON.stringify(input);
    if (typeof input === 'string') {
        // If already a JSON string, keep as-is; otherwise, try to parse CSV-like
        try {
            const parsed = JSON.parse(input);
            return JSON.stringify(parsed);
        }
        catch (_a) {
            // treat as comma-separated string
            const arr = input
                .split(',')
                .map((s) => s.trim())
                .filter((s) => s.length > 0);
            return JSON.stringify(arr);
        }
    }
    // Fallback: convert to string
    return JSON.stringify([String(input)]);
}
const getMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        // Base user query
        const userQuery = {
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                dateOfBirth: true,
                gender: true,
                profileImage: true,
                role: true,
                isEmailVerified: true,
                isActive: true,
                lastLogin: true,
                createdAt: true,
                updatedAt: true,
            },
        };
        // Include profile based on role
        if (userRole === 'DOCTOR') {
            // For doctors, we'll handle the profile in a separate query
            const doctorProfile = await prisma.doctorProfile.findUnique({
                where: { userId },
                select: {
                    id: true,
                    specialization: true,
                    bio: true,
                    licenseNumber: true,
                    experience: true,
                    consultationFee: true,
                    availableDays: true,
                    availableHours: true,
                    languages: true,
                    education: true,
                },
            });
            const user = await prisma.user.findUnique({
                ...userQuery
            });
            return res.status(200).json({
                status: 'success',
                data: {
                    ...user,
                    doctorProfile,
                },
            });
        }
        else if (userRole === 'PATIENT') {
            // For patients, we'll handle the profile in a separate query
            const patientProfile = await prisma.patientProfile.findUnique({
                where: { userId },
                select: {
                    id: true,
                    bloodType: true,
                    height: true,
                    weight: true,
                    allergies: true,
                    medications: true,
                    medicalHistory: true,
                    emergencyContacts: true,
                    insuranceInfo: true,
                },
            });
            const user = await prisma.user.findUnique({
                ...userQuery
            });
            return res.status(200).json({
                status: 'success',
                data: {
                    ...user,
                    patientProfile,
                },
            });
        }
        // For users with other roles or no specific role
        const user = await prisma.user.findUnique(userQuery);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found',
            });
        }
        return res.status(200).json({
            status: 'success',
            data: user,
        });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            status: 'error',
            message: 'An error occurred while fetching your profile',
        });
    }
};
exports.getMyProfile = getMyProfile;
const updateMyProfile = async (req, res) => {
    var _a, _b, _c, _d, _e;
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const userId = req.user.id;
        const userRole = req.user.role;
        const updateData = req.body;
        // Update basic user info
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                firstName: updateData.firstName,
                lastName: updateData.lastName,
                phone: updateData.phone,
                dateOfBirth: updateData.dateOfBirth ? new Date(updateData.dateOfBirth) : undefined,
                gender: updateData.gender,
                profileImage: updateData.profileImage,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                dateOfBirth: true,
                gender: true,
                profileImage: true,
                role: true,
            },
        });
        // Update role-specific profile
        if (userRole === 'DOCTOR' && updateData.doctorProfile) {
            await prisma.doctorProfile.upsert({
                where: { userId },
                update: {
                    specialization: updateData.doctorProfile.specialization,
                    bio: updateData.doctorProfile.bio,
                    licenseNumber: updateData.doctorProfile.licenseNumber,
                    experience: updateData.doctorProfile.experience,
                    consultationFee: updateData.doctorProfile.consultationFee,
                    availableDays: normalizeJsonList(updateData.doctorProfile.availableDays),
                    availableHours: normalizeJsonList(updateData.doctorProfile.availableHours),
                    languages: normalizeJsonList(updateData.doctorProfile.languages),
                },
                create: {
                    userId,
                    specialization: updateData.doctorProfile.specialization || '',
                    bio: updateData.doctorProfile.bio,
                    licenseNumber: updateData.doctorProfile.licenseNumber,
                    experience: updateData.doctorProfile.experience,
                    consultationFee: updateData.doctorProfile.consultationFee,
                    availableDays: (_a = normalizeJsonList(updateData.doctorProfile.availableDays)) !== null && _a !== void 0 ? _a : JSON.stringify([]),
                    availableHours: (_b = normalizeJsonList(updateData.doctorProfile.availableHours)) !== null && _b !== void 0 ? _b : JSON.stringify([]),
                    languages: (_c = normalizeJsonList(updateData.doctorProfile.languages)) !== null && _c !== void 0 ? _c : JSON.stringify([]),
                },
            });
        }
        else if (userRole === 'PATIENT' && updateData.patientProfile) {
            await prisma.patientProfile.upsert({
                where: { userId },
                update: {
                    bloodType: updateData.patientProfile.bloodType,
                    height: updateData.patientProfile.height,
                    weight: updateData.patientProfile.weight,
                    allergies: normalizeJsonList(updateData.patientProfile.allergies),
                    medications: normalizeJsonList(updateData.patientProfile.medications),
                },
                create: {
                    userId,
                    bloodType: updateData.patientProfile.bloodType,
                    height: updateData.patientProfile.height,
                    weight: updateData.patientProfile.weight,
                    allergies: (_d = normalizeJsonList(updateData.patientProfile.allergies)) !== null && _d !== void 0 ? _d : JSON.stringify([]),
                    medications: (_e = normalizeJsonList(updateData.patientProfile.medications)) !== null && _e !== void 0 ? _e : JSON.stringify([]),
                },
            });
        }
        // Get the updated user with profile
        const userWithProfile = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                doctorProfile: userRole === 'DOCTOR',
                patientProfile: userRole === 'PATIENT',
            },
        });
        res.status(200).json({
            status: 'success',
            data: {
                user: userWithProfile,
            },
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            status: 'error',
            message: 'An error occurred while updating your profile',
        });
    }
};
exports.updateMyProfile = updateMyProfile;
const updatePassword = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        // Get user with password
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { password: true },
        });
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found',
            });
        }
        // Verify current password
        const isPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                status: 'error',
                message: 'Current password is incorrect',
            });
        }
        // Hash new password
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, salt);
        // Update password
        await prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
            },
        });
        res.status(200).json({
            status: 'success',
            message: 'Password updated successfully',
        });
    }
    catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({
            status: 'error',
            message: 'An error occurred while updating your password',
        });
    }
};
exports.updatePassword = updatePassword;
const uploadAvatar = async (req, res) => {
    var _a;
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ status: 'error', message: 'No file uploaded' });
        }
        // Convert buffer to data URI for Cloudinary
        const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        const uploadResult = await cloudinary_1.default.uploader.upload(dataUri, {
            folder: 'avatars',
            resource_type: 'image',
        });
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (userId) {
            await prisma.user.update({ where: { id: userId }, data: { profileImage: uploadResult.secure_url } });
        }
        return res.status(200).json({ status: 'success', data: { url: uploadResult.secure_url } });
    }
    catch (error) {
        console.error('Upload avatar error:', error);
        return res.status(500).json({ status: 'error', message: 'Failed to upload avatar' });
    }
};
exports.uploadAvatar = uploadAvatar;
