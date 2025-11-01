import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AppointmentService } from './appointment.service';
import { environment } from '../../environments/environment';

export interface BaseUser {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'clinic' | 'admin';
  permissions?: string[];
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

export interface Clinic extends BaseUser {
  role: 'clinic';
  clinicName?: string;
  address?: string;
  phone?: string;
  dob?: never;
  bloodType?: never;
  conditions?: never;
  specialty?: never;
  hospital?: never;
  experience?: never;
  rating?: never;
}

export interface Admin extends BaseUser {
  role: 'admin';
}

export type User = Patient | Doctor | Clinic | Admin;

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
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';

  constructor(
    private http: HttpClient,
    private appointmentService: AppointmentService
  ) {
    // Load user from localStorage if available
    const userJson = localStorage.getItem(this.USER_KEY);
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (userJson && token) {
      this.currentUserSubject.next(JSON.parse(userJson));
      this.isAuthenticatedSubject.next(true);
    }
  }

  // Login with real API call
  login(email: string, password: string): Observable<{ user: User; token: string }> {
    console.log('Attempting login to:', `${this.API_URL}/auth/login`);
    return this.http.post<{ status: string; token: string; data: { user: any } }>(
      `${this.API_URL}/auth/login`,
      { email, password },
      { observe: 'response' as const }
    ).pipe(
      map((response) => {
        const responseBody = response.body;
        if (!responseBody) {
          throw new Error('Empty response from server');
        }
        
        console.log('Login response:', response);
        if (response.status !== 200) {
          throw new Error(`Login failed with status: ${response.status}`);
        }
        
        if (responseBody.status !== 'success') {
          const errorMessage = (responseBody as any)?.message || 'Invalid response from server';
          throw new Error(errorMessage);
        }

        // Extract user data from response
        const userData = responseBody.data?.user;
        if (!userData) {
          throw new Error('Invalid user data in response');
        }

        // Create base user object
        const baseUser = {
          id: userData.id,
          name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'User',
          email: userData.email,
          role: (userData.role || 'patient').toLowerCase() as 'patient' | 'doctor' | 'clinic' | 'admin'
        };

        // Create the appropriate user type based on role
        const role = userData.role?.toUpperCase();
        let user: User;
        
        if (role === 'DOCTOR') {
          user = {
            ...baseUser,
            role: 'doctor',
            specialty: 'General Medicine',
            hospital: 'City Hospital',
            experience: 5,
            rating: '4.8'
          } as Doctor;
        } else if (role === 'CLINIC') {
          user = {
            ...baseUser,
            role: 'clinic',
            clinicName: userData.clinicName || baseUser.name,
            address: userData.address || '',
            phone: userData.phone || ''
          } as Clinic;
        } else if (role === 'ADMIN') {
          user = {
            ...baseUser,
            role: 'admin'
          } as Admin;
        } else {
          user = {
            ...baseUser,
            role: 'patient',
            dob: '',
            bloodType: 'O+',
            conditions: []
          } as Patient;
        }

        if (!responseBody.token) {
          throw new Error('No authentication token received');
        }
        
        // Verify we have a token
        const token = responseBody.token;
        if (!token) {
          throw new Error('No authentication token received');
        }

        return {
          user,
          token
        };
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
    console.log('Preparing signup data:', userData);
    
    // Prepare the request body according to the backend API
    const requestBody = {
      firstName: userData.firstName || userData.name?.split(' ')[0] || '',
      lastName: userData.lastName || userData.name?.split(' ').slice(1).join(' ') || 'User',
      email: userData.email,
      password: userData.password,
      role: userData.role ? userData.role.toUpperCase() : 'PATIENT',
      phone: userData.phone || '',
      gender: userData.gender || 'other',
      dateOfBirth: userData.dateOfBirth,
      // Include profile data if available
      ...(userData.role === 'doctor' ? {
        specialization: userData.specialization,
        bio: userData.bio,
        licenseNumber: userData.licenseNumber,
        experience: userData.experience,
        consultationFee: userData.consultationFee
      } : {
        bloodType: userData.bloodType,
        height: userData.height,
        weight: userData.weight
      })
    };
    
    console.log('Sending signup request with data:', requestBody);

    return this.http.post<{ status: string; token: string; data: { user: any } }>(
      `${this.API_URL}/auth/signup`,
      requestBody,
      { observe: 'response' as const }
    ).pipe(
      map((response: HttpResponse<{ status: string; token: string; data: { user: any } }>) => {
        console.log('Signup response:', response);
        
        if (response.status !== 201 && response.status !== 200) {
          const errorResponse = response as unknown as { error: any };
          throw {
            status: response.status,
            error: errorResponse?.error || { message: `Signup failed with status: ${response.status}` }
          };
        }
        
        const responseBody = response.body;
        if (!responseBody || responseBody.status !== 'success') {
          const errorData = responseBody as any;
          throw {
            status: response.status,
            error: { 
              message: errorData?.message || 'Invalid response from server',
              errors: errorData?.errors
            }
          };
        }

        // Extract user data from response
        const userData = responseBody.data?.user;
        if (!userData) {
          throw new Error('Invalid user data in response');
        }

        // Create base user object
        const baseUser = {
          id: userData.id,
          name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'User',
          email: userData.email,
          role: (userData.role || 'patient').toLowerCase() as 'patient' | 'doctor' | 'clinic'
        };

        // Create the appropriate user type based on role
        const role = userData.role?.toUpperCase();
        let user: User;
        
        if (role === 'DOCTOR') {
          user = {
            ...baseUser,
            role: 'doctor',
            specialty: 'General Medicine',
            hospital: 'City Hospital',
            experience: 0,
            rating: '0.0'
          } as Doctor;
        } else if (role === 'CLINIC') {
          user = {
            ...baseUser,
            role: 'clinic',
            clinicName: userData.clinicName || baseUser.name,
            address: userData.address || '',
            phone: userData.phone || ''
          } as Clinic;
        } else if (role === 'ADMIN') {
          user = {
            ...baseUser,
            role: 'admin'
          } as Admin;
        } else {
          user = {
            ...baseUser,
            role: 'patient',
            dob: '',
            bloodType: 'O+',
            conditions: []
          } as Patient;
        }

        if (!responseBody.token) {
          throw new Error('No authentication token received');
        }
        
        // Verify we have a token
        const token = responseBody.token;
        if (!token) {
          throw new Error('No authentication token received');
        }

        return {
          user,
          token
        };
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
    
    // Update observables
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    
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
    this.isAuthenticatedSubject.next(true);
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
