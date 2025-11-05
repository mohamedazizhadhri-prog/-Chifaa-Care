"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const admin_controller_1 = require("../controllers/admin.controller");
const router = express_1.default.Router();
// Admin-only routes
router.use(auth_controller_1.protect, (0, auth_controller_1.restrictTo)('ADMIN'));
router.get('/stats', admin_controller_1.getAdminStats);
router.get('/users', admin_controller_1.getUsers);
router.patch('/users/:id', admin_controller_1.updateUser);
// Roles CRUD
router.get('/roles', admin_controller_1.listRoles);
router.post('/roles', admin_controller_1.createRole);
router.patch('/roles/:id', admin_controller_1.updateRole);
router.delete('/roles/:id', admin_controller_1.deleteRole);
// Permissions CRUD
router.get('/permissions', admin_controller_1.listPermissions);
router.post('/permissions', admin_controller_1.createPermission);
router.patch('/permissions/:id', admin_controller_1.updatePermission);
router.delete('/permissions/:id', admin_controller_1.deletePermission);
// Role-Permission assignment
router.get('/roles/:id/permissions', admin_controller_1.getRolePermissions);
router.post('/roles/:id/permissions', admin_controller_1.addPermissionToRole);
router.delete('/roles/:id/permissions/:permissionId', admin_controller_1.removePermissionFromRole);
// User-Role assignment
router.get('/users/:id/roles', admin_controller_1.getUserRoles);
router.post('/users/:id/roles', admin_controller_1.addRoleToUser);
router.delete('/users/:id/roles/:roleId', admin_controller_1.removeRoleFromUser);
// Clinic Management
router.get('/clinics', admin_controller_1.getClinics);
router.get('/clinics/:id', admin_controller_1.getClinic);
router.post('/clinics', admin_controller_1.createClinic);
router.put('/clinics/:id', admin_controller_1.updateClinic);
router.delete('/clinics/:id', admin_controller_1.deleteClinic);
router.patch('/clinics/:id/status', admin_controller_1.updateClinicStatus);
exports.default = router;
