import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PatientService } from '../../../services/patient.service';
import { AppointmentService } from '../../../services/appointment.service';
import { AuthService } from '../../../services/auth.service';
import { AppointmentWithRelations } from '../../../models/appointment.model';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="grid cols-1 fade-in">
      <!-- Pending Booking Requests -->
      <div class="card lift">
        <div class="card-header">
          <span>Pending Booking Requests</span>
          <button class="btn btn-sm btn-outline" (click)="loadPendingBookings()" title="Refresh">
            <i class="fa-solid fa-refresh"></i> Refresh
          </button>
        </div>
        <div class="empty-state" *ngIf="pendingBookings.length === 0">
          <i class="fa-solid fa-calendar-check"></i>
          <p>No pending appointment requests</p>
          <small class="text-muted">New appointment requests will appear here</small>
        </div>
        <div class="booking-requests">
          <div *ngFor="let booking of pendingBookings" class="booking-request">
            <div class="booking-info">
              <div class="patient-info">
                <strong>{{ booking.patientName }}</strong>
                <span class="booking-type">{{ booking.consultationType }}</span>
              </div>
              <div class="booking-details">
                <div class="booking-time">
                  <i class="fa-solid fa-calendar"></i>
                  {{ booking.preferredDate }} at {{ booking.preferredTime }}
                </div>
                <div class="booking-reason" *ngIf="booking.reason">
                  <i class="fa-solid fa-comment-medical"></i>
                  {{ booking.reason }}
                </div>
              </div>
            </div>
            <div class="booking-actions">
              <button class="btn btn-green" (click)="acceptBooking(booking.id)">
                <i class="fa-solid fa-check"></i> Accept
              </button>
              <button class="btn btn-red" (click)="refuseBooking(booking.id)">
                <i class="fa-solid fa-times"></i> Refuse
              </button>
              <button class="btn btn-outline" (click)="openReschedule(booking.id)">
                <i class="fa-solid fa-calendar-alt"></i> Reschedule
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Confirmed Consultations -->
      <div class="card lift" *ngIf="confirmedConsultations.length > 0">
        <div class="card-header">Confirmed Consultations</div>
        <div class="confirmed-list">
          <div *ngFor="let c of confirmedConsultations" class="confirmed-item">
            <div class="confirmed-info">
              <strong>{{ c.patientName }}</strong>
              <span class="muted">• {{ c.consultationType }}</span>
            </div>
            <div class="confirmed-when">
              <i class="fa-solid fa-calendar-check"></i> {{ c.preferredDate }} at {{ c.preferredTime }}
            </div>
          </div>
        </div>
      </div>

      <!-- Patient List -->
      <div class="card lift">
        <div class="card-header">My Patients</div>
        <div class="patient-filters">
          <button class="filter-btn" [class.active]="activeFilter === 'all'" (click)="setFilter('all')">All Patients</button>
          <button class="filter-btn" [class.active]="activeFilter === 'active'" (click)="setFilter('active')">Active</button>
          <button class="filter-btn" [class.active]="activeFilter === 'critical'" (click)="setFilter('critical')">Critical</button>
        </div>
        <div class="patients-grid">
          <div *ngFor="let patient of filteredPatients" class="patient-card">
            <div class="patient-avatar">
              <i class="fa-solid fa-user"></i>
            </div>
            <div class="patient-details">
              <strong>{{ patient.name }}</strong>
              <div class="patient-info">
                <span class="diagnosis">{{ patient.diagnosis }}</span>
                <span class="last-visit">Last visit: {{ patient.lastVisit }}</span>
              </div>
            </div>
            <div class="patient-status">
              <span class="badge" [class]="'badge-' + patient.status">{{ patient.status | titlecase }}</span>
            </div>
            <div class="patient-actions">
              <button class="btn btn-blue" (click)="viewPatientProfile(patient.id)">
                <i class="fa-solid fa-eye"></i> View Profile
              </button>
              <button class="btn btn-outline" (click)="scheduleConsultation(patient.id)">
                <i class="fa-solid fa-calendar-plus"></i> Schedule
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reschedule Modal (lightweight) -->
    <div class="overlay" *ngIf="showReschedule" (click)="closeReschedule()"></div>
    <div class="reschedule-modal" *ngIf="showReschedule" role="dialog" aria-modal="true">
      <div class="modal-header">
        <strong>Reschedule Booking</strong>
        <button class="close-btn" (click)="closeReschedule()" aria-label="Close">×</button>
      </div>
      <div class="modal-body">
        <div class="form-row">
          <label>Date</label>
          <input type="date" [(ngModel)]="rescheduleDate" />
        </div>
        <div class="form-row">
          <label>Time</label>
          <input type="time" [(ngModel)]="rescheduleTime" />
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" (click)="closeReschedule()">Cancel</button>
        <button class="btn btn-blue" [disabled]="!rescheduleDate || !rescheduleTime" (click)="saveReschedule()">
          <i class="fa-solid fa-save"></i> Save
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn-sm {
      padding: 4px 12px;
      font-size: 0.85rem;
    }
    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #64748b;
    }
    .empty-state i {
      font-size: 3rem;
      margin-bottom: 12px;
      color: #cbd5e1;
    }
    .empty-state p {
      margin: 8px 0 4px 0;
      font-weight: 500;
    }
    .empty-state small {
      color: #94a3b8;
    }
    .booking-requests {
      display: grid;
      gap: 12px;
    }
    .booking-request {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      background: #fef3c7;
      border-radius: 12px;
      border: 1px solid #fbbf24;
    }
    .booking-info {
      flex: 1;
    }
    .patient-info {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }
    .booking-type {
      background: #f59e0b;
      color: white;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
    }
    .booking-details {
      display: grid;
      gap: 4px;
    }
    .booking-time, .booking-reason {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.9rem;
      color: #92400e;
    }
    .booking-actions {
      display: flex;
      gap: 8px;
    }
    .confirmed-list { display: grid; gap: 10px; }
    .confirmed-item {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px;
    }
    .confirmed-when { color: #065f46; font-weight: 600; display: flex; align-items: center; gap: 6px; }
    .patient-filters {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }
    .filter-btn {
      padding: 6px 12px;
      border: 1px solid #e2e8f0;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .filter-btn.active {
      background: #3498db;
      color: white;
      border-color: #3498db;
    }
    .patients-grid {
      display: grid;
      gap: 12px;
    }
    .patient-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: #f8fafc;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      transition: all 0.2s ease;
    }
    .patient-card:hover {
      background: #f1f5f9;
      transform: translateY(-1px);
    }
    .patient-avatar {
      width: 48px;
      height: 48px;
      background: #3498db;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.2rem;
    }
    .patient-details {
      flex: 1;
    }
    .patient-info {
      display: grid;
      gap: 2px;
      margin-top: 4px;
    }
    .diagnosis {
      color: #475569;
      font-size: 0.9rem;
    }
    .last-visit {
      color: #64748b;
      font-size: 0.8rem;
    }
    .patient-status {
      margin-right: 16px;
    }
    .patient-actions {
      display: flex;
      gap: 8px;
    }

    /* Lightweight modal */
    .overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 20000; }
    .reschedule-modal { position: fixed; z-index: 20001; inset: 0; margin: auto; width: min(360px, 90vw); max-height: 60vh; background: #fff; border-radius: 12px; box-shadow: 0 20px 50px rgba(0,0,0,.25); display: grid; font-size: 0.94rem; }
    .reschedule-modal .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; border-bottom: 1px solid #e5e7eb; }
    .reschedule-modal .modal-body { padding: 10px; display: grid; gap: 8px; overflow: auto; max-height: calc(60vh - 88px); }
    .reschedule-modal .modal-footer { padding: 8px 10px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 6px; }
    .reschedule-modal .modal-footer .btn {
      padding: 3px 8px;
      font-size: 0.84rem;
      border-radius: 6px;
      line-height: 1.1;
      min-height: 28px;
      box-shadow: none; /* override global shadow to look slimmer */
      align-self: center; /* avoid vertical stretch in flex */
      white-space: nowrap; /* keep compact */
    }
    .reschedule-modal .modal-footer .btn i { margin-right: 6px; font-size: 0.95em; }
    .reschedule-modal .form-row { display: grid; gap: 4px; }
    .reschedule-modal .form-row label { font-size: 0.85rem; color: #475569; }
    .reschedule-modal input[type="date"], .reschedule-modal input[type="time"] { width: 100%; padding: 6px 8px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.9rem; line-height: 1.2; }
    .close-btn { background: transparent; border: none; font-size: 20px; cursor: pointer; }
  `]
})
export class PatientListComponent implements OnInit {
  activeFilter = 'all';
  
  pendingBookings: Array<{
    id: string;
    patientName: string;
    consultationType: string;
    preferredDate: string;
    preferredTime: string;
    reason?: string;
  }> = [];

  allPatients: any[] = [];

  filteredPatients = this.allPatients;

  confirmedConsultations: Array<{ id: string; patientName: string; consultationType: string; preferredDate: string; preferredTime: string; }> = [];

  // Reschedule state
  showReschedule = false;
  rescheduleBookingId: string | null = null;
  rescheduleDate = '';
  rescheduleTime = '';

  constructor(
    private router: Router,
    private patientService: PatientService,
    private appointmentService: AppointmentService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Load pending bookings for this doctor
    this.loadPendingBookings();

    // Load only patients that belong to this doctor (confirmed appointments)
    this.patientService.getDoctorPatients().subscribe((patients: User[]) => {
      this.allPatients = patients.map(patient => ({
        id: patient.id,
        name: `${patient.firstName} ${patient.lastName}`,
        diagnosis: patient.patientProfile?.diagnosis || '—',
        lastVisit: patient.patientProfile?.updatedAt || patient.updatedAt || '—',
        status: 'active'
      }));
      this.setFilter('all');
    });
  }

  loadPendingBookings() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'doctor') {
      console.error('User is not a doctor or not logged in');
      return;
    }

    console.log('Loading pending appointments for doctor:', currentUser.id);
    
    this.appointmentService.getAppointments({ 
      doctorId: currentUser.id,
      status: 'PENDING' as any 
    }).subscribe({
      next: (appts: AppointmentWithRelations[]) => {
        console.log('Received pending appointments:', appts);
        this.pendingBookings = (appts || []).map(a => ({
          id: a.id,
          patientName: `${a.patient?.firstName || ''} ${a.patient?.lastName || ''}`.trim() || 'Patient',
          consultationType: a.consultationType || 'Consultation',
          preferredDate: this.formatDisplayDate(a.appointmentDate),
          preferredTime: new Date(a.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          reason: a.reason
        }));
      },
      error: (err) => {
        console.error('Failed to load pending bookings:', err);
        this.pendingBookings = [];
      }
    });
  }

  setFilter(filter: string) {
    this.activeFilter = filter;
    if (filter === 'all') {
      this.filteredPatients = this.allPatients;
    } else {
      this.filteredPatients = this.allPatients.filter(p => p.status === filter);
    }
  }

  acceptBooking(bookingId: string) {
    this.appointmentService.confirmAppointment(bookingId).subscribe({
      next: (updated) => {
        // Move from pending to confirmed list in UI
        const booking = this.pendingBookings.find(b => b.id === bookingId);
        if (booking) {
          this.confirmedConsultations.unshift({
            id: booking.id,
            patientName: booking.patientName,
            consultationType: booking.consultationType,
            preferredDate: booking.preferredDate,
            preferredTime: booking.preferredTime
          });
        }
        this.pendingBookings = this.pendingBookings.filter(b => b.id !== bookingId);
      },
      error: (err) => {
        console.error('Failed to confirm booking:', err);
        alert('Failed to accept booking.');
      }
    });
  }

  refuseBooking(bookingId: string) {
    this.appointmentService.setStatus(bookingId, 'CANCELLED' as any).subscribe({
      next: () => {
        this.pendingBookings = this.pendingBookings.filter(b => b.id !== bookingId);
      },
      error: (err) => {
        console.error('Failed to cancel booking:', err);
        alert('Failed to refuse booking.');
      }
    });
  }

  openReschedule(bookingId: string) {
    console.log('Rescheduling booking:', bookingId);
    const booking = this.pendingBookings.find(b => b.id === bookingId);
    if (booking) {
      this.rescheduleBookingId = bookingId;
      // Pre-fill
      this.rescheduleDate = this.parseToInputDate(booking.preferredDate) || '';
      this.rescheduleTime = this.parseToInputTime(booking.preferredTime) || '';
      this.showReschedule = true;
    }
  }

  closeReschedule() {
    this.showReschedule = false;
    this.rescheduleBookingId = null;
    this.rescheduleDate = '';
    this.rescheduleTime = '';
  }

  saveReschedule() {
    if (!this.rescheduleBookingId || !this.rescheduleDate || !this.rescheduleTime) return;
    const idx = this.pendingBookings.findIndex(b => b.id === this.rescheduleBookingId);
    if (idx > -1) {
      // Store in a friendly display format
      this.pendingBookings[idx] = {
        ...this.pendingBookings[idx],
        preferredDate: this.formatDisplayDate(this.rescheduleDate),
        preferredTime: this.rescheduleTime
      };
    }
    this.closeReschedule();
  }

  // Helpers to parse/format dates
  private parseToInputDate(display: string): string | null {
    // Accepts strings like 'Tomorrow' or 'Friday' — not easily mapped. Return null to let user choose.
    const iso = Date.parse(display);
    if (!isNaN(iso)) {
      const d = new Date(iso);
      return d.toISOString().split('T')[0];
    }
    return null;
  }

  private parseToInputTime(time: string): string | null {
    // Expect formats like '2:00 PM' → 14:00
    try {
      const m = time.match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/i);
      if (!m) return null;
      let h = parseInt(m[1], 10);
      const min = m[2];
      const ap = m[3].toUpperCase();
      if (ap === 'PM' && h !== 12) h += 12;
      if (ap === 'AM' && h === 12) h = 0;
      return `${String(h).padStart(2,'0')}:${min}`;
    } catch { return null; }
  }

  private formatDisplayDate(input: string): string {
    // input is yyyy-mm-dd → display as e.g., 2025-09-05; customize if needed
    return input;
  }

  viewPatientProfile(patientId: string) {
    console.log('Viewing patient profile:', patientId);
    this.router.navigate(['/doctor/patient-profile', patientId]);
  }

  scheduleConsultation(patientId: string) {
    console.log('Scheduling consultation for patient:', patientId);
    // Navigate to consultations with pre-selected patient via query param
    this.router.navigate(['/doctor/consultations'], { queryParams: { patientId } });
  }
}
