import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <!-- Header -->
      <header class="dashboard-header">
        <div class="header-content">
          <div class="logo">
            <i class="fas fa-heartbeat"></i>
            <span>ChifaaCare</span>
          </div>
          <div class="user-info">
            <span class="welcome">Welcome, Dr. {{ currentUser?.full_name }}</span>
            <span class="specialty">{{ currentUser?.specialty }}</span>
            <button class="logout-btn" (click)="logout()">
              <i class="fas fa-sign-out-alt"></i>
              Logout
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="dashboard-main">
        <div class="dashboard-content">
          <h1>Doctor Dashboard</h1>
          
          <!-- Quick Stats -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-calendar-check"></i>
              </div>
              <div class="stat-content">
                <h3>Today's Appointments</h3>
                <p class="stat-number">8</p>
                <p class="stat-label">Scheduled</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-users"></i>
              </div>
              <div class="stat-content">
                <h3>Total Patients</h3>
                <p class="stat-number">156</p>
                <p class="stat-label">Under Care</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-clock"></i>
              </div>
              <div class="stat-content">
                <h3>Pending Reports</h3>
                <p class="stat-number">12</p>
                <p class="stat-label">To Review</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-bell"></i>
              </div>
              <div class="stat-content">
                <h3>Notifications</h3>
                <p class="stat-number">5</p>
                <p class="stat-label">Unread</p>
              </div>
            </div>
          </div>

          <!-- Today's Schedule -->
          <div class="schedule-section">
            <h2>Today's Schedule</h2>
            <div class="schedule-list">
              <div class="schedule-item">
                <div class="time-slot">09:00 AM</div>
                <div class="appointment-info">
                  <h4>John Doe - Follow-up</h4>
                  <p>Blood pressure check, medication review</p>
                  <span class="appointment-type">In-person</span>
                </div>
                <div class="appointment-actions">
                  <button class="action-btn small">Start</button>
                  <button class="action-btn small secondary">Reschedule</button>
                </div>
              </div>

              <div class="schedule-item">
                <div class="time-slot">10:30 AM</div>
                <div class="appointment-info">
                  <h4>Jane Smith - New Patient</h4>
                  <p>Initial consultation, medical history review</p>
                  <span class="appointment-type">Virtual</span>
                </div>
                <div class="appointment-actions">
                  <button class="action-btn small">Join</button>
                  <button class="action-btn small secondary">Reschedule</button>
                </div>
              </div>

              <div class="schedule-item">
                <div class="time-slot">02:00 PM</div>
                <div class="appointment-info">
                  <h4>Mike Johnson - Consultation</h4>
                  <p>Lab results review, treatment plan discussion</p>
                  <span class="appointment-type">In-person</span>
                </div>
                <div class="appointment-actions">
                  <button class="action-btn small">Start</button>
                  <button class="action-btn small secondary">Reschedule</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Patients -->
          <div class="patients-section">
            <h2>Recent Patients</h2>
            <div class="patients-grid">
              <div class="patient-card">
                <div class="patient-avatar">
                  <i class="fas fa-user"></i>
                </div>
                <div class="patient-info">
                  <h4>Sarah Wilson</h4>
                  <p>Last visit: 2 days ago</p>
                  <span class="patient-status active">Active</span>
                </div>
                <button class="view-btn">View</button>
              </div>

              <div class="patient-card">
                <div class="patient-avatar">
                  <i class="fas fa-user"></i>
                </div>
                <div class="patient-info">
                  <h4>Robert Brown</h4>
                  <p>Last visit: 1 week ago</p>
                  <span class="patient-status follow-up">Follow-up</span>
                </div>
                <button class="view-btn">View</button>
              </div>

              <div class="patient-card">
                <div class="patient-avatar">
                  <i class="fas fa-user"></i>
                </div>
                <div class="patient-info">
                  <h4>Emily Davis</h4>
                  <p>Last visit: 2 weeks ago</p>
                  <span class="patient-status stable">Stable</span>
                </div>
                <button class="view-btn">View</button>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="quick-actions">
            <h2>Quick Actions</h2>
            <div class="actions-grid">
              <button class="action-btn">
                <i class="fas fa-calendar-plus"></i>
                <span>Schedule Appointment</span>
              </button>
              <button class="action-btn">
                <i class="fas fa-file-medical"></i>
                <span>Review Reports</span>
              </button>
              <button class="action-btn">
                <i class="fas fa-pills"></i>
                <span>Write Prescription</span>
              </button>
              <button class="action-btn">
                <i class="fas fa-chart-line"></i>
                <span>Patient Analytics</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styleUrls: ['./doctor-dashboard.component.scss']
})
export class DoctorDashboardComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    // Redirect if not authenticated or not a doctor
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    
    if (!this.authService.isDoctor()) {
      this.router.navigate(['/patient-dashboard']);
      return;
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        this.router.navigate(['/login']);
      }
    });
  }
}
