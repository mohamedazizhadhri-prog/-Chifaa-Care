import express from 'express';
import { protect, restrictTo } from '../controllers/auth.controller';
import { 
  getAdminStats, getUsers, updateUser, createDoctor, getSpecialties,
  listRoles, createRole, updateRole, deleteRole,
  listPermissions, createPermission, updatePermission, deletePermission,
  getRolePermissions, addPermissionToRole, removePermissionFromRole,
  getUserRoles, addRoleToUser, removeRoleFromUser,
  getClinics, getClinic, createClinic, updateClinic, deleteClinic, updateClinicStatus,
  createPatient, deletePatient, deleteDoctor
} from '../controllers/admin.controller';

const router = express.Router();

// Admin-only routes
router.use(protect, restrictTo('ADMIN'));

router.get('/stats', getAdminStats);
router.get('/users', getUsers);
router.post('/doctors', createDoctor);
router.patch('/users/:id', updateUser);
router.get('/specialties', getSpecialties);

// Roles CRUD
router.get('/roles', listRoles);
router.post('/roles', createRole);
router.patch('/roles/:id', updateRole);
router.delete('/roles/:id', deleteRole);

// Permissions CRUD
router.get('/permissions', listPermissions);
router.post('/permissions', createPermission);
router.patch('/permissions/:id', updatePermission);
router.delete('/permissions/:id', deletePermission);

// Role-Permission assignment
router.get('/roles/:id/permissions', getRolePermissions);
router.post('/roles/:id/permissions', addPermissionToRole);
router.delete('/roles/:id/permissions/:permissionId', removePermissionFromRole);

// User-Role assignment
router.get('/users/:id/roles', getUserRoles);
router.post('/users/:id/roles', addRoleToUser);
router.delete('/users/:id/roles/:roleId', removeRoleFromUser);

// Clinic Management
router.get('/clinics', getClinics);
router.get('/clinics/:id', getClinic);
router.post('/clinics', createClinic);
router.put('/clinics/:id', updateClinic);
router.delete('/clinics/:id', deleteClinic);
router.patch('/clinics/:id/status', updateClinicStatus);

// Patient Management
router.post('/patients', createPatient);
router.delete('/patients/:id', deletePatient);

// Doctor Management
router.delete('/doctors/:id', deleteDoctor);

export default router;
