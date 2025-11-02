import { Request, Response, NextFunction } from 'express';

// Role-based access control middleware
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!(req as any).user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes((req as any).user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions. Required role: ' + allowedRoles.join(' or ')
      });
    }

    next();
  };
};

// Permission-based access control middleware
export const requirePermission = (...requiredPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!(req as any).user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }
    if (!(req as any).user.permissions || (req as any).user.permissions.length === 0) {
      return res.status(403).json({
        status: 'error',
        message: 'No permissions assigned'
      });
    }

    // Check if user has at least one of the required permissions
    const hasPermission = requiredPermissions.some(permission => 
      (req as any).user!.permissions!.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions. Required: ' + requiredPermissions.join(' or ')
      });
    }

    next();
  };
};

// Check if user has ALL specified permissions
export const requireAllPermissions = (...requiredPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!(req as any).user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }
    if (!(req as any).user.permissions || (req as any).user.permissions.length === 0) {
      return res.status(403).json({
        status: 'error',
        message: 'No permissions assigned'
      });
    }

    // Check if user has ALL required permissions
    const hasAllPermissions = requiredPermissions.every(permission => 
      (req as any).user!.permissions!.includes(permission)
    );

    if (!hasAllPermissions) {
      return res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions. Required all of: ' + requiredPermissions.join(', ')
      });
    }

    next();
  };
};

// Resource ownership check - ensures user can only access their own resources
export const requireOwnership = (userIdParam: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!(req as any).user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }
    const resourceUserId = req.params[userIdParam] || req.body[userIdParam];

    // Admins and project team can access any resource
    if ((req as any).user.role === 'ADMIN' || (req as any).user.role === 'PROJECT_TEAM') {
      return next();
    }

    // Check if the user owns the resource
    if (resourceUserId !== (req as any).user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only access your own resources'
      });
    }

    next();
  };
};

// Combined role and permission check
export const requireRoleOrPermission = (roles: string[], permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!(req as any).user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }
    // Check if user has required role
    const hasRole = roles.includes((req as any).user.role);

    // Check if user has required permission
    const hasPermission = (req as any).user.permissions && 
      permissions.some(permission => (req as any).user!.permissions!.includes(permission));

    if (!hasRole && !hasPermission) {
      return res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Admin only middleware
export const requireAdmin = requireRole('ADMIN');

// Doctor only middleware
export const requireDoctor = requireRole('DOCTOR');

// Patient only middleware
export const requirePatient = requireRole('PATIENT');

// Clinic staff middleware
export const requireClinic = requireRole('CLINIC');

// Project team middleware
export const requireProjectTeam = requireRole('PROJECT_TEAM');

// Doctor or Admin
export const requireDoctorOrAdmin = requireRole('DOCTOR', 'ADMIN');

// Patient or Doctor (for appointments)
export const requirePatientOrDoctor = requireRole('PATIENT', 'DOCTOR');

// Any authenticated user
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required'
    });
  }
  next();
};
