import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

declare var grecaptcha: any;

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="signup-container">
      <div class="signup-card">
        <div class="signup-header">
          <h2>Create Your Account</h2>
          <p>Join ChifaaCare and start your healthcare journey</p>
        </div>

        <form [formGroup]="signupForm" (ngSubmit)="onSubmit()" class="signup-form">
          <!-- Role Selection -->
          <div class="form-group">
            <label class="form-label">I am a:</label>
            <div class="role-buttons">
              <button 
                type="button" 
                class="role-btn" 
                [class.active]="selectedRole === 'PATIENT'"
                (click)="selectRole('PATIENT')">
                <i class="fas fa-user"></i>
                Patient
              </button>
              <button 
                type="button" 
                class="role-btn" 
                [class.active]="selectedRole === 'DOCTOR'"
                (click)="selectRole('DOCTOR')">
                <i class="fas fa-user-md"></i>
                Doctor
              </button>
            </div>
          </div>

          <!-- Full Name -->
          <div class="form-group">
            <label class="form-label" for="fullName">Full Name</label>
            <input 
              type="text" 
              id="fullName"
              formControlName="fullName"
              placeholder="Enter your full name"
              class="form-input"
              [class.error]="isFieldInvalid('fullName')">
            <div class="error-message" *ngIf="isFieldInvalid('fullName')">
              {{ getFieldError('fullName') }}
            </div>
          </div>

          <!-- Email -->
          <div class="form-group">
            <label class="form-label" for="email">Email Address</label>
            <input 
              type="email" 
              id="email"
              formControlName="email"
              placeholder="Enter your email address"
              class="form-input"
              [class.error]="isFieldInvalid('email')">
            <div class="error-message" *ngIf="isFieldInvalid('email')">
              {{ getFieldError('email') }}
            </div>
          </div>

          <!-- Password -->
          <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <input 
              type="password" 
              id="password"
              formControlName="password"
              placeholder="Create a strong password"
              class="form-input"
              [class.error]="isFieldInvalid('password')">
            <div class="password-strength" *ngIf="signupForm.get('password')?.value">
              <div class="strength-bar">
                <div class="strength-fill" [style.width.%]="getPasswordStrength()"></div>
              </div>
              <span class="strength-text">{{ getPasswordStrengthText() }}</span>
            </div>
            <div class="error-message" *ngIf="isFieldInvalid('password')">
              {{ getFieldError('password') }}
            </div>
          </div>

          <!-- Confirm Password -->
          <div class="form-group">
            <label class="form-label" for="confirmPassword">Confirm Password</label>
            <input 
              type="password" 
              id="confirmPassword"
              formControlName="confirmPassword"
              placeholder="Confirm your password"
              class="form-input"
              [class.error]="isFieldInvalid('confirmPassword')">
            <div class="error-message" *ngIf="isFieldInvalid('confirmPassword')">
              {{ getFieldError('confirmPassword') }}
            </div>
          </div>

          <!-- Doctor-specific fields -->
          <div *ngIf="selectedRole === 'DOCTOR'" class="doctor-fields">
            <div class="form-group">
              <label class="form-label" for="licenseNumber">Medical License Number</label>
              <input 
                type="text" 
                id="licenseNumber"
                formControlName="licenseNumber"
                placeholder="Enter your medical license number"
                class="form-input"
                [class.error]="isFieldInvalid('licenseNumber')">
              <div class="error-message" *ngIf="isFieldInvalid('licenseNumber')">
                {{ getFieldError('licenseNumber') }}
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="specialty">Medical Specialty</label>
              <select 
                id="specialty"
                formControlName="specialty"
                class="form-input"
                [class.error]="isFieldInvalid('specialty')">
                <option value="">Select your specialty</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Endocrinology">Endocrinology</option>
                <option value="Gastroenterology">Gastroenterology</option>
                <option value="Neurology">Neurology</option>
                <option value="Oncology">Oncology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Psychiatry">Psychiatry</option>
                <option value="Radiology">Radiology</option>
                <option value="Surgery">Surgery</option>
                <option value="Other">Other</option>
              </select>
              <div class="error-message" *ngIf="isFieldInvalid('specialty')">
                {{ getFieldError('specialty') }}
              </div>
            </div>
          </div>

          <!-- Security Verification -->
          <div class="form-group">
            <label class="form-label">Security Verification</label>
            <div class="security-buttons">
              <button 
                type="button" 
                class="security-btn active">
                <i class="fas fa-shield-alt"></i>
                reCAPTCHA
              </button>
            </div>

            <!-- reCAPTCHA -->
            <div class="captcha-section">
              <div id="recaptcha-container" #recaptchaContainer></div>
              <div class="error-message" *ngIf="captchaError">
                Please complete the security verification
              </div>
              <button 
                type="button" 
                class="refresh-captcha-btn" 
                (click)="refreshRecaptcha()">
                <i class="fas fa-sync-alt"></i>
                Refresh reCAPTCHA
              </button>
            </div>
          </div>

          <!-- Terms and Conditions -->
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" formControlName="acceptTerms" [class.error]="isFieldInvalid('acceptTerms')">
              <span class="checkmark"></span>
              I agree to the <a href="#" (click)="showTerms($event)">Terms and Conditions</a> and <a href="#" (click)="showPrivacy($event)">Privacy Policy</a>
            </label>
            <div class="error-message" *ngIf="isFieldInvalid('acceptTerms')">
              You must accept the terms and conditions
            </div>
          </div>

          <div class="form-actions">
            <button 
              type="submit" 
              class="submit-btn" 
              [disabled]="signupForm.invalid || isLoading">
              <i class="fas fa-user-plus" *ngIf="!isLoading"></i>
              <i class="fas fa-spinner fa-spin" *ngIf="isLoading"></i>
              {{ isLoading ? 'Creating Account...' : 'Create Account' }}
            </button>
          </div>
        </form>

        <!-- Login Link -->
        <div class="login-link">
          <p>Already have an account? 
            <a routerLink="/login">Sign in here</a>
          </p>
        </div>

        <!-- Error Message -->
        <div class="error-alert" *ngIf="errorMessage">
          <i class="fas fa-exclamation-circle"></i>
          {{ errorMessage }}
        </div>

        <!-- Success Message -->
        <div class="success-alert" *ngIf="successMessage">
          <i class="fas fa-check-circle"></i>
          {{ successMessage }}
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit, AfterViewInit {
  @ViewChild('recaptchaContainer', { static: false }) recaptchaContainer!: ElementRef;
  
  signupForm: FormGroup;
  selectedRole: 'PATIENT' | 'DOCTOR' = 'PATIENT';
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  isSecurityCompleted = false;
  captchaError = false;
  recaptchaWidgetId: number | null = null;

  // Your reCAPTCHA site key
  private readonly RECAPTCHA_SITE_KEY = '6LdQfKUrAAAAAIuNDkKNajL_2dWTUrWXrtfQ7lfL';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      licenseNumber: [''],
      specialty: [''],
      acceptTerms: [false, [Validators.requiredTrue]]
    });

    // Add custom validator for password confirmation
    this.signupForm.get('confirmPassword')?.setValidators([
      Validators.required,
      this.passwordMatchValidator.bind(this)
    ]);
  }

  ngOnInit(): void {
    // Check if user is already authenticated
    if (this.authService.isAuthenticated()) {
      this.redirectToDashboard();
    }
  }

  ngAfterViewInit(): void {
    // Load reCAPTCHA immediately since script is now in index.html
    this.loadRecaptcha();
  }

  private loadRecaptcha(): void {
    console.log('Loading reCAPTCHA...');
    
    // Check if reCAPTCHA is already loaded
    if (typeof grecaptcha !== 'undefined') {
      console.log('reCAPTCHA already loaded, initializing...');
      this.initRecaptcha();
    } else {
      console.log('reCAPTCHA not loaded yet, waiting...');
      
      // Wait for reCAPTCHA to load since script is in index.html
      const checkInterval = setInterval(() => {
        if (typeof grecaptcha !== 'undefined') {
          console.log('reCAPTCHA loaded via waiting, initializing...');
          clearInterval(checkInterval);
          this.initRecaptcha();
        }
      }, 100);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        if (typeof grecaptcha === 'undefined') {
          console.error('reCAPTCHA failed to load after 10 seconds');
          this.errorMessage = 'Security verification failed to load. Please refresh the page.';
        }
      }, 10000);
    }
  }

  private initRecaptcha(): void {
    if (this.recaptchaContainer && grecaptcha) {
      try {
        console.log('Initializing reCAPTCHA widget...');
        this.recaptchaWidgetId = grecaptcha.render(this.recaptchaContainer.nativeElement, {
          sitekey: this.RECAPTCHA_SITE_KEY,
          callback: (response: string) => {
            console.log('reCAPTCHA completed:', response);
            this.isSecurityCompleted = true;
            this.captchaError = false;
          },
          'expired-callback': () => {
            console.log('reCAPTCHA expired');
            this.isSecurityCompleted = false;
          },
          'error-callback': () => {
            console.log('reCAPTCHA error');
            this.isSecurityCompleted = false;
          }
        });
        console.log('reCAPTCHA widget initialized with ID:', this.recaptchaWidgetId);
      } catch (error) {
        console.error('Error initializing reCAPTCHA:', error);
        this.errorMessage = 'Failed to initialize security verification. Please refresh the page.';
      }
    } else {
      console.log('reCAPTCHA container or grecaptcha not available');
      this.errorMessage = 'Security verification not available. Please refresh the page.';
    }
  }

  private resetRecaptcha(): void {
    if (this.recaptchaWidgetId !== null && grecaptcha) {
      try {
        grecaptcha.reset(this.recaptchaWidgetId);
        console.log('reCAPTCHA reset successfully');
      } catch (error) {
        console.error('Error resetting reCAPTCHA:', error);
        // Reinitialize if reset fails
        this.initRecaptcha();
      }
    } else {
      // Initialize if no widget exists
      this.initRecaptcha();
    }
  }

  refreshRecaptcha(): void {
    console.log('Manually refreshing reCAPTCHA...');
    this.isSecurityCompleted = false;
    this.captchaError = false;
    this.resetRecaptcha();
  }

  selectRole(role: 'PATIENT' | 'DOCTOR'): void {
    this.selectedRole = role;
    this.errorMessage = '';
    this.updateFormValidation();
  }

  private updateFormValidation(): void {
    const licenseNumberControl = this.signupForm.get('licenseNumber');
    const specialtyControl = this.signupForm.get('specialty');

    if (this.selectedRole === 'DOCTOR') {
      licenseNumberControl?.setValidators([Validators.required]);
      specialtyControl?.setValidators([Validators.required]);
    } else {
      licenseNumberControl?.clearValidators();
      specialtyControl?.clearValidators();
    }

    licenseNumberControl?.updateValueAndValidity();
    specialtyControl?.updateValueAndValidity();
  }

  private passwordMatchValidator(control: any): { [key: string]: boolean } | null {
    const password = this.signupForm?.get('password')?.value;
    const confirmPassword = control.value;
    
    if (password && confirmPassword && password !== confirmPassword) {
      return { 'passwordMismatch': true };
    }
    return null;
  }

  getPasswordStrength(): number {
    const password = this.signupForm.get('password')?.value;
    if (!password) return 0;
    
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    
    return strength;
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    if (strength < 25) return 'Very Weak';
    if (strength < 50) return 'Weak';
    if (strength < 75) return 'Fair';
    if (strength < 100) return 'Good';
    return 'Strong';
  }

  onSubmit(): void {
    console.log('Form submission attempted');
    console.log('Form valid:', this.signupForm.valid);
    console.log('Security completed:', this.isSecurityCompleted);
    
    if (this.signupForm.valid && this.isSecurityCompleted) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const signupData = {
        ...this.signupForm.value,
        role: this.selectedRole
      };

      console.log('Submitting signup data:', signupData);

      this.authService.signup(signupData).subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('Signup response:', response);
          
          if (response.success) {
            this.successMessage = 'Account created successfully! Please check your email for verification.';
            // Don't redirect immediately - wait for email verification
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 3000);
          } else {
            this.errorMessage = response.message || 'Signup failed. Please try again.';
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Signup error:', error);
          
          // Extract error message from different error response formats
          if (error.error && error.error.message) {
            this.errorMessage = error.error.message;
          } else if (error.message) {
            this.errorMessage = error.message;
          } else if (error.status === 409) {
            this.errorMessage = 'An account with this email already exists.';
          } else if (error.status === 400) {
            this.errorMessage = 'Invalid data provided. Please check your information.';
          } else if (error.status === 500) {
            this.errorMessage = 'Server error. Please try again later.';
          } else {
            this.errorMessage = 'Signup failed. Please try again.';
          }
        }
      });
    } else {
      console.log('Form validation failed or security check incomplete');
      if (!this.isSecurityCompleted) {
        this.errorMessage = 'Please complete the reCAPTCHA verification';
      }
      this.markFormGroupTouched();
    }
  }

  private redirectToDashboard(): void {
    if (this.authService.isPatient()) {
      this.router.navigate(['/patient-dashboard']);
    } else if (this.authService.isDoctor()) {
      this.router.navigate(['/doctor-dashboard']);
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.signupForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.signupForm.get(fieldName);
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
      if (field.errors['passwordMismatch']) {
        return 'Passwords do not match';
      }
    }
    return '';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.signupForm.controls).forEach(key => {
      const control = this.signupForm.get(key);
      control?.markAsTouched();
    });
  }

  showTerms(event: Event): void {
    event.preventDefault();
    // Show terms and conditions modal or navigate to terms page
    alert('Terms and Conditions would be displayed here');
  }

  showPrivacy(event: Event): void {
    event.preventDefault();
    // Show privacy policy modal or navigate to privacy page
    alert('Privacy Policy would be displayed here');
  }
}