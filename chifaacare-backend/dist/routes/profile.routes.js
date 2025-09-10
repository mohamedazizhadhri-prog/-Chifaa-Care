"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_controller_1 = require("../controllers/auth.controller");
const profile_controller_1 = require("../controllers/profile.controller");
const router = express_1.default.Router();
// Protect all routes after this middleware
router.use(auth_controller_1.protect);
// Validation for updating profile
const validateUpdateProfile = [
    (0, express_validator_1.body)('firstName').optional().isString().trim().notEmpty(),
    (0, express_validator_1.body)('lastName').optional().isString().trim().notEmpty(),
    (0, express_validator_1.body)('phone').optional().isString().trim(),
    (0, express_validator_1.body)('dateOfBirth').optional().isISO8601().toDate(),
    (0, express_validator_1.body)('gender').optional().isIn(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']),
    (0, express_validator_1.body)('profileImage').optional().isString(),
    (0, express_validator_1.body)('doctorProfile').optional().isObject(),
    (0, express_validator_1.body)('patientProfile').optional().isObject(),
];
// Validation for updating password
const validateUpdatePassword = [
    (0, express_validator_1.body)('currentPassword').isString().notEmpty(),
    (0, express_validator_1.body)('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
];
const asyncHandler = (fn) => async (req, res, next) => {
    try {
        const result = await fn(req, res, next);
        if (result && !res.headersSent) {
            return result;
        }
    }
    catch (error) {
        next(error);
    }
};
// Routes
router
    .route('/me')
    .get(asyncHandler(profile_controller_1.getMyProfile))
    .patch(validateUpdateProfile, asyncHandler(profile_controller_1.updateMyProfile));
router
    .route('/update-password')
    .patch(validateUpdatePassword, asyncHandler(profile_controller_1.updatePassword));
exports.default = router;
