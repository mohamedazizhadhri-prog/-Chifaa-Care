import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="toolbar">
    <input [(ngModel)]="roleFilter" placeholder="Filter by role (PATIENT/DOCTOR/ADMIN)" />
    <button (click)="load()">Filter</button>
    <button class="primary" (click)="toggleCreate()">+ Add User</button>
  </div>

  <div class="card" *ngIf="showCreate">
    <h3>Create User</h3>
    <div class="form-grid">
      <input [(ngModel)]="create.firstName" placeholder="First name" />
      <input [(ngModel)]="create.lastName" placeholder="Last name" />
      <input [(ngModel)]="create.email" placeholder="Email" />
      <select [(ngModel)]="create.role">
        <option value="PATIENT">PATIENT</option>
        <option value="DOCTOR">DOCTOR</option>
        <option value="ADMIN">ADMIN</option>
      </select>
      <input [(ngModel)]="create.password" placeholder="Password" type="password" />
    </div>
    <button class="primary" (click)="createUser()">Create</button>
    <button (click)="toggleCreate()">Cancel</button>
  </div>

  <div class="card">
    <table class="table">
      <thead>
        <tr>
          <th>Email</th>
          <th>Name</th>
          <th>Role</th>
          <th>Active</th>
          <th>Created</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let u of users">
          <td>{{u.email}}</td>
          <td>{{u.firstName}} {{u.lastName}}</td>
          <td>{{u.role}}</td>
          <td>{{u.isActive ? 'Yes' : 'No'}}</td>
          <td>{{u.createdAt | date:'short'}}</td>
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
    .form-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap:8px; margin-bottom:8px; }
    .primary { background:#0f766e; color:#fff; border:none; padding:8px 12px; border-radius:6px; }
  `]
})
export class AdminUsersComponent {
  private http = inject(HttpClient);
  private API_ADMIN = (environment as any).adminApiUrl || 'http://localhost:3000/api/admin';

  users: any[] = [];
  page = 1;
  pageSize = 20;
  total = 0;
  roleFilter = '';

  showCreate = false;
  create = { firstName: '', lastName: '', email: '', role: 'PATIENT', password: '' };

  ngOnInit() {
    this.load();
  }

  toggleCreate() { this.showCreate = !this.showCreate; }

  load() {
    const params: any = { page: this.page, pageSize: this.pageSize };
    if (this.roleFilter) params.role = this.roleFilter.toUpperCase();
    this.http.get<any>(`${this.API_ADMIN}/users`, { params }).subscribe({
      next: (res) => {
        this.users = res?.data?.items || [];
        this.total = res?.data?.total || 0;
      },
      error: (err) => console.error('Failed to load users', err)
    });
  }

  createUser() {
    const payload = { ...this.create };
    this.http.post<any>(`${this.API_ADMIN}/create-user`, payload).subscribe({
      next: () => { this.toggleCreate(); this.create = { firstName:'', lastName:'', email:'', role:'PATIENT', password:'' }; this.load(); },
      error: (err) => console.error('Failed to create user', err)
    });
  }
}
