import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
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
  specialties: string[] = ['Cardiologist', 'Dermatologist', 'Neurology', 'Pediatrics', 'Oncology'];
  languages: string[] = ['Arabic', 'English', 'French'];
  sortOptions: SortOption[] = [
    { value: 'experience', label: 'Most Experienced' },
    { value: 'rating', label: 'Highest Rated' },
  ];

  bookingForm: FormGroup;
  bookingComplete = false;
  bookingDetails: Partial<BookingDetails> = {};

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private router: Router,
    private doctorService: DoctorService,
    private authService: AuthService
  ) {
    this.bookingForm = this.fb.group({
      date: ['', Validators.required],
      time: ['', Validators.required],
      reason: ['', Validators.required],
      consultationType: [ConsultationType.VIDEO, Validators.required]
    });
  }

  ngOnInit(): void {
    console.log('BookConsultationComponent: ngOnInit called');
    this.loadDoctors();
  }

  private loadDoctors(): void {
    console.log('BookConsultationComponent: Calling doctorService.getDoctors()');
    this.doctorService.getDoctors().subscribe({
      next: (doctors) => {
        console.log('BookConsultationComponent: Doctors received from service:', doctors);
        this.doctors = doctors as DoctorUser[];
        console.log('BookConsultationComponent: this.doctors after assignment:', this.doctors);
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
    this.selectedDoctor = doctor;
    this.bookingComplete = false;
    this.bookingDetails = {
      doctorName: this.getDoctorFullName(doctor)
    };
    this.bookingForm.reset({ consultationType: ConsultationType.VIDEO });
    this.modalService.open(content, { size: 'lg', centered: true });
  }

  submitBooking(): void {
    if (this.bookingForm.invalid) {
      return;
    }
    console.log('Booking submitted:', { ...this.bookingDetails, ...this.bookingForm.value });
    this.bookingComplete = true;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.bookingDetails.documents = Array.from(input.files);
    }
  }

  handleNotificationChange(event: Event, type: 'email' | 'sms') {
    const input = event.target as HTMLInputElement;
    if (!this.bookingDetails.notifications) {
      this.bookingDetails.notifications = { email: false, sms: false };
    }
    this.bookingDetails.notifications[type] = input.checked;
  }

  resetFilters(): void {
    this.filters = { specialty: '', language: '', gender: '', sortBy: 'experience' };
    this.applyFilters();
  }

  onCloseModal(modal: any) {
      modal.dismiss();
  }
}