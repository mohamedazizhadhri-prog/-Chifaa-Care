import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-doctors',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="toolbar">
    <button class="primary" (click)="load()">Refresh</button>
  </div>
  <div class="card">
    <table class="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Specialty</th>
          <th>Experience</th>
          <th>License</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let d of doctors">
          <td>{{d.firstName}} {{d.lastName}}</td>
          <td>{{d.email}}</td>
          <td>{{d.doctorProfile?.specialization || '-'}}</td>
          <td>{{d.doctorProfile?.experience || 0}}</td>
          <td>{{d.doctorProfile?.licenseNumber || '-'}}</td>
          <td>{{d.isActive ? 'ACTIVE' : 'SUSPENDED'}}</td>
          <td>
            <button (click)="approve(d.id)" [disabled]="d.isActive">Approve</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  `,
  styles: [`
    .toolbar { display:flex; gap:8px; margin-bottom:12px; }
    .card { background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:12px; margin-bottom:12px; }
    .table { width:100%; border-collapse: collapse; }
    .table th, .table td { padding:8px; border-bottom:1px solid #e2e8f0; text-align:left; }
    .primary { background:#0f766e; color:#fff; border:none; padding:8px 12px; border-radius:6px; }
  `]
})
export class AdminDoctorsComponent {
  private http = inject(HttpClient);
  private API_ADMIN = (environment as any).adminApiUrl || 'http://localhost:3000/api/admin';

  doctors: any[] = [];
  page = 1;
  pageSize = 20;

  ngOnInit() { this.load(); }

  load() {
    const params: any = { page: this.page, pageSize: this.pageSize };
    this.http.get<any>(`${this.API_ADMIN}/doctors`, { params }).subscribe({
      next: (res) => this.doctors = res?.data?.items || [],
      error: (err) => console.error('Failed to load doctors', err)
    });
  }

  approve(id: string) {
    this.http.post<any>(`${this.API_ADMIN}/approve-doctor/${id}`, {}).subscribe({
      next: () => this.load(),
      error: (err) => console.error('Failed to approve doctor', err)
    });
  }
}
