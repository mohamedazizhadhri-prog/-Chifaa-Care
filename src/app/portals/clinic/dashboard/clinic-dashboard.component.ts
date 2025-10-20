import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-clinic-dashboard',
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
    <h3>Today Summary</h3>
    <pre>{{summary | json}}</pre>
  </div>
  `,
  styles: [`
    .cards { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); margin-bottom: 16px; }
    .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
    .value { font-size: 28px; font-weight: 700; color: #0f766e; }
    .label { color: #475569; }
  `]
})
export class ClinicDashboardComponent {
  private http = inject(HttpClient);
  private API_CLINIC = (environment as any).clinicApiUrl || 'http://localhost:3000/api/clinic';

  statsCards = [
    { label: 'Scheduled', value: 0 },
    { label: 'Checked In', value: 0 },
    { label: 'Completed', value: 0 },
  ];
  summary: any = {};

  ngOnInit(){
    this.http.get<any>(`${this.API_CLINIC}/overview`).subscribe({
      next: (res) => {
        const s = res?.data?.today || {};
        this.statsCards = [
          { label: 'Scheduled', value: s.scheduled || 0 },
          { label: 'Checked In', value: s.checkedIn || 0 },
          { label: 'Completed', value: s.completed || 0 },
        ];
        this.summary = res?.data || {};
      },
      error: (err) => console.error('Failed to load clinic overview', err)
    });
  }
}
