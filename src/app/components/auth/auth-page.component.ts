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
            <div class="form-row" *ngIf="mode==='signup'">
              <label>Full Name</label>
              <input class="input" name="name" [(ngModel)]="form.name" placeholder="John Doe" required />
            </div>
            <div class="form-row">
              <label>Email</label>
              <input class="input" type="email" name="email" [(ngModel)]="form.email" placeholder="you@example.com" required />
            </div>
            <div class="form-row">
              <label>Password</label>
              <input class="input" type="password" name="password" [(ngModel)]="form.password" placeholder="••••••••" required />
            </div>
            <div class="form-row">
              <label>Role</label>
              <select class="input" name="role" [(ngModel)]="form.role" required>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>
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

  form: { name?: string; email: string; password: string; role: 'patient' | 'doctor' } = {
    name: '',
    email: '',
    password: '',
    role: 'patient'
  };

  constructor(private auth: AuthService, private router: Router) {}

  switchMode(mode: 'login' | 'signup') { this.mode = mode; }

  onSubmit(){
    if(this.submitting) return;
    this.submitting = true;
    const role = this.form.role;

    const proceed = (name: string) => {
      // Prepare animation content
      this.displayName = name || this.form.email.split('@')[0];
      this.badgeRole = role;

      // Start morph: hide button text and show badge
      setTimeout(() => {
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
        this.router.navigate([`/${role}/dashboard`]);
      }, 2500);
    };

    if(this.mode==='login'){
      this.auth.login(this.form.email, this.form.password).subscribe(({ user }) => {
        this.submitting = false;
        proceed(user.name);
      });
    } else {
      this.auth.signup({ name: this.form.name, email: this.form.email, role: this.form.role }).subscribe(({ user }) => {
        this.submitting = false;
        proceed(user.name);
      });
    }
  }
}
