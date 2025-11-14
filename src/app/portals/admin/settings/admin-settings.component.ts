import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface SystemSetting {
  key: string;
  value: string | boolean | number;
  label: string;
  description: string;
  type: 'text' | 'boolean' | 'number' | 'select';
  options?: string[];
}

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-settings">
      <div class="header">
        <div class="title-section">
          <h2>⚙️ System Settings</h2>
          <p>Configure system-wide settings and preferences</p>
        </div>
        <button class="btn-primary" (click)="saveAllSettings()">
          💾 Save All Changes
        </button>
      </div>

      <!-- Settings Tabs -->
      <div class="settings-tabs">
        <button 
          class="tab-button" 
          [class.active]="activeTab === 'general'"
          (click)="activeTab = 'general'"
        >
          🏠 General
        </button>
        <button 
          class="tab-button" 
          [class.active]="activeTab === 'appointment'"
          (click)="activeTab = 'appointment'"
        >
          📅 Appointments
        </button>
        <button 
          class="tab-button" 
          [class.active]="activeTab === 'notifications'"
          (click)="activeTab = 'notifications'"
        >
          🔔 Notifications
        </button>
        <button 
          class="tab-button" 
          [class.active]="activeTab === 'security'"
          (click)="activeTab = 'security'"
        >
          🔒 Security
        </button>
        <button 
          class="tab-button" 
          [class.active]="activeTab === 'integrations'"
          (click)="activeTab = 'integrations'"
        >
          🔗 Integrations
        </button>
      </div>

      <!-- General Settings -->
      <div class="settings-section" *ngIf="activeTab === 'general'">
        <h3>🏠 General Settings</h3>
        <div class="settings-grid">
          <div class="setting-item">
            <div class="setting-header">
              <label>System Name</label>
              <small>The name displayed across the platform</small>
            </div>
            <input type="text" [(ngModel)]="generalSettings.systemName" />
          </div>

          <div class="setting-item">
            <div class="setting-header">
              <label>Support Email</label>
              <small>Primary contact for support inquiries</small>
            </div>
            <input type="email" [(ngModel)]="generalSettings.supportEmail" />
          </div>

          <div class="setting-item">
            <div class="setting-header">
              <label>Timezone</label>
              <small>Default timezone for the system</small>
            </div>
            <select [(ngModel)]="generalSettings.timezone">
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
            </select>
          </div>

          <div class="setting-item">
            <div class="setting-header">
              <label>Language</label>
              <small>Default system language</small>
            </div>
            <select [(ngModel)]="generalSettings.language">
              <option value="en">English</option>
              <option value="fr">French</option>
              <option value="es">Spanish</option>
              <option value="ar">Arabic</option>
            </select>
          </div>

          <div class="setting-item toggle">
            <div class="setting-header">
              <label>Maintenance Mode</label>
              <small>Enable to restrict access for maintenance</small>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" [(ngModel)]="generalSettings.maintenanceMode" />
              <span class="slider"></span>
            </label>
          </div>

          <div class="setting-item toggle">
            <div class="setting-header">
              <label>Allow New Registrations</label>
              <small>Permit new user registrations</small>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" [(ngModel)]="generalSettings.allowRegistrations" />
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- Appointment Settings -->
      <div class="settings-section" *ngIf="activeTab === 'appointment'">
        <h3>📅 Appointment Settings</h3>
        <div class="settings-grid">
          <div class="setting-item">
            <div class="setting-header">
              <label>Booking Window (Days)</label>
              <small>How far in advance can appointments be booked</small>
            </div>
            <input type="number" [(ngModel)]="appointmentSettings.bookingWindow" min="1" max="365" />
          </div>

          <div class="setting-item">
            <div class="setting-header">
              <label>Slot Duration (Minutes)</label>
              <small>Default appointment duration</small>
            </div>
            <select [(ngModel)]="appointmentSettings.slotDuration">
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
            </select>
          </div>

          <div class="setting-item">
            <div class="setting-header">
              <label>Buffer Time (Minutes)</label>
              <small>Time between appointments</small>
            </div>
            <input type="number" [(ngModel)]="appointmentSettings.bufferTime" min="0" max="60" />
          </div>

          <div class="setting-item">
            <div class="setting-header">
              <label>Cancellation Window (Hours)</label>
              <small>Minimum notice required for cancellation</small>
            </div>
            <input type="number" [(ngModel)]="appointmentSettings.cancellationWindow" min="1" max="72" />
          </div>

          <div class="setting-item toggle">
            <div class="setting-header">
              <label>Auto-Confirm Appointments</label>
              <small>Automatically confirm new bookings</small>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" [(ngModel)]="appointmentSettings.autoConfirm" />
              <span class="slider"></span>
            </label>
          </div>

          <div class="setting-item toggle">
            <div class="setting-header">
              <label>Send Reminders</label>
              <small>Send appointment reminders to patients</small>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" [(ngModel)]="appointmentSettings.sendReminders" />
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- Notification Settings -->
      <div class="settings-section" *ngIf="activeTab === 'notifications'">
        <h3>🔔 Notification Settings</h3>
        <div class="settings-grid">
          <div class="setting-item toggle">
            <div class="setting-header">
              <label>Email Notifications</label>
              <small>Send notifications via email</small>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" [(ngModel)]="notificationSettings.emailEnabled" />
              <span class="slider"></span>
            </label>
          </div>

          <div class="setting-item toggle">
            <div class="setting-header">
              <label>SMS Notifications</label>
              <small>Send notifications via SMS</small>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" [(ngModel)]="notificationSettings.smsEnabled" />
              <span class="slider"></span>
            </label>
          </div>

          <div class="setting-item toggle">
            <div class="setting-header">
              <label>Push Notifications</label>
              <small>Send push notifications to mobile apps</small>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" [(ngModel)]="notificationSettings.pushEnabled" />
              <span class="slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-header">
              <label>Notification Frequency</label>
              <small>How often to send notifications</small>
            </div>
            <select [(ngModel)]="notificationSettings.frequency">
              <option value="immediate">Immediate</option>
              <option value="hourly">Hourly Digest</option>
              <option value="daily">Daily Digest</option>
            </select>
          </div>

          <div class="setting-item toggle">
            <div class="setting-header">
              <label>Appointment Confirmations</label>
              <small>Notify when appointments are confirmed</small>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" [(ngModel)]="notificationSettings.appointmentConfirmations" />
              <span class="slider"></span>
            </label>
          </div>

          <div class="setting-item toggle">
            <div class="setting-header">
              <label>Appointment Reminders</label>
              <small>Send reminders before appointments</small>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" [(ngModel)]="notificationSettings.appointmentReminders" />
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- Security Settings -->
      <div class="settings-section" *ngIf="activeTab === 'security'">
        <h3>🔒 Security Settings</h3>
        <div class="settings-grid">
          <div class="setting-item">
            <div class="setting-header">
              <label>Password Min Length</label>
              <small>Minimum characters required for passwords</small>
            </div>
            <input type="number" [(ngModel)]="securitySettings.passwordMinLength" min="8" max="32" />
          </div>

          <div class="setting-item">
            <div class="setting-header">
              <label>Session Timeout (Minutes)</label>
              <small>Auto logout after inactivity</small>
            </div>
            <input type="number" [(ngModel)]="securitySettings.sessionTimeout" min="5" max="1440" />
          </div>

          <div class="setting-item">
            <div class="setting-header">
              <label>Max Login Attempts</label>
              <small>Before account lockout</small>
            </div>
            <input type="number" [(ngModel)]="securitySettings.maxLoginAttempts" min="3" max="10" />
          </div>

          <div class="setting-item">
            <div class="setting-header">
              <label>Lockout Duration (Minutes)</label>
              <small>Account lockout period after max attempts</small>
            </div>
            <input type="number" [(ngModel)]="securitySettings.lockoutDuration" min="5" max="120" />
          </div>

          <div class="setting-item toggle">
            <div class="setting-header">
              <label>Two-Factor Authentication</label>
              <small>Require 2FA for all users</small>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" [(ngModel)]="securitySettings.require2FA" />
              <span class="slider"></span>
            </label>
          </div>

          <div class="setting-item toggle">
            <div class="setting-header">
              <label>Password Expiry</label>
              <small>Require password changes periodically</small>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" [(ngModel)]="securitySettings.passwordExpiry" />
              <span class="slider"></span>
            </label>
          </div>

          <div class="setting-item toggle">
            <div class="setting-header">
              <label>Login Notification</label>
              <small>Notify users of new login activities</small>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" [(ngModel)]="securitySettings.loginNotification" />
              <span class="slider"></span>
            </label>
          </div>

          <div class="setting-item toggle">
            <div class="setting-header">
              <label>IP Whitelist</label>
              <small>Restrict access to specific IP addresses</small>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" [(ngModel)]="securitySettings.ipWhitelist" />
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- Integration Settings -->
      <div class="settings-section" *ngIf="activeTab === 'integrations'">
        <h3>🔗 Integration Settings</h3>
        
        <div class="integration-card">
          <div class="integration-header">
            <div class="integration-info">
              <h4>📧 Email Service</h4>
              <p>Configure SMTP settings for email delivery</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" [(ngModel)]="integrations.email.enabled" />
              <span class="slider"></span>
            </label>
          </div>
          <div class="integration-details" *ngIf="integrations.email.enabled">
            <div class="settings-grid">
              <div class="setting-item">
                <label>SMTP Host</label>
                <input type="text" [(ngModel)]="integrations.email.host" placeholder="smtp.example.com" />
              </div>
              <div class="setting-item">
                <label>SMTP Port</label>
                <input type="number" [(ngModel)]="integrations.email.port" placeholder="587" />
              </div>
              <div class="setting-item">
                <label>Username</label>
                <input type="text" [(ngModel)]="integrations.email.username" />
              </div>
              <div class="setting-item">
                <label>Password</label>
                <input type="password" [(ngModel)]="integrations.email.password" />
              </div>
            </div>
          </div>
        </div>

        <div class="integration-card">
          <div class="integration-header">
            <div class="integration-info">
              <h4>💳 Payment Gateway</h4>
              <p>Configure Stripe payment processing</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" [(ngModel)]="integrations.payment.enabled" />
              <span class="slider"></span>
            </label>
          </div>
          <div class="integration-details" *ngIf="integrations.payment.enabled">
            <div class="settings-grid">
              <div class="setting-item">
                <label>Publishable Key</label>
                <input type="text" [(ngModel)]="integrations.payment.publishableKey" placeholder="pk_..." />
              </div>
              <div class="setting-item">
                <label>Secret Key</label>
                <input type="password" [(ngModel)]="integrations.payment.secretKey" placeholder="sk_..." />
              </div>
            </div>
          </div>
        </div>

        <div class="integration-card">
          <div class="integration-header">
            <div class="integration-info">
              <h4>📱 SMS Service</h4>
              <p>Configure Twilio for SMS notifications</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" [(ngModel)]="integrations.sms.enabled" />
              <span class="slider"></span>
            </label>
          </div>
          <div class="integration-details" *ngIf="integrations.sms.enabled">
            <div class="settings-grid">
              <div class="setting-item">
                <label>Account SID</label>
                <input type="text" [(ngModel)]="integrations.sms.accountSid" />
              </div>
              <div class="setting-item">
                <label>Auth Token</label>
                <input type="password" [(ngModel)]="integrations.sms.authToken" />
              </div>
              <div class="setting-item">
                <label>Phone Number</label>
                <input type="text" [(ngModel)]="integrations.sms.phoneNumber" placeholder="+1234567890" />
              </div>
            </div>
          </div>
        </div>

        <div class="integration-card">
          <div class="integration-header">
            <div class="integration-info">
              <h4>📅 Google Calendar</h4>
              <p>Sync appointments with Google Calendar</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" [(ngModel)]="integrations.calendar.enabled" />
              <span class="slider"></span>
            </label>
          </div>
          <div class="integration-details" *ngIf="integrations.calendar.enabled">
            <div class="settings-grid">
              <div class="setting-item">
                <label>API Key</label>
                <input type="text" [(ngModel)]="integrations.calendar.apiKey" />
              </div>
              <div class="setting-item">
                <label>Calendar ID</label>
                <input type="text" [(ngModel)]="integrations.calendar.calendarId" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Save Status -->
      <div class="save-status" *ngIf="saveStatus">
        <div class="status-message" [class.success]="saveStatus === 'success'" [class.error]="saveStatus === 'error'">
          {{ saveStatus === 'success' ? '✅ Settings saved successfully!' : '❌ Failed to save settings' }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-settings {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }

    .title-section h2 {
      margin: 0;
      font-size: 28px;
      color: #1a1a1a;
    }

    .title-section p {
      margin: 4px 0 0 0;
      color: #666;
      font-size: 14px;
    }

    .btn-primary {
      padding: 12px 24px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-primary:hover {
      background: #45a049;
      transform: translateY(-2px);
    }

    .settings-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
      border-bottom: 2px solid #e0e0e0;
      overflow-x: auto;
    }

    .tab-button {
      padding: 12px 20px;
      background: none;
      border: none;
      border-bottom: 3px solid transparent;
      color: #666;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      white-space: nowrap;
    }

    .tab-button:hover {
      color: #333;
      background: #f9f9f9;
    }

    .tab-button.active {
      color: #4CAF50;
      border-bottom-color: #4CAF50;
    }

    .settings-section {
      background: white;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      animation: fadeIn 0.3s;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .settings-section h3 {
      margin: 0 0 24px 0;
      font-size: 22px;
      color: #333;
      padding-bottom: 16px;
      border-bottom: 2px solid #f0f0f0;
    }

    .settings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }

    .setting-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .setting-item.toggle {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }

    .setting-header {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .setting-header label {
      font-weight: 600;
      font-size: 14px;
      color: #333;
    }

    .setting-header small {
      font-size: 12px;
      color: #999;
    }

    .setting-item input[type="text"],
    .setting-item input[type="email"],
    .setting-item input[type="number"],
    .setting-item input[type="password"],
    .setting-item select {
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.3s;
    }

    .setting-item input:focus,
    .setting-item select:focus {
      outline: none;
      border-color: #4CAF50;
    }

    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 52px;
      height: 28px;
    }

    .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: 0.4s;
      border-radius: 28px;
    }

    .slider:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: 0.4s;
      border-radius: 50%;
    }

    input:checked + .slider {
      background-color: #4CAF50;
    }

    input:checked + .slider:before {
      transform: translateX(24px);
    }

    .integration-card {
      background: #f9f9f9;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 16px;
    }

    .integration-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .integration-info h4 {
      margin: 0 0 4px 0;
      font-size: 16px;
      color: #333;
    }

    .integration-info p {
      margin: 0;
      font-size: 13px;
      color: #666;
    }

    .integration-details {
      padding-top: 16px;
      border-top: 2px solid #e0e0e0;
      animation: slideDown 0.3s;
    }

    @keyframes slideDown {
      from { opacity: 0; max-height: 0; }
      to { opacity: 1; max-height: 500px; }
    }

    .save-status {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 1000;
      animation: slideUp 0.3s;
    }

    .status-message {
      padding: 16px 24px;
      border-radius: 8px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .status-message.success {
      background: #4CAF50;
      color: white;
    }

    .status-message.error {
      background: #f44336;
      color: white;
    }

    @keyframes slideUp {
      from { transform: translateY(100px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `]
})
export class AdminSettingsComponent implements OnInit {
  activeTab = 'general';
  saveStatus: 'success' | 'error' | null = null;

  generalSettings = {
    systemName: 'Chifaa Care',
    supportEmail: 'support@chifaacare.com',
    timezone: 'UTC',
    language: 'en',
    maintenanceMode: false,
    allowRegistrations: true
  };

  appointmentSettings = {
    bookingWindow: 90,
    slotDuration: 30,
    bufferTime: 10,
    cancellationWindow: 24,
    autoConfirm: false,
    sendReminders: true
  };

  notificationSettings = {
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    frequency: 'immediate',
    appointmentConfirmations: true,
    appointmentReminders: true
  };

  securitySettings = {
    passwordMinLength: 8,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    lockoutDuration: 30,
    require2FA: false,
    passwordExpiry: false,
    loginNotification: true,
    ipWhitelist: false
  };

  integrations = {
    email: {
      enabled: false,
      host: '',
      port: 587,
      username: '',
      password: ''
    },
    payment: {
      enabled: false,
      publishableKey: '',
      secretKey: ''
    },
    sms: {
      enabled: false,
      accountSid: '',
      authToken: '',
      phoneNumber: ''
    },
    calendar: {
      enabled: false,
      apiKey: '',
      calendarId: ''
    }
  };

  ngOnInit() {
    console.log('Settings component initialized');
  }

  saveAllSettings() {
    console.log('Saving all settings...');
    console.log('General:', this.generalSettings);
    console.log('Appointment:', this.appointmentSettings);
    console.log('Notification:', this.notificationSettings);
    console.log('Security:', this.securitySettings);
    console.log('Integrations:', this.integrations);
    
    this.saveStatus = 'success';
    setTimeout(() => {
      this.saveStatus = null;
    }, 3000);
  }
}
