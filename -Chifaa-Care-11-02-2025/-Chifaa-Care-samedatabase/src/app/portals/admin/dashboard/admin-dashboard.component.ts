import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="wrap">
      <h1>Admin Dashboard</h1>
      <div class="grid" *ngIf="stats; else loadingTpl">
        <div class="card">
          <div class="label">Total Users</div>
          <div class="value">{{ stats.users.total }}</div>
          <div class="sub">Patients {{ stats.users.patients }} • Doctors {{ stats.users.doctors }} • Clinics {{ stats.users.clinics }} • Admins {{ stats.users.admins }}</div>
        </div>
        <div class="card">
          <div class="label">Appointments</div>
          <div class="value">{{ stats.appointments.total }}</div>
          <div class="sub">Today {{ stats.appointments.today }}</div>
        </div>
        <div class="card">
          <div class="label">Clinics</div>
          <div class="value">{{ stats.clinics.total }}</div>
        </div>
      </div>
      <ng-template #loadingTpl>
        <div class="muted">Loading stats…</div>
      </ng-template>
    </div>
  `,
  styles: [`
    .wrap{ display:block; padding: 8px; }
    .grid{ display:grid; gap:12px; grid-template-columns: repeat(auto-fit, minmax(220px,1fr)); }
    .card{ padding:14px; border:1px solid #eef2f7; border-radius:12px; background:#fff; box-shadow: var(--shadow-sm); }
    .label{ font-size:12px; color:#6b7280; }
    .value{ font-size:28px; font-weight:700; color:#0f172a; }
    .sub{ font-size:12px; color:#6b7280; margin-top:6px; }
    .muted{ color:#6b7280; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  stats: any;
  constructor(private admin: AdminService) {}
  ngOnInit(): void {
    this.admin.getStats().subscribe({
      next: (res) => this.stats = res?.data || res,
      error: () => this.stats = null
    });
  }
}
