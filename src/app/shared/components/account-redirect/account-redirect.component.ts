import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-account-redirect',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="container" style="padding:48px 0;">
    <div class="card" style="text-align:center;">
      <div class="card-header">Redirecting to your dashboard…</div>
      <p class="muted" style="margin:0;">If this takes too long, <a routerLink="/home">go home</a>.</p>
    </div>
  </div>`
})
export class AccountRedirectComponent {
  private router = inject(Router);
  private auth = inject(AuthService);

  constructor() {
    // Run on construction to navigate immediately
    const isLoggedIn = this.auth.isAuthenticated();
    if (!isLoggedIn) {
      this.router.navigate(['/home']);
      return;
    }
    const user = this.auth.getCurrentUser();
    const role = user?.role;

    // Prefer last visited per role
    const lastPatient = sessionStorage.getItem('lastPatientRoute') || '/patient/dashboard';
    const lastDoctor = sessionStorage.getItem('lastDoctorRoute') || '/doctor/dashboard';

    if (role === 'doctor') {
      this.router.navigateByUrl(lastDoctor);
    } else {
      this.router.navigateByUrl(lastPatient);
    }
  }
}
