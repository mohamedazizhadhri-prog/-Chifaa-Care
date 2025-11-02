import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../../services/auth.service';
import { catchError, of } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-clinic-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule, FormsModule],
  template: `
    <section class="dashboard-container">
      <div class="grid cols-3 fade-in">
        <!-- Welcome -->
        <div class="card lift" style="grid-column: span 3;">
          <div class="card-header">Welcome to ChifaaCare Clinic Management</div>
          <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;justify-content:space-between;">
            <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
              <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:20px;box-shadow:0 4px 12px rgba(0,0,0,0.15);">
                {{ getUserInitials() }}
              </div>
              <p class="muted" style="margin:0;">Manage your clinic operations and patient care.</p>
            </div>
          </div>
        </div>

        <!-- Clinic Stats -->
        <div class="card lift" style="grid-column: span 2;">
          <div class="card-header">Clinic Overview</div>
          <div class="grid cols-3" style="gap: 16px;">
            <div class="stat-card">
              <div class="stat-number">{{ totalPatients }}</div>
              <div class="stat-label">Total Patients</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ totalDoctors }}</div>
              <div class="stat-label">Doctors</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ todayAppointments }}</div>
              <div class="stat-label">Today's Appointments</div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="card lift">
          <div class="card-header">Quick Actions</div>
          <div class="grid" style="gap: 8px;">
            <button class="btn btn-blue" (click)="goToPatients()">
              <i class="fa-solid fa-users"></i> Manage Patients
            </button>
            <button class="btn btn-green" (click)="goToDoctors()">
              <i class="fa-solid fa-user-doctor"></i> Manage Doctors
            </button>
            <button class="btn btn-purple" (click)="goToAppointments()">
              <i class="fa-solid fa-calendar"></i> View Appointments
            </button>
            <button class="btn btn-orange" (click)="goToReports()">
              <i class="fa-solid fa-chart-bar"></i> Generate Reports
            </button>
          </div>
        </div>

        <!-- Recent Appointments -->
        <div class="card lift" style="grid-column: span 2;">
          <div class="card-header">Recent Appointments</div>
          <div *ngIf="recentAppointments.length > 0; else noAppointments">
            <div *ngFor="let appointment of recentAppointments" class="appointment-item">
              <div class="appointment-info">
                <div class="appointment-patient">
                  <strong>{{ appointment.patient?.firstName }} {{ appointment.patient?.lastName }}</strong>
                </div>
                <div class="appointment-doctor">
                  Dr. {{ appointment.doctor?.firstName }} {{ appointment.doctor?.lastName }}
                </div>
                <div class="appointment-date">
                  {{ formatAppointmentDate(appointment.appointmentDate) }}
                </div>
              </div>
              <div class="appointment-status">
                <span class="badge" [class.badge-green]="appointment.status === 'CONFIRMED'" 
                      [class.badge-yellow]="appointment.status === 'PENDING'" 
                      [class.badge-red]="appointment.status === 'CANCELLED'">
                  {{ appointment.status }}
                </span>
              </div>
            </div>
          </div>
          <ng-template #noAppointments>
            <div style="text-align:center;padding:20px;color:#666;">
              <i class="fa-solid fa-calendar-plus" style="font-size:24px;margin-bottom:10px;display:block;"></i>
              <p>No recent appointments</p>
            </div>
          </ng-template>
        </div>

        <!-- Clinic Services -->
        <div class="card lift">
          <div class="card-header">Clinic Services</div>
          <div class="grid" style="gap: 8px;">
            <div class="service-item">
              <i class="fa-solid fa-stethoscope"></i>
              <span>General Consultation</span>
            </div>
            <div class="service-item">
              <i class="fa-solid fa-heart-pulse"></i>
              <span>Cardiology</span>
            </div>
            <div class="service-item">
              <i class="fa-solid fa-brain"></i>
              <span>Neurology</span>
            </div>
            <div class="service-item">
              <i class="fa-solid fa-dna"></i>
              <span>Oncology</span>
            </div>
          </div>
        </div>

        <!-- Messages -->
        <div class="card lift" style="grid-column: span 2;">
          <div class="card-header">Recent Messages</div>
          <div class="grid" style="gap:8px;">
            <div><span class="badge badge-green">New</span> Patient inquiry about appointment availability.</div>
            <div><span class="badge">Info</span> Doctor availability updated.</div>
            <div><span class="badge badge-blue">System</span> New patient registration completed.</div>
          </div>
          <div style="margin-top:12px;">
            <button class="btn btn-blue" (click)="goToMessages()">
              <i class="fa-solid fa-comments"></i> View All Messages
            </button>
          </div>
        </div>

        <!-- System Status -->
        <div class="card lift">
          <div class="card-header">System Status</div>
          <div class="grid" style="gap: 8px;">
            <div class="status-item">
              <i class="fa-solid fa-check-circle" style="color: #22c55e;"></i>
              <span>Database Connected</span>
            </div>
            <div class="status-item">
              <i class="fa-solid fa-check-circle" style="color: #22c55e;"></i>
              <span>API Services Online</span>
            </div>
            <div class="status-item">
              <i class="fa-solid fa-check-circle" style="color: #22c55e;"></i>
              <span>Payment Gateway Active</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    
    .dashboard-container {
      padding: 24px 5%;
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .stat-card {
      text-align: center;
      padding: 16px;
      background: linear-gradient(135deg, rgba(46,204,113,.1), rgba(52,152,219,.1));
      border-radius: 12px;
      border: 1px solid rgba(46,204,113,.2);
    }
    
    .stat-number {
      font-size: 24px;
      font-weight: bold;
      color: var(--c-blue);
      margin-bottom: 4px;
    }
    
    .stat-label {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .appointment-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      margin-bottom: 8px;
    }
    
    .appointment-info {
      flex: 1;
    }
    
    .appointment-patient {
      font-weight: 600;
      color: #0f172a;
    }
    
    .appointment-doctor {
      font-size: 14px;
      color: var(--c-blue);
      margin: 2px 0;
    }
    
    .appointment-date {
      font-size: 12px;
      color: #64748b;
    }
    
    .service-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      background: rgba(52,152,219,.05);
      border-radius: 8px;
      font-size: 14px;
    }
    
    .service-item i {
      color: var(--c-blue);
      width: 16px;
    }
    
    .status-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      font-size: 14px;
    }
    
    .status-item i {
      width: 16px;
    }
  `]
})
export class ClinicDashboardComponent implements OnInit {
  currentUser: User | null = null;
  totalPatients = 0;
  totalDoctors = 0;
  todayAppointments = 0;
  recentAppointments: any[] = [];
  private apiUrl = environment.apiUrl || 'http://localhost:3000/api/v1';

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  getUserInitials(): string {
    if (!this.currentUser) return 'C';
    const firstName = (this.currentUser as any).firstName || '';
    const lastName = (this.currentUser as any).lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'C';
  }

  loadDashboardData() {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    
    // Load patients count
    this.http.get<any>(`${this.apiUrl}/patients`, { headers }).subscribe({
      next: (response) => {
        const patients = response.data?.patients || response.patients || response.data || response;
        this.totalPatients = Array.isArray(patients) ? patients.length : 0;
      },
      error: (err) => { 
        console.error('Error loading patients count:', err);
        this.totalPatients = 0; 
      }
    });
    
    // Load doctors count
    this.http.get<any>(`${this.apiUrl}/doctors`, { headers }).subscribe({
      next: (response) => {
        const doctors = response.data?.doctors || response.doctors || response.data || response;
        this.totalDoctors = Array.isArray(doctors) ? doctors.length : 0;
      },
      error: (err) => { 
        console.error('Error loading doctors count:', err);
        this.totalDoctors = 0; 
      }
    });
    
    // Load appointments
    this.http.get<any>(`${this.apiUrl}/appointments`, { headers }).subscribe({
      next: (response) => {
        const apts = response.data?.appointments || response.appointments || response.data || response;
        if (Array.isArray(apts)) {
          const today = new Date().toDateString();
          this.todayAppointments = apts.filter((a: any) => 
            new Date(a.appointmentDate || a.date).toDateString() === today
          ).length;
          
          this.recentAppointments = apts
            .slice(0, 5)
            .map((apt: any) => ({
              id: apt.id,
              patient: { 
                firstName: apt.patient?.firstName || 'Unknown',
                lastName: apt.patient?.lastName || 'Patient'
              },
              doctor: { 
                firstName: apt.doctor?.firstName || 'Unknown',
                lastName: apt.doctor?.lastName || 'Doctor'
              },
              appointmentDate: new Date(apt.appointmentDate || apt.date),
              status: (apt.status || 'PENDING').toUpperCase()
            }));
        }
      },
      error: (err) => { 
        console.error('Error loading appointments:', err);
        this.todayAppointments = 0;
        this.recentAppointments = [];
      }
    });
  }

  formatAppointmentDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  goToPatients() {
    this.router.navigate(['/clinic/patients']);
  }

  goToDoctors() {
    this.router.navigate(['/clinic/doctors']);
  }

  goToAppointments() {
    this.router.navigate(['/clinic/appointments']);
  }

  goToReports() {
    this.router.navigate(['/clinic/reports']);
  }

  goToMessages() {
    this.router.navigate(['/clinic/messages']);
  }
}
