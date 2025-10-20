import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree, CanActivateChild } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

type Role = 'patient' | 'doctor' | 'admin' | 'clinic' | null;

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const requiredRole = route.data['role'] as Role;
    const isLoggedIn = this.authService.isAuthenticated();
    const currentUser = this.authService.getCurrentUser();

    if (!isLoggedIn) {
      return this.router.createUrlTree(['/'], { queryParams: { returnUrl: state.url } });
    }

    if (requiredRole && currentUser?.role !== requiredRole) {
      let redirectTo: any[] = ['/patient', 'dashboard'];
      if (currentUser?.role === 'doctor') redirectTo = ['/doctor', 'dashboard'];
      if (currentUser?.role === 'admin') redirectTo = ['/admin', 'dashboard'];
      if (currentUser?.role === 'clinic') redirectTo = ['/clinic', 'dashboard'];
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
