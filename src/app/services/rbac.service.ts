import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
}

export interface UserPermissions {
  roles: Role[];
  permissions: string[];
}

@Injectable({
  providedIn: 'root'
})
export class RbacService {
  private userPermissionsSubject = new BehaviorSubject<UserPermissions | null>(null);
  public userPermissions$ = this.userPermissionsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Load user permissions from backend
   */
  loadUserPermissions(): Observable<UserPermissions> {
    return this.http.get<UserPermissions>(`${environment.apiUrl}/auth/permissions`).pipe(
      tap(permissions => this.userPermissionsSubject.next(permissions))
    );
  }

  /**
   * Check if user has a specific role
   */
  hasRole(roleName: string): boolean {
    const permissions = this.userPermissionsSubject.value;
    if (!permissions) return false;
    
    return permissions.roles.some(role => 
      role.name.toUpperCase() === roleName.toUpperCase()
    );
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roleNames: string[]): boolean {
    return roleNames.some(role => this.hasRole(role));
  }

  /**
   * Check if user has all specified roles
   */
  hasAllRoles(roleNames: string[]): boolean {
    return roleNames.every(role => this.hasRole(role));
  }

  /**
   * Check if user has a specific permission
   */
  hasPermission(permissionName: string): boolean {
    const permissions = this.userPermissionsSubject.value;
    if (!permissions) return false;
    
    return permissions.permissions.includes(permissionName);
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(permissionNames: string[]): boolean {
    return permissionNames.some(permission => this.hasPermission(permission));
  }

  /**
   * Check if user has all specified permissions
   */
  hasAllPermissions(permissionNames: string[]): boolean {
    return permissionNames.every(permission => this.hasPermission(permission));
  }

  /**
   * Check if user can perform an action on a resource
   */
  canPerformAction(resource: string, action: string): boolean {
    const permissionName = `${resource}:${action}`;
    return this.hasPermission(permissionName);
  }

  /**
   * Get all user roles
   */
  getUserRoles(): Role[] {
    return this.userPermissionsSubject.value?.roles || [];
  }

  /**
   * Get all user permissions
   */
  getUserPermissions(): string[] {
    return this.userPermissionsSubject.value?.permissions || [];
  }

  /**
   * Clear permissions (on logout)
   */
  clearPermissions(): void {
    this.userPermissionsSubject.next(null);
  }
}
