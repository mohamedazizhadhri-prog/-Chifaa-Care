"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const payments_controller_1 = require("../controllers/payments.controller");
const router = express_1.default.Router();
// Patient must be authenticated to pay. Admin/Clinic could also create sessions on behalf.
router.use(auth_controller_1.protect);
// Create a Stripe Checkout session for an appointment
router.post('/checkout', (0, auth_controller_1.restrictTo)('PATIENT', 'ADMIN', 'CLINIC', 'DOCTOR'), payments_controller_1.createCheckoutSession);
// Verify a session status (after redirect), optional
router.get('/session/:sessionId', payments_controller_1.verifySession);
exports.default = router;
