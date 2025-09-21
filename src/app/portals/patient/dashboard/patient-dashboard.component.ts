import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { AppointmentService } from '../../../services/appointment.service';
import { DoctorService } from '../../../services/doctor.service';
import { Appointment, AppointmentWithRelations, ConsultationType } from '../../../../app/models/appointment.model';
import { DoctorProfile, DoctorUser } from '../../../../app/models/doctor.model';
import { User } from '../../../../app/models/user.model';
import { mapAuthUserToUser } from '../../../../app/utils/type-mappers';
import { HttpClientModule } from '@angular/common/http';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  template: `
    <section class="container">
      <div class="grid cols-3 fade-in">
        <!-- Welcome -->
        <div class="card lift" style="grid-column: span 3;">
          <div class="card-header">Welcome back, {{ getDisplayName() }}!</div>
          <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;justify-content:space-between;">
            <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
              <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:20px;box-shadow:0 4px 12px rgba(0,0,0,0.15);">
                {{ getUserInitials() }}
              </div>
              <p class="muted" style="margin:0;">Wishing you a healthy day. Here's your snapshot.</p>
            </div>

          </div>
        </div>

        <!-- Upcoming appointment -->
        <div class="card lift" style="grid-column: span 2;">
          <div class="card-header">Upcoming Appointment</div>
          <div *ngIf="nextAppointment; else noAppointment" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
            <div>
              <div style="display:flex;align-items:center;gap:12px;">
                <div *ngIf="isLoading" class="skeleton" style="width: 120px; height: 20px;"></div>
                <div *ngIf="!isLoading && nextAppointment.doctor" style="color:var(--c-blue);font-weight:700;">
                  Dr. {{ nextAppointment.doctor.firstName || '' }} {{ nextAppointment.doctor.lastName || '' }} — {{ nextAppointment.doctor.doctorProfile?.specialization || 'General Practitioner' }}
                </div>
                <div *ngIf="!isLoading && !nextAppointment.doctor && error" style="color:var(--c-red);">
                  {{ error }}
                </div>
              </div>
              <div *ngIf="nextAppointment" class="badge badge-green" style="margin-top:6px;">{{ formatAppointmentDate(nextAppointment.appointmentDate) }}</div>
              <ng-container *ngIf="nextAppointment?.doctor?.doctorProfile as doctorProfile">
                <div class="doctor-rating" style="margin-top:8px;display:flex;align-items:center;gap:4px;">
                  <ng-container *ngIf="doctorProfile.rating !== undefined && doctorProfile.rating !== null">
                    <i class="fa-solid fa-star" style="color:#FFD700;"></i>
                    <span>{{ doctorProfile.rating.toFixed(1) }}</span>
                  </ng-container>
                  <ng-container *ngIf="(doctorProfile.experience !== undefined && doctorProfile.experience !== null) || 
                                   (doctorProfile.rating !== undefined && doctorProfile.rating !== null)">
                    <span class="muted">({{ (doctorProfile.experience || 0) }}+ years experience)</span>
                  </ng-container>
                </div>
              </ng-container>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <button class="btn btn-green" *ngIf="nextAppointment.consultationType === ConsultationType.VIDEO">
                <i class="fa-solid fa-video"></i> Join Call
              </button>
              <button class="btn btn-green" *ngIf="nextAppointment.consultationType === ConsultationType.IN_PERSON">
                <i class="fa-solid fa-hospital"></i> View Details
              </button>
              <button class="btn btn-green" *ngIf="nextAppointment.consultationType === ConsultationType.PHONE">
                <i class="fa-solid fa-phone"></i> Call Info
              </button>
              <button class="btn btn-blue-outline" (click)="rescheduleAppointment(nextAppointment.id)">
                <i class="fa-solid fa-calendar"></i> Reschedule
              </button>
            </div>
          </div>
          <ng-template #noAppointment>
            <div style="text-align:center;padding:20px;color:#666;">
              <i class="fa-solid fa-calendar-plus" style="font-size:24px;margin-bottom:10px;display:block;"></i>
              <p>No upcoming appointments</p>
              <button class="btn btn-blue" (click)="onBookConsultation()">
                <i class="fa-solid fa-stethoscope"></i> Book Your First Consultation
              </button>
            </div>
          </ng-template>
        </div>




        <!-- Medications -->
        <div class="card lift" style="grid-column: span 2;">
          <div class="card-header">Medications</div>
          <div class="grid cols-2">
            <div>
              <div><strong>Metformin 500mg</strong></div>
              <div class="muted">2x daily with meals</div>
            </div>
            <div>
              <div><strong>Atorvastatin 10mg</strong></div>
              <div class="muted">Once daily at night</div>
            </div>
          </div>
        </div>

        <!-- Lab results (mini cards) -->
        <div class="card lift">
          <div class="card-header">Latest Labs</div>
          <div class="grid cols-2">
            <div class="badge badge-yellow">A1C 6.8%</div>
            <div class="badge badge-green">Cholesterol 175</div>
          </div>
        </div>

        <!-- AI summary chart placeholder -->
        <div class="card lift" style="grid-column: span 3;">
          <div class="card-header">AI Health Summary</div>
          <div style="height:180px;background:linear-gradient(90deg,rgba(46,204,113,.15),rgba(52,152,219,.15));border-radius:12px;"></div>
        </div>

        <!-- Messages -->
        <div class="card lift" style="grid-column: span 2;">
          <div class="card-header">Messages</div>
          <div class="grid" style="gap:8px;">
            <div><span class="badge badge-green">New</span> Dr. Noor shared your updated plan.</div>
            <div><span class="badge">Info</span> Your lab results are available.</div>
          </div>
          <div style="margin-top:12px;">
            <button class="btn btn-blue" (click)="goToMessages()">
              <i class="fa-solid fa-comments"></i> View All Messages
            </button>
          </div>
        </div>
        <div class="card lift">
          <div class="card-header">Wellness Tip</div>
          <p class="muted" style="margin:0;">Take a 15-minute walk after lunch to improve glucose control.</p>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    
    .skeleton {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
    }
    
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    
    .doctor-rating {
      font-size: 14px;
      color: #555;
    }
  `]
})
export class PatientDashboardComponent implements OnInit {
  public ConsultationType = ConsultationType; // Added this line
  currentUser: User | null = null;
  nextAppointment: AppointmentWithRelations | null = null;
  doctorProfile: DoctorProfile | null = null;
  isLoading = false;
  error: string | null = null;
  

  constructor(
    private router: Router,
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private doctorService: DoctorService
  ) {
  }

  ngOnInit(): void {
    // Get current user
    this.authService.currentUser$.subscribe({
      next: (authUser) => {
        // Map AuthService user to our app's User type
        this.currentUser = mapAuthUserToUser(authUser);
        if (this.currentUser) {
          this.loadNextAppointment(this.currentUser.id);
        }
      },
      error: (err) => {
        console.error('Error getting current user:', err);
        this.error = 'Failed to load user data. Please try again later.';
      }
    });
  }

  getUserAvatar(): string {
    // Use patient avatar from assets
    return 'assets/avatars/pat.svg';
  }

  getUserInitials(): string {
    if (!this.currentUser?.firstName) return 'P';
    const first = this.currentUser.firstName.charAt(0);
    const last = this.currentUser.lastName ? this.currentUser.lastName.charAt(0) : '';
    return `${first}${last}`.toUpperCase().substring(0, 2);
  }

  getDisplayName(): string {
    if (!this.currentUser?.firstName) return 'Patient';
    return `${this.currentUser.firstName} ${this.currentUser.lastName || ''}`.trim();
  }

  onBookConsultation(): void {
    this.router.navigate(['/patient/book-consultation']);
  }

  private capitalizeFirstLetter(word: string): string {
    if (!word) return '';
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  private loadNextAppointment(userId: string): void {
    this.isLoading = true;
    this.error = null;

    this.appointmentService.getNextAppointment({ patientId: userId }).subscribe({
      next: (appointment) => {
        if (appointment) {
          this.nextAppointment = appointment as AppointmentWithRelations;
          // If the appointment includes doctor data, process it
          if (appointment.doctor) {
            const doctor = appointment.doctor as DoctorUser;
            this.doctorProfile = doctor.doctorProfile;
          } else if (appointment.doctorId) {
            // Otherwise, fetch the doctor's profile
            this.loadDoctorProfile(appointment.doctorId);
          }
        } else {
          this.nextAppointment = null;
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading next appointment:', err);
        this.error = 'Failed to load appointment. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  formatAppointmentDate(dateTimeString: string | Date): string {
    if (!dateTimeString) return 'Date not set';
    
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    
    return date.toLocaleString('en-US', options);
  }

  rescheduleAppointment(appointmentId: string): void {
    // For now, just navigate to book consultation
    // In a real app, this would open a reschedule modal
    this.router.navigate(['/patient/book-consultation']);
  }

  goToMessages(): void {
    this.router.navigate(['/patient/messages']);
  }

  private loadDoctorProfile(doctorId: string): void {
    if (!doctorId) {
      console.error('No doctor ID provided to load profile');
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.doctorService.getDoctorProfile(doctorId).subscribe({
      next: (response: unknown) => {
        try {
          // Type guard to ensure the response has the expected shape
          if (response && typeof response === 'object' && 'id' in response) {
            // Use the type mapper to handle the doctor profile conversion
            const doctor = response as DoctorUser;
            this.doctorProfile = doctor.doctorProfile;
          } else {
            console.error('Unexpected response format from doctor service:', response);
            this.error = 'Unexpected response format from server.';
          }
        } catch (err) {
          console.error('Error processing doctor profile:', err);
          this.error = 'Error processing doctor profile data.';
        } finally {
          this.isLoading = false;
        }
      },
      error: (err: unknown) => {
        console.error('Error loading doctor profile:', err);
        this.error = 'Failed to load doctor profile. Please try again later.';
        this.isLoading = false;
      }
    });
  }
}