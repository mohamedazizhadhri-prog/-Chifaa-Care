import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService, Doctor } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment';

interface Appointment {
  id: string;
  appointmentDate: string;
  endTime: string;
  reason: string;
  notes?: string;
  status: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
}

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <!-- Welcome Section -->
      <div class="welcome-section">
        <h1>Welcome, Dr. {{ getDoctorName() }}</h1>
        <p class="subtitle">Here is your overview for today.</p>
      </div>

      <!-- Main Dashboard Grid -->
      <div class="dashboard-grid">
        <!-- Left Column -->
        <div class="left-column">
          <!-- Schedule -->
          <div class="card">
            <div class="card-header">Today's Schedule (Accepted Patients Only)</div>
            <div class="schedule-list" *ngIf="todayAppointments.length > 0">
              <div class="schedule-item" *ngFor="let appointment of todayAppointments">
                <span class="time-badge green">{{ formatTime(appointment.appointmentDate) }}</span>
                <div class="schedule-info">
                  <strong>{{ appointment.patient.firstName }} {{ appointment.patient.lastName }}</strong>
                  <span class="description">{{ appointment.reason }}</span>
                </div>
              </div>
            </div>
            <div class="empty-state" *ngIf="todayAppointments.length === 0">
              <p>No confirmed appointments for today</p>
            </div>
          </div>

          <!-- Patient Queue -->
          <div class="card">
            <div class="card-header">Patient Queue</div>
            <div class="queue-grid" *ngIf="todayAppointments.length > 0">
              <div class="queue-item" *ngFor="let appointment of todayAppointments">
                <strong>{{ appointment.patient.firstName }} {{ appointment.patient.lastName }}</strong>
                <div class="queue-details">{{ formatTime(appointment.appointmentDate) }}</div>
              </div>
            </div>
            <div class="empty-state" *ngIf="todayAppointments.length === 0">
              <p>No patients in queue</p>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="right-column">
          <!-- Patient Alerts -->
          <div class="card">
            <div class="card-header">Patient Alerts</div>
            <div class="alerts-list">
              <div class="alert-item">
                <span class="alert-badge urgent">Urgent</span>
                <span class="alert-text">ECG anomaly detected on J. Baker</span>
              </div>
              <div class="alert-item">
                <span class="alert-badge watch">Watch</span>
                <span class="alert-text">Rising glucose trend for S. Lee</span>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="card">
            <div class="card-header">Quick Actions</div>
            <div class="actions-grid">
              <button class="action-btn primary">
                <i class="fa-solid fa-video"></i>
                Start Consultation
              </button>
              <button class="action-btn success">
                <i class="fa-solid fa-prescription"></i>
                New Plan
              </button>
              <button class="action-btn primary" (click)="goToMessages()">
                <i class="fa-solid fa-comments"></i>
                Messages
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Care Insights -->
      <div class="card insights-card">
        <div class="card-header">Care Insights</div>
        <div class="insights-placeholder"></div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 0;
      max-width: 100%;
    }
    
    .welcome-section {
      margin-bottom: 24px;
    }
    
    .welcome-section h1 {
      font-size: 1.8rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 4px 0;
    }
    
    .subtitle {
      color: #6b7280;
      margin: 0;
      font-size: 1rem;
    }
    
    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 24px;
    }
    
    .left-column, .right-column {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border: 1px solid #e5e7eb;
    }
    
    .card-header {
      font-size: 1.1rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid #f3f4f6;
    }
    
    .schedule-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .schedule-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
    }
    
    .time-badge {
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 600;
      min-width: 50px;
      text-align: center;
    }
    
    .time-badge.green {
      background: #dcfce7;
      color: #166534;
    }
    
    .time-badge.yellow {
      background: #fef3c7;
      color: #92400e;
    }
    
    .schedule-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    
    .description {
      color: #6b7280;
      font-size: 0.9rem;
    }
    
    .queue-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    
    .queue-item {
      background: #f8fafc;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    
    .queue-details {
      color: #64748b;
      font-size: 0.9rem;
      margin-top: 4px;
    }
    
    .alerts-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .alert-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 8px 0;
    }
    
    .alert-badge {
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      flex-shrink: 0;
    }
    
    .alert-badge.urgent {
      background: #fee2e2;
      color: #dc2626;
    }
    
    .alert-badge.watch {
      background: #fef3c7;
      color: #d97706;
    }
    
    .alert-text {
      font-size: 0.9rem;
      color: #374151;
      line-height: 1.4;
    }
    
    .actions-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .action-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.9rem;
    }
    
    .action-btn.primary {
      background: #3b82f6;
      color: white;
    }
    
    .action-btn.primary:hover {
      background: #2563eb;
    }
    
    .action-btn.success {
      background: #10b981;
      color: white;
    }
    
    .action-btn.success:hover {
      background: #059669;
    }
    
    .insights-card {
      grid-column: span 2;
    }
    
    .insights-placeholder {
      height: 160px;
      background: linear-gradient(135deg, #e0f2fe 0%, #e8f5e8 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      font-style: italic;
    }
    
    .insights-placeholder::before {
      content: "Analytics dashboard coming soon...";
    }
    
    .empty-state {
      text-align: center;
      padding: 32px 16px;
      color: #9ca3af;
    }
    
    .empty-state p {
      margin: 0;
      font-size: 0.95rem;
    }
    
    @media (max-width: 768px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
      
      .queue-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DoctorDashboardComponent implements OnInit {
  currentUser: any = null;
  todayAppointments: Appointment[] = [];
  loading: boolean = true;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.loadTodayAppointments();
  }

  loadTodayAppointments(): void {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    this.http.get<any>(`${environment.apiUrl}/appointments`, {
      headers,
      params: {
        status: 'CONFIRMED',
        startDate: startOfDay,
        endDate: endOfDay
      }
    }).subscribe({
      next: (response) => {
        this.todayAppointments = response.data.appointments || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading today\'s appointments:', error);
        this.todayAppointments = [];
        this.loading = false;
      }
    });
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  }

  goToMessages(): void {
    this.router.navigate(['/doctor/messages']);
  }

  getDoctorName(): string {
    if (!this.currentUser) return '';
    
    // Try to get firstName from the user object
    if (this.currentUser.firstName) {
      return this.capitalizeFirstLetter(this.currentUser.firstName);
    }
    
    // Try to get the first part of the name field
    if (this.currentUser.name && !this.currentUser.name.includes('@')) {
      const firstName = this.currentUser.name.split(' ')[0];
      return this.capitalizeFirstLetter(firstName);
    }
    
    // If all else fails, use the email username
    if (this.currentUser.email) {
      const emailUsername = this.currentUser.email.split('@')[0];
      return this.capitalizeFirstLetter(emailUsername);
    }
    
    return 'Doctor';
  }

  private capitalizeFirstLetter(word: string): string {
    if (!word) return '';
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }
}
