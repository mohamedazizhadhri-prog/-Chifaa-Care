import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

interface Patient {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-admin-patients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-patients">
      <div class="header">
        <div class="title-section">
          <h2>👥 Patients Management</h2>
          <p>View and manage all patients in the system</p>
        </div>
        <button class="btn-primary" (click)="exportPatients()">
          📊 Export Data
        </button>
      </div>

      <!-- Search and Filters -->
      <div class="filters">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search patients by name or email..." 
            [(ngModel)]="searchQuery"
            (input)="onSearch()"
          />
        </div>
        <div class="filter-group">
          <select [(ngModel)]="genderFilter" (change)="onFilterChange()">
            <option value="">All Genders</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div class="filter-group">
          <select [(ngModel)]="statusFilter" (change)="onFilterChange()">
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <div class="stat-value">{{ totalPatients }}</div>
            <div class="stat-label">Total Patients</div>
          </div>
        </div>
        <div class="stat-card active">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <div class="stat-value">{{ activePatients }}</div>
            <div class="stat-label">Active Patients</div>
          </div>
        </div>
        <div class="stat-card male">
          <div class="stat-icon">♂️</div>
          <div class="stat-content">
            <div class="stat-value">{{ malePatients }}</div>
            <div class="stat-label">Male Patients</div>
          </div>
        </div>
        <div class="stat-card female">
          <div class="stat-icon">♀️</div>
          <div class="stat-content">
            <div class="stat-value">{{ femalePatients }}</div>
            <div class="stat-label">Female Patients</div>
          </div>
        </div>
      </div>

      <!-- Patients Table -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Gender</th>
              <th>Age</th>
              <th>Status</th>
              <th>Registered</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let patient of patients">
              <td>
                <div class="user-info">
                  <div class="user-avatar" [class.male]="patient.gender === 'MALE'" [class.female]="patient.gender === 'FEMALE'">
                    {{ getInitials(patient) }}
                  </div>
                  <span>{{ patient.firstName }} {{ patient.lastName }}</span>
                </div>
              </td>
              <td>{{ patient.email }}</td>
              <td>{{ patient.phone || 'N/A' }}</td>
              <td>
                <span class="gender-badge" [class.male]="patient.gender === 'MALE'" [class.female]="patient.gender === 'FEMALE'">
                  {{ patient.gender || 'Not Set' }}
                </span>
              </td>
              <td>{{ calculateAge(patient.dateOfBirth) }}</td>
              <td>
                <span class="status-badge" [class.active]="patient.isActive" [class.inactive]="!patient.isActive">
                  {{ patient.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>{{ formatDate(patient.createdAt) }}</td>
              <td>
                <div class="action-buttons">
                  <button class="btn-icon" (click)="viewPatient(patient)" title="View Details">
                    👁️
                  </button>
                  <button class="btn-icon" (click)="viewMedicalHistory(patient)" title="Medical History">
                    📋
                  </button>
                  <button 
                    class="btn-icon" 
                    [class.activate]="!patient.isActive"
                    [class.deactivate]="patient.isActive"
                    (click)="togglePatientStatus(patient)" 
                    [title]="patient.isActive ? 'Deactivate' : 'Activate'"
                  >
                    {{ patient.isActive ? '🔴' : '🟢' }}
                  </button>
                  <button class="btn-icon" (click)="sendMessage(patient)" title="Send Message">
                    💬
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="loading">
              <td colspan="8" class="loading-row">
                <div class="loader"></div>
                <span>Loading patients...</span>
              </td>
            </tr>
            <tr *ngIf="!loading && patients.length === 0">
              <td colspan="8" class="empty-row">
                <span class="empty-icon">📭</span>
                <p>No patients found</p>
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
            <h3>{{ modalMode === 'view' ? '👁️ Patient Details' : '📋 Medical History' }}</h3>
            <button class="close-btn" (click)="closeModal()">✖️</button>
          </div>
          <div class="modal-body">
            <div class="patient-details" *ngIf="modalMode === 'view'">
              <div class="detail-section">
                <h4>Personal Information</h4>
                <div class="detail-row">
                  <strong>Name:</strong>
                  <span>{{ selectedPatient.firstName }} {{ selectedPatient.lastName }}</span>
                </div>
                <div class="detail-row">
                  <strong>Email:</strong>
                  <span>{{ selectedPatient.email }}</span>
                </div>
                <div class="detail-row">
                  <strong>Phone:</strong>
                  <span>{{ selectedPatient.phone || 'N/A' }}</span>
                </div>
                <div class="detail-row">
                  <strong>Gender:</strong>
                  <span>{{ selectedPatient.gender || 'Not Set' }}</span>
                </div>
                <div class="detail-row">
                  <strong>Date of Birth:</strong>
                  <span>{{ selectedPatient.dateOfBirth ? formatDate(selectedPatient.dateOfBirth) : 'N/A' }}</span>
                </div>
                <div class="detail-row">
                  <strong>Age:</strong>
                  <span>{{ calculateAge(selectedPatient.dateOfBirth) }}</span>
                </div>
                <div class="detail-row">
                  <strong>Address:</strong>
                  <span>{{ selectedPatient.address || 'N/A' }}</span>
                </div>
                <div class="detail-row">
                  <strong>Status:</strong>
                  <span class="status-badge" [class.active]="selectedPatient.isActive" [class.inactive]="!selectedPatient.isActive">
                    {{ selectedPatient.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </div>
                <div class="detail-row">
                  <strong>Registered:</strong>
                  <span>{{ formatDate(selectedPatient.createdAt) }}</span>
                </div>
              </div>
            </div>
            <div class="medical-history" *ngIf="modalMode === 'history'">
              <div class="history-placeholder">
                <span class="placeholder-icon">📋</span>
                <p>Medical history feature coming soon</p>
                <small>This will show appointment history, diagnoses, prescriptions, and more</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-patients {
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

    .btn-primary {
      padding: 12px 24px;
      background: #2196F3;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-primary:hover {
      background: #1976D2;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
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
      transition: border-color 0.3s;
    }

    .search-box input:focus {
      outline: none;
      border-color: #2196F3;
    }

    .filter-group select {
      padding: 12px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
      background: white;
    }

    .stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

    .stat-card.active {
      background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
      color: white;
    }

    .stat-card.male {
      background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
      color: white;
    }

    .stat-card.female {
      background: linear-gradient(135deg, #E91E63 0%, #C2185B 100%);
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

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
    }

    .user-avatar.male {
      background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
    }

    .user-avatar.female {
      background: linear-gradient(135deg, #E91E63 0%, #C2185B 100%);
    }

    .gender-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      background: #e3f2fd;
      color: #1976d2;
    }

    .gender-badge.male {
      background: #e3f2fd;
      color: #1976d2;
    }

    .gender-badge.female {
      background: #fce4ec;
      color: #c2185b;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }

    .status-badge.active {
      background: #e8f5e9;
      color: #4CAF50;
    }

    .status-badge.inactive {
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

    .btn-icon.activate:hover {
      background: #e8f5e9;
    }

    .btn-icon.deactivate:hover {
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
      border-top: 4px solid #2196F3;
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
      border: 2px solid #2196F3;
      background: white;
      color: #2196F3;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }

    .pagination button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .pagination button:not(:disabled):hover {
      background: #2196F3;
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
      max-width: 700px;
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

    .patient-details {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .detail-section h4 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #f0f0f0;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 12px;
      background: #f9f9f9;
      border-radius: 8px;
      margin-bottom: 8px;
    }

    .detail-row strong {
      color: #333;
    }

    .history-placeholder {
      text-align: center;
      padding: 48px 24px;
    }

    .placeholder-icon {
      font-size: 64px;
      display: block;
      margin-bottom: 16px;
    }

    .history-placeholder p {
      font-size: 18px;
      color: #333;
      margin: 0 0 8px 0;
    }

    .history-placeholder small {
      color: #999;
    }
  `]
})
export class AdminPatientsComponent implements OnInit {
  patients: Patient[] = [];
  loading = false;
  searchQuery = '';
  genderFilter = '';
  statusFilter = '';
  currentPage = 1;
  pageSize = 20;
  totalPatients = 0;
  totalPages = 0;
  activePatients = 0;
  malePatients = 0;
  femalePatients = 0;

  showModal = false;
  modalMode: 'view' | 'history' = 'view';
  selectedPatient: any = {};

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadPatients();
  }

  loadPatients() {
    this.loading = true;
    const opts = {
      query: this.searchQuery,
      role: 'PATIENT',
      active: this.statusFilter ? this.statusFilter === 'true' : undefined,
      page: this.currentPage,
      pageSize: this.pageSize
    };

    this.adminService.getUsers(opts).subscribe({
      next: (response) => {
        this.patients = response.data.items;
        this.totalPatients = response.data.total;
        this.totalPages = Math.ceil(this.totalPatients / this.pageSize);
        this.updateStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading patients:', error);
        this.loading = false;
      }
    });
  }

  updateStats() {
    this.activePatients = this.patients.filter(p => p.isActive).length;
    this.malePatients = this.patients.filter(p => p.gender === 'MALE').length;
    this.femalePatients = this.patients.filter(p => p.gender === 'FEMALE').length;
  }

  onSearch() {
    this.currentPage = 1;
    this.loadPatients();
  }

  onFilterChange() {
    this.currentPage = 1;
    this.loadPatients();
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.loadPatients();
  }

  getInitials(patient: Patient): string {
    return `${patient.firstName?.charAt(0) || ''}${patient.lastName?.charAt(0) || ''}`.toUpperCase();
  }

  formatDate(date: string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  calculateAge(dateOfBirth: string | undefined): string {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} years`;
  }

  viewPatient(patient: Patient) {
    this.modalMode = 'view';
    this.selectedPatient = { ...patient };
    this.showModal = true;
  }

  viewMedicalHistory(patient: Patient) {
    this.modalMode = 'history';
    this.selectedPatient = { ...patient };
    this.showModal = true;
  }

  togglePatientStatus(patient: Patient) {
    if (confirm(`Are you sure you want to ${patient.isActive ? 'deactivate' : 'activate'} this patient?`)) {
      this.adminService.updateUser(patient.id, { isActive: !patient.isActive }).subscribe({
        next: () => {
          this.loadPatients();
        },
        error: (error) => {
          console.error('Error updating patient status:', error);
          alert('Failed to update patient status');
        }
      });
    }
  }

  sendMessage(patient: Patient) {
    alert(`Send message to ${patient.firstName} ${patient.lastName}\n\nMessaging feature coming soon!`);
  }

  exportPatients() {
    alert('Export patients data\n\nThis will generate a CSV file with all patient data');
  }

  closeModal() {
    this.showModal = false;
    this.selectedPatient = {};
  }
}
