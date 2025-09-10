"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const patient_controller_1 = require("../controllers/patient.controller");
const auth_controller_1 = require("../controllers/auth.controller");
const router = express_1.default.Router();
// Protect and restrict to doctors or admins
router.use(auth_controller_1.protect);
router.get('/', (0, auth_controller_1.restrictTo)('DOCTOR', 'ADMIN'), patient_controller_1.getAllPatients);
exports.default = router;
