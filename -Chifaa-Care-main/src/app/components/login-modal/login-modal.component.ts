import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" [class.active]="isOpen" (click)="onCloseModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <!-- Close Button -->
        <button class="modal-close" (click)="onCloseModal()">
          <i class="fas fa-times"></i>
        </button>

        <!-- Modal Header -->
        <div class="modal-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your ChifaaCare account</p>
        </div>

        <!-- Role Tabs -->
        <div class="role-tabs">
          <button 
            class="tab-btn" 
            [class.active]="selectedRole === 'patient'"
            (click)="selectRole('patient')">
            <i class="fas fa-user"></i>
            Patient
          </button>
          <button 
            class="tab-btn" 
            [class.active]="selectedRole === 'doctor'"
            (click)="selectRole('doctor')">
            <i class="fas fa-user-md"></i>
            Doctor
          </button>
        </div>

        <!-- Login Form -->
        <form class="login-form" (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email"
              [(ngModel)]="loginData.email"
              required
              placeholder="Enter your email">
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password"
              [(ngModel)]="loginData.password"
              required
              placeholder="Enter your password">
          </div>

          <div class="form-actions">
            <button type="submit" class="submit-btn" [disabled]="!loginForm.valid">
              <i class="fas fa-sign-in-alt"></i>
              Sign In
            </button>
          </div>
        </form>

        <!-- Success Message -->
        <div class="success-message" *ngIf="showSuccess">
          <i class="fas fa-check-circle"></i>
          <h3>Welcome back, {{ selectedRole }}!</h3>
          <p>You have successfully signed in to ChifaaCare.</p>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./login-modal.component.scss']
})
export class LoginModalComponent implements OnInit {
  @Input() isOpen = false;
  @Output() closeModalEvent = new EventEmitter<void>();

  selectedRole: 'patient' | 'doctor' = 'patient';
  loginData = {
    email: '',
    password: ''
  };
  showSuccess = false;

  ngOnInit() {
    if (this.isOpen) {
      this.resetForm();
    }
  }

  onCloseModal() {
    this.closeModalEvent.emit();
  }

  selectRole(role: 'patient' | 'doctor') {
    this.selectedRole = role;
  }

  onSubmit() {
    if (this.loginData.email && this.loginData.password) {
      this.showSuccess = true;
      setTimeout(() => {
        this.showSuccess = false;
        this.onCloseModal();
        this.resetForm();
      }, 3000);
    }
  }

  resetForm() {
    this.loginData = {
      email: '',
      password: ''
    };
    this.showSuccess = false;
    this.selectedRole = 'patient';
  }
} 