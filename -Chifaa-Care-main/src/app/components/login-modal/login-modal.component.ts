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
  name: string;
  confirmPassword: string;
  terms: boolean;
  role: UserRole;
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
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false,
    role: 'patient'
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
    if (this.isLoading) return;
    this.selectedRole = role;
    this.signupData.role = role;
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
    if (this.signupData.password !== this.signupData.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    if (!this.signupData.terms) {
      throw new Error('You must accept the terms and conditions');
    }

    const signupData = {
      ...this.signupData,
      role: this.selectedRole
    };

    try {
      const response = await firstValueFrom(this.authService.signup(signupData as any));

      if (response?.user) {
        this.showSuccessMessage('Account created successfully! Redirecting...');
        this.startBadgeAnimation(response.user.role, response.user.name || this.signupData.name || this.signupData.email.split('@')[0]);
      } else {
        throw new Error('Signup failed. Please try again.');
      }
    } catch (error: any) {
      throw new Error(error?.error?.message || 'Email is already registered. Please try logging in.');
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
    this.signupData = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
      role: 'patient'
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