import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../../services/appointment.service';
import { AuthService, User } from '../../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-consultations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="grid cols-2 fade-in">
      <!-- Upcoming Consultations -->
      <div class="card lift" style="grid-column: span 2;">
        <div class="card-header">Upcoming Consultations</div>
        <div class="grid" style="gap:12px;">
          <div *ngIf="loading" class="empty-state"><i class="fa-solid fa-spinner fa-spin"></i><p>Loading...</p></div>
          <div *ngIf="error" class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i><p>{{ error }}</p></div>
          <div *ngFor="let consultation of upcomingConsultations" class="consultation-card">
            <div class="consultation-info">
              <div class="patient-details">
                <strong>{{ consultation.patientName }}</strong>
                <span class="consultation-type">{{ consultation.type }}</span>
              </div>
              <div class="consultation-time">
                <i class="fa-solid fa-clock"></i>
                {{ consultation.date }} at {{ consultation.time }}
              </div>
              <div class="consultation-status">
                <span class="badge" [class]="'badge-' + consultation.status">{{ consultation.status | titlecase }}</span>
              </div>
            </div>
            <div class="consultation-actions">
              <button class="btn btn-blue" (click)="startConsultation(consultation.id)">
                <i class="fa-solid fa-video"></i> Start Call
              </button>
              <button class="btn btn-outline" (click)="viewPatientDetails(consultation.patientId)">
                <i class="fa-solid fa-user"></i> View Patient
              </button>
            </div>
          </div>
          <div *ngIf="!loading && !error && upcomingConsultations.length === 0" class="empty-state">
            <i class="fa-solid fa-calendar-xmark"></i>
            <p>No upcoming consultations scheduled</p>
          </div>
        </div>
      </div>

      <!-- Quick Schedule (when patientId is provided) -->
      <div class="card lift" *ngIf="selectedPatientId as pid">
        <div class="card-header">Schedule Consultation for Patient</div>
        <div class="grid" style="gap:10px;">
          <div class="form-row">
            <label>Date</label>
            <input type="date" [(ngModel)]="scheduleDate" />
          </div>
          <div class="form-row">
            <label>Time</label>
            <input type="time" [(ngModel)]="scheduleTime" />
          </div>
          <div class="form-row">
            <label>Reason</label>
            <input type="text" [(ngModel)]="scheduleReason" placeholder="e.g., Follow-up" />
          </div>
          <div class="form-actions">
            <button class="btn btn-blue" [disabled]="!canSchedule()" (click)="scheduleForPatient()">
              <i class="fa-solid fa-calendar-check"></i> Schedule
            </button>
            <button class="btn btn-outline" (click)="clearSelectedPatient()">Cancel</button>
          </div>
        </div>
      </div>

      <!-- Today's Schedule -->
      <div class="card lift">
        <div class="card-header">Today's Schedule</div>
        <div class="schedule-list">
          <div *ngFor="let slot of todaySchedule" class="schedule-item">
            <span class="time-slot">{{ slot.time }}</span>
            <div class="slot-info">
              <strong *ngIf="slot.patient; else emptySlot">{{ slot.patient }}</strong>
              <ng-template #emptySlot><span class="muted">Available</span></ng-template>
              <span class="slot-type">{{ slot.type }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="card lift">
        <div class="card-header">Consultation Stats</div>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">{{ consultationStats.today }}</div>
            <div class="stat-label">Today</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ consultationStats.thisWeek }}</div>
            <div class="stat-label">This Week</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ consultationStats.pending }}</div>
            <div class="stat-label">Pending</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .consultation-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      background: #f8fafc;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      transition: all 0.2s ease;
    }
    .consultation-card:hover {
      background: #f1f5f9;
      transform: translateY(-1px);
    }
    .consultation-info {
      flex: 1;
    }
    .patient-details {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 4px;
    }
    .consultation-type {
      font-size: 0.85rem;
      color: #64748b;
      background: #e2e8f0;
      padding: 2px 8px;
      border-radius: 4px;
    }
    .consultation-time {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #475569;
      font-size: 0.9rem;
      margin-bottom: 8px;
    }
    .consultation-actions {
      display: flex;
      gap: 8px;
    }
    .schedule-list {
      display: grid;
      gap: 8px;
    }
    .schedule-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
    }
    .time-slot {
      background: #3498db;
      color: white;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 600;
      min-width: 60px;
      text-align: center;
    }
    .slot-info {
      flex: 1;
    }
    .slot-type {
      display: block;
      font-size: 0.8rem;
      color: #64748b;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      text-align: center;
    }
    .stat-number {
      font-size: 1.5rem;
      font-weight: 700;
      color: #2563eb;
    }
    .stat-label {
      font-size: 0.8rem;
      color: #64748b;
      margin-top: 4px;
    }
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
  upcomingConsultations: { id: string; patientId: string; patientName: string; type: string; date: string; time: string; status: string; }[] = [];
  loading = false;
  error = '';

  todaySchedule = [
    { time: '9:00', patient: 'Sarah Johnson', type: 'Follow-up' },
    { time: '10:30', patient: null, type: 'Available' },
    { time: '11:00', patient: 'Ahmed Ali', type: 'New Patient' },
    { time: '2:30', patient: null, type: 'Available' },
    { time: '4:00', patient: 'Maria Garcia', type: 'Check-up' }
  ];

  consultationStats = {
    today: 3,
    thisWeek: 12,
    pending: 2
  };

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Load real upcoming consultations for the logged-in doctor
    const user: User | null = this.authService.getCurrentUser();
    if (!user || user.role !== 'doctor') {
      this.error = 'You must be logged in as a doctor to view consultations.';
      return;
    }

    // Check if doctor wants to schedule for a specific patient via query param
    this.selectedPatientId = this.route.snapshot.queryParamMap.get('patientId');

    this.loading = true;
    const now = new Date();
    const end = new Date();
    end.setMonth(now.getMonth() + 1); // next 1 month

    this.appointmentService
      .getAppointments({
        doctorId: user.id,
        status: 'CONFIRMED' as any,
        startDate: now,
        endDate: end,
      })
      .subscribe({
        next: (appointments) => {
          this.upcomingConsultations = (appointments || []).map((apt: any) => {
            const start = new Date(apt.appointmentDate);
            const timeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const dateStr = start.toLocaleDateString();
            return {
              id: apt.id,
              patientId: apt.patient?.id || '',
              patientName: `${apt.patient?.firstName || ''} ${apt.patient?.lastName || ''}`.trim() || 'Patient',
              type: apt.reason || 'Consultation',
              date: dateStr,
              time: timeStr,
              status: (apt.status || 'CONFIRMED').toLowerCase()
            };
          });
          this.loading = false;
          // Also load today's schedule after upcoming loaded
          this.loadTodaySchedule(user.id);
        },
        error: (err) => {
          console.error('Failed to load upcoming consultations', err);
          this.error = 'Failed to load upcoming consultations';
          this.loading = false;
          // Try loading today's schedule anyway
          this.loadTodaySchedule(user.id);
        }
      });
  }

  startConsultation(consultationId: string) {
    console.log('Starting consultation:', consultationId);
    // Implement video call functionality
  }

  viewPatientDetails(patientId: string) {
    console.log('Viewing patient details:', patientId);
    // Navigate to patient profile
  }

  // Scheduling state (moved here inside the class)
  selectedPatientId: string | null = null;
  scheduleDate = '';
  scheduleTime = '';
  scheduleReason = '';

  canSchedule(): boolean {
    return !!(this.selectedPatientId && this.scheduleDate && this.scheduleTime);
  }

  scheduleForPatient() {
    if (!this.canSchedule()) return;
    const dateIso = `${this.scheduleDate}T${this.scheduleTime}:00`;
    const start = new Date(dateIso);
    const end = new Date(start.getTime() + 30 * 60 * 1000); // 30 minutes
    this.loading = true;
    this.appointmentService.createAppointmentAsDoctor({
      patientId: this.selectedPatientId!,
      appointmentDate: start.toISOString(),
      endTime: end.toISOString(),
      reason: this.scheduleReason || 'Consultation'
    }).subscribe({
      next: () => {
        // Clear form and query param, reload upcoming list
        this.clearSelectedPatient();
        this.ngOnInit();
      },
      error: (err) => {
        console.error('Failed to schedule appointment', err);
        this.error = 'Failed to schedule appointment';
        this.loading = false;
      }
    });
  }

  clearSelectedPatient() {
    this.selectedPatientId = null;
    this.scheduleDate = '';
    this.scheduleTime = '';
    this.scheduleReason = '';
    this.router.navigate([], { queryParams: { patientId: null }, queryParamsHandling: 'merge' });
  }

  private loadTodaySchedule(doctorId: string) {
    const start = new Date();
    start.setHours(0,0,0,0);
    const end = new Date();
    end.setHours(23,59,59,999);

    this.appointmentService.getAppointments({ doctorId, startDate: start, endDate: end })
      .subscribe({
        next: (appointments) => {
          const filtered = (appointments || []).filter(a => a.status === 'CONFIRMED' || a.status === 'PENDING');
          // Map to display slots
          this.todaySchedule = filtered
            .sort((a,b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
            .map(a => ({
              time: new Date(a.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              patient: `${a.patient?.firstName || ''} ${a.patient?.lastName || ''}`.trim() || 'Patient',
              type: a.reason || 'Consultation'
            }));
        },
        error: (err) => {
          console.error('Failed to load today\'s schedule', err);
          // Keep existing schedule if any
        }
      });
  }
}
