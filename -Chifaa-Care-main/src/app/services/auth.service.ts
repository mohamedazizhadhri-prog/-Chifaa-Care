import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AppointmentService } from './appointment.service';
import { environment } from '../../environments/environment';

export interface BaseUser {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor';
}

export interface Patient extends BaseUser {
  role: 'patient';
  dob: string;
  bloodType: string;
  conditions: string[];
  specialty?: never;
  hospital?: never;
  experience?: never;
  rating?: never;
}

export interface Doctor extends BaseUser {
  role: 'doctor';
  specialty: string;
  hospital: string;
  experience: number;
  rating: string;
  dob?: never;
  bloodType?: never;
  conditions?: never;
}

export type User = Patient | Doctor;

export interface AuthResponse {
  user: User;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl || 'http://localhost:3000/api/v1';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';

  constructor(
    private http: HttpClient,
    private appointmentService: AppointmentService
  ) {
    // Load user from localStorage if available
    const userJson = localStorage.getItem(this.USER_KEY);
    if (userJson) {
      this.currentUserSubject.next(JSON.parse(userJson));
    }
  }

  // Login with real API call
  login(email: string, password: string): Observable<{ user: User; token: string }> {
    return this.http.post<{ status: string; token: string; data: { user: any } }>(
      `${this.API_URL}/auth/login`,
      { email, password }
    ).pipe(
      map(response => {
        if (response.status !== 'success') {
          throw new Error('Login failed');
        }

        // Common user properties
        const baseUser = {
          id: response.data.user.id,
          name: `${response.data.user.firstName} ${response.data.user.lastName}`,
          email: response.data.user.email,
          role: response.data.user.role.toLowerCase() as 'patient' | 'doctor'
        };

        // Create the appropriate user type based on role
        let user: User;
        if (response.data.user.role === 'DOCTOR') {
          user = {
            ...baseUser,
            role: 'doctor',
            specialty: 'General Medicine',
            hospital: 'City Hospital',
            experience: 5,
            rating: '4.8'
          } as Doctor;
        } else {
          user = {
            ...baseUser,
            role: 'patient',
            dob: '',
            bloodType: 'O+',
            conditions: []
          } as Patient;
        }

        return { user, token: response.token };
      }),
      tap(response => this.setSession(response)),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => new Error(error.error?.message || 'Login failed'));
      })
    );
  }

  // Signup with real API call
  signup(userData: any): Observable<{ user: User; token: string }> {
    // Prepare the request body according to the backend API
    const requestBody = {
      firstName: userData.name.split(' ')[0],
      lastName: userData.name.split(' ').slice(1).join(' ') || 'User',
      email: userData.email,
      password: userData.password,
      role: userData.role.toUpperCase(),
      phone: userData.phone || '',
      gender: userData.gender || 'other'
    };

    return this.http.post<{ status: string; token: string; data: { user: any } }>(
      `${this.API_URL}/auth/signup`,
      requestBody
    ).pipe(
      map(response => {
        if (response.status !== 'success') {
          throw new Error('Signup failed');
        }

        // Common user properties
        const baseUser = {
          id: response.data.user.id,
          name: `${response.data.user.firstName} ${response.data.user.lastName}`,
          email: response.data.user.email,
          role: response.data.user.role.toLowerCase() as 'patient' | 'doctor'
        };

        // Create the appropriate user type based on role
        let user: User;
        if (response.data.user.role === 'DOCTOR') {
          user = {
            ...baseUser,
            role: 'doctor',
            specialty: 'General Medicine',
            hospital: 'City Hospital',
            experience: 0,
            rating: '0.0'
          } as Doctor;
        } else {
          user = {
            ...baseUser,
            role: 'patient',
            dob: '',
            bloodType: 'O+',
            conditions: []
          } as Patient;
        }

        return { user, token: response.token };
      }),
      tap(response => this.setSession(response)),
      catchError(error => {
        console.error('Signup error:', error);
        return throwError(() => new Error(error.error?.message || 'Signup failed'));
      })
    );
  }

  logout(): void {
    // Clear user data and token
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    
    // Clear appointments when logging out
    this.appointmentService.clearAllAppointments();
    
    // Emit null to all subscribers to clear the current user
    this.currentUserSubject.next(null);
    
    // Clear any other stored data that might exist
    sessionStorage.clear();
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private setSession(authResult: { user: User; token: string }): void {
    localStorage.setItem(this.TOKEN_KEY, authResult.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(authResult.user));
    this.currentUserSubject.next(authResult.user);
  }

  // Helper methods for generating mock data
  private getRandomDOB(): string {
    const start = new Date(1950, 0, 1);
    const end = new Date(2005, 11, 31);
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0];
  }

  private getRandomBloodType(): string {
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    return bloodTypes[Math.floor(Math.random() * bloodTypes.length)];
  }

  private getRandomConditions(): string[] {
    const conditions = [
      'Hypertension', 'Diabetes', 'Asthma', 'Arthritis', 'Migraine',
      'High Cholesterol', 'Anxiety', 'Depression', 'Allergies', 'Acid Reflux'
    ];
    const count = Math.min(3, Math.floor(Math.random() * 4));
    return conditions.sort(() => 0.5 - Math.random()).slice(0, count);
  }
}
