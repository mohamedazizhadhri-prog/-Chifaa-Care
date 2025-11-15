import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../../services/appointment.service';
import { Appointment, AppointmentStatus, ConsultationType, AppointmentWithRelations } from '../../../models/appointment.model';
import { Subscription } from 'rxjs';
import { format, parseISO } from 'date-fns';

@Component({
  selector: 'app-admin-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-appointments">
      <div class="header">
        <div class="title-section">
          <h2>📅 Appointments Management</h2>
          <p>View and manage all appointments across the system</p>
        </div>
        <div class="header-actions">
          <button class="btn-secondary" (click)="exportAppointments()">
            📊 Export
          </button>
          <button class="btn-primary" (click)="refreshData()">
            🔄 Refresh
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search by patient or doctor name..." 
            [(ngModel)]="searchQuery"
            (input)="onSearch()"
          />
        </div>
        <div class="filter-group">
          <select [(ngModel)]="statusFilter" (change)="onFilterChange()">
            <option value="">All Status</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="NO_SHOW">No Show</option>
          </select>
        </div>
        <div class="filter-group">
          <input 
            type="date" 
            [(ngModel)]="dateFilter" 
            (change)="onFilterChange()"
            placeholder="Filter by date"
          />
        </div>
      </div>

      <!-- Statistics -->
      <div class="stats-cards">
        <div class="stat-card total">
          <div class="stat-icon">📅</div>
          <div class="stat-content">
            <div class="stat-value">{{ totalAppointments }}</div>
            <div class="stat-label">Total Appointments</div>
          </div>
        </div>
        <div class="stat-card scheduled">
          <div class="stat-icon">⏰</div>
          <div class="stat-content">
            <div class="stat-value">{{ scheduledCount }}</div>
            <div class="stat-label">Scheduled</div>
          </div>
        </div>
        <div class="stat-card completed">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <div class="stat-value">{{ completedCount }}</div>
            <div class="stat-label">Completed</div>
          </div>
        </div>
        <div class="stat-card cancelled">
          <div class="stat-icon">❌</div>
          <div class="stat-content">
            <div class="stat-value">{{ cancelledCount }}</div>
            <div class="stat-label">Cancelled</div>
          </div>
        </div>
      </div>

      <!-- Appointments Table -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date & Time</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let appointment of appointments">
              <td><span class="id-badge">{{ appointment.id.substring(0, 8) }}</span></td>
              <td>
                <div class="user-info">
                  <span class="user-icon">👤</span>
                  <span>{{ appointment.patient ? appointment.patient.firstName + ' ' + appointment.patient.lastName : 'N/A' }}</span>
                </div>
              </td>
              <td>
                <div class="user-info">
                  <span class="user-icon doctor">👨‍⚕️</span>
                  <span>{{ appointment.doctor ? appointment.doctor.firstName + ' ' + appointment.doctor.lastName : 'N/A' }}</span>
                </div>
              </td>
              <td>
                <div class="datetime-info">
                  <span class="date">{{ formatDate(appointment.appointmentDate) }}</span>
                  <span class="time">{{ formatTime(appointment.endTime) }}</span>
                </div>
              </td>
              <td>
                <span class="type-badge">{{ appointment.consultationType | titlecase }}</span>
              </td>
              <td>
                <span 
                  class="status-badge"
                  [class.scheduled]="appointment.status === 'PENDING' || appointment.status === 'CONFIRMED'"
                  [class.completed]="appointment.status === 'COMPLETED'"
                  [class.cancelled]="appointment.status === 'CANCELLED'"
                >
                  {{ appointment.status | titlecase }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="btn-icon" (click)="viewAppointment(appointment)" title="View Details">
                    👁️
                  </button>
                  <button 
                    class="btn-icon" 
                    (click)="changeStatus(appointment)" 
                    title="Change Status"
                    *ngIf="appointment.status !== 'COMPLETED' && appointment.status !== 'CANCELLED'"
                  >
                    ✏️
                  </button>
                  <button 
                    class="btn-icon danger" 
                    (click)="cancelAppointment(appointment)" 
                    title="Cancel"
                    *ngIf="appointment.status !== 'COMPLETED' && appointment.status !== 'CANCELLED'"
                  >
                    ❌
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="isLoading">
              <td colspan="7" class="loading-row">
                <div class="loader"></div>
                <span>Loading appointments...</span>
              </td>
            </tr>
            <tr *ngIf="!isLoading && filteredAppointments.length === 0">
              <td colspan="7" class="empty-row">
                <span class="empty-icon">📭</span>
                <p>No appointments found</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination" *ngIf="totalPages > 1">
        <button [disabled]="currentPage === 1" (click)="goToPage(currentPage - 1)">
          ← Previous
        </button>
        <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
        <button [disabled]="currentPage === totalPages" (click)="goToPage(currentPage + 1)">
          Next →
        </button>
      </div>

      <!-- Modal -->
      <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ modalTitle }}</h3>
            <button class="close-btn" (click)="closeModal()">✖️</button>
          </div>
          <div class="modal-body">
            <div class="appointment-details" *ngIf="modalMode === 'view'">
              <div class="detail-row">
                <strong>Appointment ID:</strong>
                <span>{{ selectedAppointment.id }}</span>
              </div>
              <div class="detail-row">
                <strong>Patient:</strong>
                <span>{{ selectedAppointment.patientName }}</span>
              </div>
              <div class="detail-row">
                <strong>Doctor:</strong>
                <span>{{ selectedAppointment.doctorName }}</span>
              </div>
              <div class="detail-row">
                <strong>Date:</strong>
                <span>{{ formatDate(selectedAppointment.date) }}</span>
              </div>
              <div class="detail-row">
                <strong>Time:</strong>
                <span>{{ selectedAppointment.time }}</span>
              </div>
              <div class="detail-row">
                <strong>Type:</strong>
                <span>{{ selectedAppointment.type }}</span>
              </div>
              <div class="detail-row">
                <strong>Status:</strong>
                <span class="status-badge" [class]="selectedAppointment.status.toLowerCase()">
                  {{ selectedAppointment.status }}
                </span>
              </div>
              <div class="detail-row" *ngIf="selectedAppointment.notes">
                <strong>Notes:</strong>
                <span>{{ selectedAppointment.notes }}</span>
              </div>
            </div>
            <div class="status-change-form" *ngIf="modalMode === 'status'">
              <div class="form-group">
                <label>Change Status To:</label>
                <select [(ngModel)]="newStatus">
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="NO_SHOW">No Show</option>
                </select>
              </div>
            </div>
          </div>
          <div class="modal-footer" *ngIf="modalMode === 'status'">
            <button class="btn-secondary" (click)="closeModal()">Cancel</button>
            <button class="btn-primary" (click)="saveStatus()">Update Status</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-appointments {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }

    .title-section h2 {
      margin: 0;
      font-size: 28px;
      color: #1a1a1a;
    }

    .title-section p {
      margin: 4px 0 0 0;
      color: #666;
      font-size: 14px;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .btn-primary, .btn-secondary {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-primary {
      background: #FF9800;
      color: white;
    }

    .btn-primary:hover {
      background: #F57C00;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
    }

    .btn-secondary {
      background: #f5f5f5;
      color: #333;
    }

    .btn-secondary:hover {
      background: #e0e0e0;
    }

    .filters {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
    }

    .search-box {
      flex: 1;
      position: relative;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 18px;
    }

    .search-box input {
      width: 100%;
      padding: 12px 12px 12px 40px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
    }

    .search-box input:focus {
      outline: none;
      border-color: #FF9800;
    }

    .filter-group select,
    .filter-group input[type="date"] {
      padding: 12px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
      background: white;
    }

    .stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.3s;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }

    .stat-card.total {
      background: linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%);
      color: white;
    }

    .stat-card.scheduled {
      background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
      color: white;
    }

    .stat-card.completed {
      background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
      color: white;
    }

    .stat-card.cancelled {
      background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
      color: white;
    }

    .stat-icon {
      font-size: 32px;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 700;
    }

    .stat-label {
      font-size: 13px;
      opacity: 0.9;
    }

    .table-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table thead {
      background: #f5f5f5;
    }

    .data-table th {
      padding: 16px;
      text-align: left;
      font-weight: 600;
      color: #333;
      font-size: 14px;
      border-bottom: 2px solid #e0e0e0;
    }

    .data-table td {
      padding: 16px;
      border-bottom: 1px solid #f0f0f0;
      font-size: 14px;
      color: #666;
    }

    .data-table tbody tr:hover {
      background: #f9f9f9;
    }

    .id-badge {
      padding: 4px 8px;
      background: #f0f0f0;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .user-icon {
      font-size: 20px;
    }

    .datetime-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .datetime-info .date {
      font-weight: 600;
      color: #333;
    }

    .datetime-info .time {
      font-size: 12px;
      color: #999;
    }

    .type-badge {
      padding: 4px 12px;
      background: #e3f2fd;
      color: #1976d2;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-badge.scheduled {
      background: #fff3e0;
      color: #FF9800;
    }

    .status-badge.confirmed {
      background: #e3f2fd;
      color: #2196F3;
    }

    .status-badge.completed {
      background: #e8f5e9;
      color: #4CAF50;
    }

    .status-badge.cancelled {
      background: #ffebee;
      color: #f44336;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
    }

    .btn-icon {
      padding: 8px;
      border: none;
      background: #f5f5f5;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.2s;
    }

    .btn-icon:hover {
      background: #e0e0e0;
      transform: scale(1.1);
    }

    .btn-icon.danger:hover {
      background: #ffebee;
    }

    .loading-row, .empty-row {
      text-align: center;
      padding: 48px !important;
    }

    .loader {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #FF9800;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .empty-icon {
      font-size: 48px;
      display: block;
      margin-bottom: 16px;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
      margin-top: 24px;
    }

    .pagination button {
      padding: 8px 16px;
      border: 2px solid #FF9800;
      background: white;
      color: #FF9800;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }

    .pagination button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .pagination button:not(:disabled):hover {
      background: #FF9800;
      color: white;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.2s;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideUp 0.3s;
    }

    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .modal-header {
      padding: 24px;
      border-bottom: 2px solid #f0f0f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 22px;
      color: #1a1a1a;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #999;
      padding: 4px;
    }

    .close-btn:hover {
      color: #333;
    }

    .modal-body {
      padding: 24px;
    }

    .appointment-details {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 12px;
      background: #f9f9f9;
      border-radius: 8px;
    }

    .detail-row strong {
      color: #333;
    }

    .status-change-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group label {
      font-weight: 600;
      font-size: 14px;
      color: #333;
    }

    .form-group select {
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
    }

    .form-group select:focus {
      outline: none;
      border-color: #FF9800;
    }

    .modal-footer {
      padding: 24px;
      border-top: 2px solid #f0f0f0;
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }
  `]
})
export class AdminAppointmentsComponent implements OnInit, OnDestroy {
  appointments: AppointmentWithRelations[] = [];
  filteredAppointments: AppointmentWithRelations[] = [];
  searchQuery = '';
  statusFilter: AppointmentStatus | 'all' = 'all';
  dateFilter = '';
  isLoading = true;
  private subscriptions = new Subscription();
  currentPage = 1;
  pageSize = 20;
  totalAppointments = 0;
  totalPages = 0;
  scheduledCount = 0;
  completedCount = 0;
  cancelledCount = 0;

  showModal = false;
  modalMode: 'view' | 'status' = 'view';
  modalTitle = '';
  selectedAppointment: any = {};
  newStatus = '';

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadAppointments(): void {
    this.isLoading = true;
    const sub = this.appointmentService.getAppointments({
      // You can add filters here as needed
      status: this.statusFilter !== 'all' ? this.statusFilter as AppointmentStatus : undefined,
      // Add date range if needed
    }).subscribe({
      next: (appointments) => {
        this.appointments = appointments;
        this.filterAppointments();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.isLoading = false;
      }
    });
    this.subscriptions.add(sub);
  }

  filterAppointments(): void {
    let result = [...this.appointments];
    
    // Apply search
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(appt => {
        const patientName = `${appt.patient?.firstName || ''} ${appt.patient?.lastName || ''}`.toLowerCase();
        const doctorName = `${appt.doctor?.firstName || ''} ${appt.doctor?.lastName || ''}`.toLowerCase();
        return (
          patientName.includes(query) || 
          doctorName.includes(query) ||
          appt.reason?.toLowerCase().includes(query) ||
          appt.notes?.toLowerCase().includes(query)
        );
      });
    }
    
    // Apply status filter
    if (this.statusFilter !== 'all') {
      result = result.filter(appt => appt.status === this.statusFilter);
    }
    
    // Apply date filter if needed
    if (this.dateFilter) {
      const filterDate = new Date(this.dateFilter).toISOString().split('T')[0];
      result = result.filter(appt => 
        appt.appointmentDate.startsWith(filterDate)
      );
    }
    
    this.filteredAppointments = result;
  }

  formatDate(dateString: string): string {
    return format(parseISO(dateString), 'MMM d, yyyy');
  }

  formatTime(timeString: string): string {
    return format(parseISO(timeString), 'h:mm a');
  }

  onSearch(): void {
    this.filterAppointments();
  }

  onFilterChange(): void {
    this.loadAppointments();
  }

  viewAppointment(appointment: AppointmentWithRelations): void {
    this.modalMode = 'view';
    this.modalTitle = '📅 Appointment Details';
    this.selectedAppointment = { ...appointment };
    this.showModal = true;
  }

  changeStatus(appointment: AppointmentWithRelations): void {
    this.modalMode = 'status';
    this.modalTitle = '✏️ Change Appointment Status';
    this.selectedAppointment = { ...appointment };
    this.newStatus = appointment.status;
    this.showModal = true;
  }

  cancelAppointment(appointment: AppointmentWithRelations): void {
    if (confirm(`Are you sure you want to cancel this appointment?`)) {
      const appointmentId = appointment.id;
      const sub = this.appointmentService.cancelAppointment(appointmentId, 'Cancelled by admin')
        .subscribe({
          next: () => {
            // Update local state
            const updatedAppointment = this.appointments.find(a => a.id === appointmentId);
            if (updatedAppointment) {
              updatedAppointment.status = 'CANCELLED';
              this.filterAppointments();
            }
          },
          error: (error) => {
            console.error('Error cancelling appointment:', error);
          }
        });
      this.subscriptions.add(sub);
    }
  }

  saveStatus(): void {
    const status = this.newStatus as AppointmentStatus;
    const sub = this.appointmentService.updateAppointment(this.selectedAppointment.id, { status })
      .subscribe({
        next: () => {
          // Update local state
          const appointment = this.appointments.find(a => a.id === this.selectedAppointment.id);
          if (appointment) {
            appointment.status = status;
            this.filterAppointments();
          }
          this.closeModal();
        },
        error: (error) => {
          console.error('Error updating appointment status:', error);
        }
      });
    this.subscriptions.add(sub);
  }

  exportAppointments(): void {
    alert('Export appointments data\n\nThis will generate a report with all appointment data');
  }

  refreshData(): void {
    this.loadAppointments();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      // No need to reload data as we're using client-side pagination with slice pipe
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedAppointment = {};
  }
}
