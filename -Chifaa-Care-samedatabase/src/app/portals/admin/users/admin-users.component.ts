import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

type RoleFilter = '' | 'PATIENT' | 'DOCTOR' | 'CLINIC' | 'ADMIN';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="wrap">
      <div class="toolbar">
        <input class="input" [(ngModel)]="query" (ngModelChange)="debouncedReload()" placeholder="Search by name or email" />
        <select class="select" [(ngModel)]="role" (change)="reload()">
          <option value="">All roles</option>
          <option value="PATIENT">Patient</option>
          <option value="DOCTOR">Doctor</option>
          <option value="CLINIC">Clinic</option>
          <option value="ADMIN">Admin</option>
        </select>
        <select class="select" [(ngModel)]="active" (change)="reload()">
          <option [ngValue]="undefined">All statuses</option>
          <option [ngValue]="true">Active</option>
          <option [ngValue]="false">Inactive</option>
        </select>
      </div>

      <div class="table-wrap" *ngIf="items; else loadingTpl">
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of items">
              <td>{{ (u.firstName || '') + ' ' + (u.lastName || '') }}</td>
              <td>{{ u.email }}</td>
              <td>
                <select [(ngModel)]="u.role" (change)="changeRole(u.id, u.role)" class="select small">
                  <option value="PATIENT">Patient</option>
                  <option value="DOCTOR">Doctor</option>
                  <option value="CLINIC">Clinic</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </td>
              <td>
                <label class="switch">
                  <input type="checkbox" [checked]="u.isActive" (change)="toggleActive(u)" />
                  <span></span>
                </label>
              </td>
              <td>
                <button class="btn" (click)="toggleActive(u)">{{ u.isActive ? 'Deactivate' : 'Activate' }}</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="pager" *ngIf="total > pageSize">
          <button class="btn" [disabled]="page===1" (click)="page=page-1; reload()">Prev</button>
          <span>Page {{page}} / {{ totalPages }}</span>
          <button class="btn" [disabled]="page===totalPages" (click)="page=page+1; reload()">Next</button>
        </div>
      </div>
      <ng-template #loadingTpl><div class="muted">Loading users…</div></ng-template>
    </div>
  `,
  styles: [`
    .wrap{ display:block; }
    .toolbar{ display:flex; gap:8px; margin-bottom:10px; }
    .input{ padding:8px 10px; border:1px solid #e5e7eb; border-radius:8px; width:260px; }
    .select{ padding:8px 10px; border:1px solid #e5e7eb; border-radius:8px; }
    .select.small{ padding:4px 6px; }
    .table-wrap{ background:#fff; border:1px solid #eef2f7; border-radius:12px; overflow:hidden; }
    .table{ width:100%; border-collapse:collapse; }
    th, td{ text-align:left; padding:10px 12px; border-bottom:1px solid #f1f5f9; }
    th{ background:#f8fafc; font-weight:600; font-size:13px; color:#475569; }
    .pager{ display:flex; gap:10px; align-items:center; padding:10px; }
    .btn{ padding:6px 10px; border:1px solid #e5e7eb; background:#fff; border-radius:8px; cursor:pointer; }
    .btn:disabled{ opacity:.5; cursor:not-allowed; }
    .muted{ color:#6b7280; }
    .switch{ position:relative; display:inline-block; width:40px; height:22px; }
    .switch input{ opacity:0; width:0; height:0; }
    .switch span{ position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0; background:#e5e7eb; border-radius:999px; transition:.2s; }
    .switch span:before{ position:absolute; content:''; height:18px; width:18px; left:2px; top:2px; background:white; border-radius:50%; transition:.2s; box-shadow:0 1px 2px rgba(0,0,0,.1); }
    .switch input:checked + span{ background:#22c55e; }
    .switch input:checked + span:before{ transform: translateX(18px); }
  `]
})
export class AdminUsersComponent implements OnInit {
  items: any[] = [];
  total = 0;
  page = 1;
  pageSize = 20;
  query = '';
  role: RoleFilter = '';
  active: boolean | undefined = undefined;
  private debounce?: any;

  constructor(private admin: AdminService) {}

  ngOnInit(): void {
    this.reload();
  }

  get totalPages() { return Math.max(1, Math.ceil(this.total / this.pageSize)); }

  debouncedReload() {
    clearTimeout(this.debounce);
    this.debounce = setTimeout(() => this.reload(), 300);
  }

  reload() {
    this.admin.getUsers({ query: this.query.trim() || undefined, role: this.role || undefined, active: this.active, page: this.page, pageSize: this.pageSize })
      .subscribe({
        next: (res) => {
          const data = res?.data || res;
          this.items = data.items || [];
          this.total = data.total || 0;
          this.page = data.page || 1;
          this.pageSize = data.pageSize || 20;
        },
        error: () => { this.items = []; this.total = 0; }
      });
  }

  toggleActive(u: any) {
    const newVal = !u.isActive;
    this.admin.updateUser(u.id, { isActive: newVal }).subscribe({
      next: () => { u.isActive = newVal; },
      error: () => {}
    });
  }

  changeRole(id: string, role: string) {
    this.admin.updateUser(id, { role }).subscribe({ next: () => {}, error: () => {} });
  }
}
