import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid cols-1 fade-in">
      <!-- Pending Booking Requests -->
      <div class="card lift" *ngIf="pendingBookings.length > 0">
        <div class="card-header">Pending Booking Requests</div>
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
              <button class="btn btn-outline" (click)="rescheduleBooking(booking.id)">
                <i class="fa-solid fa-calendar-alt"></i> Reschedule
              </button>
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
  `,
  styles: [`
    :host { display: block; }
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
  `]
})
export class PatientListComponent implements OnInit {
  activeFilter = 'all';
  
  pendingBookings = [
    {
      id: 'b1',
      patientName: 'Emma Wilson',
      consultationType: 'Initial Consultation',
      preferredDate: 'Tomorrow',
      preferredTime: '2:00 PM',
      reason: 'Experiencing chest pain and shortness of breath'
    },
    {
      id: 'b2',
      patientName: 'James Chen',
      consultationType: 'Follow-up',
      preferredDate: 'Friday',
      preferredTime: '10:30 AM',
      reason: 'Blood pressure medication review'
    }
  ];

  allPatients = [
    {
      id: 'p1',
      name: 'Sarah Johnson',
      diagnosis: 'Hypertension',
      lastVisit: '2 days ago',
      status: 'stable'
    },
    {
      id: 'p2',
      name: 'Ahmed Ali',
      diagnosis: 'Diabetes Type 2',
      lastVisit: '1 week ago',
      status: 'active'
    },
    {
      id: 'p3',
      name: 'Maria Garcia',
      diagnosis: 'Asthma',
      lastVisit: '3 days ago',
      status: 'critical'
    },
    {
      id: 'p4',
      name: 'John Smith',
      diagnosis: 'Arthritis',
      lastVisit: '1 month ago',
      status: 'stable'
    }
  ];

  filteredPatients = this.allPatients;

  ngOnInit() {
    this.setFilter('all');
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
    console.log('Accepting booking:', bookingId);
    this.pendingBookings = this.pendingBookings.filter(b => b.id !== bookingId);
    // Add to confirmed consultations
  }

  refuseBooking(bookingId: string) {
    console.log('Refusing booking:', bookingId);
    this.pendingBookings = this.pendingBookings.filter(b => b.id !== bookingId);
    // Send refusal notification to patient
  }

  rescheduleBooking(bookingId: string) {
    console.log('Rescheduling booking:', bookingId);
    // Open reschedule dialog
  }

  viewPatientProfile(patientId: string) {
    console.log('Viewing patient profile:', patientId);
    // Navigate to patient profile
  }

  scheduleConsultation(patientId: string) {
    console.log('Scheduling consultation for patient:', patientId);
    // Open scheduling dialog
  }
}
