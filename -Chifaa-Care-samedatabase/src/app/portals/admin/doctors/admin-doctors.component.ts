import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

interface Doctor {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  specialty?: string;
  licenseNumber?: string;
  isActive: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-admin-doctors',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-doctors">
      <div class="header">
        <div class="title-section">
          <h2>👨‍⚕️ Doctors Management</h2>
          <p>View and manage all doctors in the system</p>
        </div>
        <button class="btn-primary" (click)="openAddModal()">
          ➕ Add New Doctor
        </button>
      </div>

      <!-- Search and Filters -->
      <div class="filters">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search doctors by name or email..." 
            [(ngModel)]="searchQuery"
            (input)="onSearch()"
          />
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
            <div class="stat-value">{{ totalDoctors }}</div>
            <div class="stat-label">Total Doctors</div>
          </div>
        </div>
        <div class="stat-card active">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <div class="stat-value">{{ activeDoctors }}</div>
            <div class="stat-label">Active Doctors</div>
          </div>
        </div>
        <div class="stat-card inactive">
          <div class="stat-icon">⛔</div>
          <div class="stat-content">
            <div class="stat-value">{{ inactiveDoctors }}</div>
            <div class="stat-label">Inactive Doctors</div>
          </div>
        </div>
      </div>

      <!-- Doctors Table -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Specialty</th>
              <th>License</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let doctor of doctors">
              <td>
                <div class="user-info">
                  <div class="user-avatar">{{ getInitials(doctor) }}</div>
                  <span>{{ doctor.firstName }} {{ doctor.lastName }}</span>
                </div>
              </td>
              <td>{{ doctor.email }}</td>
              <td>{{ doctor.phone || 'N/A' }}</td>
              <td>
                <span class="specialty-badge">{{ doctor.specialty || 'Not Set' }}</span>
              </td>
              <td>{{ doctor.licenseNumber || 'N/A' }}</td>
              <td>
                <span class="status-badge" [class.active]="doctor.isActive" [class.inactive]="!doctor.isActive">
                  {{ doctor.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>{{ formatDate(doctor.createdAt) }}</td>
              <td>
                <div class="action-buttons">
                  <button class="btn-icon" (click)="viewDoctor(doctor)" title="View Details">
                    👁️
                  </button>
                  <button class="btn-icon" (click)="editDoctor(doctor)" title="Edit">
                    ✏️
                  </button>
                  <button 
                    class="btn-icon" 
                    [class.activate]="!doctor.isActive"
                    [class.deactivate]="doctor.isActive"
                    (click)="toggleDoctorStatus(doctor)" 
                    [title]="doctor.isActive ? 'Deactivate' : 'Activate'"
                  >
                    {{ doctor.isActive ? '🔴' : '🟢' }}
                  </button>
                  <button class="btn-icon danger" (click)="deleteDoctor(doctor)" title="Delete">
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="loading">
              <td colspan="8" class="loading-row">
                <div class="loader"></div>
                <span>Loading doctors...</span>
              </td>
            </tr>
            <tr *ngIf="!loading && doctors.length === 0">
              <td colspan="8" class="empty-row">
                <span class="empty-icon">📭</span>
                <p>No doctors found</p>
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
            <h3>{{ modalMode === 'add' ? '➕ Add New Doctor' : modalMode === 'edit' ? '✏️ Edit Doctor' : '👁️ Doctor Details' }}</h3>
            <button class="close-btn" (click)="closeModal()">✖️</button>
          </div>
          <div class="modal-body">
            <div class="form-grid" *ngIf="modalMode !== 'view'">
              <div class="form-group">
                <label>First Name *</label>
                <input type="text" [(ngModel)]="selectedDoctor.firstName" />
              </div>
              <div class="form-group">
                <label>Last Name *</label>
                <input type="text" [(ngModel)]="selectedDoctor.lastName" />
              </div>
              <div class="form-group">
                <label>Email *</label>
                <input type="email" [(ngModel)]="selectedDoctor.email" />
              </div>
              <div class="form-group">
                <label>Phone</label>
                <input type="tel" [(ngModel)]="selectedDoctor.phone" />
              </div>
              <div class="form-group">
                <label>Specialty</label>
                <input type="text" [(ngModel)]="selectedDoctor.specialty" />
              </div>
              <div class="form-group">
                <label>License Number</label>
                <input type="text" [(ngModel)]="selectedDoctor.licenseNumber" />
              </div>
              <div class="form-group full-width">
                <label>
                  <input type="checkbox" [(ngModel)]="selectedDoctor.isActive" />
                  Active
                </label>
              </div>
            </div>
            <div class="doctor-details" *ngIf="modalMode === 'view'">
              <div class="detail-row">
                <strong>Name:</strong>
                <span>{{ selectedDoctor.firstName }} {{ selectedDoctor.lastName }}</span>
              </div>
              <div class="detail-row">
                <strong>Email:</strong>
                <span>{{ selectedDoctor.email }}</span>
              </div>
              <div class="detail-row">
                <strong>Phone:</strong>
                <span>{{ selectedDoctor.phone || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <strong>Specialty:</strong>
                <span>{{ selectedDoctor.specialty || 'Not Set' }}</span>
              </div>
              <div class="detail-row">
                <strong>License:</strong>
                <span>{{ selectedDoctor.licenseNumber || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <strong>Status:</strong>
                <span class="status-badge" [class.active]="selectedDoctor.isActive" [class.inactive]="!selectedDoctor.isActive">
                  {{ selectedDoctor.isActive ? 'Active' : 'Inactive' }}
                </span>
              </div>
              <div class="detail-row">
                <strong>Joined:</strong>
                <span>{{ formatDate(selectedDoctor.createdAt) }}</span>
              </div>
            </div>
          </div>
          <div class="modal-footer" *ngIf="modalMode !== 'view'">
            <button class="btn-secondary" (click)="closeModal()">Cancel</button>
            <button class="btn-primary" (click)="saveDoctor()">
              {{ modalMode === 'add' ? 'Create Doctor' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-doctors {
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
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-primary:hover {
      background: #45a049;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
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
      border-color: #4CAF50;
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

    .stat-card.inactive {
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

    .specialty-badge {
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

    .btn-icon.danger:hover {
      background: #ffebee;
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
      border-top: 4px solid #4CAF50;
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
      border: 2px solid #4CAF50;
      background: white;
      color: #4CAF50;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }

    .pagination button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .pagination button:not(:disabled):hover {
      background: #4CAF50;
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

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-group label {
      font-weight: 600;
      font-size: 14px;
      color: #333;
    }

    .form-group input[type="text"],
    .form-group input[type="email"],
    .form-group input[type="tel"] {
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
    }

    .form-group input:focus {
      outline: none;
      border-color: #4CAF50;
    }

    .form-group input[type="checkbox"] {
      width: 18px;
      height: 18px;
      margin-right: 8px;
    }

    .doctor-details {
      display: flex;
      flex-direction: column;
      gap: 16px;
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

    .modal-footer {
      padding: 24px;
      border-top: 2px solid #f0f0f0;
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .btn-secondary {
      padding: 12px 24px;
      background: #f5f5f5;
      color: #333;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-secondary:hover {
      background: #e0e0e0;
    }
  `]
})
export class AdminDoctorsComponent implements OnInit {
  doctors: Doctor[] = [];
  loading = false;
  searchQuery = '';
  statusFilter = '';
  currentPage = 1;
  pageSize = 20;
  totalDoctors = 0;
  totalPages = 0;
  activeDoctors = 0;
  inactiveDoctors = 0;

  showModal = false;
  modalMode: 'add' | 'edit' | 'view' = 'add';
  selectedDoctor: any = this.getEmptyDoctor();

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadDoctors();
  }

  getEmptyDoctor() {
    return {
      id: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      specialty: '',
      licenseNumber: '',
      isActive: true,
      createdAt: new Date().toISOString()
    };
  }

  loadDoctors() {
    this.loading = true;
    const opts = {
      query: this.searchQuery,
      role: 'DOCTOR',
      active: this.statusFilter ? this.statusFilter === 'true' : undefined,
      page: this.currentPage,
      pageSize: this.pageSize
    };

    this.adminService.getUsers(opts).subscribe({
      next: (response) => {
        this.doctors = response.data.items;
        this.totalDoctors = response.data.total;
        this.totalPages = Math.ceil(this.totalDoctors / this.pageSize);
        this.updateStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
        this.loading = false;
      }
    });
  }

  updateStats() {
    this.activeDoctors = this.doctors.filter(d => d.isActive).length;
    this.inactiveDoctors = this.doctors.filter(d => !d.isActive).length;
  }

  onSearch() {
    this.currentPage = 1;
    this.loadDoctors();
  }

  onFilterChange() {
    this.currentPage = 1;
    this.loadDoctors();
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.loadDoctors();
  }

  getInitials(doctor: Doctor): string {
    return `${doctor.firstName?.charAt(0) || ''}${doctor.lastName?.charAt(0) || ''}`.toUpperCase();
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  openAddModal() {
    this.modalMode = 'add';
    this.selectedDoctor = this.getEmptyDoctor();
    this.showModal = true;
  }

  viewDoctor(doctor: Doctor) {
    this.modalMode = 'view';
    this.selectedDoctor = { ...doctor };
    this.showModal = true;
  }

  editDoctor(doctor: Doctor) {
    this.modalMode = 'edit';
    this.selectedDoctor = { ...doctor };
    this.showModal = true;
  }

  toggleDoctorStatus(doctor: Doctor) {
    if (confirm(`Are you sure you want to ${doctor.isActive ? 'deactivate' : 'activate'} this doctor?`)) {
      this.adminService.updateUser(doctor.id, { isActive: !doctor.isActive }).subscribe({
        next: () => {
          this.loadDoctors();
        },
        error: (error) => {
          console.error('Error updating doctor status:', error);
          alert('Failed to update doctor status');
        }
      });
    }
  }

  deleteDoctor(doctor: Doctor) {
    if (confirm(`Are you sure you want to delete ${doctor.firstName} ${doctor.lastName}? This action cannot be undone.`)) {
      // Note: Implement delete endpoint in backend if needed
      console.log('Delete doctor:', doctor);
      alert('Delete functionality to be implemented in backend');
    }
  }

  saveDoctor() {
    if (this.modalMode === 'add') {
      // Implement create doctor endpoint
      console.log('Create doctor:', this.selectedDoctor);
      alert('Create functionality to be implemented');
    } else {
      this.adminService.updateUser(this.selectedDoctor.id, {
        isActive: this.selectedDoctor.isActive
      }).subscribe({
        next: () => {
          this.closeModal();
          this.loadDoctors();
        },
        error: (error) => {
          console.error('Error saving doctor:', error);
          alert('Failed to save doctor');
        }
      });
    }
  }

  closeModal() {
    this.showModal = false;
    this.selectedDoctor = this.getEmptyDoctor();
  }
}
