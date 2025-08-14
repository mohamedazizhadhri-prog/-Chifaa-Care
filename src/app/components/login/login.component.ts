import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your ChifaaCare account</p>
        </div>

        <!-- Role Selection -->
        <div class="role-tabs">
          <button 
            class="tab-btn" 
            [class.active]="selectedRole === 'PATIENT'"
            (click)="selectRole('PATIENT')">
            <i class="fas fa-user"></i>
            Patient
          </button>
          <button 
            class="tab-btn" 
            [class.active]="selectedRole === 'DOCTOR'"
            (click)="selectRole('DOCTOR')">
            <i class="fas fa-user-md"></i>
            Doctor
          </button>
        </div>

        <!-- Login Form -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              formControlName="email"
              placeholder="Enter your email"
              [class.error]="isFieldInvalid('email')">
            <div class="error-message" *ngIf="isFieldInvalid('email')">
              {{ getFieldError('email') }}
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              formControlName="password"
              placeholder="Enter your password"
              [class.error]="isFieldInvalid('password')">
            <div class="error-message" *ngIf="isFieldInvalid('password')">
              {{ getFieldError('password') }}
            </div>
          </div>

          <div class="form-actions">
            <button 
              type="submit" 
              class="submit-btn" 
              [disabled]="loginForm.invalid || isLoading">
              <i class="fas fa-sign-in-alt" *ngIf="!isLoading"></i>
              <i class="fas fa-spinner fa-spin" *ngIf="isLoading"></i>
              {{ isLoading ? 'Signing In...' : 'Sign In' }}
            </button>
          </div>
        </form>

        <!-- Sign Up Link -->
        <div class="signup-link">
          <p>Don't have an account? 
            <a routerLink="/signup">Sign up here</a>
          </p>
        </div>

        <!-- Error Message -->
        <div class="error-alert" *ngIf="errorMessage">
          <i class="fas fa-exclamation-circle"></i>
          {{ errorMessage }}
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  selectedRole: 'PATIENT' | 'DOCTOR' = 'PATIENT';
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit(): void {
    // Check if user is already authenticated
    if (this.authService.isAuthenticated()) {
      this.redirectToDashboard();
    }
  }

  selectRole(role: 'PATIENT' | 'DOCTOR'): void {
    this.selectedRole = role;
    this.errorMessage = '';
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const loginData = {
        ...this.loginForm.value,
        role: this.selectedRole
      };

      this.authService.login(loginData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.redirectToDashboard();
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private redirectToDashboard(): void {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    
    if (this.authService.isPatient()) {
      this.router.navigate(['/patient-dashboard']);
    } else if (this.authService.isDoctor()) {
      this.router.navigate(['/doctor-dashboard']);
    } else {
      this.router.navigate([returnUrl]);
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
    }
    return '';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }
}
