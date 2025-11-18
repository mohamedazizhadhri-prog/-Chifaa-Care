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
  templateUrl: './admin-doctors.component.html',
  styleUrls: ['./admin-doctors.component.css']
})
export class AdminDoctorsComponent implements OnInit {
  doctors: Doctor[] = [];
  specialties: string[] = [];
  loading = false;
  saving = false;
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
  selectedSpecialty = '';
  customSpecialty = '';
  showCustomSpecialty = false;
  
  formErrors: any = {};
  errorMessage = '';
  successMessage = '';

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadDoctors();
    this.loadSpecialties();
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
      password: '',
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

  loadSpecialties() {
    this.adminService.getSpecialties().subscribe({
      next: (specialties) => {
        this.specialties = specialties;
      },
      error: (error) => {
        console.error('Error loading specialties:', error);
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

  onSpecialtyChange() {
    if (this.selectedSpecialty === '__new__') {
      this.showCustomSpecialty = true;
      this.customSpecialty = '';
      this.selectedDoctor.specialty = '';
    } else {
      this.showCustomSpecialty = false;
      this.selectedDoctor.specialty = this.selectedSpecialty;
      this.customSpecialty = '';
    }
    // Clear specialty error when user makes a selection
    if (this.formErrors.specialty) {
      delete this.formErrors.specialty;
    }
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
    this.selectedSpecialty = '';
    this.customSpecialty = '';
    this.showCustomSpecialty = false;
    this.formErrors = {};
    this.errorMessage = '';
    this.successMessage = '';
    this.showModal = true;
  }

  viewDoctor(doctor: Doctor) {
    this.modalMode = 'view';
    this.selectedDoctor = { ...doctor };
    this.errorMessage = '';
    this.successMessage = '';
    this.showModal = true;
  }

  editDoctor(doctor: Doctor) {
    this.modalMode = 'edit';
    this.selectedDoctor = { ...doctor };
    
    // Set the specialty selection
    if (doctor.specialty && this.specialties.includes(doctor.specialty)) {
      this.selectedSpecialty = doctor.specialty;
      this.showCustomSpecialty = false;
    } else if (doctor.specialty) {
      this.selectedSpecialty = '__new__';
      this.customSpecialty = doctor.specialty;
      this.showCustomSpecialty = true;
    } else {
      this.selectedSpecialty = '';
      this.showCustomSpecialty = false;
    }
    
    this.formErrors = {};
    this.errorMessage = '';
    this.successMessage = '';
    this.showModal = true;
  }

  toggleDoctorStatus(doctor: Doctor) {
    const action = doctor.isActive ? 'deactivate' : 'activate';
    if (confirm(`Are you sure you want to ${action} Dr. ${doctor.firstName} ${doctor.lastName}?`)) {
      this.adminService.updateUser(doctor.id, { isActive: !doctor.isActive }).subscribe({
        next: () => {
          this.loadDoctors();
        },
        error: (error) => {
          console.error('Error updating doctor status:', error);
          alert('Failed to update doctor status. Please try again.');
        }
      });
    }
  }

  deleteDoctor(doctor: Doctor) {
    if (confirm(`⚠️ Are you sure you want to delete Dr. ${doctor.firstName} ${doctor.lastName}?\n\nThis action cannot be undone and will fail if the doctor has any appointments.`)) {
      this.adminService.deleteDoctor(doctor.id).subscribe({
        next: () => {
          this.loadDoctors();
          alert(`Dr. ${doctor.firstName} ${doctor.lastName} has been deleted successfully!`);
        },
        error: (error) => {
          console.error('Error deleting doctor:', error);
          alert(error.error?.message || 'Failed to delete doctor. The doctor may have existing appointments.');
        }
      });
    }
  }

  validateForm(): boolean {
    this.formErrors = {};
    let isValid = true;

    // First Name validation
    if (!this.selectedDoctor.firstName || !this.selectedDoctor.firstName.trim()) {
      this.formErrors.firstName = 'First name is required';
      isValid = false;
    }

    // Last Name validation
    if (!this.selectedDoctor.lastName || !this.selectedDoctor.lastName.trim()) {
      this.formErrors.lastName = 'Last name is required';
      isValid = false;
    }

    // Email validation
    if (!this.selectedDoctor.email || !this.selectedDoctor.email.trim()) {
      this.formErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.selectedDoctor.email)) {
      this.formErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Specialty validation
    const specialty = this.showCustomSpecialty ? this.customSpecialty : this.selectedDoctor.specialty;
    if (!specialty || !specialty.trim()) {
      this.formErrors.specialty = 'Specialty is required';
      isValid = false;
    }

    // Password validation (only for add mode)
    if (this.modalMode === 'add') {
      if (this.selectedDoctor.password && this.selectedDoctor.password.length < 8) {
        this.formErrors.password = 'Password must be at least 8 characters';
        isValid = false;
      }
    }

    return isValid;
  }

  saveDoctor() {
    // Clear previous messages
    this.errorMessage = '';
    this.successMessage = '';

    // Validate form
    if (!this.validateForm()) {
      this.errorMessage = 'Please fix the errors above before submitting.';
      return;
    }

    // Set the final specialty value
    if (this.showCustomSpecialty && this.customSpecialty) {
      this.selectedDoctor.specialty = this.customSpecialty.trim();
    }

    this.saving = true;

    if (this.modalMode === 'add') {
      // Create new doctor
      const doctorData = {
        email: this.selectedDoctor.email.trim(),
        firstName: this.selectedDoctor.firstName.trim(),
        lastName: this.selectedDoctor.lastName.trim(),
        phone: this.selectedDoctor.phone?.trim() || undefined,
        specialty: this.selectedDoctor.specialty,
        licenseNumber: this.selectedDoctor.licenseNumber?.trim() || undefined,
        password: this.selectedDoctor.password?.trim() || undefined
      };

      this.adminService.createDoctor(doctorData).subscribe({
        next: (response) => {
          this.successMessage = `Dr. ${doctorData.firstName} ${doctorData.lastName} has been created successfully!`;
          this.saving = false;
          
          // Refresh specialties list if a new one was added
          if (this.showCustomSpecialty && !this.specialties.includes(this.selectedDoctor.specialty)) {
            this.loadSpecialties();
          }
          
          // Close modal and reload doctors after a short delay
          setTimeout(() => {
            this.closeModal();
            this.loadDoctors();
          }, 1500);
        },
        error: (error) => {
          console.error('Error creating doctor:', error);
          this.errorMessage = error.error?.message || 'Failed to create doctor. Please try again.';
          this.saving = false;
        }
      });
    } else {
      // Update existing doctor
      const updateData: any = {
        firstName: this.selectedDoctor.firstName.trim(),
        lastName: this.selectedDoctor.lastName.trim(),
        phone: this.selectedDoctor.phone?.trim() || undefined,
        specialty: this.selectedDoctor.specialty,
        licenseNumber: this.selectedDoctor.licenseNumber?.trim() || undefined,
        isActive: this.selectedDoctor.isActive
      };

      this.adminService.updateUser(this.selectedDoctor.id, updateData).subscribe({
        next: (response) => {
          this.successMessage = `Dr. ${updateData.firstName} ${updateData.lastName} has been updated successfully!`;
          this.saving = false;
          
          // Refresh specialties list if a new one was added
          if (this.showCustomSpecialty && !this.specialties.includes(this.selectedDoctor.specialty)) {
            this.loadSpecialties();
          }
          
          // Close modal and reload doctors after a short delay
          setTimeout(() => {
            this.closeModal();
            this.loadDoctors();
          }, 1500);
        },
        error: (error) => {
          console.error('Error updating doctor:', error);
          this.errorMessage = error.error?.message || 'Failed to update doctor. Please try again.';
          this.saving = false;
        }
      });
    }
  }

  closeModal() {
    this.showModal = false;
    this.selectedDoctor = this.getEmptyDoctor();
    this.selectedSpecialty = '';
    this.customSpecialty = '';
    this.showCustomSpecialty = false;
    this.formErrors = {};
    this.errorMessage = '';
    this.successMessage = '';
  }
}
