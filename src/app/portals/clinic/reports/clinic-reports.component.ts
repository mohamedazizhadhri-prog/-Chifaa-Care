import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-clinic-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="card">
    <h3>Reports (Last 28 days)</h3>
    <pre>{{data | json}}</pre>
  </div>
  `,
  styles: [`
    .card { background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:12px; }
  `]
})
export class ClinicReportsComponent {
  private http = inject(HttpClient);
  private API = (environment as any).clinicApiUrl || 'http://localhost:3000/api/clinic';

  data: any = {};

  ngOnInit(){
    this.http.get<any>(`${this.API}/reports`).subscribe({
      next: (res) => this.data = res?.data || {},
      error: (err) => console.error('Failed to load reports', err)
    });
  }
}
