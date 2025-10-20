import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="toolbar">
    <select [(ngModel)]="role">
      <option value="">All Roles</option>
      <option value="ADMIN">ADMIN</option>
      <option value="DOCTOR">DOCTOR</option>
      <option value="PATIENT">PATIENT</option>
      <option value="PROJECT_TEAM">PROJECT_TEAM</option>
    </select>
    <input type="date" [(ngModel)]="start" />
    <input type="date" [(ngModel)]="end" />
    <button (click)="load()">Filter</button>
    <button (click)="exportCsv()">Export CSV</button>
  </div>

  <div class="card">
    <table class="table">
      <thead>
        <tr>
          <th>Time</th>
          <th>User</th>
          <th>Role</th>
          <th>Action</th>
          <th>Resource</th>
          <th>Success</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let log of logs">
          <td>{{log.timestamp | date:'short'}}</td>
          <td>{{log.userEmail || log.userId}}</td>
          <td>{{log.userRole}}</td>
          <td>{{log.action}}</td>
          <td>{{log.resource}}</td>
          <td>{{log.success ? 'Yes' : 'No'}}</td>
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
export class AdminLogsComponent {
  private http = inject(HttpClient);
  private API_ADMIN = (environment as any).adminApiUrl || 'http://localhost:3000/api/admin';

  logs: any[] = [];
  role = '';
  start = '';
  end = '';
  page = 1;
  pageSize = 50;

  ngOnInit(){ this.load(); }

  load(){
    const params: any = { page: this.page, pageSize: this.pageSize };
    if (this.role) params.role = this.role;
    if (this.start) params.start = this.start;
    if (this.end) params.end = this.end;
    this.http.get<any>(`${this.API_ADMIN}/logs`, { params }).subscribe({
      next: (res) => this.logs = res?.data?.items || [],
      error: (err) => console.error('Failed to load logs', err)
    });
  }

  exportCsv(){
    const header = ['timestamp','userEmail','userRole','action','resource','success'];
    const rows = this.logs.map((l:any) => [l.timestamp, l.userEmail || '', l.userRole || '', l.action || '', l.resource || '', l.success ? 'true' : 'false']);
    const csv = [header, ...rows].map(r => r.map(x => `"${(x??'').toString().replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
