// Define a proper type for a doctor user with their profile
import { Component, OnInit, AfterViewInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NgbModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { PaymentInterfaceComponent } from './payment-interface/payment-interface.component';
import { SPECIALTIES } from '../../../shared/specialties';

// Models
import { User } from '../../../models/user.model';
import { DoctorProfile } from '../../../models/doctor.model';
import { Appointment } from '../../../models/appointment.model';

// Services
import { AppointmentService } from '../../../services/appointment.service';
import { AuthService } from '../../../services/auth.service';
import { DoctorService } from '../../../services/doctor.service';
import { AdminService } from '../../../services/admin.service';
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
    RouterModule,
    PaymentInterfaceComponent
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
  specialties: string[] = SPECIALTIES;
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
  bookingStep = 1; // 1: details, 2: payment, 3: confirmation
  isProcessing = false;

  // Payment related
  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  cardElement: StripeCardElement | null = null;
  clientSecret: string = '';
  createdAppointmentId: string = '';
  paymentId: string = '';
  useMockPayment: boolean = false;

  // Role flags
  isDoctorUser = false;

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private router: Router,
    private doctorService: DoctorService,
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private paymentService: PaymentService,
    private adminService: AdminService
  ) {
    this.bookingForm = this.fb.group({
      date: ['', Validators.required],
      time: ['', Validators.required],
      reason: ['', Validators.required],
      consultationType: [ConsultationType.VIDEO, Validators.required]
    });
  }

  async goToPaymentStep() {
    if (this.bookingForm.invalid || !this.selectedDoctor || this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      // Step 1: Create appointment
      const appointment = await this.createAppointment();
      this.createdAppointmentId = appointment.id;

      // Step 2: Initialize Stripe payment
      const paymentData = await this.initializePayment();
      
      // Store booking details for payment interface
      this.bookingDetails = {
        doctorName: this.getDoctorFullName(this.selectedDoctor),
        date: this.bookingForm.value.date,
        time: this.bookingForm.value.time,
        consultationType: this.bookingForm.value.consultationType
      };
      
      // Move to payment step
      this.bookingStep = 2;
      this.bookingComplete = false;

      // Setup Stripe elements if not using mock payment
      if (!this.useMockPayment) {
        // Wait for DOM to update
        setTimeout(() => {
          this.setupStripeElements();
        }, 100);
      }

    } catch (error: any) {
      console.error('Error creating appointment:', error);
      alert(error.message || 'Failed to create appointment. Please try again.');
    } finally {
      this.isProcessing = false;
    }
  }

  private async createAppointment(): Promise<any> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'patient') {
      throw new Error('You must be logged in as a patient to book a consultation.');
    }

    if (!this.selectedDoctor) {
      throw new Error('No doctor selected');
    }

    const dateStr: string = this.bookingForm.value.date;
    const timeStr: string = this.bookingForm.value.time;
    const start = this.combineLocalDateTime(dateStr, timeStr);
    const end = new Date(start.getTime() + 30 * 60 * 1000);

    const appointmentData = {
      patientId: currentUser.id,
      doctorId: this.selectedDoctor.id,
      appointmentDate: start.toISOString(),
      endTime: end.toISOString(),
      reason: this.bookingForm.value.reason,
      consultationType: this.bookingForm.value.consultationType,
    };

    return await this.appointmentService.bookAppointment(appointmentData).toPromise();
  }

  private async initializePayment(): Promise<any> {
    try {
      // Get Stripe publishable key
      const config = await this.paymentService.getConfig().toPromise();
      
      // Check if using mock payment
      this.useMockPayment = (config as any).useMock || false;
      
      if (this.useMockPayment) {
        console.log('Mock payment mode enabled');
        // Still create payment intent for tracking
        const amount = this.getConsultationFee();
        const paymentIntent = await this.paymentService.createPaymentIntent(
          this.createdAppointmentId,
          amount
        ).toPromise();
        
        this.clientSecret = paymentIntent!.clientSecret;
        this.paymentId = paymentIntent!.paymentId;
        
        return { useMock: true, paymentIntent };
      }
      
      // Initialize Stripe for real payments
      this.stripe = await loadStripe(config!.publishableKey);

      if (!this.stripe) {
        throw new Error('Failed to load Stripe');
      }

      // Create payment intent
      const amount = this.getConsultationFee();
      const paymentIntent = await this.paymentService.createPaymentIntent(
        this.createdAppointmentId,
        amount
      ).toPromise();

      this.clientSecret = paymentIntent!.clientSecret;
      this.paymentId = paymentIntent!.paymentId;
      
      return { useMock: false, paymentIntent };

    } catch (error: any) {
      console.error('Error initializing payment:', error);
      throw new Error('Failed to initialize payment. Please try again.');
    }
  }

  private setupStripeElements() {
    if (!this.stripe) return;

    // Create Elements instance
    this.elements = this.stripe.elements();

    // Create Card Element
    this.cardElement = this.elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#32325d',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          '::placeholder': {
            color: '#aab7c4',
          },
        },
        invalid: {
          color: '#fa755a',
        },
      },
    });

    // Mount Card Element
    const cardElement = document.getElementById('card-element');
    if (cardElement && this.cardElement) {
      this.cardElement.mount('#card-element');

      // Handle real-time validation errors
      this.cardElement.on('change', (event: any) => {
        const displayError = document.getElementById('card-errors');
        if (displayError) {
          displayError.textContent = event.error ? event.error.message : '';
        }
      });
    }
  }

  async onPaymentComplete(result: { success: boolean; error?: string }) {
    if (result.success) {
      // Confirm payment on backend
      try {
        const paymentIntentId = this.clientSecret.split('_secret_')[0];
        await this.paymentService.confirmPayment(paymentIntentId).toPromise();
        
        // Move to confirmation step
        this.bookingComplete = true;
        this.bookingStep = 3;
      } catch (error: any) {
        console.error('Error confirming payment:', error);
        alert('Payment was successful but confirmation failed. Please contact support.');
      }
    } else {
      alert(result.error || 'Payment failed. Please try again.');
    }
  }

  async handlePayment(): Promise<void> {
    if (this.isProcessing) return;

    this.isProcessing = true;

    try {
      if (this.useMockPayment) {
        await this.handleMockPayment();
      } else {
        await this.handleStripePayment();
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      alert(error.message || 'Payment failed. Please try again.');
    } finally {
      this.isProcessing = false;
    }
  }

  async handleMockPayment() {
    try {
      console.log('Processing mock payment...');
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get the mock payment intent ID from clientSecret
      const paymentIntentId = this.clientSecret.split('_secret_')[0];
      
      // Confirm mock payment on backend
      await this.paymentService.confirmPayment(paymentIntentId).toPromise();
      
      // Success!
      this.bookingComplete = true;
      this.bookingStep = 3;
      
      console.log('Mock payment completed successfully');
    } catch (error: any) {
      console.error('Mock payment error:', error);
      throw new Error('Mock payment failed. Please try again.');
    }
  }

  async handleStripePayment(): Promise<void> {
    if (!this.stripe || !this.cardElement) {
      throw new Error('Stripe is not initialized');
    }

    try {
      // Confirm payment with Stripe
      const { error, paymentIntent } = await this.stripe.confirmCardPayment(
        this.clientSecret,
        {
          payment_method: {
            card: this.cardElement,
          },
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirm payment on backend
        await this.paymentService.confirmPayment(paymentIntent.id).toPromise();
        
        // Success!
        this.bookingComplete = true;
        this.bookingStep = 3;
      } else {
        throw new Error('Payment not completed');
      }
    } catch (error: any) {
      console.error('Stripe payment error:', error);
      throw error;
    }
  }

  goBackToDetails() {
    this.bookingStep = 1;
  }

  getConsultationFee(): number {
    if (this.selectedDoctor && this.selectedDoctor.doctorProfile && this.selectedDoctor.doctorProfile.consultationFee) {
      return this.selectedDoctor.doctorProfile.consultationFee;
    }
    return 50;
  }

  getMinDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  formatAmount(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }

  ngOnInit(): void {
    console.log('BookConsultationComponent: ngOnInit called');
    try {
      const user = this.authService.getCurrentUser() as any;
      this.isDoctorUser = !!user && (user.role === 'doctor' || user.role === 'DOCTOR');
    } catch { this.isDoctorUser = false; }
    this.loadDoctors();
    // Load allowed specialties from backend, fallback to local list
    try {
      this.adminService.getSpecialties().subscribe({
        next: (list: any) => {
          const payload = Array.isArray(list) ? list : list?.data;
          if (Array.isArray(payload) && payload.length) this.specialties = payload;
        },
        error: (err: any) => console.warn('Could not load specialties from admin service, using local list', err)
      });
    } catch (e: any) { console.warn('Error fetching specialties', e); }
  }

  // Reload doctors when the window gains focus (so newly-created doctors appear)
  @HostListener('window:focus')
  onWindowFocus(): void {
    console.log('Window focused - reloading doctors');
    this.loadDoctors();
  }

  public loadDoctors(): void {
    console.log('BookConsultationComponent: Calling doctorService.getDoctors()');
    this.doctorService.getDoctors().subscribe({
      next: (doctors) => {
        console.log('BookConsultationComponent: Doctors received from service:', doctors);
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
        tempDoctors = tempDoctors.filter(d => {
            const doctorGender = d.gender?.toUpperCase();
            const filterGender = this.filters.gender.toUpperCase();
            const match = doctorGender === filterGender;
            console.log(`Doctor ${d.firstName} ${d.lastName}: gender=${d.gender}, filter=${this.filters.gender}, match=${match}`);
            return match;
        });
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
      if (this.filters.sortBy === 'rating') {
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
    this.bookingStep = 1;
    this.isProcessing = false;
    this.bookingDetails = {
      doctorName: this.getDoctorFullName(doctor)
    };
    this.bookingForm.reset({ consultationType: ConsultationType.VIDEO });
    this.modalService.open(content, { size: 'lg', centered: true, backdrop: 'static' });
  }

  resetFilters(): void {
    this.filters = { specialty: '', language: '', gender: '', sortBy: 'experience' };
    this.searchTerm = '';
    this.applyFilters();
  }

  onCloseModal(modal: any): void {
    if (this.bookingStep === 2 && !this.bookingComplete) {
      if (!confirm('Payment is in progress. Are you sure you want to cancel?')) {
        return;
      }
    }
    modal.dismiss('Cross click');
    this.bookingStep = 1;
    this.bookingComplete = false;
    this.isProcessing = false;
  }

  closeModalAndRedirect(modal: any): void {
    modal.dismiss();
    this.router.navigate(['/patient/appointments']);
  }

  private combineLocalDateTime(dateStr: string, timeStr: string): Date {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const [hours, minutes] = timeStr.split(':').map(Number);
      return new Date(year, month - 1, day, hours, minutes);
    } catch (error) {
      console.error('Error combining date and time:', error);
      return new Date();
    }
  }
}
