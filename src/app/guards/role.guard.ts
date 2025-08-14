import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    // Check if route requires specific role
    const requiredRole = route.data['role'] as 'PATIENT' | 'DOCTOR';
    
    if (requiredRole && !this.authService.hasRole(requiredRole)) {
      // Redirect to appropriate dashboard based on user's role
      if (this.authService.isPatient()) {
        this.router.navigate(['/patient-dashboard']);
      } else if (this.authService.isDoctor()) {
        this.router.navigate(['/doctor-dashboard']);
      } else {
        this.router.navigate(['/login']);
      }
      return false;
    }

    return true;
  }
}
