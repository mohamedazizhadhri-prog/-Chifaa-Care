"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditResource = exports.AuditAction = void 0;
exports.logAudit = logAudit;
exports.extractRequestMetadata = extractRequestMetadata;
exports.auditMiddleware = auditMiddleware;
exports.logPatientAccess = logPatientAccess;
exports.logMedicalRecordAccess = logMedicalRecordAccess;
exports.logAuthEvent = logAuthEvent;
exports.logAccessDenied = logAccessDenied;
exports.getAuditTrail = getAuditTrail;
exports.getUserActivityLog = getUserActivityLog;
exports.getFailedAccessAttempts = getFailedAccessAttempts;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Audit Logger for HIPAA/GDPR Compliance
 * Tracks all access to sensitive patient data
 */
var AuditAction;
(function (AuditAction) {
    AuditAction["CREATE"] = "CREATE";
    AuditAction["READ"] = "READ";
    AuditAction["UPDATE"] = "UPDATE";
    AuditAction["DELETE"] = "DELETE";
    AuditAction["LOGIN"] = "LOGIN";
    AuditAction["LOGOUT"] = "LOGOUT";
    AuditAction["EXPORT"] = "EXPORT";
    AuditAction["SHARE"] = "SHARE";
    AuditAction["PRINT"] = "PRINT";
    AuditAction["ACCESS_DENIED"] = "ACCESS_DENIED";
})(AuditAction || (exports.AuditAction = AuditAction = {}));
var AuditResource;
(function (AuditResource) {
    AuditResource["PATIENT"] = "PATIENT";
    AuditResource["MEDICAL_RECORD"] = "MEDICAL_RECORD";
    AuditResource["APPOINTMENT"] = "APPOINTMENT";
    AuditResource["PRESCRIPTION"] = "PRESCRIPTION";
    AuditResource["LAB_RESULT"] = "LAB_RESULT";
    AuditResource["MESSAGE"] = "MESSAGE";
    AuditResource["USER"] = "USER";
    AuditResource["TREATMENT_PLAN"] = "TREATMENT_PLAN";
    AuditResource["BILLING"] = "BILLING";
})(AuditResource || (exports.AuditResource = AuditResource = {}));
/**
 * Log audit event to database
 */
async function logAudit(entry) {
    try {
        await prisma.auditLog.create({
            data: {
                userId: entry.userId,
                userEmail: entry.userEmail,
                userRole: entry.userRole,
                action: entry.action,
                resource: entry.resource,
                resourceId: entry.resourceId,
                details: entry.details ? JSON.stringify(entry.details) : null,
                ipAddress: entry.ipAddress,
                userAgent: entry.userAgent,
                success: entry.success,
                errorMessage: entry.errorMessage,
                timestamp: new Date()
            }
        });
    }
    catch (error) {
        // Log to console if database logging fails (critical for compliance)
        console.error('[AUDIT LOG FAILURE]', {
            ...entry,
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
/**
 * Extract request metadata for audit logging
 */
function extractRequestMetadata(req) {
    const ipAddress = (req.headers['x-forwarded-for'] ||
        req.headers['x-real-ip'] ||
        req.socket.remoteAddress ||
        'unknown').split(',')[0].trim();
    const userAgent = req.headers['user-agent'] || 'unknown';
    return { ipAddress, userAgent };
}
/**
 * Middleware to automatically log data access
 */
function auditMiddleware(resource, action) {
    return async (req, res, next) => {
        const user = req.user;
        const { ipAddress, userAgent } = extractRequestMetadata(req);
        // Store original json method
        const originalJson = res.json.bind(res);
        // Override json method to log after response
        res.json = function (data) {
            var _a;
            const success = res.statusCode >= 200 && res.statusCode < 300;
            // Log audit event
            logAudit({
                userId: (user === null || user === void 0 ? void 0 : user.id) || 'anonymous',
                userEmail: user === null || user === void 0 ? void 0 : user.email,
                userRole: user === null || user === void 0 ? void 0 : user.role,
                action,
                resource,
                resourceId: req.params.id || ((_a = data === null || data === void 0 ? void 0 : data.data) === null || _a === void 0 ? void 0 : _a.id),
                details: {
                    method: req.method,
                    path: req.path,
                    query: req.query,
                    statusCode: res.statusCode
                },
                ipAddress,
                userAgent,
                success,
                errorMessage: success ? undefined : data === null || data === void 0 ? void 0 : data.message
            }).catch(err => {
                console.error('Failed to log audit event:', err);
            });
            return originalJson(data);
        };
        next();
    };
}
/**
 * Log patient data access (HIPAA requirement)
 */
async function logPatientAccess(userId, patientId, action, req, success = true, errorMessage) {
    const { ipAddress, userAgent } = extractRequestMetadata(req);
    const user = req.user;
    await logAudit({
        userId,
        userEmail: user === null || user === void 0 ? void 0 : user.email,
        userRole: user === null || user === void 0 ? void 0 : user.role,
        action,
        resource: AuditResource.PATIENT,
        resourceId: patientId,
        details: {
            method: req.method,
            path: req.path
        },
        ipAddress,
        userAgent,
        success,
        errorMessage
    });
}
/**
 * Log medical record access (HIPAA requirement)
 */
async function logMedicalRecordAccess(userId, recordId, action, req, details) {
    const { ipAddress, userAgent } = extractRequestMetadata(req);
    const user = req.user;
    await logAudit({
        userId,
        userEmail: user === null || user === void 0 ? void 0 : user.email,
        userRole: user === null || user === void 0 ? void 0 : user.role,
        action,
        resource: AuditResource.MEDICAL_RECORD,
        resourceId: recordId,
        details,
        ipAddress,
        userAgent,
        success: true
    });
}
/**
 * Log authentication events
 */
async function logAuthEvent(userId, email, action, req, success, errorMessage) {
    const { ipAddress, userAgent } = extractRequestMetadata(req);
    await logAudit({
        userId,
        userEmail: email,
        action,
        resource: AuditResource.USER,
        resourceId: userId,
        ipAddress,
        userAgent,
        success,
        errorMessage
    });
}
/**
 * Log access denied events (security monitoring)
 */
async function logAccessDenied(userId, resource, resourceId, req, reason) {
    const { ipAddress, userAgent } = extractRequestMetadata(req);
    const user = req.user;
    await logAudit({
        userId,
        userEmail: user === null || user === void 0 ? void 0 : user.email,
        userRole: user === null || user === void 0 ? void 0 : user.role,
        action: AuditAction.ACCESS_DENIED,
        resource,
        resourceId,
        details: { reason },
        ipAddress,
        userAgent,
        success: false,
        errorMessage: reason
    });
}
/**
 * Get audit trail for a specific resource (for compliance reports)
 */
async function getAuditTrail(resourceId, resource, startDate, endDate) {
    return await prisma.auditLog.findMany({
        where: {
            resourceId,
            ...(resource && { resource }),
            ...(startDate && endDate && {
                timestamp: {
                    gte: startDate,
                    lte: endDate
                }
            })
        },
        orderBy: {
            timestamp: 'desc'
        }
    });
}
/**
 * Get user activity log (for security monitoring)
 */
async function getUserActivityLog(userId, startDate, endDate, limit = 100) {
    return await prisma.auditLog.findMany({
        where: {
            userId,
            ...(startDate && endDate && {
                timestamp: {
                    gte: startDate,
                    lte: endDate
                }
            })
        },
        orderBy: {
            timestamp: 'desc'
        },
        take: limit
    });
}
/**
 * Get failed access attempts (security monitoring)
 */
async function getFailedAccessAttempts(timeWindowMinutes = 60, limit = 100) {
    const since = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
    return await prisma.auditLog.findMany({
        where: {
            success: false,
            timestamp: {
                gte: since
            }
        },
        orderBy: {
            timestamp: 'desc'
        },
        take: limit
    });
}
