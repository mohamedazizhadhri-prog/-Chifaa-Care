"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const router = (0, express_1.Router)();
/**
 * Example protected routes demonstrating RBAC implementation
 */
// Public route - no authentication required
router.get('/public', (req, res) => {
    res.json({
        status: 'success',
        message: 'This is a public endpoint'
    });
});
// Protected route - requires authentication
router.get('/protected', auth_middleware_1.validateJWT, (req, res) => {
    res.json({
        status: 'success',
        message: 'You are authenticated',
        user: req.user
    });
});
// Admin only route
router.get('/admin-only', auth_middleware_1.validateJWT, rbac_middleware_1.requireAdmin, (req, res) => {
    res.json({
        status: 'success',
        message: 'Admin access granted',
        user: req.user
    });
});
// Doctor only route
router.get('/doctor-only', auth_middleware_1.validateJWT, rbac_middleware_1.requireDoctor, (req, res) => {
    res.json({
        status: 'success',
        message: 'Doctor access granted',
        user: req.user
    });
});
// Patient only route
router.get('/patient-only', auth_middleware_1.validateJWT, rbac_middleware_1.requirePatient, (req, res) => {
    res.json({
        status: 'success',
        message: 'Patient access granted',
        user: req.user
    });
});
// Multiple roles allowed
router.get('/doctor-or-admin', auth_middleware_1.validateJWT, rbac_middleware_1.requireDoctorOrAdmin, (req, res) => {
    res.json({
        status: 'success',
        message: 'Doctor or Admin access granted',
        user: req.user
    });
});
// Permission-based access
router.get('/read-appointments', auth_middleware_1.validateJWT, (0, rbac_middleware_1.requirePermission)('appointments:read'), (req, res) => {
    res.json({
        status: 'success',
        message: 'You have permission to read appointments',
        user: req.user
    });
});
// Multiple permissions (user needs at least one)
router.post('/manage-records', auth_middleware_1.validateJWT, (0, rbac_middleware_1.requirePermission)('medical_records:write', 'medical_records:manage'), (req, res) => {
    res.json({
        status: 'success',
        message: 'You can manage medical records',
        user: req.user
    });
});
// Resource ownership check
router.get('/users/:userId/profile', auth_middleware_1.validateJWT, (0, rbac_middleware_1.requireOwnership)('userId'), (req, res) => {
    res.json({
        status: 'success',
        message: 'Access to user profile granted',
        userId: req.params.userId,
        user: req.user
    });
});
// Complex authorization - role OR permission
router.get('/analytics', auth_middleware_1.validateJWT, (req, res, next) => {
    var _a, _b, _c, _d;
    // Custom logic: Admin, Project Team, or users with analytics:read permission
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === 'ADMIN' ||
        ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) === 'PROJECT_TEAM' ||
        ((_d = (_c = req.user) === null || _c === void 0 ? void 0 : _c.permissions) === null || _d === void 0 ? void 0 : _d.includes('analytics:read'))) {
        return next();
    }
    return res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions to view analytics'
    });
}, (req, res) => {
    res.json({
        status: 'success',
        message: 'Analytics data',
        user: req.user
    });
});
exports.default = router;
