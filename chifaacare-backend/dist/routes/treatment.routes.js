"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_controller_1 = require("../controllers/auth.controller");
const treatment_controller_1 = require("../controllers/treatment.controller");
const router = express_1.default.Router();
// All routes protected
router.use(auth_controller_1.protect);
// Plans
router
    .route('/plan')
    .get([
    (0, express_validator_1.query)('patientId').optional().isString(),
    (0, express_validator_1.query)('status').optional().isString(),
], treatment_controller_1.listPlans)
    .post((0, auth_controller_1.restrictTo)('DOCTOR', 'ADMIN'), [
    (0, express_validator_1.body)('patientId').isString().notEmpty(),
    (0, express_validator_1.body)('title').isString().notEmpty(),
    (0, express_validator_1.body)('diagnosis').optional().isString(),
    (0, express_validator_1.body)('goals').optional().isString(),
    (0, express_validator_1.body)('carePlan').optional().isString(),
    (0, express_validator_1.body)('status').optional().isIn(['ACTIVE', 'ON_HOLD', 'COMPLETED']),
    (0, express_validator_1.body)('startDate').optional().isISO8601(),
    (0, express_validator_1.body)('endDate').optional().isISO8601(),
], treatment_controller_1.createPlan);
router
    .route('/plan/:id')
    .get([(0, express_validator_1.param)('id').isString().notEmpty()], treatment_controller_1.getPlanById)
    .patch((0, auth_controller_1.restrictTo)('DOCTOR', 'ADMIN'), [(0, express_validator_1.param)('id').isString().notEmpty()], treatment_controller_1.updatePlan);
// Notes
router
    .route('/plan/:id/notes')
    .get([(0, express_validator_1.param)('id').isString().notEmpty()], treatment_controller_1.listNotes)
    .post((0, auth_controller_1.restrictTo)('DOCTOR', 'ADMIN'), [
    (0, express_validator_1.param)('id').isString().notEmpty(),
    (0, express_validator_1.body)('content').isString().notEmpty(),
    (0, express_validator_1.body)('isImportant').optional().isBoolean(),
], treatment_controller_1.addNote);
// Medications
router
    .route('/plan/:id/medications')
    .get([(0, express_validator_1.param)('id').isString().notEmpty()], treatment_controller_1.listMedications)
    .post((0, auth_controller_1.restrictTo)('DOCTOR', 'ADMIN'), [
    (0, express_validator_1.param)('id').isString().notEmpty(),
    (0, express_validator_1.body)('name').isString().notEmpty(),
    (0, express_validator_1.body)('dose').optional().isString(),
    (0, express_validator_1.body)('frequency').optional().isString(),
    (0, express_validator_1.body)('route').optional().isString(),
    (0, express_validator_1.body)('instructions').optional().isString(),
    (0, express_validator_1.body)('startDate').optional().isISO8601(),
    (0, express_validator_1.body)('endDate').optional().isISO8601(),
    (0, express_validator_1.body)('isActive').optional().isBoolean(),
], treatment_controller_1.addMedication);
exports.default = router;
