"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_controller_1 = require("../controllers/auth.controller");
const router = express_1.default.Router();
// Input validation for signup
const validateSignup = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long'),
    (0, express_validator_1.body)('firstName').notEmpty().withMessage('First name is required'),
    (0, express_validator_1.body)('lastName').notEmpty().withMessage('Last name is required'),
    (0, express_validator_1.body)('role')
        .optional()
        .isIn(['PATIENT', 'DOCTOR'])
        .withMessage('Invalid role. Must be PATIENT or DOCTOR'),
];
// Input validation for login
const validateLogin = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password').exists().withMessage('Please provide a password'),
];
// Routes
router.post('/signup', validateSignup, auth_controller_1.signup);
router.post('/login', validateLogin, auth_controller_1.login);
// Protected route example
router.get('/me', auth_controller_1.protect, (req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
            user: req.user,
        },
    });
});
exports.default = router;
