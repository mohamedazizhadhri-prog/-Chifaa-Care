"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const admin_controller_1 = require("../controllers/admin.controller");
const router = express_1.default.Router();
// All admin routes require auth and ADMIN or SUPER_ADMIN role
router.use(auth_controller_1.protect, (0, auth_controller_1.restrictTo)('ADMIN', 'SUPER_ADMIN'));
// Overview
router.get('/overview', admin_controller_1.getOverview);
// Users
router.get('/users', admin_controller_1.listUsers);
router.post('/create-user', admin_controller_1.createUser);
// Doctors
router.get('/doctors', admin_controller_1.listDoctors);
router.post('/approve-doctor/:id', admin_controller_1.approveDoctor);
// Clinics
router.get('/clinics', admin_controller_1.listClinics);
router.post('/create-clinic', admin_controller_1.createClinic);
router.patch('/update-clinic/:id', admin_controller_1.updateClinic);
// Patients
router.get('/patients', admin_controller_1.listPatients);
// Logs
router.get('/logs', admin_controller_1.getLogs);
// Settings
router.get('/settings', admin_controller_1.getSettings);
router.patch('/settings', admin_controller_1.updateSettings);
exports.default = router;
