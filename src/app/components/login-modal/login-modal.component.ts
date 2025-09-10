import { Component, EventEmitter, Input, OnInit, Output, ViewChild, Directive } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm, NG_VALIDATORS, Validator, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';

type UserRole = 'patient' | 'doctor';
type AuthMode = 'login' | 'signup';

interface LoginData {
  email: string;
  password: string;
}

// Standalone directive to validate that confirm password matches the original password
@Directive({
  selector: '[appMatchPassword]',
  standalone: true,
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: MatchPasswordDirective,
      multi: true
    }
  ]
})
export class MatchPasswordDirective implements Validator {
  @Input('appMatchPassword') matchTo: string | null = null;

  validate(control: AbstractControl): ValidationErrors | null {
    if (!this.matchTo) return null;
    const confirm = control.value ?? '';
    return confirm === this.matchTo ? null : { passwordMismatch: true };
  }
}

interface SignupData extends LoginData {
  firstName: string;
  lastName: string;
  confirmPassword: string;
  terms: boolean;
  role: UserRole;
  phone: string;
  dateOfBirth: string;
  gender: string;
  // Patient specific
  bloodType?: string;
  height?: number;
  weight?: number;
  // Doctor specific
  specialization?: string;
  bio?: string;
  licenseNumber?: string;
  experience?: number;
  consultationFee?: number;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: UserRole;
    name?: string;
  };
  token: string;
}

// Using real AuthService (providedIn: 'root')

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatchPasswordDirective],
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.scss']
})
export class LoginModalComponent implements OnInit {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  authMode: AuthMode = 'login';
  selectedRole: UserRole = 'patient';
  isLoading = false;
  currentStep = 1;
  errorMessage = '';
  showSuccess = false;
  successMessage = '';

  // Badge animation state
  showBadge = false; // no longer used for local overlay
  scannerRunning = false;
  badgeSlideUp = false;
  badgeRole: UserRole = 'patient';
  displayName = '';

  @Output() animationStart = new EventEmitter<{ role: UserRole; name: string; durationMs: number }>();

  // Form data
  loginData: LoginData = {
    email: '',
    password: ''
  };

  signupData: SignupData = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false,
    role: 'patient',
    phone: '',
    dateOfBirth: '',
    gender: '',
    // Patient specific
    bloodType: '',
    height: undefined,
    weight: undefined,
    // Doctor specific
    specialization: '',
    bio: '',
    licenseNumber: '',
    experience: undefined,
    consultationFee: undefined
  };

  // Mock doctor specialties for signup
  doctorSpecialties = [
    'Medical Oncology',
    'Radiation Oncology',
    'Surgical Oncology',
    'Hematology',
    'Palliative Care',
    'Pathology'
  ];

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    if (this.isOpen) {
      this.resetForms();
    }
  }

  onCloseModal(): void {
    // Allow closing even if loading when we're transitioning to global animation
    this.close.emit();
    this.resetForms();
  }

  openSignup(): void {
    this.authMode = 'signup';
    this.errorMessage = '';
    this.showSuccess = false;
  }

  openLogin(): void {
    this.authMode = 'login';
    this.errorMessage = '';
    this.showSuccess = false;
  }

  switchMode(mode: AuthMode): void {
    if (this.isLoading) return;
    this.authMode = mode;
    this.errorMessage = '';
  }

  selectRole(role: UserRole): void {
    this.selectedRole = role;
    this.errorMessage = '';
    this.currentStep = 1; // Reset to first step when changing role
    this.signupData.role = role;
  }

  nextStep(): void {
    if (this.currentStep === 1 && this.isStep1Valid()) {
      this.currentStep = 2;
      this.errorMessage = '';
      // Scroll to top of form when moving to next step
      const formElement = document.querySelector('.modal-content');
      if (formElement) {
        formElement.scrollTop = 0;
      }
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.errorMessage = '';
      // Scroll to top of form when going back
      const formElement = document.querySelector('.modal-content');
      if (formElement) {
        formElement.scrollTop = 0;
      }
    }
  }

  isStep1Valid(): boolean {
    return (
      !!this.signupData.firstName?.trim() &&
      !!this.signupData.lastName?.trim() &&
      !!this.signupData.email?.trim() &&
      !!this.signupData.phone?.trim() &&
      !!this.signupData.dateOfBirth &&
      !!this.signupData.gender &&
      !!this.signupData.password &&
      !!this.signupData.confirmPassword &&
      this.signupData.password === this.signupData.confirmPassword
    );
  }

  isStep2Valid(): boolean {
    if (this.selectedRole === 'patient') {
      return (
        !!this.signupData.bloodType &&
        (this.signupData.height === undefined || this.signupData.height > 0) &&
        (this.signupData.weight === undefined || this.signupData.weight > 0)
      );
    } else {
      return (
        !!this.signupData.specialization?.trim() &&
        !!this.signupData.licenseNumber?.trim() &&
        this.signupData.experience !== undefined &&
        this.signupData.experience >= 0 &&
        this.signupData.consultationFee !== undefined &&
        this.signupData.consultationFee >= 0
      );
    }
  }

  async onSubmit(loginForm?: NgForm, signupForm?: NgForm): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      if (this.authMode === 'login' && loginForm) {
        if (loginForm.invalid) {
          throw new Error('Please fill in all required fields');
        }
        await this.handleLogin();
      } else if (signupForm) {
        if (signupForm.invalid) {
          throw new Error('Please fill in all required fields and accept the terms');
        }
        await this.handleSignup();
      }
    } catch (error: any) {
      this.errorMessage = error?.message || 'An error occurred. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  private async handleLogin(): Promise<void> {
    if (!this.loginData.email || !this.loginData.password) {
      throw new Error('Please enter both email and password');
    }

    const response = await firstValueFrom(
      this.authService.login(this.loginData.email, this.loginData.password)
    );

    if (response?.user) {
      this.showSuccessMessage('Successfully logged in!');
      this.startBadgeAnimation(response.user.role, response.user.name || this.loginData.email.split('@')[0]);
    } else {
      throw new Error('Login failed. Please check your credentials and try again.');
    }
  }

  private async handleSignup(): Promise<void> {
    // Final validation before submission
    if (this.signupData.password !== this.signupData.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      this.currentStep = 1; // Go back to first step
      return;
    }

    if (!this.signupData.terms) {
      this.errorMessage = 'You must accept the terms and conditions';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Prepare the signup data based on role
    const baseData = {
      firstName: this.signupData.firstName,
      lastName: this.signupData.lastName,
      email: this.signupData.email,
      password: this.signupData.password,
      phone: this.signupData.phone,
      dateOfBirth: this.signupData.dateOfBirth,
      gender: this.signupData.gender,
      role: this.selectedRole.toUpperCase()
    };

    let signupPayload: any = { ...baseData };

    // Add role-specific data
    if (this.selectedRole === 'patient') {
      signupPayload = {
        ...signupPayload,
        patientProfile: {
          bloodType: this.signupData.bloodType,
          height: this.signupData.height,
          weight: this.signupData.weight
        }
      };
    } else {
      signupPayload = {
        ...signupPayload,
        doctorProfile: {
          specialization: this.signupData.specialization,
          bio: this.signupData.bio,
          licenseNumber: this.signupData.licenseNumber,
          experience: Number(this.signupData.experience) || 0,
          consultationFee: Number(this.signupData.consultationFee) || 0
        }
      };
    }

    try {
      const response = await firstValueFrom(this.authService.signup(signupPayload));

      if (response?.user) {
        this.showSuccessMessage('Account created successfully! Redirecting...');
        const displayName = response.user.name || `${this.signupData.firstName} ${this.signupData.lastName}`.trim() || this.signupData.email.split('@')[0];
        this.startBadgeAnimation(response.user.role, displayName);
      } else {
        throw new Error('Signup failed. Please try again.');
      }
    } catch (error: any) {
      throw new Error(error?.error?.message || 'Registration failed. Please try again.');
    }
  }

  private startBadgeAnimation(role: UserRole, name: string) {
    this.displayName = name;
    this.badgeRole = role;
    // Set fade-out state and ensure loading doesn't block closing
    this.showBadge = true;
    this.isLoading = false;
    // Emit to navbar to show global overlay and immediately close modal so forms disappear
    this.animationStart.emit({ role, name, durationMs: 2500 });
    // Close on next tick to avoid losing the event render cycle
    setTimeout(() => this.onCloseModal());

    // Keep navigation after ~2.5s
    setTimeout(() => {
      this.router.navigate(['/', role, 'dashboard']);
      // reset any internal flags
      this.showBadge = false; this.scannerRunning = false; this.badgeSlideUp = false;
    }, 2500);
  }

  private showSuccessMessage(message: string): void {
    this.successMessage = message;
    this.showSuccess = true;

    // Auto-hide success message after delay
    setTimeout(() => {
      this.showSuccess = false;
    }, 5000);
  }

  private resetForms(): void {
    this.loginData = { email: '', password: '' };
    this.currentStep = 1; // Reset to first step
    this.errorMessage = '';
    this.signupData = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
      role: 'patient',
      phone: '',
      dateOfBirth: '',
      gender: '',
      bloodType: '',
      height: undefined,
      weight: undefined,
      specialization: '',
      bio: '',
      licenseNumber: '',
      experience: undefined,
      consultationFee: undefined
    };
    this.errorMessage = '';
    this.showSuccess = false;
    this.selectedRole = 'patient';
    this.authMode = 'login';
  }

  // Helper method to get a random specialty (for doctor signup)
  private getRandomSpecialty(): string {
    const randomIndex = Math.floor(Math.random() * this.doctorSpecialties.length);
    return this.doctorSpecialties[randomIndex];
  }

  private getRandomDateOfBirth(): string {
    const start = new Date(1950, 0, 1);
    const end = new Date(2005, 0, 1);
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0];
  }

  private getRandomBloodType(): string {
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    return bloodTypes[Math.floor(Math.random() * bloodTypes.length)];
  }
}