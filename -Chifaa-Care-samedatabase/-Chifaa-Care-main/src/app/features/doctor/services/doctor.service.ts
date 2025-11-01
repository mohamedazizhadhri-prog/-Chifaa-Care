import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

// Interfaces for our data models
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date | string;
  gender?: string;
  profileImage?: string;
  patientProfile?: any;
  appointmentsAsPatient?: any[];
  createdAt?: Date | string;
}

export interface Appointment {
  id: string;
  appointmentDate: Date | string;
  endTime: Date | string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'RESCHEDULED' | 'NO_SHOW';
  reason: string;
  notes?: string;
  patient: Patient;
  doctor: {
    id: string;
    firstName: string;
    lastName: string;
    specialty: string;
  };
}

interface DoctorSchedule {
  doctorId: string;
  startDate: Date;
  endDate: Date;
  appointments: Appointment[];
}

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private apiUrl = environment.apiUrl || 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  /**
   * Get all patients
   */
  getPatients(): Observable<{ status: string; data: { patients: Patient[] } }> {
    return this.http.get<{ status: string; data: { patients: Patient[] } }>(
      `${this.apiUrl}/patients`,
      { withCredentials: true }
    );
  }

  /**
   * Get a single patient's details by ID
   * @param patientId The ID of the patient
   */
  getPatientById(patientId: string): Observable<{ status: string; data: { patient: Patient } }> {
    return this.http.get<{ status: string; data: { patient: Patient } }>(
      `${this.apiUrl}/patients/${patientId}`,
      { withCredentials: true }
    );
  }

  /**
   * Get the doctor's schedule with appointments
   * @param startDate Optional start date for the date range
   * @param endDate Optional end date for the date range
   */
  getDoctorSchedule(
    startDate?: Date,
    endDate?: Date,
    status?: string
  ): Observable<{ status: string; data: { schedule: DoctorSchedule } }> {
    let params = new HttpParams();
    
    if (startDate) {
      params = params.set('startDate', startDate.toISOString());
    }
    
    if (endDate) {
      params = params.set('endDate', endDate.toISOString());
    }
    
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<{ status: string; data: { schedule: DoctorSchedule } }>(
      `${this.apiUrl}/appointments/doctor/schedule`,
      { 
        params,
        withCredentials: true 
      }
    );
  }

  /**
   * Update an appointment's status
   * @param appointmentId The ID of the appointment to update
   * @param status The new status
   */
  updateAppointmentStatus(
    appointmentId: string,
    status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED' | 'NO_SHOW'
  ): Observable<{ status: string; data: { appointment: Appointment } }> {
    return this.http.patch<{ status: string; data: { appointment: Appointment } }>(
      `${this.apiUrl}/appointments/${appointmentId}/status`,
      { status },
      { withCredentials: true }
    );
  }

  /**
   * Get a patient's upcoming appointments
   * @param patientId The ID of the patient
   */
  getPatientAppointments(patientId: string): Observable<{ status: string; data: { appointments: Appointment[] } }> {
    const params = new HttpParams()
      .set('patientId', patientId)
      .set('status', 'PENDING,CONFIRMED');

    return this.http.get<{ status: string; data: { appointments: Appointment[] } }>(
      `${this.apiUrl}/appointments`,
      { 
        params,
        withCredentials: true 
      }
    );
  }
}
