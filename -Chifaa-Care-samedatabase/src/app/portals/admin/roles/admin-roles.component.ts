import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="wrap">
      <h2>Roles & Permissions</h2>
      <div class="grid">
        <!-- Roles -->
        <section class="card">
          <div class="card-header">Roles</div>
          <div class="row">
            <input class="input" [(ngModel)]="newRoleName" placeholder="Role name (e.g., ADMIN)" />
            <input class="input" [(ngModel)]="newRoleDesc" placeholder="Description (optional)" />
            <button class="btn" (click)="createRole()" [disabled]="!newRoleName">Create Role</button>
          </div>
          <ul class="list">
            <li *ngFor="let r of roles" [class.active]="r.id===selectedRoleId" (click)="selectRole(r.id)">
              <div class="title">{{r.name}}</div>
              <div class="desc">{{r.description || '—'}}</div>
              <button class="btn danger" (click)="deleteRole(r.id); $event.stopPropagation()">Delete</button>
            </li>
          </ul>
        </section>

        <!-- Permissions -->
        <section class="card">
          <div class="card-header">Permissions</div>
          <div class="row">
            <input class="input" [(ngModel)]="permName" placeholder="Name (e.g., users:manage)" />
            <input class="input" [(ngModel)]="permResource" placeholder="Resource (e.g., users)" />
            <input class="input" [(ngModel)]="permAction" placeholder="Action (read|write|delete|manage)" />
            <button class="btn" (click)="createPermission()" [disabled]="!permName || !permResource || !permAction">Create Permission</button>
          </div>
          <div class="perm-list">
            <div class="perm-item" *ngFor="let p of permissions">
              <div class="meta">
                <div class="title">{{p.name}}</div>
                <div class="desc">{{p.resource}} • {{p.action}}</div>
              </div>
              <div class="actions">
                <label class="chk" *ngIf="selectedRoleId">
                  <input type="checkbox" [checked]="roleHasPermission(p.id)" (change)="toggleRolePermission(p.id, $any($event.target).checked)" />
                  <span>Assigned</span>
                </label>
                <button class="btn danger" (click)="deletePermission(p.id)">Delete</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .wrap{ display:block; }
    .grid{ display:grid; grid-template-columns: 320px 1fr; gap:12px; }
    .card{ border:1px solid #eef2f7; border-radius:12px; background:#fff; padding:12px; }
    .card-header{ font-weight:600; margin-bottom:10px; }
    .row{ display:flex; gap:8px; margin-bottom:10px; flex-wrap:wrap; }
    .input{ padding:8px 10px; border:1px solid #e5e7eb; border-radius:8px; }
    .btn{ padding:8px 10px; border:1px solid #e5e7eb; background:#fff; border-radius:8px; cursor:pointer; }
    .btn.danger{ border-color:#fecaca; color:#b91c1c; }
    .list{ list-style:none; margin:0; padding:0; }
    .list li{ display:grid; grid-template-columns: 1fr auto; gap:6px; padding:10px; border:1px solid #f1f5f9; border-radius:10px; margin-bottom:8px; cursor:pointer; }
    .list li.active{ border-color:#bfdbfe; background:#eff6ff; }
    .title{ font-weight:600; }
    .desc{ font-size:12px; color:#6b7280; }
    .perm-list{ display:grid; gap:8px; }
    .perm-item{ display:grid; grid-template-columns: 1fr auto; align-items:center; border:1px solid #f1f5f9; border-radius:10px; padding:10px; }
    .meta .title{ font-weight:600; }
    .meta .desc{ font-size:12px; color:#6b7280; }
    .actions{ display:flex; gap:8px; align-items:center; }
    .chk{ display:flex; align-items:center; gap:6px; font-size:12px; color:#374151; }
  `]
})
export class AdminRolesComponent implements OnInit {
  roles: any[] = [];
  permissions: any[] = [];
  rolePermissions: Set<string> = new Set();
  selectedRoleId: string | null = null;

  newRoleName = '';
  newRoleDesc = '';

  permName = '';
  permResource = '';
  permAction = '';

  constructor(private admin: AdminService) {}

  ngOnInit(): void {
    this.loadRoles();
    this.loadPermissions();
  }

  loadRoles() {
    this.admin.getRoles().subscribe({ next: res => { this.roles = (res?.data?.items)||[]; if (!this.selectedRoleId && this.roles.length) { this.selectRole(this.roles[0].id); } } });
  }
  loadPermissions() {
    this.admin.getPermissions().subscribe({ next: res => this.permissions = (res?.data?.items)||[] });
  }
  loadRolePermissions(roleId: string) {
    this.admin.getRolePermissions(roleId).subscribe({ next: res => {
      const items = (res?.data?.items)||[]; this.rolePermissions = new Set(items.map((i:any)=> i.permissionId));
    }});
  }

  selectRole(id: string) { this.selectedRoleId = id; this.loadRolePermissions(id); }

  createRole() {
    const data = { name: this.newRoleName.trim().toUpperCase(), description: this.newRoleDesc?.trim()||undefined };
    if (!data.name) return;
    this.admin.createRole(data).subscribe({ next: () => { this.newRoleName=''; this.newRoleDesc=''; this.loadRoles(); } });
  }
  deleteRole(id: string) { this.admin.deleteRole(id).subscribe({ next: () => { if (this.selectedRoleId===id) this.selectedRoleId=null; this.loadRoles(); } }); }

  createPermission() {
    const data = { name: this.permName.trim(), resource: this.permResource.trim(), action: this.permAction.trim() } as any;
    if (!data.name || !data.resource || !data.action) return;
    this.admin.createPermission(data).subscribe({ next: () => { this.permName=''; this.permResource=''; this.permAction=''; this.loadPermissions(); } });
  }
  deletePermission(id: string) { this.admin.deletePermission(id).subscribe({ next: () => this.loadPermissions() }); }

  roleHasPermission(permId: string) { return this.rolePermissions.has(permId); }
  toggleRolePermission(permId: string, checked: boolean) {
    if (!this.selectedRoleId) return;
    if (checked) {
      this.admin.addPermissionToRole(this.selectedRoleId, permId).subscribe({ next: () => this.rolePermissions.add(permId) });
    } else {
      this.admin.removePermissionFromRole(this.selectedRoleId, permId).subscribe({ next: () => this.rolePermissions.delete(permId) });
    }
  }
}
