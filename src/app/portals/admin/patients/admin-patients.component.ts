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
  templateUrl: './admin-patients.component.html',
  styleUrls: ['./admin-patients.component.css']
})
export class AdminPatientsComponent implements OnInit {
  patients: Patient[] = [];
  loading = false;
  saving = false;
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
  modalMode: 'view' | 'history' | 'create' | 'edit' = 'view';
  selectedPatient: any = {};
  formData: any = {};

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

  openCreateModal() {
    this.modalMode = 'create';
    this.formData = {
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      password: ''
    };
    this.showModal = true;
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

  editPatient(patient: Patient) {
    this.modalMode = 'edit';
    this.selectedPatient = { ...patient };
    this.formData = {
      id: patient.id,
      email: patient.email,
      firstName: patient.firstName,
      lastName: patient.lastName,
      phone: patient.phone || '',
      dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.split('T')[0] : '',
      gender: patient.gender || '',
      address: patient.address || ''
    };
    this.showModal = true;
  }

  savePatient() {
    if (!this.formData.firstName || !this.formData.lastName || !this.formData.email) {
      alert('Please fill in all required fields');
      return;
    }

    this.saving = true;

    if (this.modalMode === 'create') {
      this.adminService.createPatient(this.formData).subscribe({
        next: (response) => {
          this.saving = false;
          this.closeModal();
          this.loadPatients();
          alert('Patient created successfully!');
        },
        error: (error) => {
          console.error('Error creating patient:', error);
          this.saving = false;
          alert(error.error?.message || 'Failed to create patient');
        }
      });
    } else {
      this.adminService.updateUser(this.formData.id, this.formData).subscribe({
        next: () => {
          this.saving = false;
          this.closeModal();
          this.loadPatients();
          alert('Patient updated successfully!');
        },
        error: (error) => {
          console.error('Error updating patient:', error);
          this.saving = false;
          alert('Failed to update patient');
        }
      });
    }
  }

  deletePatient(patient: Patient) {
    if (confirm(`Are you sure you want to delete ${patient.firstName} ${patient.lastName}?\n\nThis action cannot be undone and will fail if the patient has any appointments.`)) {
      this.adminService.deletePatient(patient.id).subscribe({
        next: () => {
          this.loadPatients();
          alert('Patient deleted successfully!');
        },
        error: (error) => {
          console.error('Error deleting patient:', error);
          alert(error.error?.message || 'Failed to delete patient');
        }
      });
    }
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
    this.formData = {};
  }
}
