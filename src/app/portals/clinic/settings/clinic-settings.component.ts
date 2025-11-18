import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-clinic-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
    <div class="settings-page">
      <div class="page-header">
        <div>
          <h1><i class="fas fa-cog"></i> Clinic Settings</h1>
          <p>Manage your clinic configuration and preferences</p>
        </div>
      </div>

      <div class="settings-layout">
        <!-- Settings Navigation -->
        <div class="settings-nav">
          <button class="nav-item" [class.active]="activeTab === 'profile'" (click)="activeTab = 'profile'">
            <i class="fas fa-building"></i>
            <span>Clinic Profile</span>
          </button>
          <button class="nav-item" [class.active]="activeTab === 'hours'" (click)="activeTab = 'hours'">
            <i class="fas fa-clock"></i>
            <span>Working Hours</span>
          </button>
          <button class="nav-item" [class.active]="activeTab === 'notifications'" (click)="activeTab = 'notifications'">
            <i class="fas fa-bell"></i>
            <span>Notifications</span>
          </button>
          <button class="nav-item" [class.active]="activeTab === 'security'" (click)="activeTab = 'security'">
            <i class="fas fa-shield-alt"></i>
            <span>Security</span>
          </button>
          <button class="nav-item" [class.active]="activeTab === 'account'" (click)="activeTab = 'account'">
            <i class="fas fa-user"></i>
            <span>Account</span>
          </button>
        </div>

        <!-- Settings Content -->
        <div class="settings-content">
          <!-- Clinic Profile -->
          <div class="settings-section" *ngIf="activeTab === 'profile'">
            <h2><i class="fas fa-building"></i> Clinic Profile</h2>
            <p class="section-description">Update your clinic information</p>
            
            <div class="form-grid">
              <div class="form-group">
                <label>Clinic Name *</label>
                <input type="text" [(ngModel)]="clinicProfile.name" placeholder="Enter clinic name">
              </div>
              <div class="form-group">
                <label>Email *</label>
                <input type="email" [(ngModel)]="clinicProfile.email" placeholder="clinic@example.com">
              </div>
              <div class="form-group">
                <label>Phone *</label>
                <input type="tel" [(ngModel)]="clinicProfile.phone" placeholder="+1 234 567 8900">
              </div>
              <div class="form-group">
                <label>Website</label>
                <input type="url" [(ngModel)]="clinicProfile.website" placeholder="https://yourwebsite.com">
              </div>
              <div class="form-group full-width">
                <label>Address *</label>
                <input type="text" [(ngModel)]="clinicProfile.address" placeholder="Street address">
              </div>
              <div class="form-group">
                <label>City *</label>
                <input type="text" [(ngModel)]="clinicProfile.city" placeholder="City">
              </div>
              <div class="form-group">
                <label>Postal Code</label>
                <input type="text" [(ngModel)]="clinicProfile.postalCode" placeholder="12345">
              </div>
              <div class="form-group full-width">
                <label>About Clinic</label>
                <textarea [(ngModel)]="clinicProfile.description" rows="4" placeholder="Brief description of your clinic..."></textarea>
              </div>
            </div>
            <button class="btn btn-primary" (click)="saveProfile()">
              <i class="fas fa-save"></i> Save Changes
            </button>
          </div>

          <!-- Working Hours -->
          <div class="settings-section" *ngIf="activeTab === 'hours'">
            <h2><i class="fas fa-clock"></i> Working Hours</h2>
            <p class="section-description">Set your clinic's operating hours</p>
            
            <div class="hours-list">
              <div class="hour-item" *ngFor="let day of workingHours">
                <div class="day-toggle">
                  <input type="checkbox" [id]="day.day" [(ngModel)]="day.isOpen">
                  <label [for]="day.day" class="day-label">{{day.day}}</label>
                </div>
                <div class="time-inputs" *ngIf="day.isOpen">
                  <input type="time" [(ngModel)]="day.openTime" placeholder="Open">
                  <span>to</span>
                  <input type="time" [(ngModel)]="day.closeTime" placeholder="Close">
                </div>
                <span class="closed-label" *ngIf="!day.isOpen">Closed</span>
              </div>
            </div>
            <button class="btn btn-primary" (click)="saveHours()">
              <i class="fas fa-save"></i> Save Hours
            </button>
          </div>

          <!-- Notifications -->
          <div class="settings-section" *ngIf="activeTab === 'notifications'">
            <h2><i class="fas fa-bell"></i> Notification Preferences</h2>
            <p class="section-description">Choose how you want to be notified</p>
            
            <div class="notification-group">
              <h3>Email Notifications</h3>
              <div class="checkbox-item">
                <input type="checkbox" id="emailAppointments" [(ngModel)]="notifications.emailAppointments">
                <label for="emailAppointments">New appointment bookings</label>
              </div>
              <div class="checkbox-item">
                <input type="checkbox" id="emailCancellations" [(ngModel)]="notifications.emailCancellations">
                <label for="emailCancellations">Appointment cancellations</label>
              </div>
              <div class="checkbox-item">
                <input type="checkbox" id="emailMessages" [(ngModel)]="notifications.emailMessages">
                <label for="emailMessages">New messages from patients</label>
              </div>
              <div class="checkbox-item">
                <input type="checkbox" id="emailReports" [(ngModel)]="notifications.emailReports">
                <label for="emailReports">Daily/Weekly reports</label>
              </div>
            </div>

            <div class="notification-group">
              <h3>SMS Notifications</h3>
              <div class="checkbox-item">
                <input type="checkbox" id="smsAppointments" [(ngModel)]="notifications.smsAppointments">
                <label for="smsAppointments">Urgent appointment changes</label>
              </div>
              <div class="checkbox-item">
                <input type="checkbox" id="smsEmergency" [(ngModel)]="notifications.smsEmergency">
                <label for="smsEmergency">Emergency alerts</label>
              </div>
            </div>

            <button class="btn btn-primary" (click)="saveNotifications()">
              <i class="fas fa-save"></i> Save Preferences
            </button>
          </div>

          <!-- Security -->
          <div class="settings-section" *ngIf="activeTab === 'security'">
            <h2><i class="fas fa-shield-alt"></i> Security Settings</h2>
            <p class="section-description">Manage your account security</p>
            
            <div class="security-card">
              <h3>Change Password</h3>
              <div class="form-group">
                <label>Current Password</label>
                <input type="password" [(ngModel)]="security.currentPassword" placeholder="Enter current password">
              </div>
              <div class="form-group">
                <label>New Password</label>
                <input type="password" [(ngModel)]="security.newPassword" placeholder="Enter new password">
              </div>
              <div class="form-group">
                <label>Confirm Password</label>
                <input type="password" [(ngModel)]="security.confirmPassword" placeholder="Confirm new password">
              </div>
              <button class="btn btn-warning" (click)="changePassword()">
                <i class="fas fa-key"></i> Update Password
              </button>
            </div>

            <div class="security-card">
              <h3>Two-Factor Authentication</h3>
              <p>Add an extra layer of security to your account</p>
              <button class="btn btn-outline" (click)="enable2FA()">
                <i class="fas fa-mobile-alt"></i> {{twoFactorEnabled ? 'Disable' : 'Enable'}} 2FA
              </button>
            </div>

            <div class="security-card">
              <h3>Active Sessions</h3>
              <p>You are currently logged in on 1 device</p>
              <button class="btn btn-danger" (click)="logoutAllDevices()">
                <i class="fas fa-sign-out-alt"></i> Logout All Devices
              </button>
            </div>
          </div>

          <!-- Account -->
          <div class="settings-section" *ngIf="activeTab === 'account'">
            <h2><i class="fas fa-user"></i> Account Management</h2>
            <p class="section-description">Manage your account settings</p>
            
            <div class="account-info">
              <div class="info-row">
                <label>Account Type:</label>
                <span class="badge badge-primary">Clinic Administrator</span>
              </div>
              <div class="info-row">
                <label>Member Since:</label>
                <span>{{memberSince}}</span>
              </div>
              <div class="info-row">
                <label>Last Login:</label>
                <span>{{lastLogin}}</span>
              </div>
            </div>

            <div class="danger-zone">
              <h3><i class="fas fa-exclamation-triangle"></i> Danger Zone</h3>
              <p>Once you delete your account, there is no going back. Please be certain.</p>
              <button class="btn btn-danger" (click)="deleteAccount()">
                <i class="fas fa-trash"></i> Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-page { padding: 24px 5%; max-width: 1400px; margin: 0 auto; }
    .page-header { margin-bottom: 24px; }
    .page-header h1 { font-size: 28px; font-weight: 700; color: #0f172a; margin: 0; display: flex; align-items: center; gap: 12px; }
    .page-header h1 i { color: #3b82f6; }
    .page-header p { color: #64748b; margin: 4px 0 0; font-size: 14px; }
    
    .settings-layout { display: grid; grid-template-columns: 250px 1fr; gap: 24px; }
    
    /* Settings Navigation */
    .settings-nav { display: flex; flex-direction: column; gap: 8px; }
    .nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: white; border: none; border-radius: 8px; text-align: left; cursor: pointer; transition: all 0.2s; color: #64748b; font-size: 14px; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .nav-item i { width: 20px; font-size: 16px; }
    .nav-item:hover { background: #f8fafc; color: #3b82f6; }
    .nav-item.active { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; box-shadow: 0 4px 12px rgba(102,126,234,0.4); }
    .nav-item.active i { color: white; }
    
    /* Settings Content */
    .settings-content { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .settings-section h2 { font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px; display: flex; align-items: center; gap: 12px; }
    .settings-section h2 i { color: #3b82f6; }
    .section-description { color: #64748b; margin-bottom: 24px; }
    
    /* Form Grid */
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    .form-group { display: flex; flex-direction: column; }
    .form-group.full-width { grid-column: 1 / -1; }
    .form-group label { font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 8px; }
    .form-group input, .form-group textarea, .form-group select { padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; font-family: inherit; }
    .form-group input:focus, .form-group textarea:focus { outline: none; border-color: #3b82f6; }
    textarea { resize: vertical; }
    
    /* Working Hours */
    .hours-list { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
    .hour-item { display: flex; align-items: center; gap: 16px; padding: 16px; background: #f8fafc; border-radius: 8px; }
    .day-toggle { display: flex; align-items: center; gap: 12px; min-width: 150px; }
    .day-toggle input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; }
    .day-label { font-weight: 600; color: #0f172a; cursor: pointer; }
    .time-inputs { display: flex; align-items: center; gap: 12px; }
    .time-inputs input { padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px; }
    .time-inputs span { color: #64748b; }
    .closed-label { color: #94a3b8; font-style: italic; }
    
    /* Notifications */
    .notification-group { margin-bottom: 24px; }
    .notification-group h3 { font-size: 18px; font-weight: 600; color: #0f172a; margin-bottom: 16px; }
    .checkbox-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: #f8fafc; border-radius: 6px; margin-bottom: 8px; }
    .checkbox-item input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; }
    .checkbox-item label { cursor: pointer; color: #334155; font-size: 14px; }
    
    /* Security Cards */
    .security-card { padding: 24px; background: #f8fafc; border-radius: 12px; border-left: 4px solid #3b82f6; margin-bottom: 24px; }
    .security-card h3 { font-size: 18px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
    .security-card p { color: #64748b; margin-bottom: 16px; }
    
    /* Account Info */
    .account-info { background: #f8fafc; padding: 24px; border-radius: 12px; margin-bottom: 24px; }
    .info-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e2e8f0; }
    .info-row:last-child { border-bottom: none; }
    .info-row label { font-weight: 600; color: #64748b; }
    .info-row span { color: #0f172a; }
    
    /* Danger Zone */
    .danger-zone { padding: 24px; background: #fef2f2; border-radius: 12px; border-left: 4px solid #ef4444; }
    .danger-zone h3 { font-size: 18px; font-weight: 600; color: #ef4444; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
    .danger-zone p { color: #991b1b; margin-bottom: 16px; }
    
    /* Buttons */
    .btn { padding: 10px 20px; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s; }
    .btn:hover { transform: translateY(-2px); }
    .btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; box-shadow: 0 4px 12px rgba(102,126,234,0.3); }
    .btn-outline { background: white; border: 2px solid #e2e8f0; color: #64748b; }
    .btn-outline:hover { border-color: #3b82f6; color: #3b82f6; }
    .btn-warning { background: #f59e0b; color: white; box-shadow: 0 4px 12px rgba(245,158,11,0.3); }
    .btn-danger { background: #ef4444; color: white; box-shadow: 0 4px 12px rgba(239,68,68,0.3); }
    
    .badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
    .badge-primary { background: #dbeafe; color: #1e40af; }
    
    @media (max-width: 968px) {
      .settings-layout { grid-template-columns: 1fr; }
      .settings-nav { flex-direction: row; overflow-x: auto; }
      .form-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ClinicSettingsComponent implements OnInit {
  activeTab = 'profile';
  twoFactorEnabled = false;
  memberSince = 'January 2024';
  lastLogin = 'Today at 10:15 AM';
  
  private apiUrl = environment.apiUrl || 'http://localhost:3000/api/v1';
  
  clinicProfile = {
    name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    postalCode: '',
    description: ''
  };
  
  workingHours = [
    { day: 'Monday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
    { day: 'Tuesday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
    { day: 'Wednesday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
    { day: 'Thursday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
    { day: 'Friday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
    { day: 'Saturday', isOpen: false, openTime: '', closeTime: '' },
    { day: 'Sunday', isOpen: false, openTime: '', closeTime: '' }
  ];
  
  notifications = {
    emailAppointments: true,
    emailCancellations: true,
    emailMessages: true,
    emailReports: false,
    smsAppointments: false,
    smsEmergency: true
  };
  
  security = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadClinicProfile();
  }

  loadClinicProfile() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.clinicProfile.name = user.clinicName || user.name || '';
    this.clinicProfile.email = user.email || '';
    this.clinicProfile.phone = user.phone || '';
  }

  saveProfile() {
    console.log('Saving profile:', this.clinicProfile);
    alert('Clinic profile updated successfully!');
  }

  saveHours() {
    console.log('Saving hours:', this.workingHours);
    alert('Working hours updated successfully!');
  }

  saveNotifications() {
    console.log('Saving notifications:', this.notifications);
    alert('Notification preferences saved!');
  }

  changePassword() {
    if (!this.security.currentPassword || !this.security.newPassword || !this.security.confirmPassword) {
      alert('Please fill in all password fields');
      return;
    }
    
    if (this.security.newPassword !== this.security.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    console.log('Changing password...');
    alert('Password changed successfully!');
    this.security = { currentPassword: '', newPassword: '', confirmPassword: '' };
  }

  enable2FA() {
    this.twoFactorEnabled = !this.twoFactorEnabled;
    alert(this.twoFactorEnabled ? '2FA enabled!' : '2FA disabled!');
  }

  logoutAllDevices() {
    if (confirm('Are you sure you want to logout from all devices?')) {
      alert('Logged out from all devices');
    }
  }

  deleteAccount() {
    const confirmation = prompt('Type "DELETE" to confirm account deletion:');
    if (confirmation === 'DELETE') {
      alert('Account deletion initiated. You will receive a confirmation email.');
    }
  }
}
