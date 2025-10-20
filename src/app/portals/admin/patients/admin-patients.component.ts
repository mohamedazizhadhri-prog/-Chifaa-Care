import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-patients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="toolbar">
    <input [(ngModel)]="search" placeholder="Search by name or email" />
    <input [(ngModel)]="clinicId" placeholder="Clinic ID (optional)" />
    <button (click)="load()">Search</button>
  </div>

  <div class="card">
    <table class="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Clinic</th>
          <th>Active</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let p of patients">
          <td>{{p.firstName}} {{p.lastName}}</td>
          <td>{{p.email}}</td>
          <td>{{p.clinicId || '-'}}</td>
          <td>{{p.isActive ? 'Yes' : 'No'}}</td>
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
  `]
})
export class AdminPatientsComponent {
  private http = inject(HttpClient);
  private API_ADMIN = (environment as any).adminApiUrl || 'http://localhost:3000/api/admin';

  patients: any[] = [];
  page = 1;
  pageSize = 20;
  search = '';
  clinicId = '';

  ngOnInit() { this.load(); }

  load() {
    const params: any = { page: this.page, pageSize: this.pageSize };
    if (this.search) params.search = this.search;
    if (this.clinicId) params.clinicId = this.clinicId;
    this.http.get<any>(`${this.API_ADMIN}/patients`, { params }).subscribe({
      next: (res) => this.patients = res?.data?.items || [],
      error: (err) => console.error('Failed to load patients', err)
    });
  }
}
