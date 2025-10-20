import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="cards">
    <div class="card" *ngFor="let c of statsCards">
      <div class="value">{{c.value}}</div>
      <div class="label">{{c.label}}</div>
    </div>
  </div>
  <div class="card">
    <h3>Alerts</h3>
    <pre>{{alerts | json}}</pre>
  </div>
  `,
  styles: [`
    .cards { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); margin-bottom: 16px; }
    .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
    .value { font-size: 28px; font-weight: 700; color: #0f766e; }
    .label { color: #475569; }
  `]
})
export class AdminDashboardComponent {
  private http = inject(HttpClient);
  private API_ADMIN = (environment as any).adminApiUrl || 'http://localhost:3000/api/admin';

  statsCards = [
    { label: 'Patients', value: 0 },
    { label: 'Doctors', value: 0 },
    { label: 'Clinics', value: 0 },
    { label: 'Appointments', value: 0 },
  ];
  alerts: any = {};

  ngOnInit() {
    this.http.get<any>(`${this.API_ADMIN}/overview`).subscribe({
      next: (res) => {
        const s = res?.data?.stats || {};
        this.statsCards = [
          { label: 'Patients', value: s.patients || 0 },
          { label: 'Doctors', value: s.doctors || 0 },
          { label: 'Clinics', value: s.clinics || 0 },
          { label: 'Appointments', value: s.appointments || 0 },
        ];
        this.alerts = res?.data?.alerts || {};
      },
      error: (err) => {
        console.error('Failed to load overview', err);
      }
    });
  }
}
