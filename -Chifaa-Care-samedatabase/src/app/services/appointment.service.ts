import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  Appointment, 
  AppointmentWithRelations, 
  CreateAppointmentData, 
  UpdateAppointmentData,
  AppointmentStatus,
  ConsultationType
} from '../models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = `${environment.apiUrl}/appointments`;

  constructor(private http: HttpClient) {}

  /**
   * Get all appointments with optional filters
   * @param options Filtering and pagination options
   * @returns Observable of appointments array with relations
   */
  getAppointments(options?: {
    patientId?: string;
    doctorId?: string;
    status?: AppointmentStatus;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Observable<AppointmentWithRelations[]> {
    let params = new HttpParams();
    
    if (options?.patientId) params = params.set('patientId', options.patientId);
    if (options?.doctorId) params = params.set('doctorId', options.doctorId);
    if (options?.status) params = params.set('status', options.status);
    if (options?.startDate) params = params.set('startDate', options.startDate.toISOString());
    if (options?.endDate) params = params.set('endDate', options.endDate.toISOString());
    if (options?.limit) params = params.set('limit', options.limit.toString());
    if (options?.offset) params = params.set('offset', options.offset.toString());
    
    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map((resp) => {
        // Backend returns { status, results, data: { appointments } }
        if (resp && resp.data && Array.isArray(resp.data.appointments)) {
          return resp.data.appointments as AppointmentWithRelations[];
        }
        // Fallback if API returns raw array (dev/testing)
        if (Array.isArray(resp)) return resp as AppointmentWithRelations[];
        return [] as AppointmentWithRelations[];
      }),
      catchError(error => {
        console.error('Error fetching appointments:', error);
        return of([]);
      })
    );
  }

  /**
   * Get a single appointment by ID
   * @param id The ID of the appointment
   * @returns Observable of the appointment or null if not found
   */
  getAppointmentById(id: string): Observable<AppointmentWithRelations | null> {
    return this.http.get<AppointmentWithRelations>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        if (error.status === 404) {
          return of(null);
        }
        console.error('Error fetching appointment:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get the next upcoming appointment for a patient or doctor
   * @param options Filter options (either patientId or doctorId is required)
   * @returns Observable of the next appointment or null if none found
   */
  getNextAppointment(options: { patientId: string } | { doctorId: string }): Observable<AppointmentWithRelations | null> {
    const now = new Date();
    const endDate = new Date();
    endDate.setMonth(now.getMonth() + 1); // Look ahead 1 month

    const list$ = this.getAppointments({
      ...(('patientId' in options) ? { patientId: options.patientId } : {}),
      ...(('doctorId' in options) ? { doctorId: (options as any).doctorId } : {}),
      startDate: now,
      endDate: endDate,
    });

    return list$.pipe(
      map((appointments) => {
        if (!appointments || appointments.length === 0) return null;
        // Keep only pending/confirmed and in the future
        const filtered = appointments.filter(a => {
          const dt = new Date(a.appointmentDate);
          return dt >= now && (a.status === 'PENDING' || a.status === 'CONFIRMED');
        });
        if (filtered.length === 0) return null;
        filtered.sort((a,b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
        return filtered[0];
      }),
      catchError(error => {
        console.error('Error fetching next appointment:', error);
        return of(null);
      })
    );
  }

  /**
   * Book a new appointment
   * @param appointmentData The appointment data to book
   * @returns Observable of the created appointment with relations
   */
  bookAppointment(appointmentData: CreateAppointmentData): Observable<AppointmentWithRelations> {
    // Validate required fields
    if (!appointmentData.patientId || !appointmentData.doctorId || !appointmentData.appointmentDate) {
      return throwError(() => new Error('Missing required appointment data'));
    }

    // Set default status if not provided
    const data = {
      ...appointmentData,
      status: 'PENDING' as AppointmentStatus
    };

    return this.http.post<any>(this.apiUrl, data).pipe(
      map((resp) => {
        // Backend returns { status, data: { appointment } }
        return (resp?.data?.appointment || resp) as AppointmentWithRelations;
      }),
      catchError((error: any) => {
        const backend = error?.error;
        const details = backend?.errors || backend?.meta;
        const code = backend?.code;
        const message = backend?.message || error?.message || 'Error booking appointment';
        const enriched = new Error(`${message}${code ? ` (code: ${code})` : ''}${details ? `\nDetails: ${JSON.stringify(details)}` : ''}`);
        console.error('Error booking appointment:', backend || error);
        return throwError(() => enriched);
      })
    );
  }

  /**
   * Cancel an existing appointment
   * @param appointmentId The ID of the appointment to cancel
   * @param reason Optional reason for cancellation
   * @returns Observable of the updated appointment with relations
   */
  cancelAppointment(appointmentId: string, reason?: string): Observable<AppointmentWithRelations> {
    const updateData: UpdateAppointmentData = {
      status: 'CANCELLED',
      metadata: {
        cancellationReason: reason || 'Patient requested cancellation'
      }
    };

    return this.http.patch<any>(
      `${this.apiUrl}/${appointmentId}/status`,
      updateData
    ).pipe(
      map((resp) => (resp?.data?.appointment || resp) as AppointmentWithRelations),
      catchError(error => {
        console.error('Error cancelling appointment:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update an existing appointment
   * @param appointmentId The ID of the appointment to update
   * @param updateData The data to update
   * @returns Observable of the updated appointment with relations
   */
  updateAppointment(
    appointmentId: string,
    updateData: UpdateAppointmentData
  ): Observable<AppointmentWithRelations> {
    return this.http.patch<any>(
      `${this.apiUrl}/${appointmentId}`,
      updateData
    ).pipe(
      map((resp) => (resp?.data?.appointment || resp) as AppointmentWithRelations),
      catchError(error => {
        console.error('Error updating appointment:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Set appointment status via dedicated status endpoint
   */
  setStatus(appointmentId: string, status: AppointmentStatus): Observable<AppointmentWithRelations> {
    return this.http.patch<any>(
      `${this.apiUrl}/${appointmentId}/status`,
      { status }
    ).pipe(
      map((resp) => (resp?.data?.appointment || resp) as AppointmentWithRelations),
      catchError(error => {
        console.error('Error updating appointment status:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Confirm an appointment
   */
  confirmAppointment(appointmentId: string): Observable<AppointmentWithRelations> {
    return this.setStatus(appointmentId, 'CONFIRMED');
  }

  /**
   * Doctor creates an appointment for a patient (defaults to CONFIRMED on backend)
   */
  createAppointmentAsDoctor(input: {
    patientId: string;
    appointmentDate: string; // ISO string
    endTime: string; // ISO string
    reason?: string;
    notes?: string;
  }): Observable<AppointmentWithRelations> {
    return this.http.post<any>(
      `${this.apiUrl}/doctor/create`,
      input
    ).pipe(
      map((resp) => (resp?.data?.appointment || resp) as AppointmentWithRelations),
      catchError(error => {
        console.error('Error creating appointment as doctor:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Reschedule an existing appointment
   * @param appointmentId The ID of the appointment to reschedule
   * @param newAppointmentDate The new appointment date
   * @param newEndTime The new end time
   * @param reason Optional reason for rescheduling
   * @returns Observable of the updated appointment with relations
   */
  rescheduleAppointment(
    appointmentId: string, 
    newAppointmentDate: string, 
    newEndTime: string,
    reason?: string
  ): Observable<AppointmentWithRelations> {
    const updateData: UpdateAppointmentData = {
      appointmentDate: newAppointmentDate,
      endTime: newEndTime,
      status: 'PENDING', // Reset status to PENDING for doctor approval
      metadata: {
        rescheduledFrom: new Date().toISOString(),
        cancellationReason: reason
      }
    };

    return this.updateAppointment(appointmentId, updateData);
  }

  /**
   * Get available time slots for a doctor
   * @param doctorId The ID of the doctor
   * @param date The date to check availability for
   * @param duration Duration of the appointment in minutes (default: 30)
   * @returns Observable of available time slots
   */
  getAvailableSlots(
    doctorId: string,
    date: Date,
    duration: number = 30
  ): Observable<{ start: string; end: string; }[]> {
    const params = new HttpParams()
      .set('date', date.toISOString())
      .set('duration', duration.toString());

    return this.http.get<{ start: string; end: string; }[]>(
      `${this.apiUrl}/doctors/${doctorId}/availability`,
      { params }
    ).pipe(
      catchError(error => {
        console.error('Error fetching available slots:', error);
        return of([]);
      })
    );
  }

  /**
   * Clear all appointments from the service (used during logout)
   * @returns void
   */
  clearAllAppointments(): void {
    // This method is intentionally left empty as it's just used to clear any in-memory state
    // The actual appointments are managed by the backend and user's authentication state
    console.log('Appointments cleared from service');
  }
}
