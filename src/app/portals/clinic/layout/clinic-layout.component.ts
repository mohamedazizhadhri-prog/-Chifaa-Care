import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-clinic-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  template: `
  <div class="clinic-shell">
    <aside class="sidebar">
      <div class="brand">Clinic Portal</div>
      <nav>
        <a routerLink="/clinic/dashboard" routerLinkActive="active">Overview</a>
        <a routerLink="/clinic/patients" routerLinkActive="active">Patients</a>
        <a routerLink="/clinic/follow-up" routerLinkActive="active">Treatment Follow-Up</a>
        <a routerLink="/clinic/doctors" routerLinkActive="active">Doctor Coordination</a>
        <a routerLink="/clinic/reports" routerLinkActive="active">Reports</a>
        <a routerLink="/clinic/settings" routerLinkActive="active">Settings</a>
      </nav>
    </aside>
    <main class="content">
      <header class="topbar">
        <div class="title">ChifaaCare</div>
        <div class="spacer"></div>
        <div class="profile">Clinic</div>
      </header>
      <section class="page">
        <router-outlet></router-outlet>
      </section>
    </main>
  </div>
  `,
  styles: [`
    .clinic-shell { display:grid; grid-template-columns:240px 1fr; min-height:100vh; }
    .sidebar { background:#0ea5a6; color:#fff; padding:20px; }
    .brand { font-weight:700; margin-bottom:16px; }
    .sidebar nav { display:flex; flex-direction:column; gap:8px; }
    .sidebar a { color:#e2f6f4; text-decoration:none; padding:8px 10px; border-radius:6px; }
    .sidebar a.active, .sidebar a:hover { background:#0b8282; color:#fff; }
    .content { background:#f7faf9; }
    .topbar { display:flex; align-items:center; padding:12px 16px; background:#ffffff; border-bottom:1px solid #e2e8f0; }
    .title { font-weight:600; color:#0f766e; }
    .spacer { flex:1; }
    .page { padding:16px; }
  `]
})
export class ClinicLayoutComponent {}
