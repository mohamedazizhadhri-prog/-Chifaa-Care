import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

type AuthMode = 'login' | 'signup';
type UserRole = 'patient' | 'doctor';

interface LoginData {
  email: string;
  password: string;
}

interface SignupData extends LoginData {
  name: string;
  confirmPassword: string;
  terms: boolean;
}

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.scss']
})
export class LoginModalComponent implements OnInit {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  
  authMode: AuthMode = 'login';
  selectedRole: UserRole = 'patient';
  loginData: LoginData = { email: '', password: '' };
  signupData: SignupData = { 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    terms: false 
  };
  
  isLoading = false;
  errorMessage = '';
  showSuccess = false;
  successMessage = '';

  constructor(private router: Router) {}

  ngOnInit(): void {}

  onCloseModal(): void {
    this.close.emit();
    this.resetForm();
  }

  switchMode(mode: AuthMode): void {
    this.authMode = mode;
    this.errorMessage = '';
  }

  selectRole(role: UserRole): void {
    this.selectedRole = role;
  }

  async onSubmit(): Promise<void> {
    if (this.authMode === 'login') {
      await this.handleLogin();
    } else {
      await this.handleSignup();
    }
  }

  private async handleLogin(): Promise<void> {
    try {
      this.isLoading = true;
      this.errorMessage = '';
      
      // Mock login - replace with actual auth service call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, accept any non-empty credentials
      if (this.loginData.email && this.loginData.password) {
        this.showSuccessMessage('Successfully logged in!');
        this.router.navigate([`/${this.selectedRole}-dashboard`]);
        this.onCloseModal();
      } else {
        throw new Error('Please enter both email and password');
      }
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  private async handleSignup(): Promise<void> {
    try {
      this.isLoading = true;
      this.errorMessage = '';

      // Validate form
      if (this.signupData.password !== this.signupData.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      if (!this.signupData.terms) {
        throw new Error('You must accept the terms and conditions');
      }

      // Mock signup - replace with actual auth service call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock user data
      const userData = this.generateMockUserData();
      console.log('New user created:', userData);
      
      this.showSuccessMessage('Account created successfully! Redirecting...');
      this.router.navigate([`/${this.selectedRole}-dashboard`]);
      this.onCloseModal();
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Signup failed. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  private showSuccessMessage(message: string): void {
    this.successMessage = message;
    this.showSuccess = true;
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      this.showSuccess = false;
    }, 3000);
  }

  private resetForm(): void {
    this.loginData = { email: '', password: '' };
    this.signupData = { 
      name: '', 
      email: '', 
      password: '', 
      confirmPassword: '',
      terms: false 
    };
    this.errorMessage = '';
    this.showSuccess = false;
  }

  private generateMockUserData(): any {
    const baseUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: this.signupData.name,
      email: this.signupData.email,
      role: this.selectedRole,
      createdAt: new Date().toISOString()
    };

    if (this.selectedRole === 'doctor') {
      return {
        ...baseUser,
        specialty: this.getRandomSpecialty(),
        hospital: this.getRandomHospital(),
        experience: Math.floor(Math.random() * 20) + 1,
        rating: (Math.random() * 1 + 4).toFixed(1)
      };
    } else {
      return {
        ...baseUser,
        dob: this.getRandomDOB(),
        bloodType: this.getRandomBloodType(),
        conditions: this.getRandomConditions()
      };
    }
  }

  private getRandomSpecialty(): string {
    const specialties = [
      'Cardiology', 'Dermatology', 'Neurology', 'Pediatrics', 'Orthopedics',
      'Ophthalmology', 'Psychiatry', 'Surgery', 'Gynecology', 'Urology'
    ];
    return specialties[Math.floor(Math.random() * specialties.length)];
  }

  private getRandomHospital(): string {
    const hospitals = [
      'City General Hospital', 'Metro Medical Center', 'Unity Health',
      'Prestige Healthcare', 'Grand Valley Hospital', 'Sunshine Medical'
    ];
    return hospitals[Math.floor(Math.random() * hospitals.length)];
  }

  private getRandomDOB(): string {
    const start = new Date(1950, 0, 1);
    const end = new Date(2005, 11, 31);
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0];
  }

  private getRandomBloodType(): string {
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    return bloodTypes[Math.floor(Math.random() * bloodTypes.length)];
  }

  private getRandomConditions(): string[] {
    const conditions = [
      'Hypertension', 'Diabetes', 'Asthma', 'Arthritis', 'Migraine',
      'High Cholesterol', 'Anxiety', 'Depression', 'Allergies', 'Acid Reflux'
    ];
    const count = Math.min(3, Math.floor(Math.random() * 4));
    return conditions.sort(() => 0.5 - Math.random()).slice(0, count);
  }
}
