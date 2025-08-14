import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-patient-dashboard',
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
            <span class="welcome">Welcome, {{ currentUser?.full_name }}</span>
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
          <h1>Patient Dashboard</h1>
          
          <!-- Quick Stats -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-calendar-check"></i>
              </div>
              <div class="stat-content">
                <h3>Appointments</h3>
                <p class="stat-number">3</p>
                <p class="stat-label">Upcoming</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-file-medical"></i>
              </div>
              <div class="stat-content">
                <h3>Medical Records</h3>
                <p class="stat-number">12</p>
                <p class="stat-label">Available</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-user-md"></i>
              </div>
              <div class="stat-content">
                <h3>Doctors</h3>
                <p class="stat-number">5</p>
                <p class="stat-label">Consulted</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-pills"></i>
              </div>
              <div class="stat-content">
                <h3>Prescriptions</h3>
                <p class="stat-number">8</p>
                <p class="stat-label">Active</p>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="activity-section">
            <h2>Recent Activity</h2>
            <div class="activity-list">
              <div class="activity-item">
                <div class="activity-icon">
                  <i class="fas fa-calendar-plus"></i>
                </div>
                <div class="activity-content">
                  <h4>Appointment Scheduled</h4>
                  <p>Dr. Smith - Cardiology - Tomorrow at 2:00 PM</p>
                  <span class="activity-time">2 hours ago</span>
                </div>
              </div>

              <div class="activity-item">
                <div class="activity-icon">
                  <i class="fas fa-file-medical"></i>
                </div>
                <div class="activity-content">
                  <h4>Medical Report Updated</h4>
                  <p>Blood test results are now available</p>
                  <span class="activity-time">1 day ago</span>
                </div>
              </div>

              <div class="activity-item">
                <div class="activity-icon">
                  <i class="fas fa-pills"></i>
                </div>
                <div class="activity-content">
                  <h4>Prescription Renewed</h4>
                  <p>Blood pressure medication renewed for 30 days</p>
                  <span class="activity-time">3 days ago</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="quick-actions">
            <h2>Quick Actions</h2>
            <div class="actions-grid">
              <button class="action-btn">
                <i class="fas fa-calendar-plus"></i>
                <span>Book Appointment</span>
              </button>
              <button class="action-btn">
                <i class="fas fa-file-medical"></i>
                <span>View Records</span>
              </button>
              <button class="action-btn">
                <i class="fas fa-comments"></i>
                <span>Message Doctor</span>
              </button>
              <button class="action-btn">
                <i class="fas fa-pills"></i>
                <span>Manage Prescriptions</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styleUrls: ['./patient-dashboard.component.scss']
})
export class PatientDashboardComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    // Redirect if not authenticated or not a patient
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    
    if (!this.authService.isPatient()) {
      this.router.navigate(['/doctor-dashboard']);
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
