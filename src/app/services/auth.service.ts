import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: 'PATIENT' | 'DOCTOR';
  license_number?: string;
  specialty?: string;
  created_at: string;
}

export interface LoginData {
  email: string;
  password: string;
  role: 'PATIENT' | 'DOCTOR';
}

export interface SignupData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'PATIENT' | 'DOCTOR';
  licenseNumber?: string;
  specialty?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3000/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private accessTokenSubject = new BehaviorSubject<string | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public accessToken$ = this.accessTokenSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check for existing token on app start
    this.checkExistingAuth();
  }

  private checkExistingAuth(): void {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('currentUser');
    
    if (token && user) {
      try {
        const userObj = JSON.parse(user);
        this.accessTokenSubject.next(token);
        this.currentUserSubject.next(userObj);
      } catch (error) {
        this.clearAuth();
      }
    }
  }

  login(loginData: LoginData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, loginData).pipe(
      tap(response => {
        if (response.success) {
          this.setAuth(response.data.accessToken, response.data.user);
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error.error?.message || 'Login failed');
      })
    );
  }

  signup(signupData: SignupData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/signup`, signupData).pipe(
      tap(response => {
        if (response.success) {
          this.setAuth(response.data.accessToken, response.data.user);
        }
      }),
      catchError(error => {
        console.error('Signup error:', error);
        return throwError(() => error.error?.message || 'Signup failed');
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.API_URL}/logout`, {}).pipe(
      tap(() => {
        this.clearAuth();
        this.router.navigate(['/login']);
      }),
      catchError(error => {
        console.error('Logout error:', error);
        // Even if logout fails, clear local auth
        this.clearAuth();
        this.router.navigate(['/login']);
        return throwError(() => error);
      })
    );
  }

  refreshToken(): Observable<any> {
    return this.http.post(`${this.API_URL}/refresh`, {}).pipe(
      tap((response: any) => {
        if (response.success) {
          this.accessTokenSubject.next(response.data.accessToken);
          localStorage.setItem('accessToken', response.data.accessToken);
        }
      }),
      catchError(error => {
        console.error('Token refresh error:', error);
        this.clearAuth();
        this.router.navigate(['/login']);
        return throwError(() => error);
      })
    );
  }

  getProfile(): Observable<User> {
    return this.http.get<any>(`${this.API_URL}/profile`).pipe(
      map(response => response.data.user),
      catchError(error => {
        console.error('Get profile error:', error);
        return throwError(() => error);
      })
    );
  }

  private setAuth(token: string, user: User): void {
    this.accessTokenSubject.next(token);
    this.currentUserSubject.next(user);
    localStorage.setItem('accessToken', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  private clearAuth(): void {
    this.accessTokenSubject.next(null);
    this.currentUserSubject.next(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getAccessToken(): string | null {
    return this.accessTokenSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  hasRole(role: 'PATIENT' | 'DOCTOR'): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  isPatient(): boolean {
    return this.hasRole('PATIENT');
  }

  isDoctor(): boolean {
    return this.hasRole('DOCTOR');
  }
}
