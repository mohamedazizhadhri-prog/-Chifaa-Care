import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { DoctorUser } from '../models/doctor.model'; // Changed from DoctorWithUser

// Define a type for the API response
interface DoctorsApiResponse {
  status: string;
  results: number;
  data: {
    doctors: DoctorUser[]; // Changed from DoctorWithUser[]
  };
}

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private apiUrl = `${environment.apiUrl}/doctors`;

  constructor(private http: HttpClient) {}

  /**
   * Get all doctors
   * @returns Observable with an array of doctors
   */
  getDoctors(): Observable<DoctorUser[]> {
    console.log('Fetching doctors from:', this.apiUrl);
    return this.http.get<DoctorsApiResponse>(this.apiUrl).pipe(
      map(response => {
        console.log('API Response:', response);
        if (!response || !response.data || !Array.isArray(response.data.doctors)) {
          console.error('Invalid response format:', response);
          throw new Error('Invalid response format from server');
        }
        return response.data.doctors;
      }),
      catchError(error => {
        console.error('Error fetching doctors:', error);
        return of([]);
      })
    );
  }

  /**
   * Get a doctor's profile by ID
   * @param doctorId The ID of the doctor
   * @returns Observable with the doctor's profile
   */
  getDoctorProfile(doctorId: string): Observable<DoctorUser> { // Changed from DoctorWithUser
    return this.http.get<DoctorUser>(`${this.apiUrl}/${doctorId}`);
  }

  /**
   * Get a doctor's appointments
   * @param doctorId The ID of the doctor
   * @returns Observable with the doctor's appointments
   */
  getDoctorAppointments(doctorId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${doctorId}/appointments`);
  }

  /**
   * Get a doctor's schedule
   * @param doctorId The ID of the doctor
   * @returns Observable with the doctor's schedule
   */
  getDoctorSchedule(doctorId: string): Observable<{ availableDays: string; availableHours: string }> { // Changed from string[]
    return this.http.get<{ availableDays: string; availableHours: string }>(`${this.apiUrl}/${doctorId}/schedule`);
  }
}
