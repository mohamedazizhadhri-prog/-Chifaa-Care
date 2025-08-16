import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, delay, map, tap } from 'rxjs/operators';

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
}

export interface Doctor extends BaseUser {
  role: 'doctor';
  specialty: string;
  hospital: string;
  experience: number;
  rating: string;
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
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';

  constructor() {
    // Load user from localStorage if available
    const userJson = localStorage.getItem(this.USER_KEY);
    if (userJson) {
      this.currentUserSubject.next(JSON.parse(userJson));
    }
  }

  // Mock login - replace with actual API call in a real app
  login(email: string, password: string): Observable<{ user: User; token: string }> {
    const role: 'patient' | 'doctor' = email.includes('@doctor.') ? 'doctor' : 'patient';
    const base = {
      id: 'user-' + Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0],
      email
    };
    const user: User = role === 'doctor'
      ? { ...base, role: 'doctor', specialty: 'General Medicine', hospital: 'City General Hospital', experience: Math.floor(Math.random() * 20) + 1, rating: (Math.random() * 1 + 4).toFixed(1) }
      : { ...base, role: 'patient', dob: this.getRandomDOB(), bloodType: this.getRandomBloodType(), conditions: this.getRandomConditions() };

    return of({ user, token: 'mock-jwt-token-' + Math.random().toString(36).substr(2) }).pipe(
      delay(1000),
      tap(response => this.setSession(response))
    );
  }

  // Mock signup - replace with actual API call in a real app
  signup(userData: any): Observable<{ user: User; token: string }> {
    const role: 'patient' | 'doctor' = userData.role === 'doctor' ? 'doctor' : 'patient';
    const base = {
      id: 'user-' + Math.random().toString(36).substr(2, 9),
      name: userData.name,
      email: userData.email
    };
    const user: User = role === 'doctor'
      ? { ...base, role: 'doctor', specialty: 'General Medicine', hospital: 'City General Hospital', experience: 0, rating: '0.0' }
      : { ...base, role: 'patient', dob: this.getRandomDOB(), bloodType: this.getRandomBloodType(), conditions: [] };

    return of({ user, token: 'mock-jwt-token-' + Math.random().toString(36).substr(2) }).pipe(
      delay(1500),
      tap(response => this.setSession(response))
    );
  }

  logout(): void {
    // Clear user data and token
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
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
