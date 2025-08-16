import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, RouterLinkActive, Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-portal-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="portal">
      <header class="portal-topbar">
        <div class="container" style="display:flex;align-items:center;gap:12px;justify-content:space-between;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:36px;height:36px;border-radius:8px;background:linear-gradient(135deg,var(--c-green),var(--c-blue));"></div>
            <strong>ChifaaCare</strong>
          </div>
          <div style="display:flex;align-items:center;gap:12px;">
            <a routerLink="/home" class="btn btn-blue-outline"><i class="fa-solid fa-house"></i> Home</a>
            <button class="btn btn-green"><i class="fa-regular fa-user"></i> Profile</button>
          </div>
        </div>
      </header>

      <div class="portal-shell container">
        <aside class="portal-sidebar">
          <nav class="menu">
            <a routerLink="dashboard" routerLinkActive="active" class="menu-item"><i class="fa-solid fa-gauge-high"></i> <span>Dashboard</span></a>
            <a routerLink="book-consultation" routerLinkActive="active" class="menu-item"><i class="fa-solid fa-calendar-check"></i> <span>Book Consultation</span></a>
            <a routerLink="treatment-plan" routerLinkActive="active" class="menu-item"><i class="fa-solid fa-prescription-bottle-medical"></i> <span>Treatment Plan</span></a>
            <a routerLink="ai-reports" routerLinkActive="active" class="menu-item"><i class="fa-solid fa-wave-square"></i> <span>AI Reports</span></a>
            <a routerLink="messages" routerLinkActive="active" class="menu-item"><i class="fa-regular fa-comments"></i> <span>Messages</span></a>
            <a routerLink="medical-records" routerLinkActive="active" class="menu-item"><i class="fa-regular fa-file-medical"></i> <span>Medical Records</span></a>
            <a routerLink="partner-clinics" routerLinkActive="active" class="menu-item"><i class="fa-solid fa-hospital"></i> <span>Partner Clinics</span></a>
            <a routerLink="settings" routerLinkActive="active" class="menu-item"><i class="fa-solid fa-gear"></i> <span>Settings</span></a>
            <hr style="border:none;height:1px;background:#edf2f7;margin:.25rem 0;"/>
            <a routerLink="patients" routerLinkActive="active" class="menu-item"><i class="fa-regular fa-user"></i> <span>Patients</span></a>
            <a routerLink="consultations" routerLinkActive="active" class="menu-item"><i class="fa-solid fa-video"></i> <span>Consultations</span></a>
            <a routerLink="treatment-management" routerLinkActive="active" class="menu-item"><i class="fa-solid fa-clipboard-list"></i> <span>Treatment Management</span></a>
          </nav>
        </aside>

        <main class="portal-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host{display:block}
    .portal-topbar{ position: sticky; top: 0; z-index: 10; background: #fff; border-bottom: 1px solid #eef2f7; }
    .portal-shell{ display: grid; grid-template-columns: 260px 1fr; gap: 16px; align-items: start; padding: 16px 0; min-height: calc(100vh - 64px); }
    .portal-sidebar{ position: sticky; top: 72px; align-self: start; }
    .portal-content{ background: #fff; border-radius: var(--radius); padding: 16px; box-shadow: var(--shadow-sm); border: 1px solid rgba(0,0,0,0.04); }
    .menu { display:grid; gap:.4rem; }
    .menu-item { display:flex; align-items:center; gap:.6rem; padding:.7rem .9rem; border-radius:12px; color:#2b3a49; text-decoration:none; transition:background .2s, transform .15s; }
    .menu-item i{ color: var(--c-blue); }
    .menu-item:hover{ background: rgba(52,152,219,.06); transform: translateY(-1px); }
    .menu-item.active{ background: linear-gradient(135deg, rgba(46,204,113,.12), rgba(52,152,219,.12)); box-shadow: var(--shadow-sm); }

    @media (max-width: 1024px){
      .portal-shell{ grid-template-columns: 220px 1fr; }
    }
    @media (max-width: 768px){
      .portal-shell{ grid-template-columns: 1fr; }
      .portal-sidebar{ position: static; }
    }
  `]
})
export class PortalLayoutComponent {
  constructor(private router: Router) {
    // Remember last visited patient/doctor sub-route to improve /account redirect UX
    this.router.events.subscribe(ev => {
      if (ev instanceof NavigationEnd) {
        const url = ev.urlAfterRedirects || ev.url;
        if (url.startsWith('/patient/')) {
          sessionStorage.setItem('lastPatientRoute', url);
        } else if (url.startsWith('/doctor/')) {
          sessionStorage.setItem('lastDoctorRoute', url);
        }
      }
    });
  }
}
