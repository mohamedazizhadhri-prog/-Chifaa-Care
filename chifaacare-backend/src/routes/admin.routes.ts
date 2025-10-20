import express from 'express';
import { protect, restrictTo } from '../controllers/auth.controller';
import {
  getOverview,
  listUsers,
  createUser,
  listDoctors,
  approveDoctor,
  listClinics,
  createClinic,
  updateClinic,
  listPatients,
  getLogs,
  getSettings,
  updateSettings,
} from '../controllers/admin.controller';

const router = express.Router();

// All admin routes require auth and ADMIN or SUPER_ADMIN role
router.use(protect, restrictTo('ADMIN', 'SUPER_ADMIN'));

// Overview
router.get('/overview', getOverview);

// Users
router.get('/users', listUsers);
router.post('/create-user', createUser);

// Doctors
router.get('/doctors', listDoctors);
router.post('/approve-doctor/:id', approveDoctor);

// Clinics
router.get('/clinics', listClinics);
router.post('/create-clinic', createClinic);
router.patch('/update-clinic/:id', updateClinic);

// Patients
router.get('/patients', listPatients);

// Logs
router.get('/logs', getLogs);

// Settings
router.get('/settings', getSettings);
router.patch('/settings', updateSettings);

export default router;
