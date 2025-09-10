import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../../services/appointment.service';
import { AuthService } from '../../../services/auth.service';
import { AppointmentWithRelations } from '../../../models/appointment.model';

@Component({
  selector: 'app-consultations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pending-container fade-in">
      <div class="section-title">Pending Booking Requests</div>
      <div class="list" *ngIf="pendingAppointments.length > 0; else noRequests">
        <div class="request-card" *ngFor="let appt of pendingAppointments; trackBy: trackById">
          <div class="request-header">
            <div class="patient-name">{{ appt.patient?.firstName }} {{ appt.patient?.lastName }}</div>
            <span class="type-chip">{{ (appt.consultationType || 'Initial Consultation') | titlecase }}</span>
          </div>
          <div class="request-body">
            <div class="line"><i class="fa-regular fa-calendar"></i> {{ appt.appointmentDate | date:'EEEE \at h:mm a' }}</div>
            <div class="line" *ngIf="appt.reason"><i class="fa-regular fa-message"></i> {{ appt.reason }}</div>
          </div>
          <div class="request-actions">
            <button class="btn btn-accept" (click)="accept(appt.id)">✓ Accept</button>
            <button class="btn btn-refuse" (click)="decline(appt.id)">✕ Refuse</button>
            <button class="btn btn-resched" (click)="reschedule(appt.id, appt)">📅 Reschedule</button>
          </div>
        </div>
      </div>
      <ng-template #noRequests>
        <div class="empty-state">
          <i class="fa-solid fa-calendar-xmark"></i>
          <p>No requests available</p>
        </div>
      </ng-template>

      <div class="stats">
        <div><strong>{{ stats.today }}</strong><span>Today</span></div>
        <div><strong>{{ stats.thisWeek }}</strong><span>This Week</span></div>
        <div><strong>{{ pendingAppointments.length }}</strong><span>Pending</span></div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .pending-container { background: #fff; border-radius: 12px; padding: 16px; border: 1px solid #e5e7eb; }
    .section-title { font-weight: 700; margin-bottom: 12px; }
    .list { display: grid; gap: 12px; }
    .request-card { background: #fff7ed; border: 1px solid #fdba74; border-radius: 12px; padding: 14px; }
    .request-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
    .patient-name { font-weight: 700; }
    .type-chip { background: #f59e0b; color: white; padding: 2px 8px; border-radius: 8px; font-size: 12px; }
    .request-body .line { color: #475569; display: flex; gap: 8px; align-items: center; margin: 6px 0; }
    .request-actions { display: flex; gap: 8px; margin-top: 8px; }
    .btn { border: 1px solid #e5e7eb; background: #fff; border-radius: 8px; padding: 6px 10px; font-weight: 600; cursor: pointer; }
    .btn-accept { background: #22c55e; color: #fff; border-color: #16a34a; }
    .btn-refuse { background: #f3f4f6; }
    .btn-resched { background: #f3f4f6; }
    .btn:hover { filter: brightness(0.98); }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; text-align: center; padding-top: 12px; }
    .stats strong { display: block; font-size: 1.2rem; color: #2563eb; }
    .stats span { color: #64748b; font-size: 0.8rem; }
    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #64748b;
    }
    .empty-state i {
      font-size: 2rem;
      margin-bottom: 12px;
      opacity: 0.5;
    }
  `]
})
export class ConsultationsComponent implements OnInit {
  pendingAppointments: AppointmentWithRelations[] = [];
  stats = { today: 0, thisWeek: 0 };

  constructor(
    private appointmentService: AppointmentService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.loadPending();
  }

  private loadPending() {
    const user = this.auth.getCurrentUser();
    if (!user || user.role !== 'doctor') {
      this.pendingAppointments = [];
      return;
    }
    this.appointmentService.getAppointments({ doctorId: user.id, status: 'PENDING' as any }).subscribe(appts => {
      // Ensure no duplicates and stable order
      const seen = new Set<string>();
      this.pendingAppointments = appts.filter(a => {
        if (seen.has(a.id)) return false;
        seen.add(a.id);
        return true;
      }).sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
    });
  }

  trackById = (_: number, a: AppointmentWithRelations) => a.id;

  accept(id: string) {
    this.appointmentService.setStatus(id, 'CONFIRMED' as any).subscribe({
      next: () => {
        // Remove from local list so refresh does not re-show (since server state changed)
        this.pendingAppointments = this.pendingAppointments.filter(a => a.id !== id);
      },
      error: (e) => console.error(e)
    });
  }

  decline(id: string) {
    this.appointmentService.setStatus(id, 'CANCELLED' as any).subscribe({
      next: () => {
        this.pendingAppointments = this.pendingAppointments.filter(a => a.id !== id);
      },
      error: (e) => console.error(e)
    });
  }

  reschedule(id: string, appt: AppointmentWithRelations) {
    const current = new Date(appt.appointmentDate);
    const proposed = prompt('Enter new start date/time (ISO or yyyy-mm-dd HH:MM):', current.toISOString().slice(0,16).replace('T',' '));
    if (!proposed) return;
    // Parse proposed to ISO strings
    const start = new Date(proposed.replace(' ', 'T'));
    if (isNaN(start.getTime())) return alert('Invalid date/time');
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    this.appointmentService.rescheduleAppointment(id, start.toISOString(), end.toISOString()).subscribe({
      next: () => {
        // After proposing reschedule, it becomes PENDING for approval; remove from current list
        this.pendingAppointments = this.pendingAppointments.filter(a => a.id !== id);
      },
      error: (e) => console.error(e)
    });
  }
}
