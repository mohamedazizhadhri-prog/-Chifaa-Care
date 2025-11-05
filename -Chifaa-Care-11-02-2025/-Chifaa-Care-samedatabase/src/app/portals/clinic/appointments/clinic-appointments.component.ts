import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  date: Date;
  time: string;
  type: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

@Component({
  selector: 'app-clinic-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
    <div class="appointments-page">
      <div class="page-header">
        <div>
          <h1><i class="fas fa-calendar-check"></i> Appointments Management</h1>
          <p>Schedule and manage patient appointments</p>
        </div>
        <button class="btn btn-primary" (click)="openBookModal()">
          <i class="fas fa-plus"></i> Book Appointment
        </button>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <i class="fas fa-calendar-alt"></i>
          <div class="stat-info">
            <div class="stat-value">{{appointments.length}}</div>
            <div class="stat-label">Total</div>
          </div>
        </div>
        <div class="stat-card">
          <i class="fas fa-clock"></i>
          <div class="stat-info">
            <div class="stat-value">{{todayCount}}</div>
            <div class="stat-label">Today</div>
          </div>
        </div>
        <div class="stat-card">
          <i class="fas fa-check-circle"></i>
          <div class="stat-info">
            <div class="stat-value">{{confirmedCount}}</div>
            <div class="stat-label">Confirmed</div>
          </div>
        </div>
      </div>

      <div class="filters-bar">
        <div class="filter-group">
          <label>Status:</label>
          <select [(ngModel)]="filterStatus" (change)="filterAppointments()">
            <option value="all">All</option>
            <option value="scheduled">Scheduled</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Date:</label>
          <input type="date" [(ngModel)]="filterDate" (change)="filterAppointments()">
        </div>
        <button class="btn btn-outline" (click)="clearFilters()">
          <i class="fas fa-times"></i> Clear
        </button>
      </div>

      <div class="appointments-list">
        <div *ngFor="let apt of filteredAppointments" class="appointment-card" 
             [class.scheduled]="apt.status === 'scheduled'"
             [class.confirmed]="apt.status === 'confirmed'"
             [class.completed]="apt.status === 'completed'"
             [class.cancelled]="apt.status === 'cancelled'">
          <div class="appointment-date-badge">
            <div class="month">{{getMonth(apt.date)}}</div>
            <div class="day">{{getDay(apt.date)}}</div>
          </div>
          <div class="appointment-info">
            <h3>{{apt.patientName}}</h3>
            <p><i class="fas fa-user-doctor"></i> Dr. {{apt.doctorName}}</p>
            <p><i class="fas fa-clock"></i> {{apt.time}} | <i class="fas fa-stethoscope"></i> {{apt.type}}</p>
            <p class="notes" *ngIf="apt.notes"><i class="fas fa-note-sticky"></i> {{apt.notes}}</p>
          </div>
          <div class="appointment-actions">
            <span class="status-badge" [class]="'status-' + apt.status">{{apt.status}}</span>
            <div class="action-btns">
              <button class="btn-icon btn-info" (click)="viewAppointment(apt)" title="View">
                <i class="fas fa-eye"></i>
              </button>
              <button class="btn-icon btn-warning" (click)="editAppointment(apt)" title="Edit">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-icon btn-success" *ngIf="apt.status === 'scheduled'" 
                      (click)="confirmAppointment(apt)" title="Confirm">
                <i class="fas fa-check"></i>
              </button>
              <button class="btn-icon btn-danger" (click)="cancelAppointment(apt)" title="Cancel">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>

        <div *ngIf="filteredAppointments.length === 0" class="empty-state">
          <i class="fas fa-calendar-times fa-3x"></i>
          <h3>No appointments found</h3>
          <button class="btn btn-primary" (click)="openBookModal()">
            <i class="fas fa-plus"></i> Book First Appointment
          </button>
        </div>
      </div>

      <div class="modal" *ngIf="showModal" (click)="closeModal()">
        <div class="modal-dialog" (click)="$event.stopPropagation()" (mousedown)="$event.stopPropagation()" (mouseup)="$event.stopPropagation()">
          <div class="modal-header">
            <h2><i class="fas fa-calendar-plus"></i> {{editMode ? 'Edit' : 'Book'}} Appointment</h2>
            <button class="btn-close" (click)="closeModal()">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Patient Name *</label>
              <input type="text" [(ngModel)]="form.patientName" placeholder="Enter patient name">
            </div>
            <div class="form-group">
              <label>Doctor *</label>
              <select [(ngModel)]="form.doctorName">
                <option value="">Select Doctor</option>
                <option value="Dr. Ahmed Khalil">Dr. Ahmed Khalil - Cardiology</option>
                <option value="Dr. Sarah Johnson">Dr. Sarah Johnson - Pediatrics</option>
                <option value="Dr. Omar Ali">Dr. Omar Ali - Neurology</option>
              </select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Date *</label>
                <input type="date" [(ngModel)]="form.date">
              </div>
              <div class="form-group">
                <label>Time *</label>
                <input type="time" [(ngModel)]="form.time">
              </div>
            </div>
            <div class="form-group">
              <label>Appointment Type *</label>
              <select [(ngModel)]="form.type">
                <option value="">Select Type</option>
                <option value="Consultation">Consultation</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Emergency">Emergency</option>
                <option value="Check-up">Check-up</option>
              </select>
            </div>
            <div class="form-group">
              <label>Notes</label>
              <textarea [(ngModel)]="form.notes" rows="3" placeholder="Additional notes..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" (click)="closeModal()">Cancel</button>
            <button class="btn btn-primary" (click)="saveAppointment()">
              <i class="fas fa-save"></i> {{editMode ? 'Update' : 'Book'}}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .appointments-page { padding: 24px 5%; max-width: 1400px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { font-size: 28px; font-weight: 700; color: #0f172a; margin: 0; display: flex; align-items: center; gap: 12px; }
    .page-header h1 i { color: #3b82f6; }
    .page-header p { color: #64748b; margin: 4px 0 0; font-size: 14px; }
    
    .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 24px; }
    .stat-card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 16px; }
    .stat-card i { font-size: 32px; color: #3b82f6; }
    .stat-value { font-size: 32px; font-weight: 700; color: #0f172a; }
    .stat-label { font-size: 13px; color: #64748b; text-transform: uppercase; }
    
    .filters-bar { background: white; padding: 16px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex; gap: 16px; align-items: center; margin-bottom: 24px; flex-wrap: wrap; }
    .filter-group { display: flex; align-items: center; gap: 8px; }
    .filter-group label { font-size: 14px; font-weight: 600; color: #64748b; }
    .filter-group select, .filter-group input { padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; }
    
    .appointments-list { display: flex; flex-direction: column; gap: 16px; }
    .appointment-card { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 20px; display: flex; gap: 20px; align-items: start; border-left: 4px solid #cbd5e1; transition: transform 0.2s; }
    .appointment-card:hover { transform: translateX(4px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .appointment-card.scheduled { border-left-color: #3b82f6; }
    .appointment-card.confirmed { border-left-color: #22c55e; }
    .appointment-card.completed { border-left-color: #8b5cf6; }
    .appointment-card.cancelled { border-left-color: #ef4444; }
    
    .appointment-date-badge { min-width: 70px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; padding: 12px 8px; }
    .appointment-date-badge .month { font-size: 12px; text-transform: uppercase; font-weight: 600; }
    .appointment-date-badge .day { font-size: 28px; font-weight: 700; line-height: 1; }
    
    .appointment-info { flex: 1; }
    .appointment-info h3 { margin: 0 0 8px; font-size: 18px; font-weight: 700; color: #0f172a; }
    .appointment-info p { margin: 4px 0; font-size: 14px; color: #64748b; display: flex; align-items: center; gap: 8px; }
    .appointment-info p i { width: 16px; color: #94a3b8; }
    .notes { font-style: italic; color: #94a3b8; }
    
    .appointment-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 12px; }
    .status-badge { padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
    .status-scheduled { background: #dbeafe; color: #1e40af; }
    .status-confirmed { background: #dcfce7; color: #166534; }
    .status-completed { background: #f3e8ff; color: #6b21a8; }
    .status-cancelled { background: #fee2e2; color: #991b1b; }
    
    .action-btns { display: flex; gap: 8px; }
    .btn-icon { width: 32px; height: 32px; border: none; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: white; transition: transform 0.2s; }
    .btn-icon:hover { transform: scale(1.1); }
    .btn-icon.btn-info { background: #0ea5e9; }
    .btn-icon.btn-warning { background: #f59e0b; }
    .btn-icon.btn-success { background: #22c55e; }
    .btn-icon.btn-danger { background: #ef4444; }
    
    .btn { padding: 10px 20px; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: transform 0.2s; }
    .btn:hover { transform: translateY(-2px); }
    .btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
    .btn-outline { background: white; border: 1px solid #e2e8f0; color: #64748b; }
    
    .empty-state { text-align: center; padding: 60px 20px; color: #64748b; background: white; border-radius: 12px; }
    .empty-state i { color: #cbd5e1; margin-bottom: 16px; }
    .empty-state h3 { color: #0f172a; margin: 16px 0; }
    
    .modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-dialog { background: white; border-radius: 12px; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #e2e8f0; }
    .modal-header h2 { margin: 0; font-size: 20px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
    .btn-close { background: none; border: none; font-size: 28px; color: #94a3b8; cursor: pointer; }
    .modal-body { padding: 20px; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 20px; border-top: 1px solid #e2e8f0; }
    
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 6px; font-size: 14px; font-weight: 600; color: #334155; }
    .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: #3b82f6; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    textarea { font-family: inherit; resize: vertical; }
  `]
})
export class ClinicAppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  filterStatus = 'all';
  filterDate = '';
  showModal = false;
  editMode = false;
  
  todayCount = 0;
  confirmedCount = 0;
  
  private apiUrl = environment.apiUrl || 'http://localhost:3000/api/v1';
  
  form: any = {
    patientName: '',
    doctorName: '',
    date: '',
    time: '',
    type: '',
    notes: '',
    status: 'scheduled'
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders(token ? { 'Authorization': `Bearer ${token}` } : {});
    
    this.http.get<any>(`${this.apiUrl}/appointments`, { headers }).subscribe({
      next: (response) => {
        console.log('Appointments API response:', response);
        const apts = response.data?.appointments || response.appointments || response.data || response;
        this.appointments = Array.isArray(apts) ? apts.map((apt: any) => ({
          id: apt.id,
          patientName: `${apt.patient?.firstName || ''} ${apt.patient?.lastName || ''}`.trim() || 'Unknown Patient',
          doctorName: `Dr. ${apt.doctor?.firstName || ''} ${apt.doctor?.lastName || ''}`.trim() || 'Unknown Doctor',
          date: new Date(apt.appointmentDate || apt.date),
          time: new Date(apt.appointmentDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          type: apt.reason || 'Consultation',
          status: (apt.status || 'PENDING').toLowerCase() as 'scheduled' | 'confirmed' | 'completed' | 'cancelled',
          notes: apt.notes || ''
        })) : [];
        this.filteredAppointments = [...this.appointments];
        this.updateStats();
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        console.error('Error details:', error.error);
        this.appointments = [];
        this.filteredAppointments = [];
        this.updateStats();
      }
    });
  }

  updateStats() {
    const today = new Date().toDateString();
    this.todayCount = this.appointments.filter(a => a.date.toDateString() === today).length;
    this.confirmedCount = this.appointments.filter(a => a.status === 'confirmed').length;
  }

  filterAppointments() {
    this.filteredAppointments = this.appointments.filter(a => {
      const matchesStatus = this.filterStatus === 'all' || a.status === this.filterStatus;
      const matchesDate = !this.filterDate || a.date.toISOString().split('T')[0] === this.filterDate;
      return matchesStatus && matchesDate;
    });
  }

  clearFilters() {
    this.filterStatus = 'all';
    this.filterDate = '';
    this.filteredAppointments = [...this.appointments];
  }

  openBookModal() {
    this.editMode = false;
    this.form = { patientName: '', doctorName: '', date: '', time: '', type: '', notes: '', status: 'scheduled' };
    this.showModal = true;
  }

  viewAppointment(apt: Appointment) {
    alert(`Appointment Details:\nPatient: ${apt.patientName}\nDoctor: ${apt.doctorName}\nDate: ${apt.date.toDateString()}\nTime: ${apt.time}\nType: ${apt.type}\nStatus: ${apt.status}`);
  }

  editAppointment(apt: Appointment) {
    this.editMode = true;
    this.form = { ...apt, date: apt.date.toISOString().split('T')[0] };
    this.showModal = true;
  }

  confirmAppointment(apt: Appointment) {
    apt.status = 'confirmed';
    this.updateStats();
    alert('Appointment confirmed!');
  }

  cancelAppointment(apt: Appointment) {
    if (confirm('Cancel this appointment?')) {
      apt.status = 'cancelled';
      this.updateStats();
      alert('Appointment cancelled!');
    }
  }

  saveAppointment() {
    if (!this.form.patientName || !this.form.doctorName || !this.form.date || !this.form.time || !this.form.type) {
      alert('Please fill all required fields');
      return;
    }
    
    if (this.editMode) {
      const index = this.appointments.findIndex(a => a.id === this.form.id);
      if (index !== -1) {
        this.appointments[index] = { ...this.form, date: new Date(this.form.date) };
        alert('Appointment updated!');
      }
    } else {
      this.form.id = Date.now().toString();
      this.appointments.push({ ...this.form, date: new Date(this.form.date) });
      alert('Appointment booked!');
    }
    
    this.filterAppointments();
    this.updateStats();
    this.closeModal();
  }

  closeModal() {
    this.showModal = false;
  }

  getMonth(date: Date): string {
    return date.toLocaleDateString('en', { month: 'short' }).toUpperCase();
  }

  getDay(date: Date): string {
    return date.getDate().toString();
  }
}
