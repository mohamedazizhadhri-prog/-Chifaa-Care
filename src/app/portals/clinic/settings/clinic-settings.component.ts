import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-clinic-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="card">
    <h3>Clinic Profile</h3>
    <div class="form-grid">
      <label>Name<input [(ngModel)]="form.name" /></label>
      <label>Address<input [(ngModel)]="form.address" /></label>
      <label>City<input [(ngModel)]="form.city" /></label>
      <label>State<input [(ngModel)]="form.state" /></label>
      <label>Country<input [(ngModel)]="form.country" /></label>
      <label>Postal Code<input [(ngModel)]="form.postalCode" /></label>
      <label>Phone<input [(ngModel)]="form.phone" /></label>
      <label>Email<input [(ngModel)]="form.email" /></label>
      <label>Website<input [(ngModel)]="form.website" /></label>
    </div>
    <button class="primary" (click)="save()">Save</button>
    <span class="muted" *ngIf="message">{{message}}</span>
  </div>
  `,
  styles: [`
    .card { background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:12px; }
    .form-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:8px; margin-bottom:8px; }
    .primary { background:#0f766e; color:#fff; border:none; padding:8px 12px; border-radius:6px; }
    .muted { color:#64748b; margin-left:8px; }
    label { display:flex; flex-direction:column; gap:4px; }
  `]
})
export class ClinicSettingsComponent {
  private http = inject(HttpClient);
  private API = (environment as any).clinicApiUrl || 'http://localhost:3000/api/clinic';

  form: any = { name:'', address:'', city:'', state:'', country:'', postalCode:'', phone:'', email:'', website:'' };
  message = '';

  ngOnInit(){ this.fetch(); }

  fetch(){
    this.http.get<any>(`${this.API}/me`).subscribe({
      next: (res) => this.form = { ...(res?.data || {}) },
      error: (err) => console.error('Failed to load clinic profile', err)
    });
  }

  save(){
    this.http.patch<any>(`${this.API}/me`, this.form).subscribe({
      next: () => { this.message = 'Saved'; setTimeout(()=> this.message='', 3000); },
      error: (err) => { console.error('Failed to save clinic profile', err); this.message = 'Save failed'; }
    });
  }
}
