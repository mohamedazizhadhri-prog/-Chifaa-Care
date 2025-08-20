import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, User } from '../../../services/auth.service';
import { AppointmentService, Appointment } from '../../../services/appointment.service';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule],
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
              <div style="color:var(--c-blue);font-weight:700;">{{ nextAppointment.doctorName }} — {{ nextAppointment.doctorSpecialty }}</div>
              <div class="badge badge-green" style="margin-top:6px;">{{ formatAppointmentDate(nextAppointment.date, nextAppointment.time) }}</div>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <button class="btn btn-green" *ngIf="nextAppointment.consultationType === 'video'">
                <i class="fa-solid fa-video"></i> Join Call
              </button>
              <button class="btn btn-green" *ngIf="nextAppointment.consultationType === 'in-person'">
                <i class="fa-solid fa-hospital"></i> View Details
              </button>
              <button class="btn btn-green" *ngIf="nextAppointment.consultationType === 'phone'">
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
  styles: [`:host{display:block}`]
})
export class PatientDashboardComponent implements OnInit {
  currentUser: User | null = null;
  nextAppointment: Appointment | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private appointmentService: AppointmentService
  ) {}

  ngOnInit() {
    // Subscribe to current user changes
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.loadNextAppointment();
    });

    // Subscribe to appointment changes
    this.appointmentService.appointments$.subscribe(() => {
      this.loadNextAppointment();
    });
  }

  getUserAvatar(): string {
    // Use patient avatar from assets
    return 'assets/avatars/pat.svg';
  }

  getUserInitials(): string {
    if (!this.currentUser?.name) return 'P';
    return this.currentUser.name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getDisplayName(): string {
    if (!this.currentUser?.name) return 'Patient';
    return this.currentUser.name;
  }

  onBookConsultation(): void {
    this.router.navigate(['/patient/book-consultation']);
  }



  private loadNextAppointment(): void {
    if (this.currentUser) {
      this.nextAppointment = this.appointmentService.getNextAppointment(this.currentUser.id || this.currentUser.name);
    }
  }

  formatAppointmentDate(date: string, time: string): string {
    const appointmentDate = new Date(`${date}T${time}`);
    const now = new Date();
    const diffTime = appointmentDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today, ${time}`;
    } else if (diffDays === 1) {
      return `Tomorrow, ${time}`;
    } else if (diffDays < 7) {
      return appointmentDate.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }) + `, ${time}`;
    } else {
      return appointmentDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }) + `, ${time}`;
    }
  }

  rescheduleAppointment(appointmentId: string): void {
    // For now, just navigate to book consultation
    // In a real app, this would open a reschedule modal
    this.router.navigate(['/patient/book-consultation']);
  }

  goToMessages(): void {
    this.router.navigate(['/patient/messages']);
  }
}
