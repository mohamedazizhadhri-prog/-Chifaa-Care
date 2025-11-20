import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';
import { AppointmentService } from './appointment.service';
import { environment } from '../../environments/environment';

export interface BaseUser {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'clinic' | 'admin';
  firstName?: string;
  lastName?: string;
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
        // Try multiple ways to get the user's name
        console.log('User data received from API:', userData);
        let userName = '';
        if (userData.firstName || userData.lastName) {
          // Construct full name from firstName and lastName
          const first = userData.firstName || '';
          const last = userData.lastName || '';
          userName = `${first} ${last}`.trim();
          console.log('Using firstName + lastName:', userName);
        } else if (userData.name && !userData.name.includes('@')) {
          // Use name field if it doesn't look like an email
          userName = userData.name;
          console.log('Using name field:', userName);
        } else if (userData.fullName && !userData.fullName.includes('@')) {
          userName = userData.fullName;
          console.log('Using fullName field:', userName);
        } else if (userData.username && !userData.username.includes('@')) {
          userName = userData.username;
          console.log('Using username field:', userName);
        } else {
          // Last resort: use email username and capitalize it
          const emailUsername = userData.email.split('@')[0];
          userName = emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1);
          console.log('Using email username:', userName);
        }
        
        const baseUser = {
          id: userData.id,
          name: userName,
          email: userData.email,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          role: (userData.role || 'PATIENT').toUpperCase() === 'CLINIC' ? 'clinic' : 
                (userData.role || 'PATIENT').toUpperCase() === 'DOCTOR' ? 'doctor' : 
                (userData.role || 'PATIENT').toUpperCase() === 'ADMIN' ? 'admin' : 'patient'
        };

        // Create the appropriate user type based on role
        const role = (userData.role || 'PATIENT').toUpperCase();
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
    const roleUpper = (userData.role || 'PATIENT').toString().toUpperCase();

    // Support both flat fields (specialization, experience, etc.) and nested profile objects
    const doctorProfile = userData.doctorProfile || userData.doctor || null;
    const patientProfile = userData.patientProfile || userData.patient || null;

    const requestBody: any = {
      firstName: userData.firstName || userData.name?.split(' ')[0] || '',
      lastName: userData.lastName || userData.name?.split(' ').slice(1).join(' ') || 'User',
      email: userData.email,
      password: userData.password,
      role: roleUpper,
      phone: userData.phone || '',
      gender: userData.gender || 'other',
      dateOfBirth: userData.dateOfBirth
    };

    if (roleUpper === 'DOCTOR') {
      requestBody.specialization = userData.specialization || doctorProfile?.specialization || '';
      requestBody.bio = userData.bio || doctorProfile?.bio || '';
      requestBody.licenseNumber = userData.licenseNumber || doctorProfile?.licenseNumber || '';
      requestBody.experience = Number(userData.experience ?? doctorProfile?.experience ?? 0) || 0;
      requestBody.consultationFee = Number(userData.consultationFee ?? doctorProfile?.consultationFee ?? 0) || 0;
      // include nested doctorProfile object for backends that expect that shape
      requestBody.doctorProfile = {
        specialization: requestBody.specialization,
        bio: requestBody.bio,
        licenseNumber: requestBody.licenseNumber,
        experience: requestBody.experience,
        consultationFee: requestBody.consultationFee
      };
    } else {
      requestBody.bloodType = userData.bloodType || patientProfile?.bloodType || '';
      requestBody.height = userData.height ?? patientProfile?.height ?? null;
      requestBody.weight = userData.weight ?? patientProfile?.weight ?? null;
      requestBody.patientProfile = {
        bloodType: requestBody.bloodType,
        height: requestBody.height,
        weight: requestBody.weight
      };
    }
    
    console.log('Sending signup request with data:', requestBody);
    const doPost = (body: any) => this.http.post<{ status: string; token: string; data: { user: any } }>(
      `${this.API_URL}/auth/signup`,
      body,
      { observe: 'response' as const }
    );

    const processResponse = (response: HttpResponse<{ status: string; token: string; data: { user: any } }>) => {
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
      console.log('Raw signup response body.data:', responseBody.data);
      if (!userData) {
        throw new Error('Invalid user data in response');
      }

      // Ensure backend returned a created user id — if not, surface a clear error so it's
      // obvious the account wasn't persisted server-side.
      if (!userData.id) {
        console.error('Signup response missing created user id. Full response:', responseBody);
        throw {
          status: response.status,
          error: { message: 'Signup did not return a created user id. Backend may not have persisted the account.' }
        };
      }

      // Create base user object
      console.log('User data received from signup API:', userData);
      let userName = '';
      if (userData.firstName || userData.lastName) {
        const first = userData.firstName || '';
        const last = userData.lastName || '';
        userName = `${first} ${last}`.trim();
      } else if (userData.name && !userData.name.includes('@')) {
        userName = userData.name;
      } else if (userData.fullName && !userData.fullName.includes('@')) {
        userName = userData.fullName;
      } else if (userData.username && !userData.username.includes('@')) {
        userName = userData.username;
      } else {
        const emailUsername = userData.email.split('@')[0];
        userName = emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1);
      }

      const baseUser = {
        id: userData.id,
        name: userName,
        email: userData.email,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        role: (userData.role || 'PATIENT').toUpperCase() === 'CLINIC' ? 'clinic' : 
              (userData.role || 'PATIENT').toUpperCase() === 'DOCTOR' ? 'doctor' : 
              (userData.role || 'PATIENT').toUpperCase() === 'ADMIN' ? 'admin' : 'patient'
      };

      const role = (userData.role || 'PATIENT').toUpperCase();
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

      const token = responseBody.token;
      if (!token) {
        throw new Error('No authentication token received');
      }

      return {
        user,
        token
      };
    };

    // Helper to find a best match from available specializations
    const findBestSpecializationMatch = (provided: string, available: string[]): string | null => {
      if (!provided || !available || !available.length) return null;
      const p = provided.trim().toLowerCase();
      // 1) exact case-insensitive
      for (const a of available) {
        if (a.trim().toLowerCase() === p) return a;
      }
      // 2) substring match (provided contains available or vice versa)
      for (const a of available) {
        const al = a.trim().toLowerCase();
        if (p.includes(al) || al.includes(p)) return a;
      }
      // 3) token overlap scoring
      const pTokens = p.split(/\s+/).filter(Boolean);
      let best: {score: number; value: string} | null = null;
      for (const a of available) {
        const at = a.trim().toLowerCase();
        const aTokens = at.split(/\s+/).filter(Boolean);
        const common = pTokens.filter(t => aTokens.includes(t)).length;
        if (common > 0 && (!best || common > best.score)) {
          best = { score: common, value: a };
        }
      }
      if (best) return best.value;
      // 4) fallback to first available
      return available[0] || null;
    };

    return doPost(requestBody).pipe(
      map(processResponse),
      tap(res => this.setSession(res)),
      // Verify persistence: if the user is a doctor, ensure they appear in the public doctors list
      switchMap(res => {
        try {
          const isDoctor = (res.user && (res.user as any).role === 'doctor');
          if (!isDoctor) return of(res);
          return this.http.get<any>(`${this.API_URL}/doctors`).pipe(
            map(resp => {
              const doctors = resp?.data?.doctors || resp;
              const found = Array.isArray(doctors) && doctors.some((d: any) => d.email === res.user.email);
              if (!found) {
                console.error('Doctor not found in doctors list after signup', { email: res.user.email, doctors: Array.isArray(doctors) ? doctors.slice(0,5) : doctors });
                throw { error: { message: 'Signup succeeded but the doctor is not present in the public doctors list yet.' } };
              }
              return res;
            }),
            catchError(err => {
              console.warn('Error verifying created doctor in doctors list', err);
              return throwError(() => err);
            })
          );
        } catch (e) {
          return of(res);
        }
      }),
      catchError((error: any) => {
        console.error('Signup error (initial):', error);

        // If server returned available specializations, try to map and retry once
        const serverError = error?.error || error;
        const msg = serverError?.message || '';
        const available: string[] | undefined = serverError?.availableSpecializations || serverError?.data?.availableSpecializations;
        const provided = requestBody.specialization || requestBody.doctorProfile?.specialization || '';

        if (msg && msg.toLowerCase().includes('invalid specialization') && Array.isArray(available) && available.length) {
          const mapped = findBestSpecializationMatch(provided, available);
          if (mapped && mapped !== provided) {
            console.warn(`Specialization '${provided}' is invalid. Retrying with mapped specialization '${mapped}'.`);
            // Update body and retry once
            const retryBody = { ...requestBody, specialization: mapped, doctorProfile: { ...requestBody.doctorProfile, specialization: mapped } };
            return doPost(retryBody).pipe(
              map(processResponse),
              tap(res => this.setSession(res)),
              switchMap(res => {
                const isDoctor = (res.user && (res.user as any).role === 'doctor');
                if (!isDoctor) return of(res);
                return this.http.get<any>(`${this.API_URL}/doctors`).pipe(
                  map(resp => {
                    const doctors = resp?.data?.doctors || resp;
                    const found = Array.isArray(doctors) && doctors.some((d: any) => d.email === res.user.email);
                    if (!found) {
                      throw { error: { message: 'Retry signup succeeded but doctor not present in public doctors list.' } };
                    }
                    return res;
                  })
                );
              }),
              catchError((err2: any) => {
                console.error('Signup retry failed:', err2);
                return throwError(() => new Error(err2?.error?.message || 'Signup failed'));
              })
            );
          }
        }

        return throwError(() => new Error(serverError?.message || 'Signup failed'));
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

  // Handle HTTP errors
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // Get all patients
  getPatients(): Observable<Patient[]> {
    return this.http.get<{data: Patient[]}>(`${this.API_URL}/users/patients`).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
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
