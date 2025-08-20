import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

type Role = 'patient' | 'doctor' | null;

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const currentUser = this.authService.getCurrentUser();
    const requiredRole = route.data['role'] as Role;
    const isLoggedIn = this.authService.isAuthenticated();
    
    // If user is not logged in, redirect to home page
    if (!isLoggedIn) {
      return this.router.createUrlTree(['/'], { 
        queryParams: { returnUrl: state.url } 
      });
    }

    // If role is required but user doesn't have it, redirect to their dashboard
    if (requiredRole && currentUser?.role !== requiredRole) {
      const redirectTo = currentUser?.role === 'doctor' ? ['/doctor', 'dashboard'] : ['/patient', 'dashboard'];
      return this.router.createUrlTree(redirectTo);
    }

    return true;
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.canActivate(route, state);
  }
}
