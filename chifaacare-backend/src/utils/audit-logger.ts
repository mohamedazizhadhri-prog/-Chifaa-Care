import { PrismaClient } from '@prisma/client';
import { Request } from 'express';

const prisma = new PrismaClient();

/**
 * Audit Logger for HIPAA/GDPR Compliance
 * Tracks all access to sensitive patient data
 */

export enum AuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  EXPORT = 'EXPORT',
  SHARE = 'SHARE',
  PRINT = 'PRINT',
  ACCESS_DENIED = 'ACCESS_DENIED'
}

export enum AuditResource {
  PATIENT = 'PATIENT',
  MEDICAL_RECORD = 'MEDICAL_RECORD',
  APPOINTMENT = 'APPOINTMENT',
  PRESCRIPTION = 'PRESCRIPTION',
  LAB_RESULT = 'LAB_RESULT',
  MESSAGE = 'MESSAGE',
  USER = 'USER',
  TREATMENT_PLAN = 'TREATMENT_PLAN',
  BILLING = 'BILLING'
}

interface AuditLogEntry {
  userId: string;
  userEmail?: string;
  userRole?: string;
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
  timestamp: Date;
}

/**
 * Log audit event to database
 */
export async function logAudit(entry: Omit<AuditLogEntry, 'timestamp'>): Promise<void> {
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
  } catch (error) {
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
export function extractRequestMetadata(req: Request): {
  ipAddress: string;
  userAgent: string;
} {
  const ipAddress = (
    req.headers['x-forwarded-for'] as string ||
    req.headers['x-real-ip'] as string ||
    req.socket.remoteAddress ||
    'unknown'
  ).split(',')[0].trim();

  const userAgent = req.headers['user-agent'] || 'unknown';

  return { ipAddress, userAgent };
}

/**
 * Middleware to automatically log data access
 */
export function auditMiddleware(resource: AuditResource, action: AuditAction) {
  return async (req: any, res: any, next: any) => {
    const user = req.user;
    const { ipAddress, userAgent } = extractRequestMetadata(req);
    
    // Store original json method
    const originalJson = res.json.bind(res);
    
    // Override json method to log after response
    res.json = function (data: any) {
      const success = res.statusCode >= 200 && res.statusCode < 300;
      
      // Log audit event
      logAudit({
        userId: user?.id || 'anonymous',
        userEmail: user?.email,
        userRole: user?.role,
        action,
        resource,
        resourceId: req.params.id || data?.data?.id,
        details: {
          method: req.method,
          path: req.path,
          query: req.query,
          statusCode: res.statusCode
        },
        ipAddress,
        userAgent,
        success,
        errorMessage: success ? undefined : data?.message
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
export async function logPatientAccess(
  userId: string,
  patientId: string,
  action: AuditAction,
  req: Request,
  success: boolean = true,
  errorMessage?: string
): Promise<void> {
  const { ipAddress, userAgent } = extractRequestMetadata(req);
  const user = (req as any).user;
  
  await logAudit({
    userId,
    userEmail: user?.email,
    userRole: user?.role,
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
export async function logMedicalRecordAccess(
  userId: string,
  recordId: string,
  action: AuditAction,
  req: Request,
  details?: Record<string, any>
): Promise<void> {
  const { ipAddress, userAgent } = extractRequestMetadata(req);
  const user = (req as any).user;
  
  await logAudit({
    userId,
    userEmail: user?.email,
    userRole: user?.role,
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
export async function logAuthEvent(
  userId: string,
  email: string,
  action: AuditAction.LOGIN | AuditAction.LOGOUT,
  req: Request,
  success: boolean,
  errorMessage?: string
): Promise<void> {
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
export async function logAccessDenied(
  userId: string,
  resource: AuditResource,
  resourceId: string,
  req: Request,
  reason: string
): Promise<void> {
  const { ipAddress, userAgent } = extractRequestMetadata(req);
  const user = (req as any).user;
  
  await logAudit({
    userId,
    userEmail: user?.email,
    userRole: user?.role,
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
export async function getAuditTrail(
  resourceId: string,
  resource?: AuditResource,
  startDate?: Date,
  endDate?: Date
) {
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
export async function getUserActivityLog(
  userId: string,
  startDate?: Date,
  endDate?: Date,
  limit: number = 100
) {
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
export async function getFailedAccessAttempts(
  timeWindowMinutes: number = 60,
  limit: number = 100
) {
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
