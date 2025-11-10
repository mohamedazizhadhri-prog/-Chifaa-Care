import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Clinic } from '../portals/admin/admin.models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly API = environment.apiUrl || 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) {}

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.API}/admin/stats`);
    
  }

  getUsers(opts?: { query?: string; role?: string; active?: boolean; page?: number; pageSize?: number }): Observable<any> {
    let params = new HttpParams();
    if (opts?.query) params = params.set('query', opts.query);
    if (opts?.role) params = params.set('role', opts.role);
    if (typeof opts?.active === 'boolean') params = params.set('active', String(opts.active));
    if (opts?.page) params = params.set('page', String(opts.page));
    if (opts?.pageSize) params = params.set('pageSize', String(opts.pageSize));
    return this.http.get<any>(`${this.API}/admin/users`, { params });
  }

  updateUser(id: string, data: { isActive?: boolean; role?: string }): Observable<any> {
    return this.http.patch<any>(`${this.API}/admin/users/${id}`, data);
  }

  // Roles
  getRoles(): Observable<any> { return this.http.get<any>(`${this.API}/admin/roles`); }
  createRole(data: { name: string; description?: string }): Observable<any> { return this.http.post<any>(`${this.API}/admin/roles`, data); }
  updateRole(id: string, data: { name?: string; description?: string }): Observable<any> { return this.http.patch<any>(`${this.API}/admin/roles/${id}`, data); }
  deleteRole(id: string): Observable<any> { return this.http.delete<any>(`${this.API}/admin/roles/${id}`); }

  // Permissions
  getPermissions(): Observable<any> { return this.http.get<any>(`${this.API}/admin/permissions`); }
  createPermission(data: { name: string; resource: string; action: string; description?: string }): Observable<any> { return this.http.post<any>(`${this.API}/admin/permissions`, data); }
  updatePermission(id: string, data: { name?: string; resource?: string; action?: string; description?: string }): Observable<any> { return this.http.patch<any>(`${this.API}/admin/permissions/${id}`, data); }
  deletePermission(id: string): Observable<any> { return this.http.delete<any>(`${this.API}/admin/permissions/${id}`); }

  // Role-Permission assignments
  getRolePermissions(roleId: string): Observable<any> { return this.http.get<any>(`${this.API}/admin/roles/${roleId}/permissions`); }
  addPermissionToRole(roleId: string, permissionId: string): Observable<any> { return this.http.post<any>(`${this.API}/admin/roles/${roleId}/permissions`, { permissionId }); }
  removePermissionFromRole(roleId: string, permissionId: string): Observable<any> { return this.http.delete<any>(`${this.API}/admin/roles/${roleId}/permissions/${permissionId}`); }

  // User-Role assignments
  getUserRoles(userId: string): Observable<any> { return this.http.get<any>(`${this.API}/admin/users/${userId}/roles`); }
  addRoleToUser(userId: string, roleId: string): Observable<any> { return this.http.post<any>(`${this.API}/admin/users/${userId}/roles`, { roleId }); }
  removeRoleFromUser(userId: string, roleId: string): Observable<any> { return this.http.delete<any>(`${this.API}/admin/users/${userId}/roles/${roleId}`); }

  // Clinic Management
  getClinics(): Observable<Clinic[]> {
    return this.http.get<any>(`${this.API}/admin/clinics`).pipe(
      map(response => response.data || [])
    );
  }

  getClinic(id: string): Observable<Clinic> {
    return this.http.get<Clinic>(`${this.API}/admin/clinics/${id}`);
  }

  createClinic(clinic: Partial<Clinic>): Observable<Clinic> {
    return this.http.post<any>(`${this.API}/admin/clinics`, clinic).pipe(
      map(response => response.data)
    );
  }

  updateClinic(clinic: Clinic): Observable<Clinic> {
    return this.http.put<any>(`${this.API}/admin/clinics/${clinic.id}`, clinic).pipe(
      map(response => response.data)
    );
  }

  deleteClinic(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/admin/clinics/${id}`);
  }

  updateClinicStatus(id: string, status: string): Observable<Clinic> {
    return this.http.patch<any>(`${this.API}/admin/clinics/${id}/status`, { status }).pipe(
      map(response => response.data)
    );
  }
}
