import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-clinic-patients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="toolbar">
    <input [(ngModel)]="search" placeholder="Search patients (name/email)" />
    <button (click)="load()">Search</button>
  </div>

  <div class="card">
    <table class="table">
      <thead>
        <tr>
          <th>Appointment Date</th>
          <th>Patient</th>
          <th>Email</th>
          <th>Doctor</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let a of appts">
          <td>{{ a.appointmentDate | date:'short' }}</td>
          <td>{{ a.patient?.firstName }} {{ a.patient?.lastName }}</td>
          <td>{{ a.patient?.email }}</td>
          <td>{{ a.doctor?.firstName }} {{ a.doctor?.lastName }}</td>
          <td>{{ a.status }}</td>
          <td class="actions">
            <button (click)="attendance(a.id, 'ARRIVED')">Arrived</button>
            <button (click)="attendance(a.id, 'CANCELLED')">Cancelled</button>
            <button (click)="attendance(a.id, 'NO_SHOW')">No-show</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  `,
  styles: [`
    .toolbar { display:flex; gap:8px; margin-bottom:12px; }
    .card { background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:12px; }
    .table { width:100%; border-collapse: collapse; }
    .table th, .table td { padding:8px; border-bottom:1px solid #e2e8f0; text-align:left; }
    .actions button { margin-right: 6px; }
  `]
})
export class ClinicPatientsComponent {
  private http = inject(HttpClient);
  private API = (environment as any).clinicApiUrl || 'http://localhost:3000/api/clinic';

  appts: any[] = [];
  page = 1;
  pageSize = 20;
  total = 0;
  search = '';

  ngOnInit(){ this.load(); }

  load(){
    const params: any = { page: this.page, pageSize: this.pageSize };
    if (this.search) params.search = this.search;
    this.http.get<any>(`${this.API}/patients`, { params }).subscribe({
      next: (res) => { this.appts = res?.data?.items || []; this.total = res?.data?.total || 0; },
      error: (err) => console.error('Failed to load clinic patients', err)
    });
  }

  attendance(appointmentId: string, status: 'ARRIVED'|'CANCELLED'|'NO_SHOW'){
    this.http.patch<any>(`${this.API}/patients/${appointmentId}/attendance`, { attendance: status }).subscribe({
      next: () => this.load(),
      error: (err) => console.error('Failed to update attendance', err)
    });
  }
}
