import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

/**
 * RBAC Guard - Role-Based Access Control
 * Checks if user has required role or permission to access a route
 */
export const rbacGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (!isAuthenticated) {
        // Redirect to login/home with return URL
        return router.createUrlTree(['/'], {
          queryParams: { returnUrl: state.url }
        });
      }

      const currentUser = authService.getCurrentUser();
      const requiredRoles = route.data['roles'] as string[] | undefined;
      const requiredPermissions = route.data['permissions'] as string[] | undefined;

      // If no specific role or permission required, just check authentication
      if (!requiredRoles && !requiredPermissions) {
        return true;
      }

      // Check roles
      if (requiredRoles && requiredRoles.length > 0) {
        const hasRole = currentUser?.role && requiredRoles.includes(currentUser.role.toUpperCase());
        if (hasRole) {
          return true;
        }
      }

      // Check permissions
      if (requiredPermissions && requiredPermissions.length > 0 && currentUser?.permissions) {
        const hasPermission = requiredPermissions.some(permission =>
          currentUser.permissions?.includes(permission)
        );
        if (hasPermission) {
          return true;
        }
      }

      // User doesn't have required access - redirect to appropriate dashboard
      const redirectPath = getDashboardPath(currentUser?.role);
      return router.createUrlTree([redirectPath]);
    })
  );
};

/**
 * Admin Guard - Requires ADMIN role
 */
export const adminGuard: CanActivateFn = (route, state) => {
  route.data = { ...route.data, roles: ['ADMIN'] };
  return rbacGuard(route, state);
};

/**
 * Doctor Guard - Requires DOCTOR role
 */
export const doctorGuard: CanActivateFn = (route, state) => {
  route.data = { ...route.data, roles: ['DOCTOR'] };
  return rbacGuard(route, state);
};

/**
 * Patient Guard - Requires PATIENT role
 */
export const patientGuard: CanActivateFn = (route, state) => {
  route.data = { ...route.data, roles: ['PATIENT'] };
  return rbacGuard(route, state);
};

/**
 * Clinic Guard - Requires CLINIC role
 */
export const clinicGuard: CanActivateFn = (route, state) => {
  route.data = { ...route.data, roles: ['CLINIC'] };
  return rbacGuard(route, state);
};

/**
 * Project Team Guard - Requires PROJECT_TEAM role
 */
export const projectTeamGuard: CanActivateFn = (route, state) => {
  route.data = { ...route.data, roles: ['PROJECT_TEAM'] };
  return rbacGuard(route, state);
};

/**
 * Helper function to get dashboard path based on role
 */
function getDashboardPath(role?: string): string {
  switch (role?.toUpperCase()) {
    case 'DOCTOR':
      return '/doctor/dashboard';
    case 'PATIENT':
      return '/patient/dashboard';
    case 'CLINIC':
      return '/clinic/dashboard';
    case 'PROJECT_TEAM':
      return '/project-team/dashboard';
    case 'ADMIN':
      return '/admin/dashboard';
    default:
      return '/';
  }
}
