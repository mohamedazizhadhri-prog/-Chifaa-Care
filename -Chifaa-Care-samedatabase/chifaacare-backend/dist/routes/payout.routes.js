"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payout_controller_1 = require("../controllers/payout.controller");
const auth_controller_1 = require("../controllers/auth.controller");
const router = express_1.default.Router();
router.use(auth_controller_1.protect);
router.use((0, auth_controller_1.restrictTo)('ADMIN'));
router.get('/doctors', payout_controller_1.listClinicDoctors);
router.post('/onboard', payout_controller_1.createDoctorOnboarding);
router.post('/payout', payout_controller_1.createPayout);
exports.default = router;
