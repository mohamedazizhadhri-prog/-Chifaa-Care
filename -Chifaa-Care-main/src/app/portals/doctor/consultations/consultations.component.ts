import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-consultations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid cols-2 fade-in">
      <!-- Upcoming Consultations -->
      <div class="card lift" style="grid-column: span 2;">
        <div class="card-header">Upcoming Consultations</div>
        <div class="grid" style="gap:12px;">
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
          <div *ngIf="upcomingConsultations.length === 0" class="empty-state">
            <i class="fa-solid fa-calendar-xmark"></i>
            <p>No upcoming consultations scheduled</p>
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
  upcomingConsultations = [
    {
      id: '1',
      patientId: 'p1',
      patientName: 'Sarah Johnson',
      type: 'Follow-up',
      date: 'Today',
      time: '2:30 PM',
      status: 'confirmed'
    },
    {
      id: '2',
      patientId: 'p2',
      patientName: 'Ahmed Ali',
      type: 'Initial Consultation',
      date: 'Today',
      time: '4:00 PM',
      status: 'pending'
    },
    {
      id: '3',
      patientId: 'p3',
      patientName: 'Maria Garcia',
      type: 'Check-up',
      date: 'Tomorrow',
      time: '10:00 AM',
      status: 'confirmed'
    }
  ];

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

  ngOnInit() {
    // Initialize component data
  }

  startConsultation(consultationId: string) {
    console.log('Starting consultation:', consultationId);
    // Implement video call functionality
  }

  viewPatientDetails(patientId: string) {
    console.log('Viewing patient details:', patientId);
    // Navigate to patient profile
  }
}
