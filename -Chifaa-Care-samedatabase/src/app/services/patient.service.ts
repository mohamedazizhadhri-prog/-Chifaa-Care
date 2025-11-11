import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

interface PatientsApiResponse {
  status: string;
  results: number;
  data: {
    patients: (User & { patientProfile?: any })[];
  };
}

@Injectable({ providedIn: 'root' })
export class PatientService {
  private apiUrl = `${environment.apiUrl}/patients`;
  constructor(private http: HttpClient) {}

  getPatients(): Observable<User[]> {
    return this.http.get<PatientsApiResponse>(this.apiUrl).pipe(
      map(res => res?.data?.patients || []),
      catchError(() => of([]))
    );
  }

  // Get patients for the authenticated doctor (those with confirmed appointments)
  getDoctorPatients(): Observable<User[]> {
    return this.http.get<PatientsApiResponse>(`${this.apiUrl}/doctor/mine`).pipe(
      map(res => res?.data?.patients || []),
      catchError(() => of([]))
    );
  }

  // Get a single patient's profile by ID (rich details)
  getPatientById(id: string): Observable<any | null> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(res => res?.data?.patient || null),
      catchError(() => of(null))
    );
  }
}
