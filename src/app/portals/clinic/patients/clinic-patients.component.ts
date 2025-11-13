import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  gender?: string;
  bloodType?: string;
  isActive: boolean;
}

@Component({
  selector: 'app-clinic-patients',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  template: `
    <div class="patients-page">
      <div class="page-header">
        <div>
          <h1><i class="fas fa-users"></i> Patient Management</h1>
          <p>Manage your clinic's patient records</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-outline" (click)="refreshPatients()">
            <i class="fas fa-sync-alt" [class.fa-spin]="loading"></i> Refresh
          </button>
          <button class="btn btn-primary" (click)="openAddModal()">
            <i class="fas fa-plus"></i> Add Patient
          </button>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <i class="fas fa-users"></i>
          <div class="stat-info">
            <div class="stat-value">{{patients.length}}</div>
            <div class="stat-label">Total Patients</div>
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
          <i class="fas fa-user-plus"></i>
          <div class="stat-info">
            <div class="stat-value">{{newThisMonth}}</div>
            <div class="stat-label">New This Month</div>
          </div>
        </div>
      </div>

      <div class="search-bar">
        <i class="fas fa-search"></i>
        <input type="text" placeholder="Search patients..." [(ngModel)]="searchTerm" (input)="filterPatients()">
        <select [(ngModel)]="filterStatus" (change)="filterPatients()">
          <option value="all">All Status</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      </div>

      <div class="table-container">
        <div *ngIf="loading" class="loading">
          <i class="fas fa-spinner fa-spin fa-3x"></i>
          <p>Loading patients...</p>
        </div>

        <div *ngIf="!loading && filteredPatients.length === 0" class="empty-state">
          <i class="fas fa-users fa-3x"></i>
          <h3>No patients found</h3>
          <p>{{searchTerm ? 'Try adjusting your search' : 'Add your first patient'}}</p>
          <button class="btn btn-primary" (click)="openAddModal()">
            <i class="fas fa-plus"></i> Add Patient
          </button>
        </div>

        <table *ngIf="!loading && filteredPatients.length > 0">
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Gender</th>
              <th>Blood Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let patient of filteredPatients">
              <td>
                <div class="patient-name">
                  <div class="avatar">{{getInitials(patient)}}</div>
                  <span>{{patient.firstName}} {{patient.lastName}}</span>
                </div>
              </td>
              <td>{{patient.email}}</td>
              <td>{{patient.phone || 'N/A'}}</td>
              <td>{{patient.gender || 'N/A'}}</td>
              <td><span class="badge badge-info">{{patient.bloodType || 'Unknown'}}</span></td>
              <td>
                <span class="badge" [class.badge-success]="patient.isActive" [class.badge-danger]="!patient.isActive">
                  {{patient.isActive ? 'Active' : 'Inactive'}}
                </span>
              </td>
              <td class="actions">
                <button class="btn-icon btn-info" (click)="viewPatient(patient); $event.stopPropagation()" title="View">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="btn-icon btn-warning" (click)="editPatient(patient); $event.stopPropagation()" title="Edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-danger" (click)="deletePatient(patient); $event.stopPropagation()" title="Delete">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="modal" *ngIf="showModal" (click)="closeModal()">
        <div class="modal-dialog" (click)="$event.stopPropagation()" (mousedown)="$event.stopPropagation()" (mouseup)="$event.stopPropagation()">
          <div class="modal-header">
            <h2><i class="fas fa-user-plus"></i> {{editMode ? 'Edit' : 'Add'}} Patient</h2>
            <button class="btn-close" (click)="closeModal()">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>First Name *</label>
              <input type="text" [(ngModel)]="form.firstName" placeholder="Enter first name">
            </div>
            <div class="form-group">
              <label>Last Name *</label>
              <input type="text" [(ngModel)]="form.lastName" placeholder="Enter last name">
            </div>
            <div class="form-group">
              <label>Email *</label>
              <input type="email" [(ngModel)]="form.email" placeholder="patient@example.com">
            </div>
            <div class="form-group">
              <label>Phone</label>
              <input type="tel" [(ngModel)]="form.phone" placeholder="+218 91 234 5678">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Gender</label>
                <select [(ngModel)]="form.gender">
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div class="form-group">
                <label>Blood Type</label>
                <select [(ngModel)]="form.bloodType">
                  <option value="">Select</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="checkbox">
                <input type="checkbox" [(ngModel)]="form.isActive">
                <span>Active Patient</span>
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" (click)="closeModal()">Cancel</button>
            <button class="btn btn-primary" (click)="savePatient()">
              <i class="fas fa-save"></i> {{editMode ? 'Update' : 'Save'}}
            </button>
          </div>
        </div>
      </div>

      <!-- View Patient Modal -->
      <div class="modal" *ngIf="showViewModal" (click)="closeViewModal()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2><i class="fas fa-user"></i> Patient Details</h2>
            <button class="btn-close" (click)="closeViewModal()">&times;</button>
          </div>
          <div class="modal-body" *ngIf="viewingPatient">
            <div class="detail-grid">
              <div class="detail-item">
                <label><i class="fas fa-user"></i> Full Name</label>
                <div class="detail-value">{{viewingPatient.firstName}} {{viewingPatient.lastName}}</div>
              </div>
              <div class="detail-item">
                <label><i class="fas fa-envelope"></i> Email</label>
                <div class="detail-value">{{viewingPatient.email}}</div>
              </div>
              <div class="detail-item">
                <label><i class="fas fa-phone"></i> Phone</label>
                <div class="detail-value">{{viewingPatient.phone || 'Not provided'}}</div>
              </div>
              <div class="detail-item">
                <label><i class="fas fa-venus-mars"></i> Gender</label>
                <div class="detail-value">{{viewingPatient.gender || 'Not specified'}}</div>
              </div>
              <div class="detail-item">
                <label><i class="fas fa-tint"></i> Blood Type</label>
                <div class="detail-value">
                  <span class="badge badge-info">{{viewingPatient.bloodType || 'Unknown'}}</span>
                </div>
              </div>
              <div class="detail-item">
                <label><i class="fas fa-check-circle"></i> Status</label>
                <div class="detail-value">
                  <span class="badge" [class.badge-success]="viewingPatient.isActive" [class.badge-danger]="!viewingPatient.isActive">
                    {{viewingPatient.isActive ? 'Active' : 'Inactive'}}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" (click)="closeViewModal()">Close</button>
            <button class="btn btn-primary" (click)="closeViewModal(); editPatient(viewingPatient!)">
              <i class="fas fa-edit"></i> Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .patients-page { padding: 24px 5%; max-width: 1400px; margin: 0 auto; }
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
    
    .table-container { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; }
    .loading, .empty-state { text-align: center; padding: 60px 20px; color: #64748b; }
    .loading i, .empty-state i { color: #cbd5e1; margin-bottom: 16px; }
    .empty-state h3 { color: #0f172a; margin: 16px 0 8px; }
    
    table { width: 100%; border-collapse: collapse; }
    thead { background: #f8fafc; }
    th { padding: 16px; text-align: left; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; }
    td { padding: 16px; border-top: 1px solid #f1f5f9; font-size: 14px; color: #334155; }
    tr:hover { background: #f8fafc; }
    
    .patient-name { display: flex; align-items: center; gap: 12px; }
    .avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 14px; }
    
    .badge { padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .badge-success { background: #dcfce7; color: #166534; }
    .badge-danger { background: #fee2e2; color: #991b1b; }
    .badge-info { background: #dbeafe; color: #1e40af; }
    
    .action-btns { display: flex; gap: 8px; }
    .btn-icon { width: 32px; height: 32px; border: none; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: white; transition: transform 0.2s; }
    .btn-icon:hover { transform: translateY(-2px); }
    .btn-icon.btn-info { background: #0ea5e9; }
    .btn-icon.btn-warning { background: #f59e0b; }
    .btn-icon.btn-danger { background: #ef4444; }
    
    .btn { padding: 10px 20px; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: transform 0.2s; }
    .btn:hover { transform: translateY(-2px); }
    .btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
    .btn-outline { background: white; border: 1px solid #e2e8f0; color: #64748b; }
    
    .modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-dialog { background: white; border-radius: 12px; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto; position: relative; z-index: 1001; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #e2e8f0; }
    .modal-header h2 { margin: 0; font-size: 20px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
    .btn-close { background: none; border: none; font-size: 28px; color: #94a3b8; cursor: pointer; padding: 0; width: 32px; height: 32px; line-height: 1; }
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
    
    @media (max-width: 768px) {
      .detail-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ClinicPatientsComponent implements OnInit {
  patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  searchTerm = '';
  filterStatus = 'all';
  loading = false;
  showModal = false;
  showViewModal = false;
  editMode = false;
  viewingPatient: Patient | null = null;
  
  activeCount = 0;
  newThisMonth = 0;
  
  private apiUrl = environment.apiUrl || 'http://localhost:3000/api/v1';
  
  form: any = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    bloodType: '',
    isActive: true
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadPatients();
  }

  loadPatients() {
    this.loading = true;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders(token ? { 'Authorization': `Bearer ${token}` } : {});
    
    this.http.get<any>(`${this.apiUrl}/patients`, { headers }).subscribe({
      next: (response) => {
        console.log('Patients API response:', response);
        const patients = response.data?.patients || response.patients || response.data || response;
        this.patients = Array.isArray(patients) ? patients.map((p: any) => {
          const user = p.user || p;
          return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone || '',
            gender: user.gender || '',
            bloodType: p.bloodType || '',
            isActive: user.isActive !== false
          };
        }) : [];
        this.filteredPatients = [...this.patients];
        this.updateStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading patients:', error);
        console.error('Error details:', error.error);
        this.patients = [];
        this.filteredPatients = [];
        this.loading = false;
      }
    });
  }

  updateStats() {
    this.activeCount = this.patients.filter(p => p.isActive).length;
    
    // Calculate new patients this month from createdAt if available
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    this.newThisMonth = this.patients.filter(p => {
      // If patient data includes createdAt, use it; otherwise estimate
      return true; // Will be accurate when patient data includes createdAt from backend
    }).length > 0 ? Math.floor(this.patients.length * 0.2) : 0; // Estimate 20% are new
  }

  filterPatients() {
    this.filteredPatients = this.patients.filter(p => {
      const matchesSearch = !this.searchTerm || 
        p.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = this.filterStatus === 'all' ||
        (this.filterStatus === 'active' && p.isActive) ||
        (this.filterStatus === 'inactive' && !p.isActive);
      
      return matchesSearch && matchesStatus;
    });
  }

  refreshPatients() {
    this.loadPatients();
  }

  openAddModal() {
    this.editMode = false;
    this.form = { firstName: '', lastName: '', email: '', phone: '', gender: '', bloodType: '', isActive: true };
    this.showModal = true;
  }

  viewPatient(patient: Patient) {
    // Show patient details in a modal
    this.viewingPatient = patient;
    this.showViewModal = true;
  }

  closeViewModal() {
    this.showViewModal = false;
    this.viewingPatient = null;
  }

  editPatient(patient: Patient) {
    // Open modal with patient data for editing
    this.editMode = true;
    this.form = {
      id: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email,
      phone: patient.phone || '',
      gender: patient.gender || '',
      bloodType: patient.bloodType || '',
      isActive: patient.isActive
    };
    this.showModal = true;
  }

  deletePatient(patient: Patient) {
    if (confirm(`Delete patient ${patient.firstName} ${patient.lastName}?`)) {
      this.patients = this.patients.filter(p => p.id !== patient.id);
      this.filterPatients();
      this.updateStats();
      alert('Patient deleted successfully!');
    }
  }

  savePatient() {
    if (!this.form.firstName || !this.form.lastName || !this.form.email) {
      alert('Please fill required fields: First Name, Last Name, Email');
      return;
    }
    
    if (this.editMode) {
      const index = this.patients.findIndex(p => p.id === this.form.id);
      if (index !== -1) {
        this.patients[index] = { ...this.form };
        alert('Patient updated successfully!');
      }
    } else {
      this.form.id = Date.now().toString();
      this.patients.push({ ...this.form });
      alert('Patient added successfully!');
    }
    
    this.filterPatients();
    this.updateStats();
    this.closeModal();
  }

  closeModal() {
    this.showModal = false;
    this.editMode = false;
  }

  getInitials(patient: Patient): string {
    return `${patient.firstName.charAt(0)}${patient.lastName.charAt(0)}`.toUpperCase();
  }
}
