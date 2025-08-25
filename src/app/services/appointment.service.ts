import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: number;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  time: string;
  consultationType: 'video' | 'in-person' | 'phone';
  reason: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  createdAt: Date;
  medicalRecord?: {
    name: string;
    size: number;
    type: string;
  };
  insurance?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private readonly APPOINTMENTS_KEY = 'patient_appointments';
  private appointmentsSubject = new BehaviorSubject<Appointment[]>([]);
  public appointments$ = this.appointmentsSubject.asObservable();

  constructor() {
    this.loadAppointments();
  }

  private loadAppointments(): void {
    try {
      const stored = localStorage.getItem(this.APPOINTMENTS_KEY);
      if (stored) {
        const appointments = JSON.parse(stored).map((apt: any) => ({
          ...apt,
          createdAt: new Date(apt.createdAt)
        }));
        this.appointmentsSubject.next(appointments);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      this.appointmentsSubject.next([]);
    }
  }

  private saveAppointments(appointments: Appointment[]): void {
    try {
      localStorage.setItem(this.APPOINTMENTS_KEY, JSON.stringify(appointments));
    } catch (error) {
      console.error('Error saving appointments:', error);
    }
  }

  bookAppointment(appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'status'>): Appointment {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: this.generateId(),
      createdAt: new Date(),
      status: 'upcoming'
    };

    const currentAppointments = this.appointmentsSubject.value;
    const updatedAppointments = [...currentAppointments, newAppointment];
    
    this.appointmentsSubject.next(updatedAppointments);
    this.saveAppointments(updatedAppointments);
    
    return newAppointment;
  }

  getUpcomingAppointments(patientId: string): Appointment[] {
    const now = new Date();
    return this.appointmentsSubject.value
      .filter(apt => 
        apt.patientId === patientId && 
        apt.status === 'upcoming' &&
        new Date(`${apt.date}T${apt.time}`) > now
      )
      .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
  }

  getNextAppointment(patientId: string): Appointment | null {
    const upcoming = this.getUpcomingAppointments(patientId);
    return upcoming.length > 0 ? upcoming[0] : null;
  }

  cancelAppointment(appointmentId: string): void {
    const currentAppointments = this.appointmentsSubject.value;
    const updatedAppointments = currentAppointments.map(apt => 
      apt.id === appointmentId ? { ...apt, status: 'cancelled' as const } : apt
    );
    
    this.appointmentsSubject.next(updatedAppointments);
    this.saveAppointments(updatedAppointments);
  }

  rescheduleAppointment(appointmentId: string, newDate: string, newTime: string): void {
    const currentAppointments = this.appointmentsSubject.value;
    const updatedAppointments = currentAppointments.map(apt => 
      apt.id === appointmentId ? { ...apt, date: newDate, time: newTime } : apt
    );
    
    this.appointmentsSubject.next(updatedAppointments);
    this.saveAppointments(updatedAppointments);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Clear all appointments (useful for testing or logout)
  clearAllAppointments(): void {
    this.appointmentsSubject.next([]);
    localStorage.removeItem(this.APPOINTMENTS_KEY);
  }
}
