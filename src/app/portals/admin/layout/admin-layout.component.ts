import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  template: `
  <div class="admin-shell">
    <aside class="sidebar">
      <div class="brand">ChifaaCare Admin</div>
      <nav>
        <a routerLink="/admin/dashboard" routerLinkActive="active">Dashboard</a>
        <a routerLink="/admin/users" routerLinkActive="active">Users</a>
        <a routerLink="/admin/doctors" routerLinkActive="active">Doctors</a>
        <a routerLink="/admin/clinics" routerLinkActive="active">Clinics</a>
        <a routerLink="/admin/patients" routerLinkActive="active">Patients</a>
        <a routerLink="/admin/logs" routerLinkActive="active">Logs</a>
        <a routerLink="/admin/settings" routerLinkActive="active">Settings</a>
      </nav>
    </aside>
    <main class="content">
      <header class="topbar">
        <div class="spacer"></div>
        <div class="profile">Admin</div>
      </header>
      <section class="page">
        <router-outlet></router-outlet>
      </section>
    </main>
  </div>
  `,
  styles: [`
    .admin-shell { display: grid; grid-template-columns: 240px 1fr; min-height: 100vh; }
    .sidebar { background: #0f766e; color: #fff; padding: 20px; }
    .brand { font-weight: 700; margin-bottom: 16px; }
    .sidebar nav { display: flex; flex-direction: column; gap: 8px; }
    .sidebar a { color: #e2f6f4; text-decoration: none; padding: 8px 10px; border-radius: 6px; }
    .sidebar a.active, .sidebar a:hover { background: #115e59; color: #fff; }
    .content { background: #f7faf9; }
    .topbar { display: flex; align-items: center; justify-content: flex-end; padding: 12px 16px; background: #ffffff; border-bottom: 1px solid #e2e8f0; }
    .page { padding: 16px; }
  `]
})
export class AdminLayoutComponent {}
