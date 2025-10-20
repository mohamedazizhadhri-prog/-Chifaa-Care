import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface BaseUser {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin' | 'clinic';
  permissions?: string[];
}

export interface Patient extends BaseUser {
  role: 'patient';
  dob?: string;
  bloodType?: string;
  conditions?: string[];
}

export interface Doctor extends BaseUser {
  role: 'doctor';
  specialty?: string;
  hospital?: string;
  experience?: number;
  rating?: string;
}

export interface Admin extends BaseUser { role: 'admin'; }
export interface ClinicUser extends BaseUser { role: 'clinic'; }
export type User = Patient | Doctor | Admin | ClinicUser;

export interface AuthResponse {
  status: string;
  token: string;
  data: { user: any };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = environment.apiUrl || 'http://localhost:3000/api/v1';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';

  constructor(private http: HttpClient) {
    const userJson = localStorage.getItem(this.USER_KEY);
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (userJson && token) {
      this.currentUserSubject.next(JSON.parse(userJson));
      this.isAuthenticatedSubject.next(true);
    }
  }

  login(email: string, password: string): Observable<{ user: User; token: string }> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, { email, password }).pipe(
      map((res) => {
        if (res.status !== 'success' || !res.token || !res.data?.user) {
          throw new Error('Invalid login response');
        }
        const userData = res.data.user;
        const base: BaseUser = {
          id: userData.id,
          name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'User',
          email: userData.email,
          role: (userData.role || 'PATIENT').toString().toLowerCase() as any,
        };
        let user: User;
        const role = (userData.role || '').toString().toUpperCase();
        if (role === 'DOCTOR') {
          user = { ...base, role: 'doctor', specialty: 'General Medicine', experience: 5 } as Doctor;
        } else if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
          user = { ...base, role: 'admin' } as Admin;
        } else if (role === 'CLINIC') {
          user = { ...base, role: 'clinic' } as ClinicUser;
        } else {
          user = { ...base, role: 'patient' } as Patient;
        }
        return { user, token: res.token };
      }),
      tap((r) => this.setSession(r)),
      catchError((err) => throwError(() => new Error(err?.error?.message || 'Login failed')))
    );
  }

  signup(payload: any): Observable<{ user: User; token: string }> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/signup`, payload).pipe(
      map((res) => {
        if (res.status !== 'success' || !res.token || !res.data?.user) {
          throw new Error('Invalid signup response');
        }
        const userData = res.data.user;
        const base: BaseUser = {
          id: userData.id,
          name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'User',
          email: userData.email,
          role: (userData.role || 'PATIENT').toString().toLowerCase() as any,
        };
        let user: User;
        const role = (userData.role || '').toString().toUpperCase();
        if (role === 'DOCTOR') {
          user = { ...base, role: 'doctor', specialty: 'General Medicine', experience: 0 } as Doctor;
        } else if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
          user = { ...base, role: 'admin' } as Admin;
        } else if (role === 'CLINIC') {
          user = { ...base, role: 'clinic' } as ClinicUser;
        } else {
          user = { ...base, role: 'patient' } as Patient;
        }
        return { user, token: res.token };
      }),
      tap((r) => this.setSession(r)),
      catchError((err) => throwError(() => new Error(err?.error?.message || 'Signup failed')))
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    sessionStorage.clear();
  }

  isAuthenticated(): boolean { return !!localStorage.getItem(this.TOKEN_KEY); }
  getCurrentUser(): User | null { return this.currentUserSubject.value; }
  getToken(): string | null { return localStorage.getItem(this.TOKEN_KEY); }

  private setSession(auth: { user: User; token: string }){
    localStorage.setItem(this.TOKEN_KEY, auth.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(auth.user));
    this.currentUserSubject.next(auth.user);
    this.isAuthenticatedSubject.next(true);
  }
}
