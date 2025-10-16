import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DoctorService, Appointment } from '../services/doctor.service';
import { MaterialModule } from '../../shared/material.module';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
    DatePipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  isLoading = true;
  upcomingAppointments: Appointment[] = [];
  todayAppointments: Appointment[] = [];
  recentPatients: any[] = [];
  selectedTabIndex = 0;
  
  // For the calendar view
  currentDate: Date = new Date();
  selectedDate: Date = new Date();
  daysInMonth: Date[] = [];
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  constructor(private doctorService: DoctorService) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.generateCalendarDays();
  }

  private loadDashboardData(): void {
    this.isLoading = true;
    
    // Get today's date range
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    
    // Get upcoming appointments (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    // Load today's appointments including pending consultations
    this.doctorService.getDoctorSchedule(todayStart, todayEnd, 'PENDING,CONFIRMED').subscribe({
      next: (response) => {
        // Map the response to match our Appointment interface
        this.todayAppointments = response.data.schedule.appointments.map((appt: any) => ({
          ...appt,
          patient: appt.patient?.user || appt.patient, // Handle nested user object
          doctor: appt.doctor || { id: '', firstName: '', lastName: '', specialty: '' } // Ensure doctor object exists
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading today\'s appointments:', error);
        this.isLoading = false;
      }
    });
    
    // Load upcoming appointments for the next 7 days including pending ones
    this.doctorService.getDoctorSchedule(new Date(), nextWeek, 'PENDING,CONFIRMED').subscribe({
      next: (response) => {
        this.upcomingAppointments = response.data.schedule.appointments
          .map((appt: any) => ({
            ...appt,
            patient: appt.patient?.user || appt.patient, // Handle nested user object
            doctor: appt.doctor || { id: '', firstName: '', lastName: '', specialty: '' } // Ensure doctor object exists
          }))
          .filter((appt: any) => new Date(appt.appointmentDate) > new Date()) // Only future appointments
          .sort((a: any, b: any) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
      },
      error: (error) => {
        console.error('Error loading upcoming appointments:', error);
      }
    });
    
    // Load recent patients from appointments to ensure we have actual patients with appointments
    this.doctorService.getPatients().subscribe({
      next: (response) => {
        // Get unique patients from appointments
        const patientMap = new Map();
        
        // Add today's appointments patients
        this.todayAppointments.forEach(appt => {
          if (appt.patient && appt.patient.id) {
            patientMap.set(appt.patient.id, appt.patient);
          }
        });
        
        // Add upcoming appointments patients
        this.upcomingAppointments.forEach(appt => {
          if (appt.patient && appt.patient.id) {
            patientMap.set(appt.patient.id, appt.patient);
          }
        });
        
        // Convert map values to array and take the 5 most recent
        this.recentPatients = Array.from(patientMap.values())
          .slice(0, 5);
          
        // If we don't have enough patients from appointments, fetch more
        if (this.recentPatients.length < 5) {
          this.doctorService.getPatients().subscribe({
            next: (patientsResponse) => {
              const additionalPatients = patientsResponse.data.patients
                .filter((p: any) => !patientMap.has(p.id))
                .slice(0, 5 - this.recentPatients.length);
              
              this.recentPatients = [...this.recentPatients, ...additionalPatients];
            },
            error: (error) => {
              console.error('Error loading additional patients:', error);
            }
          });
        }
      },
      error: (error) => {
        console.error('Error loading recent patients:', error);
      }
    });
  }
  
  // Calendar functions
  private generateCalendarDays(): void {
    this.daysInMonth = [];
    
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    // Get the first day of the month
    const firstDay = new Date(year, month, 1);
    // Get the last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayIndex = firstDay.getDay();
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayIndex; i++) {
      this.daysInMonth.push(new Date(year, month, -firstDayIndex + i + 1));
    }
    
    // Add all days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      this.daysInMonth.push(new Date(year, month, i));
    }
  }
  
  onDateSelected(date: Date): void {
    this.selectedDate = date;
    // Here you could load appointments for the selected date
  }
  
  // Navigation functions for the calendar
  prevMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.generateCalendarDays();
  }
  
  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.generateCalendarDays();
  }
  
  // Check if a date is today
  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  }
  
  // Check if a date is selected
  isSelected(date: Date): boolean {
    return date.getDate() === this.selectedDate.getDate() && 
           date.getMonth() === this.selectedDate.getMonth() && 
           date.getFullYear() === this.selectedDate.getFullYear();
  }
  
  // Get appointments for a specific date
  getAppointmentsForDate(date: Date): Appointment[] {
    return this.todayAppointments.filter(appt => {
      const apptDate = new Date(appt.appointmentDate);
      return apptDate.getDate() === date.getDate() && 
             apptDate.getMonth() === date.getMonth() && 
             apptDate.getFullYear() === date.getFullYear();
    });
  }
  
  // Format time for display
  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Get the first letter of the patient's name
  getInitials(patient: any): string {
    return `${patient.firstName ? patient.firstName[0] : ''}${patient.lastName ? patient.lastName[0] : ''}`.toUpperCase();
  }
}
