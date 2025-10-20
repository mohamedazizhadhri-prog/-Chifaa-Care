import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="card">
    <h3>System Settings</h3>
    <div class="form-grid">
      <label>
        Branding Logo URL
        <input [(ngModel)]="settings['branding.logoUrl']" placeholder="https://..." />
      </label>
      <label>
        Primary Color
        <input [(ngModel)]="settings['branding.primaryColor']" placeholder="#00A676" />
      </label>
      <label>
        Failed Login Threshold
        <input [(ngModel)]="settings['alerts.failedLoginThreshold']" type="number" />
      </label>
    </div>
    <button class="primary" (click)="save()">Save Settings</button>
  </div>
  `,
  styles: [`
    .card { background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:12px; margin-bottom:12px; }
    .form-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:8px; margin-bottom:8px; }
    .primary { background:#0f766e; color:#fff; border:none; padding:8px 12px; border-radius:6px; }
    label { display:flex; flex-direction:column; gap:4px; }
  `]
})
export class AdminSettingsComponent {
  private http = inject(HttpClient);
  private API_ADMIN = (environment as any).adminApiUrl || 'http://localhost:3000/api/admin';

  settings: Record<string, any> = {};

  ngOnInit(){ this.fetch(); }

  fetch(){
    this.http.get<any>(`${this.API_ADMIN}/settings`).subscribe({
      next: (res) => {
        const items = res?.data || [];
        // Convert array of rows with key/value into a flat object
        const obj: Record<string, any> = {};
        for (const row of items) obj[row.key] = row.value;
        this.settings = obj;
      },
      error: (err) => console.error('Failed to load settings', err)
    });
  }

  save(){
    this.http.patch<any>(`${this.API_ADMIN}/settings`, this.settings).subscribe({
      next: () => this.fetch(),
      error: (err) => console.error('Failed to save settings', err)
    });
  }
}
