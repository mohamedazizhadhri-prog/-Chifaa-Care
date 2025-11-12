import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specialization: string;
  licenseNumber?: string;
  yearsOfExperience?: number;
  rating?: number;
  isActive: boolean;
}

@Component({
  selector: 'app-clinic-doctors',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
    <div class="doctors-page">
      <div class="page-header">
        <div>
          <h1><i class="fas fa-user-doctor"></i> Doctor Management</h1>
          <p>Manage medical staff and specialists</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-outline" (click)="refreshDoctors()">
            <i class="fas fa-sync-alt" [class.fa-spin]="loading"></i> Refresh
          </button>
          <button class="btn btn-primary" (click)="openAddModal()">
            <i class="fas fa-plus"></i> Add Doctor
          </button>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <i class="fas fa-user-doctor"></i>
          <div class="stat-info">
            <div class="stat-value">{{doctors.length}}</div>
            <div class="stat-label">Total Doctors</div>
          </div>
        </div>
        <div class="stat-card">
          <i class="fas fa-user-check"></i>
          <div class="stat-info">
            <div class="stat-value">{{activeCount}}</div>
            <div class="stat-label">Active</div>
          </div>
        </div>
        <div class="stat-card">
          <i class="fas fa-star"></i>
          <div class="stat-info">
            <div class="stat-value">{{avgRating.toFixed(1)}}</div>
            <div class="stat-label">Avg Rating</div>
          </div>
        </div>
      </div>

      <div class="search-bar">
        <i class="fas fa-search"></i>
        <input type="text" placeholder="Search doctors..." [(ngModel)]="searchTerm" (input)="filterDoctors()">
        <select [(ngModel)]="filterStatus" (change)="filterDoctors()">
          <option value="all">All Doctors</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      </div>

      <div class="doctors-grid">
        <div *ngIf="loading" class="loading">
          <i class="fas fa-spinner fa-spin fa-3x"></i>
          <p>Loading doctors...</p>
        </div>

        <div *ngIf="!loading && filteredDoctors.length === 0" class="empty-state">
          <i class="fas fa-user-doctor fa-3x"></i>
          <h3>No doctors found</h3>
          <button class="btn btn-primary" (click)="openAddModal()">
            <i class="fas fa-plus"></i> Add Doctor
          </button>
        </div>

        <div *ngFor="let doctor of filteredDoctors" class="doctor-card">
          <div class="doctor-header">
            <div class="doctor-avatar">{{getInitials(doctor)}}</div>
            <div class="doctor-info">
              <h3>Dr. {{doctor.firstName}} {{doctor.lastName}}</h3>
              <p class="specialization">{{doctor.specialization}}</p>
              <div class="rating">
                <i class="fas fa-star" *ngFor="let star of [1,2,3,4,5]" 
                   [class.filled]="star <= (doctor.rating || 0)"></i>
                <span>{{doctor.rating || 0}}.0</span>
              </div>
            </div>
            <span class="badge" [class.badge-success]="doctor.isActive" [class.badge-danger]="!doctor.isActive">
              {{doctor.isActive ? 'Active' : 'Inactive'}}
            </span>
          </div>
          <div class="doctor-details">
            <div class="detail-item">
              <i class="fas fa-envelope"></i>
              <span>{{doctor.email}}</span>
            </div>
            <div class="detail-item">
              <i class="fas fa-phone"></i>
              <span>{{doctor.phone || 'N/A'}}</span>
            </div>
            <div class="detail-item">
              <i class="fas fa-id-card"></i>
              <span>License: {{doctor.licenseNumber || 'N/A'}}</span>
            </div>
            <div class="detail-item">
              <i class="fas fa-briefcase"></i>
              <span>{{doctor.yearsOfExperience || 0}} years experience</span>
            </div>
          </div>
          <div class="doctor-actions">
            <button class="btn-icon btn-info" (click)="viewDoctor(doctor); $event.stopPropagation()" title="View">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn-icon btn-warning" (click)="editDoctor(doctor); $event.stopPropagation()" title="Edit">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon btn-danger" (click)="deleteDoctor(doctor); $event.stopPropagation()" title="Delete">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="modal" *ngIf="showModal" (click)="closeModal()">
        <div class="modal-dialog" (click)="$event.stopPropagation()" (mousedown)="$event.stopPropagation()" (mouseup)="$event.stopPropagation()">
          <div class="modal-header">
            <h2><i class="fas fa-user-doctor"></i> {{editMode ? 'Edit' : 'Add'}} Doctor</h2>
            <button class="btn-close" (click)="closeModal()">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-row">
              <div class="form-group">
                <label>First Name *</label>
                <input type="text" [(ngModel)]="form.firstName" placeholder="Enter first name" [attr.readonly]="null">
              </div>
              <div class="form-group">
                <label>Last Name *</label>
                <input type="text" [(ngModel)]="form.lastName" placeholder="Enter last name" [attr.readonly]="null">
              </div>
            </div>
            <div class="form-group">
              <label>Email *</label>
              <input type="email" [(ngModel)]="form.email" placeholder="doctor@example.com" [attr.readonly]="null">
            </div>
            <div class="form-group">
              <label>Phone</label>
              <input type="tel" [(ngModel)]="form.phone" placeholder="+218 91 234 5678" [attr.readonly]="null">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Specialization *</label>
                <select [(ngModel)]="form.specialization">
                  <option value="">Select Specialization</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="General Practice">General Practice</option>
                  <option value="Surgery">Surgery</option>
                  <option value="Orthopedics">Orthopedics</option>
                </select>
              </div>
              <div class="form-group">
                <label>Years of Experience</label>
                <input type="number" [(ngModel)]="form.yearsOfExperience" min="0">
              </div>
            </div>
            <div class="form-group">
              <label>License Number</label>
              <input type="text" [(ngModel)]="form.licenseNumber" placeholder="MED-123456">
            </div>
            <div class="form-group">
              <label class="checkbox">
                <input type="checkbox" [(ngModel)]="form.isActive">
                <span>Active Doctor</span>
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" (click)="closeModal()">Cancel</button>
            <button class="btn btn-primary" (click)="saveDoctor()">
              <i class="fas fa-save"></i> {{editMode ? 'Update' : 'Save'}}
            </button>
          </div>
        </div>
      </div>

      <!-- View Doctor Modal -->
      <div class="modal" *ngIf="showViewModal" (click)="closeViewModal()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2><i class="fas fa-user-doctor"></i> Doctor Details</h2>
            <button class="btn-close" (click)="closeViewModal()">&times;</button>
          </div>
          <div class="modal-body" *ngIf="viewingDoctor">
            <div class="detail-grid">
              <div class="detail-item">
                <label><i class="fas fa-user-doctor"></i> Full Name</label>
                <div class="detail-value">Dr. {{viewingDoctor.firstName}} {{viewingDoctor.lastName}}</div>
              </div>
              <div class="detail-item">
                <label><i class="fas fa-envelope"></i> Email</label>
                <div class="detail-value">{{viewingDoctor.email}}</div>
              </div>
              <div class="detail-item">
                <label><i class="fas fa-phone"></i> Phone</label>
                <div class="detail-value">{{viewingDoctor.phone || 'Not provided'}}</div>
              </div>
              <div class="detail-item">
                <label><i class="fas fa-stethoscope"></i> Specialization</label>
                <div class="detail-value">{{viewingDoctor.specialization}}</div>
              </div>
              <div class="detail-item">
                <label><i class="fas fa-id-card"></i> License Number</label>
                <div class="detail-value">{{viewingDoctor.licenseNumber || 'Not provided'}}</div>
              </div>
              <div class="detail-item">
                <label><i class="fas fa-briefcase"></i> Experience</label>
                <div class="detail-value">{{viewingDoctor.yearsOfExperience || 0}} years</div>
              </div>
              <div class="detail-item">
                <label><i class="fas fa-star"></i> Rating</label>
                <div class="detail-value">
                  <span class="rating-value">{{viewingDoctor.rating || 'N/A'}} ⭐</span>
                </div>
              </div>
              <div class="detail-item">
                <label><i class="fas fa-check-circle"></i> Status</label>
                <div class="detail-value">
                  <span class="badge" [class.badge-success]="viewingDoctor.isActive" [class.badge-danger]="!viewingDoctor.isActive">
                    {{viewingDoctor.isActive ? 'Active' : 'Inactive'}}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" (click)="closeViewModal()">Close</button>
            <button class="btn btn-primary" (click)="closeViewModal(); editDoctor(viewingDoctor!)">
              <i class="fas fa-edit"></i> Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .doctors-page { padding: 24px 5%; max-width: 1400px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { font-size: 28px; font-weight: 700; color: #0f172a; margin: 0; display: flex; align-items: center; gap: 12px; }
    .page-header h1 i { color: #3b82f6; }
    .page-header p { color: #64748b; margin: 4px 0 0; font-size: 14px; }
    .header-actions { display: flex; gap: 12px; }
    
    .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 24px; }
    .stat-card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 16px; }
    .stat-card i { font-size: 32px; color: #3b82f6; }
    .stat-value { font-size: 32px; font-weight: 700; color: #0f172a; }
    .stat-label { font-size: 13px; color: #64748b; text-transform: uppercase; }
    
    .search-bar { background: white; padding: 16px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
    .search-bar i { color: #94a3b8; font-size: 18px; }
    .search-bar input { flex: 1; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; }
    .search-bar select { padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; background: white; }
    
    .doctors-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
    .doctor-card { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 20px; transition: transform 0.2s; }
    .doctor-card:hover { transform: translateY(-4px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    
    .doctor-header { display: flex; gap: 12px; margin-bottom: 16px; position: relative; }
    .doctor-avatar { width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 18px; flex-shrink: 0; }
    .doctor-info { flex: 1; }
    .doctor-info h3 { margin: 0 0 4px; font-size: 18px; font-weight: 700; color: #0f172a; }
    .specialization { margin: 0 0 8px; color: #3b82f6; font-size: 14px; font-weight: 500; }
    
    .rating { display: flex; align-items: center; gap: 4px; }
    .rating i { color: #e2e8f0; font-size: 14px; }
    .rating i.filled { color: #fbbf24; }
    .rating span { font-size: 13px; color: #64748b; margin-left: 4px; }
    
    .doctor-details { border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; padding: 16px 0; margin-bottom: 16px; }
    .detail-item { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 14px; color: #64748b; }
    .detail-item:last-child { margin-bottom: 0; }
    .detail-item i { width: 16px; color: #94a3b8; }
    
    .doctor-actions { display: flex; gap: 8px; }
    
    .badge { position: absolute; top: 0; right: 0; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .badge-success { background: #dcfce7; color: #166534; }
    .badge-danger { background: #fee2e2; color: #991b1b; }
    
    .btn { padding: 10px 20px; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: transform 0.2s; }
    .btn:hover { transform: translateY(-2px); }
    .btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
    .btn-outline { background: white; border: 1px solid #e2e8f0; color: #64748b; }
    .btn-sm { padding: 8px 16px; font-size: 13px; }
    .btn-info { background: #0ea5e9; color: white; }
    .btn-warning { background: #f59e0b; color: white; }
    .btn-danger { background: #ef4444; color: white; }
    
    .loading, .empty-state { text-align: center; padding: 60px 20px; color: #64748b; grid-column: 1 / -1; }
    .loading i, .empty-state i { color: #cbd5e1; margin-bottom: 16px; }
    .empty-state h3 { color: #0f172a; margin: 16px 0; }
    
    .modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-dialog { background: white; border-radius: 12px; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 1001; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #e2e8f0; }
    .modal-header h2 { margin: 0; font-size: 20px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
    .btn-close { background: none; border: none; font-size: 28px; color: #94a3b8; cursor: pointer; padding: 0; line-height: 1; }
    .modal-body { padding: 20px; position: relative; z-index: 1; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 20px; border-top: 1px solid #e2e8f0; }
    
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 6px; font-size: 14px; font-weight: 600; color: #334155; }
    .form-group input, .form-group select { width: 100%; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; }
    .form-group input:focus, .form-group select:focus { outline: none; border-color: #3b82f6; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .checkbox { display: flex; align-items: center; gap: 8px; cursor: pointer; }
    .checkbox input { width: auto; }
    
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .detail-item { padding: 16px; background: #f8fafc; border-radius: 8px; border-left: 3px solid #3b82f6; }
    .detail-item label { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 8px; }
    .detail-item label i { color: #3b82f6; }
    .detail-value { font-size: 15px; color: #0f172a; font-weight: 600; }
    .rating-value { color: #f59e0b; }
    
    @media (max-width: 768px) {
      .detail-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ClinicDoctorsComponent implements OnInit {
  doctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];
  searchTerm = '';
  filterStatus = 'all';
  loading = false;
  showModal = false;
  showViewModal = false;
  editMode = false;
  viewingDoctor: Doctor | null = null;
  
  activeCount = 0;
  avgRating = 0;
  
  private apiUrl = environment.apiUrl || 'http://localhost:3000/api/v1';
  
  form: any = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialization: '',
    licenseNumber: '',
    yearsOfExperience: 0,
    rating: 4.5,
    isActive: true
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadDoctors();
  }

  loadDoctors() {
    this.loading = true;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders(token ? { 'Authorization': `Bearer ${token}` } : {});
    
    this.http.get<any>(`${this.apiUrl}/doctors`, { headers }).subscribe({
      next: (response) => {
        console.log('Doctors API response:', response);
        const doctors = response.data?.doctors || response.doctors || response.data || response;
        this.doctors = Array.isArray(doctors) ? doctors.map((d: any) => {
          const user = d.user || d;
          return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone || '',
            specialization: d.specialization || 'General Practice',
            licenseNumber: d.licenseNumber || '',
            yearsOfExperience: d.yearsOfExperience || 0,
            rating: d.rating || 4.5,
            isActive: user.isActive !== false
          };
        }) : [];
        this.filteredDoctors = [...this.doctors];
        this.updateStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
        console.error('Error details:', error.error);
        this.doctors = [];
        this.filteredDoctors = [];
        this.loading = false;
      }
    });
  }

  updateStats() {
    this.activeCount = this.doctors.filter(d => d.isActive).length;
    const totalRating = this.doctors.reduce((sum, d) => sum + (d.rating || 0), 0);
    this.avgRating = this.doctors.length > 0 ? totalRating / this.doctors.length : 0;
  }

  filterDoctors() {
    this.filteredDoctors = this.doctors.filter(d => {
      const matchesSearch = !this.searchTerm || 
        d.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        d.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        d.specialization.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = this.filterStatus === 'all' ||
        (this.filterStatus === 'active' && d.isActive) ||
        (this.filterStatus === 'inactive' && !d.isActive);
      
      return matchesSearch && matchesStatus;
    });
  }

  refreshDoctors() {
    this.loadDoctors();
  }

  openAddModal() {
    this.editMode = false;
    this.form = { firstName: '', lastName: '', email: '', phone: '', specialization: '', licenseNumber: '', yearsOfExperience: 0, rating: 4.5, isActive: true };
    this.showModal = true;
  }

  viewDoctor(doctor: Doctor) {
    // Show doctor details in a modal
    this.viewingDoctor = doctor;
    this.showViewModal = true;
  }

  closeViewModal() {
    this.showViewModal = false;
    this.viewingDoctor = null;
  }

  editDoctor(doctor: Doctor) {
    this.editMode = true;
    this.form = {
      id: doctor.id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      email: doctor.email,
      phone: doctor.phone || '',
      specialization: doctor.specialization,
      licenseNumber: doctor.licenseNumber || '',
      yearsOfExperience: doctor.yearsOfExperience || 0,
      rating: doctor.rating || 4.5,
      isActive: doctor.isActive
    };
    this.showModal = true;
  }

  deleteDoctor(doctor: Doctor) {
    if (confirm(`Remove Dr. ${doctor.firstName} ${doctor.lastName}?`)) {
      this.doctors = this.doctors.filter(d => d.id !== doctor.id);
      this.filterDoctors();
      this.updateStats();
      alert('Doctor removed successfully!');
    }
  }

  saveDoctor() {
    if (!this.form.firstName || !this.form.lastName || !this.form.email || !this.form.specialization) {
      alert('Please fill required fields');
      return;
    }
    
    if (this.editMode) {
      const index = this.doctors.findIndex(d => d.id === this.form.id);
      if (index !== -1) {
        this.doctors[index] = { ...this.form };
        alert('Doctor updated!');
      }
    } else {
      this.form.id = Date.now().toString();
      this.form.rating = 4.5;
      this.doctors.push({ ...this.form });
      alert('Doctor added!');
    }
    
    this.filterDoctors();
    this.updateStats();
    this.closeModal();
  }

  closeModal() {
    this.showModal = false;
    this.editMode = false;
  }

  getInitials(doctor: Doctor): string {
    return `${doctor.firstName.charAt(0)}${doctor.lastName.charAt(0)}`.toUpperCase();
  }
}
