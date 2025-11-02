"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = exports.requirePatientOrDoctor = exports.requireDoctorOrAdmin = exports.requireProjectTeam = exports.requireClinic = exports.requirePatient = exports.requireDoctor = exports.requireAdmin = exports.requireRoleOrPermission = exports.requireOwnership = exports.requireAllPermissions = exports.requirePermission = exports.requireRole = void 0;
// Role-based access control middleware
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'Authentication required'
            });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: 'Insufficient permissions. Required role: ' + allowedRoles.join(' or ')
            });
        }
        next();
    };
};
exports.requireRole = requireRole;
// Permission-based access control middleware
const requirePermission = (...requiredPermissions) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'Authentication required'
            });
        }
        if (!req.user.permissions || req.user.permissions.length === 0) {
            return res.status(403).json({
                status: 'error',
                message: 'No permissions assigned'
            });
        }
        // Check if user has at least one of the required permissions
        const hasPermission = requiredPermissions.some(permission => req.user.permissions.includes(permission));
        if (!hasPermission) {
            return res.status(403).json({
                status: 'error',
                message: 'Insufficient permissions. Required: ' + requiredPermissions.join(' or ')
            });
        }
        next();
    };
};
exports.requirePermission = requirePermission;
// Check if user has ALL specified permissions
const requireAllPermissions = (...requiredPermissions) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'Authentication required'
            });
        }
        if (!req.user.permissions || req.user.permissions.length === 0) {
            return res.status(403).json({
                status: 'error',
                message: 'No permissions assigned'
            });
        }
        // Check if user has ALL required permissions
        const hasAllPermissions = requiredPermissions.every(permission => req.user.permissions.includes(permission));
        if (!hasAllPermissions) {
            return res.status(403).json({
                status: 'error',
                message: 'Insufficient permissions. Required all of: ' + requiredPermissions.join(', ')
            });
        }
        next();
    };
};
exports.requireAllPermissions = requireAllPermissions;
// Resource ownership check - ensures user can only access their own resources
const requireOwnership = (userIdParam = 'userId') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'Authentication required'
            });
        }
        const resourceUserId = req.params[userIdParam] || req.body[userIdParam];
        // Admins and project team can access any resource
        if (req.user.role === 'ADMIN' || req.user.role === 'PROJECT_TEAM') {
            return next();
        }
        // Check if the user owns the resource
        if (resourceUserId !== req.user.id) {
            return res.status(403).json({
                status: 'error',
                message: 'You can only access your own resources'
            });
        }
        next();
    };
};
exports.requireOwnership = requireOwnership;
// Combined role and permission check
const requireRoleOrPermission = (roles, permissions) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'Authentication required'
            });
        }
        // Check if user has required role
        const hasRole = roles.includes(req.user.role);
        // Check if user has required permission
        const hasPermission = req.user.permissions &&
            permissions.some(permission => req.user.permissions.includes(permission));
        if (!hasRole && !hasPermission) {
            return res.status(403).json({
                status: 'error',
                message: 'Insufficient permissions'
            });
        }
        next();
    };
};
exports.requireRoleOrPermission = requireRoleOrPermission;
// Admin only middleware
exports.requireAdmin = (0, exports.requireRole)('ADMIN');
// Doctor only middleware
exports.requireDoctor = (0, exports.requireRole)('DOCTOR');
// Patient only middleware
exports.requirePatient = (0, exports.requireRole)('PATIENT');
// Clinic staff middleware
exports.requireClinic = (0, exports.requireRole)('CLINIC');
// Project team middleware
exports.requireProjectTeam = (0, exports.requireRole)('PROJECT_TEAM');
// Doctor or Admin
exports.requireDoctorOrAdmin = (0, exports.requireRole)('DOCTOR', 'ADMIN');
// Patient or Doctor (for appointments)
exports.requirePatientOrDoctor = (0, exports.requireRole)('PATIENT', 'DOCTOR');
// Any authenticated user
const requireAuth = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            status: 'error',
            message: 'Authentication required'
        });
    }
    next();
};
exports.requireAuth = requireAuth;
