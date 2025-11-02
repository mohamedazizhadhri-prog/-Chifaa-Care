import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Clinic, ClinicStatus } from '../admin.models';
import { AdminService } from '../../../services/admin.service';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-admin-clinics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputTextareaModule,
    DropdownModule,
    ConfirmDialogModule,
    ToastModule,
    ProgressSpinnerModule
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <div class="page p-4">
      <div class="flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Clinics Management</h2>
          <p class="text-muted">Manage healthcare clinics and their onboarding status</p>
        </div>
        <button pButton 
                icon="pi pi-plus" 
                label="Add Clinic" 
                (click)="openNew()"
                class="p-button-success">
        </button>
      </div>

      <!-- Search and Filter Bar -->
      <div class="card mb-3 p-3">
        <div class="grid">
          <div class="col-12 md:col-6">
            <span class="p-input-icon-left w-full">
              <i class="pi pi-search"></i>
              <input pInputText 
                     type="text" 
                     [(ngModel)]="searchTerm"
                     (input)="onSearch()"
                     placeholder="Search by name, email, or city..." 
                     class="w-full" />
            </span>
          </div>
          <div class="col-12 md:col-3">
            <p-dropdown [options]="statusFilterOptions" 
                       [(ngModel)]="selectedStatus" 
                       (onChange)="onFilterChange()"
                       placeholder="Filter by Status"
                       [showClear]="true"
                       class="w-full">
            </p-dropdown>
          </div>
          <div class="col-12 md:col-3">
            <button pButton 
                    label="Refresh" 
                    icon="pi pi-refresh" 
                    (click)="loadClinics()"
                    class="w-full">
            </button>
          </div>
        </div>
      </div>

      <p-toast></p-toast>
      <p-confirmDialog></p-confirmDialog>

      <p-table [value]="filteredClinics" 
               [paginator]="true" 
               [rows]="10"
               [rowsPerPageOptions]="[5,10,25,50]"
               [loading]="loading"
               [globalFilterFields]="['name', 'email', 'city', 'status']"
               styleClass="p-datatable-gridlines">
        
        <ng-template pTemplate="header">
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Location</th>
            <th>Status</th>
            <th>Onboarding</th>
            <th>Actions</th>
          </tr>
        </ng-template>
        
        <ng-template pTemplate="body" let-clinic>
          <tr>
            <td>{{ clinic.name }}</td>
            <td>{{ clinic.email }}</td>
            <td>{{ clinic.phone }}</td>
            <td>{{ clinic.city }}, {{ clinic.country }}</td>
            <td>
              <span [ngClass]="{
                'p-tag': true,
                'p-tag-warning': clinic.status === 'PENDING',
                'p-tag-success': clinic.status === 'ACTIVE',
                'p-tag-danger': clinic.status === 'SUSPENDED' || clinic.status === 'REJECTED',
                'p-tag-secondary': clinic.status === 'INACTIVE'
              }">
                {{ clinic.status }}
              </span>
            </td>
            <td>{{ clinic.onboardingStep }}</td>
            <td>
              <button pButton 
                      icon="pi pi-pencil" 
                      class="p-button-rounded p-button-text p-button-sm mr-2"
                      (click)="editClinic(clinic)">
              </button>
              <button pButton 
                      icon="pi pi-trash" 
                      class="p-button-rounded p-button-text p-button-danger p-button-sm"
                      (click)="confirmDelete(clinic)">
              </button>
            </td>
          </tr>
        </ng-template>
        
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="7" class="text-center py-5">
              <i class="pi pi-inbox" style="font-size: 3rem; color: #dee2e6;"></i>
              <p class="mt-3 mb-0" style="color: #6c757d;">
                {{ searchTerm || selectedStatus ? 'No clinics match your filters' : 'No clinics found. Click "Add Clinic" to create one.' }}
              </p>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <!-- Clinic Dialog -->
    <p-dialog header="{{ clinic.id ? 'Edit' : 'New' }} Clinic" 
              [(visible)]="clinicDialog" 
              [style]="{ width: '50vw' }"
              [modal]="true"
              [draggable]="false"
              [resizable]="false">
      
      <form (ngSubmit)="saveClinic()" #clinicForm="ngForm" class="p-fluid">
        <div class="grid">
          <div class="col-12 md:col-6">
            <div class="field">
              <label for="name">Clinic Name</label>
              <input id="name" name="name" pInputText [(ngModel)]="clinic.name" required>
            </div>
            
            <div class="field">
              <label for="email">Email</label>
              <input id="email" name="email" pInputText [(ngModel)]="clinic.email" required type="email">
            </div>
            
            <div class="field">
              <label for="phone">Phone</label>
              <input id="phone" name="phone" pInputText [(ngModel)]="clinic.phone" required>
            </div>
            
            <div class="field">
              <label for="status">Status</label>
              <p-dropdown [options]="statusOptions" 
                         [(ngModel)]="clinic.status" 
                         name="status"
                         [showClear]="false"
                         placeholder="Select Status">
              </p-dropdown>
            </div>
          </div>
          
          <div class="col-12 md:col-6">
            <div class="field">
              <label for="address">Address</label>
              <textarea id="address" name="address" pInputTextarea [(ngModel)]="clinic.address" required></textarea>
            </div>
            
            <div class="grid">
              <div class="col-6">
                <div class="field">
                  <label for="city">City</label>
                  <input id="city" name="city" pInputText [(ngModel)]="clinic.city" required>
                </div>
              </div>
              <div class="col-6">
                <div class="field">
                  <label for="country">Country</label>
                  <input id="country" name="country" pInputText [(ngModel)]="clinic.country" required>
                </div>
              </div>
            </div>
            
            <div class="field">
              <label for="postalCode">Postal Code</label>
              <input id="postalCode" name="postalCode" pInputText [(ngModel)]="clinic.postalCode" required>
            </div>
            
            <div class="field">
              <label for="onboardingStep">Onboarding Step</label>
              <p-dropdown [options]="onboardingSteps" 
                         [(ngModel)]="clinic.onboardingStep" 
                         name="onboardingStep"
                         [showClear]="false"
                         placeholder="Select Onboarding Step">
              </p-dropdown>
            </div>
          </div>
        </div>
        
        <div class="flex justify-content-end gap-2 mt-4">
          <button pButton 
                  type="button" 
                  label="Cancel" 
                  icon="pi pi-times" 
                  class="p-button-text"
                  (click)="clinicDialog = false">
          </button>
          <button pButton 
                  type="submit" 
                  label="Save" 
                  icon="pi pi-check" 
                  class="p-button-success"
                  [disabled]="!clinicForm.form.valid">
          </button>
        </div>
      </form>
    </p-dialog>
  `,
  styles: [`
    .p-datatable .p-datatable-thead > tr > th {
      background: #f8f9fa;
    }
    
    .p-dialog .p-dialog-header {
      background: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
    }
    
    .field {
      margin-bottom: 1.5rem;
    }
    
    .field label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
  `]
})
export class AdminClinicsComponent implements OnInit {
  clinics: Clinic[] = [];
  filteredClinics: Clinic[] = [];
  clinic: Clinic = this.createEmptyClinic();
  clinicDialog: boolean = false;
  loading: boolean = true;
  searchTerm: string = '';
  selectedStatus: string | null = null;
  
  statusOptions = [
    { label: 'Pending', value: 'PENDING' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Suspended', value: 'SUSPENDED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Inactive', value: 'INACTIVE' }
  ];

  statusFilterOptions = [
    { label: 'All Statuses', value: null },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Suspended', value: 'SUSPENDED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Inactive', value: 'INACTIVE' }
  ];
  
  onboardingSteps = [
    { label: 'Registration', value: 'REGISTRATION' },
    { label: 'Document Upload', value: 'DOCUMENT_UPLOAD' },
    { label: 'Payment', value: 'PAYMENT' },
    { label: 'EHR Integration', value: 'EHR_INTEGRATION' },
    { label: 'Completed', value: 'COMPLETED' }
  ];

  constructor(
    private adminService: AdminService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadClinics();
  }

  loadClinics(): void {
    this.loading = true;
    this.adminService.getClinics().subscribe({
      next: (data: Clinic[]) => {
        this.clinics = data;
        this.filteredClinics = data;
        this.applyFilters();
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Loaded ${data.length} clinic(s)`,
          life: 2000
        });
      },
      error: (error: any) => {
        console.error('Error loading clinics:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error Loading Clinics',
          detail: error.error?.message || error.message || 'Could not connect to server. Please ensure backend is running on port 3000.',
          life: 5000
        });
        this.loading = false;
        this.clinics = [];
        this.filteredClinics = [];
      }
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.clinics];

    // Apply search filter
    if (this.searchTerm && this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(clinic => 
        clinic.name.toLowerCase().includes(search) ||
        clinic.email.toLowerCase().includes(search) ||
        clinic.city.toLowerCase().includes(search) ||
        (clinic.phone && clinic.phone.toLowerCase().includes(search))
      );
    }

    // Apply status filter
    if (this.selectedStatus) {
      filtered = filtered.filter(clinic => clinic.status === this.selectedStatus);
    }

    this.filteredClinics = filtered;
  }

  openNew() {
    this.clinic = this.createEmptyClinic();
    this.clinicDialog = true;
  }

  editClinic(clinic: Clinic) {
    this.clinic = { ...clinic };
    this.clinicDialog = true;
  }

  saveClinic(): void {
    if (!this.clinic) return;
    
    const operation = this.clinic.id 
      ? this.adminService.updateClinic(this.clinic)
      : this.adminService.createClinic(this.clinic);
    
    operation.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Clinic ${this.clinic.id ? 'updated' : 'created'} successfully`,
          life: 3000
        });
        this.loadClinics();
        this.clinicDialog = false;
      },
      error: (error: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to ${this.clinic.id ? 'update' : 'create'} clinic: ${error.error?.message || error.message || 'Unknown error'}`,
          life: 5000
        });
      }
    });
  }

  confirmDelete(clinic: Clinic) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + clinic.name + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteClinic(clinic.id);
      }
    });
  }

  deleteClinic(id: string): void {
    if (!id) return;
    
    this.adminService.deleteClinic(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Clinic deleted successfully',
          life: 3000
        });
        this.loadClinics();
      },
      error: (error: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to delete clinic: ${error.error?.message || error.message || 'Unknown error'}`,
          life: 5000
        });
      }
    });
  }

  private createEmptyClinic(): Clinic {
    return {
      id: '',
      name: '',
      description: null,
      address: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      phone: '',
      email: '',
      website: null,
      taxId: null,
      status: 'PENDING',
      onboardingStep: 'REGISTRATION',
      ehrSystem: null,
      ehrApiKey: null,
      ehrApiUrl: null,
      ehrConnected: false,
      billingEmail: null,
      billingAddress: null,
      billingCity: null,
      billingCountry: null,
      billingPostalCode: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}
