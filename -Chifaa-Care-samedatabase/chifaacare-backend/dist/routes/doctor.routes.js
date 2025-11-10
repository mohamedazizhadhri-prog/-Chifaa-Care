"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const doctor_controller_1 = require("../controllers/doctor.controller");
const router = express_1.default.Router();
// This route could be protected if only logged-in users can see doctors
// For a public search, protect can be removed.
router.route('/').get(doctor_controller_1.getAllDoctors);
exports.default = router;
