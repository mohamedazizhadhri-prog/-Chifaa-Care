import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-clinic-follow-up',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="card">
    <h3>Add Follow-Up Entry</h3>
    <div class="form-grid">
      <input [(ngModel)]="appointmentId" placeholder="Appointment ID" />
      <textarea [(ngModel)]="notes" placeholder="Notes" rows="4"></textarea>
      <textarea [(ngModel)]="vitals" placeholder="Vitals (JSON or text)" rows="2"></textarea>
    </div>
    <button class="primary" (click)="submit()">Submit</button>
    <div class="muted" *ngIf="message">{{message}}</div>
  </div>
  `,
  styles: [`
    .card { background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:12px; }
    .form-grid { display:grid; gap:8px; }
    .primary { background:#0f766e; color:#fff; border:none; padding:8px 12px; border-radius:6px; }
    .muted { color:#64748b; margin-top:8px; }
  `]
})
export class ClinicFollowUpComponent {
  private http = inject(HttpClient);
  private API = (environment as any).clinicApiUrl || 'http://localhost:3000/api/clinic';

  appointmentId = '';
  notes = '';
  vitals = '';
  message = '';

  submit(){
    if (!this.appointmentId) { this.message = 'Appointment ID required'; return; }
    this.http.post(`${this.API}/patients/${this.appointmentId}/follow-up`, { notes: this.notes, vitals: this.vitals }).subscribe({
      next: () => { this.message = 'Follow-up recorded'; this.notes=''; this.vitals=''; },
      error: (err) => { console.error(err); this.message = 'Failed to record follow-up'; }
    });
  }
}
