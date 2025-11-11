"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_controller_1 = require("../controllers/auth.controller");
const records_controller_1 = require("../controllers/records.controller");
const router = express_1.default.Router();
// All routes protected
router.use(auth_controller_1.protect);
// List records for a patient
router.get('/', [(0, express_validator_1.query)('patientId').isString().notEmpty()], records_controller_1.listRecords);
// Export CSV/PDF
router.get('/export/csv', [(0, express_validator_1.query)('patientId').isString().notEmpty()], records_controller_1.exportRecordsCsv);
router.get('/export/pdf', [(0, express_validator_1.query)('patientId').isString().notEmpty()], records_controller_1.exportRecordsPdf);
// Create a record (doctor/admin)
router.post('/', (0, auth_controller_1.restrictTo)('DOCTOR', 'ADMIN'), [
    (0, express_validator_1.body)('patientId').isString().notEmpty(),
    (0, express_validator_1.body)('condition').isString().notEmpty(),
    (0, express_validator_1.body)('diagnosisDate').isISO8601(),
    (0, express_validator_1.body)('status').isString().notEmpty(),
    (0, express_validator_1.body)('notes').optional().isString(),
], records_controller_1.createRecord);
// Add attachment to a record
router.post('/:id/attachments', [(0, express_validator_1.param)('id').isString().notEmpty(), (0, express_validator_1.body)('url').isString().notEmpty(), (0, express_validator_1.body)('name').optional().isString()], records_controller_1.addAttachment);
exports.default = router;
