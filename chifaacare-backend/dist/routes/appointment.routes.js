"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_controller_1 = require("../controllers/auth.controller");
const appointment_controller_1 = require("../controllers/appointment.controller");
const router = express_1.default.Router();
// Protect all routes after this middleware
router.use(auth_controller_1.protect);
// Validation for creating an appointment
const validateCreateAppointment = [
    (0, express_validator_1.body)('doctorId').isString().notEmpty().withMessage('Doctor ID is required'),
    (0, express_validator_1.body)('appointmentDate').isISO8601().toDate().withMessage('Valid appointment date is required'),
    (0, express_validator_1.body)('endTime').isISO8601().toDate().withMessage('Valid end time is required'),
    (0, express_validator_1.body)('reason').isString().notEmpty().withMessage('Reason for appointment is required'),
    (0, express_validator_1.body)('notes').optional().isString(),
];
// Validation for updating appointment status
const validateUpdateStatus = [
    (0, express_validator_1.param)('id').isString().withMessage('Valid appointment ID is required'),
    (0, express_validator_1.body)('status').isIn(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED', 'NO_SHOW'])
        .withMessage('Invalid status value'),
];
// Routes
router
    .route('/')
    .get(appointment_controller_1.getAppointments)
    .post(validateCreateAppointment, appointment_controller_1.createAppointment);
router
    .route('/:id/status')
    .patch(validateUpdateStatus, appointment_controller_1.updateAppointmentStatus);
router
    .route('/:id')
    .delete(appointment_controller_1.deleteAppointment);
exports.default = router;
