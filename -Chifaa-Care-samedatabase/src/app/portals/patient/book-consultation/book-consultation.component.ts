// Define a proper type for a doctor user with their profile
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NgbModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

// Models
import { User } from '../../../models/user.model';
import { DoctorProfile } from '../../../models/doctor.model';
import { Appointment } from '../../../models/appointment.model';

// Services
import { AppointmentService } from '../../../services/appointment.service';
import { AuthService } from '../../../services/auth.service';
import { DoctorService } from '../../../services/doctor.service';
import { PaymentService } from '../../../services/payment.service';
import { safeJsonParse } from '../../../utils/type-mappers'; // Import safeJsonParse

// Define a proper type for a doctor user with their profile
export type DoctorUser = User & { doctorProfile: DoctorProfile | null };

export enum ConsultationType {
  VIDEO = 'VIDEO',
  IN_PERSON = 'IN_PERSON',
  PHONE = 'PHONE'
}

interface BookingDetails {
  patientId: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  consultationType: ConsultationType;
  reason: string;
  documents: File[];
  notifications: { email: boolean; sms: boolean; };
}

interface FilterState {
  specialty: string;
  language: string;
  gender: string;
  sortBy: string;
}

interface SortOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-book-consultation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    RouterModule
  ],
  templateUrl: './book-consultation.component.html',
  styleUrls: ['./book-consultation.component.scss']
})
export class BookConsultationComponent implements OnInit {
  public ConsultationType = ConsultationType;

  doctors: DoctorUser[] = [];
  filteredDoctors: DoctorUser[] = [];
  selectedDoctor: DoctorUser | null = null;

  filters: FilterState = { specialty: '', language: '', gender: '', sortBy: 'experience' };
  // Standardized to match backend specialties (e.g., 'Cardiology' not 'Cardiologist')
  specialties: string[] = [
    'Cardiology', 
    'Dermatology', 
    'Neurology', 
    'Pediatrics', 
    'Oncology',
    'Radiology',
    'Endocrinology',
    'Gastroenterology',
    'Pulmonology',
    'General Medicine'
  ];
  languages: string[] = ['Arabic', 'English', 'French'];
  sortOptions: SortOption[] = [
    { value: 'experience', label: 'Most Experienced' },
    { value: 'rating', label: 'Highest Rated' },
  ];

  // Search state
  searchTerm: string = '';

  bookingForm: FormGroup;
  bookingComplete = false;
  bookingDetails: Partial<BookingDetails> = {};
  bookingStep = 1; // 1: details, 2: payment, 3: confirm
  paymentSuccess = false;

  // Role flags
  isDoctorUser = false;

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private router: Router,
    private doctorService: DoctorService,
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private paymentService: PaymentService
  ) {
    this.bookingForm = this.fb.group({
      date: ['', Validators.required],
      time: ['', Validators.required],
      reason: ['', Validators.required],
      consultationType: [ConsultationType.VIDEO, Validators.required]
    });
  }

  goToPaymentStep() {
    if (this.bookingForm.valid) {
      // Skip payment step and go directly to confirmation
      this.bookingStep = 3;
      // Simulate payment success
      this.onPaymentSuccess({ success: true, transactionId: 'tx_' + Math.random().toString(36).substr(2, 9) });
    }
  }

  getConsultationFee(): number {
    // Use a default or get from doctor profile
    if (this.selectedDoctor && this.selectedDoctor.doctorProfile && this.selectedDoctor.doctorProfile.consultationFee) {
      return this.selectedDoctor.doctorProfile.consultationFee;
    }
    return 50; // fallback default
  }

  onPaymentSuccess(event: any) {
    this.paymentSuccess = true;
    this.bookingStep = 3;
  }

  // Removed mock doctors: rely solely on real API data

  ngOnInit(): void {
    console.log('BookConsultationComponent: ngOnInit called');
    // Determine role of current user to guard patient-only actions
    try {
      const user = this.authService.getCurrentUser() as any;
      this.isDoctorUser = !!user && (user.role === 'doctor' || user.role === 'DOCTOR');
    } catch { this.isDoctorUser = false; }
    this.loadDoctors();
  }

  private loadDoctors(): void {
    console.log('BookConsultationComponent: Calling doctorService.getDoctors()');
    this.doctorService.getDoctors().subscribe({
      next: (doctors) => {
        console.log('BookConsultationComponent: Doctors received from service:', doctors);
        // Assign only real doctors from API
        this.doctors = (doctors as DoctorUser[]) || [];
        console.log('BookConsultationComponent: this.doctors (real API only):', this.doctors);
        this.applyFilters();
      },
      error: (err) => console.error('BookConsultationComponent: Error fetching doctors:', err)
    });
  }

  applyFilters(): void {
    console.log('BookConsultationComponent: applyFilters called');
    console.log('BookConsultationComponent: Initial this.doctors:', this.doctors);
    console.log('BookConsultationComponent: Current filters:', this.filters);

    let tempDoctors = [...this.doctors];

    // Free-text search by doctor name or specialization
    const q = (this.searchTerm || '').trim().toLowerCase();
    if (q) {
      tempDoctors = tempDoctors.filter(d => {
        const name = this.getDoctorFullName(d).toLowerCase();
        const spec = (d.doctorProfile?.specialization || '').toLowerCase();
        return name.includes(q) || spec.includes(q);
      });
    }

    if (this.filters.specialty) {
      tempDoctors = tempDoctors.filter(d => d.doctorProfile?.specialization === this.filters.specialty);
      console.log('BookConsultationComponent: After specialty filter:', tempDoctors);
    }

    if (this.filters.language) {
        tempDoctors = tempDoctors.filter(d => {
            const languages = d.doctorProfile?.languages;
            const parsedLanguages = languages ? safeJsonParse(languages, [] as string[]) : [];
            const includesLanguage = parsedLanguages.includes(this.filters.language);
            console.log(`Doctor ${d.firstName} ${d.lastName}: languages=${languages}, parsed=${parsedLanguages}, filter=${this.filters.language}, includes=${includesLanguage}`);
            return includesLanguage;
        });
        console.log('BookConsultationComponent: After language filter:', tempDoctors);
    }

    if (this.filters.gender) {
        tempDoctors = tempDoctors.filter(d => d.gender === this.filters.gender);
        console.log('BookConsultationComponent: After gender filter:', tempDoctors);
    }

    this.filteredDoctors = tempDoctors;
    console.log('BookConsultationComponent: Final filteredDoctors:', this.filteredDoctors);
    this.sortDoctors();
  }

  sortDoctors(): void {
    this.filteredDoctors.sort((a, b) => {
      const profileA = a.doctorProfile;
      const profileB = b.doctorProfile;
      if (!profileA || !profileB) return 0;

      if (this.filters.sortBy === 'experience') {
        return (profileB.experience || 0) - (profileA.experience || 0);
      }
      if (this.filters.sortBy === 'rating') { // Added rating sort
        return (profileB.rating || 0) - (profileA.rating || 0);
      }
      return 0;
    });
    console.log('BookConsultationComponent: After sorting filteredDoctors:', this.filteredDoctors);
  }

  getDoctorFullName(doctor: DoctorUser): string {
    return `${doctor.firstName} ${doctor.lastName}`;
  }

  getStars(rating: number | undefined): number[] {
    const r = rating || 0;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (r >= i) stars.push(1);
      else if (r >= i - 0.5) stars.push(0.5);
      else stars.push(0);
    }
    return stars;
  }

  viewProfile(doctor: DoctorUser, content: any): void {
    this.selectedDoctor = doctor;
    this.modalService.open(content, { size: 'lg', centered: true });
  }

  startBooking(doctor: DoctorUser, content: any): void {
    if (this.isDoctorUser) {
      alert('Booking is only available from a patient account. Please switch to a patient profile to schedule.');
      return;
    }
    this.selectedDoctor = doctor;
    this.bookingComplete = false;
    this.bookingDetails = {
      doctorName: this.getDoctorFullName(doctor)
    };
    this.bookingForm.reset({ consultationType: ConsultationType.VIDEO });
    this.modalService.open(content, { size: 'lg', centered: true });
  }

  // Reset all filters to their default values
  resetFilters(): void {
    this.filters = { specialty: '', language: '', gender: '', sortBy: 'experience' };
    this.searchTerm = '';
    this.applyFilters();
  }

  // Handle modal close
  onCloseModal(modal: any): void {
    modal.dismiss('Cross click');
    this.bookingStep = 1; // Reset to first step
    this.bookingComplete = false;
  }


  private combineLocalDateTime(dateStr: string, timeStr: string): Date {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const [hours, minutes] = timeStr.split(':').map(Number);
      return new Date(year, month - 1, day, hours, minutes);
    } catch (error) {
      console.error('Error combining date and time:', error);
      return new Date(); // Return current date as fallback
    }
  }

  submitBooking(): void {
    if (this.bookingForm.invalid || !this.selectedDoctor || !this.paymentSuccess) {
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'patient') {
      alert('You must be logged in as a patient to book a consultation.');
      return;
    }

    // Combine date and time into ISO strings
    const dateStr: string = this.bookingForm.value.date;
    const timeStr: string = this.bookingForm.value.time; // e.g. "14:30"
    const start = this.combineLocalDateTime(dateStr, timeStr);
    const end = new Date(start.getTime() + 30 * 60 * 1000); // default 30 mins

    const appointmentData: Appointment = {
      id: '',
      patientId: currentUser.id,
      doctorId: this.selectedDoctor.id,
      appointmentDate: start.toISOString(),
      endTime: end.toISOString(),
      status: 'PENDING',
      reason: this.bookingForm.value.reason,
      consultationType: this.bookingForm.value.consultationType,
      isFollowUp: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: undefined,
    } as any;

    this.appointmentService.bookAppointment({
      patientId: appointmentData.patientId,
      doctorId: appointmentData.doctorId,
      appointmentDate: appointmentData.appointmentDate,
      endTime: appointmentData.endTime,
      reason: appointmentData.reason,
      consultationType: appointmentData.consultationType,
    }).subscribe({
      next: (created) => {
        console.log('Appointment created:', created);
        this.bookingComplete = true;
      },
      error: (err) => {
        console.error('Failed to create appointment:', err);
        const msg = (err && err.message) ? err.message : 'Failed to create appointment. Please try again.';
        alert(msg);
      }
    });
  }
}
