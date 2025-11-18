import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { DoctorService, Appointment, Patient } from '../services/doctor.service';
import { MatSnackBar } from '@angular/material/snack-bar';

// Extend the Appointment interface to include the mapped patient property
interface Consultation extends Omit<Appointment, 'patient'> {
  patient: Patient & { user?: Patient };
  doctor: {
    id: string;
    firstName: string;
    lastName: string;
    specialty: string;
  };
}

@Component({
  selector: 'app-consultations',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
    DatePipe
  ],
  templateUrl: './consultations.component.html',
  styleUrls: ['./consultations.component.scss']
})
export class ConsultationsComponent implements OnInit {
  isLoading = true;
  displayedColumns: string[] = ['patient', 'date', 'time', 'reason', 'status', 'actions'];
  dataSource: Consultation[] = [];

  constructor(
    private doctorService: DoctorService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadConsultations();
  }

  private loadConsultations(): void {
    this.isLoading = true;
    
    // Get date range for the next 30 days
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    
    // Load all pending and confirmed consultations
    this.doctorService.getDoctorSchedule(startDate, endDate, 'PENDING,CONFIRMED').subscribe({
      next: (response) => {
        this.dataSource = response.data.schedule.appointments.map((appt: any) => ({
          ...appt,
          patient: appt.patient?.user || appt.patient,
          doctor: appt.doctor || { id: '', firstName: '', lastName: '', specialty: '' }
        })) as Consultation[];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading consultations:', error);
        this.snackBar.open('Failed to load consultations', 'Dismiss', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  onApprove(consultation: Consultation): void {
    this.updateConsultationStatus(consultation.id, 'CONFIRMED');
  }

  onReject(consultation: Consultation): void {
    this.updateConsultationStatus(consultation.id, 'CANCELLED');
  }

  private updateConsultationStatus(consultationId: string, status: 'CONFIRMED' | 'CANCELLED'): void {
    this.doctorService.updateAppointmentStatus(consultationId, status).subscribe({
      next: () => {
        this.snackBar.open(`Consultation ${status.toLowerCase()} successfully`, 'Dismiss', {
          duration: 3000
        });
        this.loadConsultations(); // Refresh the list
      },
      error: (error) => {
        console.error(`Error ${status.toLowerCase()}ing consultation:`, error);
        this.snackBar.open(`Failed to ${status.toLowerCase()} consultation`, 'Dismiss', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'status-pending';
      case 'CONFIRMED':
        return 'status-confirmed';
      case 'CANCELLED':
        return 'status-cancelled';
      case 'COMPLETED':
        return 'status-completed';
      default:
        return '';
    }
  }
}
