import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-clinic-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="container">
    <div class="login-card">
      <h2>Clinic Login</h2>
      <form (ngSubmit)="onSubmit()" #f="ngForm">
        <label>Email
          <input type="email" [(ngModel)]="email" name="email" required />
        </label>
        <label>Password
          <input type="password" [(ngModel)]="password" name="password" required />
        </label>
        <button class="primary" type="submit" [disabled]="loading">{{ loading ? 'Signing in…' : 'Sign In' }}</button>
        <div class="error" *ngIf="error">{{error}}</div>
      </form>
    </div>
  </div>
  `,
  styles: [`
    .container { min-height: 70vh; display: grid; place-items: center; }
    .login-card { width: 100%; max-width: 420px; background: #fff; border:1px solid #e2e8f0; border-radius: 10px; padding: 20px; }
    h2 { margin: 0 0 12px; color: #0f766e; }
    label { display: flex; flex-direction: column; gap: 6px; margin: 10px 0; }
    input { padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; }
    .primary { width: 100%; background:#0f766e; color:#fff; border:none; padding:10px 14px; border-radius:8px; margin-top: 8px; }
    .error { color: #b91c1c; margin-top: 8px; }
  `]
})
export class ClinicLoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  email = '';
  password = '';
  loading = false;
  error = '';

  async onSubmit(){
    this.error = '';
    this.loading = true;
    try {
      const res = await this.auth.login(this.email, this.password).toPromise();
      // If logged in as clinic, go to clinic dashboard
      if (res?.user?.role === 'clinic') {
        this.router.navigate(['/clinic','dashboard']);
      } else if (res?.user?.role === 'admin') {
        this.router.navigate(['/admin','dashboard']);
      } else if (res?.user?.role === 'doctor') {
        this.router.navigate(['/doctor','dashboard']);
      } else {
        this.router.navigate(['/patient','dashboard']);
      }
    } catch (e: any) {
      this.error = e?.message || 'Login failed';
    } finally {
      this.loading = false;
    }
  }
}
