import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-page">
      <div class="auth-card card shadow-md">
        <div class="logo">
          <div class="logo-mark"></div>
          <div class="logo-text">HealthCare Portal</div>
        </div>

        <div class="mode-toggle">
          <button type="button" class="toggle-btn" [class.active]="mode==='login'" (click)="switchMode('login')">Login</button>
          <button type="button" class="toggle-btn" [class.active]="mode==='signup'" (click)="switchMode('signup')">Sign Up</button>
        </div>

        <form (ngSubmit)="onSubmit()" #formRef="ngForm" [class.disabled]="submitting">
          <div class="grid">
            <!-- Common Fields -->
            <div class="form-row" *ngIf="mode==='signup'">
              <label>First Name</label>
              <input class="input" name="firstName" [(ngModel)]="form.firstName" placeholder="John" required />
            </div>
            <div class="form-row" *ngIf="mode==='signup'">
              <label>Last Name</label>
              <input class="input" name="lastName" [(ngModel)]="form.lastName" placeholder="Doe" required />
            </div>
            <div class="form-row">
              <label>Email</label>
              <input class="input" type="email" name="email" [(ngModel)]="form.email" placeholder="you@example.com" required />
            </div>
            <div class="form-row">
              <label>Password</label>
              <input class="input" type="password" name="password" [(ngModel)]="form.password" placeholder="••••••••" required minlength="8" />
            </div>
            <div class="form-row">
              <label>Phone</label>
              <input class="input" type="tel" name="phone" [(ngModel)]="form.phone" placeholder="+1234567890" required />
            </div>
            <div class="form-row" *ngIf="mode==='signup'">
              <label>Date of Birth</label>
              <input class="input" type="date" name="dateOfBirth" [(ngModel)]="form.dateOfBirth" required />
            </div>
            <div class="form-row" *ngIf="mode==='signup'">
              <label>Gender</label>
              <select class="input" name="gender" [(ngModel)]="form.gender" required>
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
              </select>
            </div>
            <div class="form-row" *ngIf="mode==='signup'">
              <label>I am a</label>
              <select class="input" name="role" [(ngModel)]="form.role" (change)="onRoleChange()" required>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>

            <!-- Patient Specific Fields -->
            <ng-container *ngIf="mode==='signup' && form.role === 'patient'">
              <div class="form-row">
                <label>Blood Type</label>
                <select class="input" name="bloodType" [(ngModel)]="form.bloodType">
                  <option value="">Select Blood Type</option>
                  <option *ngFor="let type of ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']" [value]="type">{{type}}</option>
                </select>
              </div>
              <div class="form-row-group">
                <div class="form-row">
                  <label>Height (cm)</label>
                  <input class="input" type="number" name="height" [(ngModel)]="form.height" placeholder="175" />
                </div>
                <div class="form-row">
                  <label>Weight (kg)</label>
                  <input class="input" type="number" name="weight" [(ngModel)]="form.weight" placeholder="70" />
                </div>
              </div>
            </ng-container>

            <!-- Doctor Specific Fields -->
            <ng-container *ngIf="mode==='signup' && form.role === 'doctor'">
              <div class="form-row">
                <label>Specialization</label>
                <input class="input" name="specialization" [(ngModel)]="form.specialization" placeholder="Cardiology" required />
              </div>
              <div class="form-row">
                <label>License Number</label>
                <input class="input" name="licenseNumber" [(ngModel)]="form.licenseNumber" placeholder="MED123456" required />
              </div>
              <div class="form-row">
                <label>Years of Experience</label>
                <input class="input" type="number" name="experience" [(ngModel)]="form.experience" placeholder="5" required />
              </div>
              <div class="form-row">
                <label>Consultation Fee (USD)</label>
                <input class="input" type="number" name="consultationFee" [(ngModel)]="form.consultationFee" placeholder="100" required />
              </div>
              <div class="form-row">
                <label>Bio</label>
                <textarea class="input" name="bio" [(ngModel)]="form.bio" placeholder="Tell us about your medical background..." rows="3"></textarea>
              </div>
            </ng-container>
          </div>

          <div class="actions">
            <button type="submit"
                    class="btn action-btn"
                    [disabled]="submitting"
                    [class.morph]="showBadge">
              <span *ngIf="!submitting && !showBadge">{{ mode==='login' ? 'Login' : 'Sign Up' }}</span>
              <span *ngIf="submitting && !showBadge" class="spinner"></span>
            </button>
          </div>
        </form>

        <!-- Animated Badge -->
        <div class="badge-wrapper" *ngIf="showBadge">
          <div class="id-badge" [class.patient]="badgeRole==='patient'" [class.doctor]="badgeRole==='doctor'" [class.slideUp]="badgeSlideUp">
            <div class="scanner" [class.scan]="scannerRunning"></div>
            <div class="avatar"></div>
            <div class="badge-info">
              <div class="name">{{ displayName }}</div>
              <div class="role" [class.role-patient]="badgeRole==='patient'" [class.role-doctor]="badgeRole==='doctor'">{{ badgeRole | titlecase }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display:block; }
    .auth-page {
      min-height: 100vh; display:grid; place-items:center; background: #fff;
      padding: 2rem; background-image: radial-gradient(ellipse at top left, rgba(52,152,219,.08), transparent 40%),
                                       radial-gradient(ellipse at bottom right, rgba(46,204,113,.08), transparent 40%);
    }
    .auth-card { width: 100%; max-width: 480px; border-radius: 18px; padding: 1.5rem 1.25rem; background:#ffffff; position:relative; overflow:hidden; }
    .logo { display:flex; align-items:center; gap:.6rem; justify-content:center; margin-bottom: .5rem; }
    .logo-mark { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, var(--c-green, #2ECC71), var(--c-blue, #3498DB)); box-shadow: var(--shadow-sm, 0 6px 18px rgba(0,0,0,.06)); }
    .logo-text { font-weight: 700; font-size: 1.1rem; color:#2b3a49; }

    .mode-toggle { display:flex; gap:.5rem; justify-content:center; margin: .25rem 0 1rem; }
    .toggle-btn { padding: .55rem .95rem; border-radius: 999px; border:1px solid rgba(52,152,219,.25); background:#fff; color:#2b3a49; cursor:pointer; transition: all .2s; }
    .toggle-btn.active, .toggle-btn:hover { background: rgba(52,152,219,.1); box-shadow: 0 6px 14px rgba(52,152,219,.15); }

    form.disabled { opacity:.7; pointer-events:none; }
    .grid { display:grid; gap:.8rem; }
    .form-row { display:grid; gap:.35rem; }
    .form-row-group { 
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: 1rem; 
      margin-bottom: 0.5rem;
    }
    textarea.input { 
      min-height: 80px; 
      resize: vertical; 
      font-family: inherit;
      line-height: 1.5;
    }
    label { font-size:.85rem; color:#527086; }
    .input { padding:.7rem .9rem; border-radius:12px; border:1px solid #e7edf3; outline:none; background:#fbfdff; transition: box-shadow .2s, border-color .2s; }
    .input:focus { border-color: rgba(52,152,219,.6); box-shadow: 0 0 0 4px rgba(52,152,219,.15); }

    .actions { display:flex; justify-content:center; margin-top: 1rem; min-height:52px; }
    .btn.action-btn { position:relative; background: var(--c-blue, #3498DB); color:#fff; border:none; padding:.8rem 1.2rem; border-radius:14px; cursor:pointer; transition: transform .15s, box-shadow .2s, background .2s; box-shadow: 0 8px 18px rgba(52,152,219,.28); }
    .btn.action-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 26px rgba(52,152,219,.34); background:#2886c4; }
    .btn.action-btn:disabled { opacity:.8; cursor:not-allowed; }

    .spinner { width: 22px; height:22px; border:3px solid rgba(255,255,255,.4); border-top-color:#fff; border-radius:50%; display:inline-block; animation: spin .8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Badge */
    .badge-wrapper { display:grid; place-items:center; margin-top:.25rem; }
    .id-badge { position:relative; width: 100%; max-width: 360px; background:#eaf4ff; border-radius:16px; padding: 1rem 1rem 1rem 4.25rem; box-shadow: 0 10px 28px rgba(0,0,0,.08); overflow:hidden; transform-origin:center; transition: transform .35s ease, opacity .35s ease; }
    .id-badge.patient { background: linear-gradient(135deg, #f2f8ff, #eaf6ff); }
    .id-badge.doctor { background: linear-gradient(135deg, #e7f3ff, #dbe9ff); }

    .id-badge::before { content:""; position:absolute; inset:0; background: radial-gradient(circle at 85% 25%, rgba(52,152,219,.12), transparent 45%),
                                                              radial-gradient(circle at 20% 80%, rgba(46,204,113,.12), transparent 45%);
      opacity:.9; pointer-events:none; }
    .id-badge.patient::after { content:""; position:absolute; inset:0; background: url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" opacity=\"0.08\"><path d=\"M6 32h12l6-10 8 20 6-10h14\" fill=\"none\" stroke=\"%233498DB\" stroke-width=\"4\" stroke-linecap=\"round\"/></svg>') center/60% no-repeat; }
    .id-badge.doctor::after { content:""; position:absolute; inset:0; background: url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" opacity=\"0.08\"><path d=\"M12 24c0-6.627 5.373-12 12-12s12 5.373 12 12-5.373 12-12 12v8\" fill=\"none\" stroke=\"%232b6cb0\" stroke-width=\"4\" stroke-linecap=\"round\"/></svg>') center/60% no-repeat; }

    .scanner { position:absolute; left:0; right:0; top:-20%; height: 14px; background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(52,152,219,.35) 45%, rgba(255,255,255,0) 100%);
      box-shadow: 0 0 12px rgba(52,152,219,.35); filter: blur(.3px); opacity:0; }
    .scanner.scan { animation: scan 1s ease-in-out forwards; }
    @keyframes scan {
      0% { top:-18%; opacity:.0; }
      10% { opacity:1; }
      100% { top: 100%; opacity:.0; }
    }

    .avatar { position:absolute; left: .8rem; top:50%; transform: translateY(-50%); width: 56px; height:56px; border-radius:50%; background: linear-gradient(135deg, #d8f5e7, #cfe9ff); box-shadow: inset 0 0 0 3px #fff; }
    .badge-info { display:flex; flex-direction:column; gap:.15rem; }
    .name { font-weight: 700; color:#22313f; font-size:1.05rem; }
    .role { width:max-content; padding:.2rem .55rem; border-radius:999px; font-size:.75rem; font-weight:600; }
    .role.role-patient { background: rgba(52,152,219,.15); color:#246fa8; }
    .role.role-doctor { background: rgba(43,108,176,.18); color:#234e78; }

    .id-badge.slideUp { animation: slideUp 1s ease forwards; }
    @keyframes slideUp { to { transform: translateY(-20px); opacity:.98; } }

    /* Responsive */
    @media (max-width: 520px){
      .auth-card{ padding: 1.25rem .9rem; }
      .id-badge{ max-width: 100%; }
    }
  `]
})
export class AuthPageComponent {
  mode: 'login' | 'signup' = 'login';
  submitting = false;
  showBadge = false;
  scannerRunning = false;
  badgeSlideUp = false;
  badgeRole: 'patient' | 'doctor' = 'patient';
  displayName = '';

  form: {
    // Common fields
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
    role: 'patient' | 'doctor';
    // Patient specific fields
    bloodType?: string;
    height?: number;
    weight?: number;
    // Doctor specific fields
    specialization?: string;
    bio?: string;
    licenseNumber?: string;
    experience?: number;
    consultationFee?: number;
  } = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    role: 'patient',
    // Initialize patient fields
    bloodType: '',
    height: undefined,
    weight: undefined,
    // Initialize doctor fields
    specialization: '',
    bio: '',
    licenseNumber: '',
    experience: undefined,
    consultationFee: undefined
  };

  constructor(private auth: AuthService, private router: Router) {}

  switchMode(mode: 'login' | 'signup') { 
    this.mode = mode; 
    // Reset form when switching modes
    if (mode === 'login') {
      this.resetForm();
    }
  }

  onRoleChange() {
    // Reset role-specific fields when role changes
    if (this.form.role === 'patient') {
      this.form.specialization = '';
      this.form.licenseNumber = '';
      this.form.experience = undefined;
      this.form.consultationFee = undefined;
      this.form.bio = '';
    } else {
      this.form.bloodType = '';
      this.form.height = undefined;
      this.form.weight = undefined;
    }
  }

  private resetForm() {
    this.form = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      role: 'patient',
      bloodType: '',
      height: undefined,
      weight: undefined,
      specialization: '',
      bio: '',
      licenseNumber: '',
      experience: undefined,
      consultationFee: undefined
    };
  }

  onSubmit(){
    console.log('Form submitted with:', this.form);
    if(this.submitting) {
      console.log('Already submitting, ignoring duplicate submission');
      return;
    }
    
    this.submitting = true;
    const role = this.form.role;
    console.log('Starting', this.mode, 'process for role:', role);

    const proceed = (name: string) => {
      console.log('Proceeding with success for user:', name);
      // Prepare animation content
      this.displayName = name || this.form.email.split('@')[0];
      this.badgeRole = role;

      // Start morph: hide button text and show badge
      setTimeout(() => {
        console.log('Showing success badge');
        this.showBadge = true;
        // Start scanner
        requestAnimationFrame(() => {
          this.scannerRunning = true;
        });
      }, 250);

      // Slide up near end
      setTimeout(() => {
        this.badgeSlideUp = true;
      }, 1400);

      // Navigate after ~2.5s total
      setTimeout(() => {
        console.log('Navigating to:', `/${role}/dashboard`);
        this.router.navigate([`/${role}/dashboard`]);
      }, 2500);
    };

    const handleError = (error: any) => {
      console.error('Authentication error:', error);
      this.submitting = false;
      alert(`Error during ${this.mode}: ${error?.error?.message || error.message || 'Unknown error'}`);
    };

    if(this.mode === 'login'){
      console.log('Attempting login with email:', this.form.email);
      this.auth.login(this.form.email, this.form.password).subscribe({
        next: ({ user }) => {
          console.log('Login successful:', user);
          this.submitting = false;
          proceed(user.name);
        },
        error: handleError
      });
    } else {
      const baseData = {
        firstName: this.form.firstName,
        lastName: this.form.lastName,
        email: this.form.email,
        password: this.form.password,
        phone: this.form.phone,
        dateOfBirth: this.form.dateOfBirth,
        gender: this.form.gender,
        role: this.form.role.toUpperCase()
      };

      let signupData: any = { ...baseData };

      if (this.form.role === 'patient') {
        signupData = {
          ...signupData,
          patientProfile: {
            bloodType: this.form.bloodType,
            height: this.form.height,
            weight: this.form.weight
          }
        };
      } else {
        signupData = {
          ...signupData,
          doctorProfile: {
            specialization: this.form.specialization,
            bio: this.form.bio,
            licenseNumber: this.form.licenseNumber,
            experience: Number(this.form.experience),
            consultationFee: Number(this.form.consultationFee)
          }
        };
      }
      console.log('Attempting signup with data:', signupData);
      
      this.auth.signup(signupData).subscribe({
        next: (response) => {
          console.log('Signup successful:', response);
          this.submitting = false;
          proceed(response.user?.name || `${this.form.firstName} ${this.form.lastName}`.trim() || 'User');
        },
        error: handleError
      });
    }
  }
}
