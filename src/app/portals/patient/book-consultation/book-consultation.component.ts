import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  subspecialty: string;
  experience: number;
  languages: string[];
  rating: number;
  reviews: number;
  nextAvailable: string;
  photo: string;
  bio: string;
  education: string[];
  certifications: string[];
  hospitals: string[];
}

interface FilterOptions {
  specialty: string;
  language: string;
  sortBy: string;
}

@Component({
  selector: 'app-book-consultation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="book-consultation">
      <header class="header">
        <h1>Book Consultation</h1>
        <p>Find the right oncologist for your needs and book your appointment instantly.</p>
      </header>

      <div class="content">
        <!-- Filters -->
        <aside class="filters">
          <h3>Filters</h3>
          
          <div class="form-group">
            <label>Specialty</label>
            <select class="form-control" [(ngModel)]="filters.specialty" (change)="filterDoctors()">
              <option value="">All Specialties</option>
              <option *ngFor="let spec of specialties" [value]="spec">{{spec}}</option>
            </select>
          </div>

          <div class="form-group">
            <label>Language</label>
            <select class="form-control" [(ngModel)]="filters.language" (change)="filterDoctors()">
              <option value="">All Languages</option>
              <option *ngFor="let lang of languages" [value]="lang">{{lang}}</option>
            </select>
          </div>

          <div class="form-group">
            <label>Sort By</label>
            <select class="form-control" [(ngModel)]="filters.sortBy" (change)="sortDoctors()">
              <option *ngFor="let option of sortOptions" [value]="option.value">
                {{option.label}}
              </option>
            </select>
          </div>
        </aside>

        <!-- Doctors List -->
        <main class="doctors-list">
          <div *ngFor="let doctor of filteredDoctors" class="doctor-card">
            <div class="doctor-card__header">
              <img [src]="doctor.photo" [alt]="doctor.name" class="doctor-photo">
              <div class="doctor-info">
                <h3>{{doctor.name}}</h3>
                <p class="specialty">{{doctor.specialty}} - {{doctor.subspecialty}}</p>
                <div class="rating">
                  <span *ngFor="let star of getStars(doctor.rating)" class="star">
                    <i *ngIf="star === 1" class="fas fa-star"></i>
                    <i *ngIf="star === 0.5" class="fas fa-star-half-alt"></i>
                    <i *ngIf="star === 0" class="far fa-star"></i>
                  </span>
                  <span class="reviews">({{doctor.reviews}} reviews)</span>
                </div>
              </div>
            </div>
            
            <div class="doctor-card__details">
              <p><i class="fas fa-briefcase-medical"></i> {{doctor.experience}} years experience</p>
              <p><i class="fas fa-language"></i> {{doctor.languages.join(', ')}}</p>
              <p><i class="fas fa-calendar-check"></i> Next available: {{doctor.nextAvailable}}</p>
            </div>

            <div class="doctor-card__actions">
              <button class="btn btn-outline" (click)="viewProfile(doctor)">View Profile</button>
              <button class="btn btn-primary" (click)="startBooking(doctor)">Book Now</button>
            </div>
          </div>
        </main>
      </div>
    </div>

    <!-- Doctor Profile Modal -->
    <div class="modal" [class.show]="selectedDoctor && showProfileModal">
      <div class="modal-content">
        <span class="close" (click)="closeProfile()">&times;</span>
        
        <div *ngIf="selectedDoctor" class="profile-container">
          <div class="profile-header">
            <img [src]="selectedDoctor.photo" [alt]="selectedDoctor.name" class="profile-photo">
            <div class="profile-info">
              <h2>{{selectedDoctor.name}}</h2>
              <p class="specialty">{{selectedDoctor.specialty}} - {{selectedDoctor.subspecialty}}</p>
              <div class="rating">
                <span *ngFor="let star of getStars(selectedDoctor.rating)" class="star">
                  <i *ngIf="star === 1" class="fas fa-star"></i>
                  <i *ngIf="star === 0.5" class="fas fa-star-half-alt"></i>
                  <i *ngIf="star === 0" class="far fa-star"></i>
                </span>
                <span class="reviews">({{selectedDoctor.reviews}} reviews)</span>
              </div>
            </div>
          </div>

          <div class="profile-sections">
            <div class="profile-section">
              <h3><i class="fas fa-user-md"></i> About</h3>
              <p>{{selectedDoctor.bio}}</p>
            </div>

            <div class="profile-section">
              <h3><i class="fas fa-graduation-cap"></i> Education</h3>
              <ul>
                <li *ngFor="let edu of selectedDoctor.education">{{edu}}</li>
              </ul>
            </div>

            <div class="profile-section">
              <h3><i class="fas fa-certificate"></i> Certifications</h3>
              <ul>
                <li *ngFor="let cert of selectedDoctor.certifications">{{cert}}</li>
              </ul>
            </div>

            <div class="profile-section">
              <h3><i class="fas fa-hospital"></i> Hospitals</h3>
              <ul>
                <li *ngFor="let hospital of selectedDoctor.hospitals">{{hospital}}</li>
              </ul>
            </div>
          </div>

          <div class="profile-actions">
            <button class="btn btn-outline" (click)="closeProfile()">Close</button>
            <button class="btn btn-primary" (click)="startBooking(selectedDoctor)">Book Appointment</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Booking Form Modal -->
    <div class="modal" [class.show]="showBookingForm">
      <div class="modal-content booking-form">
        <span class="close" (click)="resetForm()">&times;</span>
        
        <h2>Book Appointment</h2>
        <p *ngIf="selectedDoctor">With {{selectedDoctor.name}} - {{selectedDoctor.specialty}}</p>
        
        <form (ngSubmit)="submitBooking()" *ngIf="selectedDoctor">
          <div class="form-group">
            <label>Date</label>
            <input type="date" class="form-control" [(ngModel)]="bookingDetails.date" name="date" required>
          </div>
          
          <div class="form-group">
            <label>Time Slot</label>
            <select class="form-control" [(ngModel)]="bookingDetails.time" name="time" required>
              <option value="">Select a time slot</option>
              <option *ngFor="let slot of availableTimeSlots" [value]="slot">{{slot}}</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Consultation Type</label>
            <select class="form-control" [(ngModel)]="bookingDetails.consultationType" name="consultationType" required>
              <option value="video">Video Consultation</option>
              <option value="in-person">In-Person Visit</option>
              <option value="phone">Phone Consultation</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Reason for Visit</label>
            <textarea class="form-control" [(ngModel)]="bookingDetails.reason" name="reason" rows="3" required></textarea>
          </div>
          
          <div class="form-group">
            <label>Upload Medical Records (Optional)</label>
            <div class="file-upload">
              <input type="file" (change)="onFileSelected($event)" id="medicalRecords" style="display: none;">
              <label for="medicalRecords" class="file-upload-label">
                <i class="fas fa-upload"></i> Choose File
              </label>
              <span class="file-name" *ngIf="bookingDetails.medicalRecord">
                {{bookingDetails.medicalRecord.name}}
              </span>
            </div>
          </div>
          
          <div class="form-group">
            <label>Insurance Information</label>
            <input type="text" class="form-control" [(ngModel)]="bookingDetails.insurance" name="insurance" placeholder="Insurance Provider">
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn btn-outline" (click)="resetForm()">Cancel</button>
            <button type="submit" class="btn btn-primary">Confirm Booking</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Booking Confirmation -->
    <div class="modal" [class.show]="bookingComplete">
      <div class="modal-content confirmation">
        <div class="confirmation-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <h2>Appointment Confirmed!</h2>
        <div class="confirmation-details" *ngIf="selectedDoctor && bookingDetails.date && bookingDetails.time">
          <p><strong>Doctor:</strong> {{selectedDoctor.name}}</p>
          <p><strong>Date:</strong> {{bookingDetails.date | date:'fullDate'}}</p>
          <p><strong>Time:</strong> {{bookingDetails.time}}</p>
          <p><strong>Type:</strong> {{bookingDetails.consultationType | titlecase}} Consultation</p>
        </div>
        <button class="btn btn-primary" (click)="resetForm()">Done</button>
        <button class="btn btn-text" (click)="addToCalendar()">
          <i class="far fa-calendar-plus"></i> Add to Calendar
        </button>
      </div>
    </div>
  `,
  styles: [`
    /* Global Styles */
    .btn {
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s ease;
      border: 1px solid transparent;
    }
    
    .btn-primary {
      background-color: #4a6cf7;
      color: white;
      border-color: #4a6cf7;
    }
    
    .btn-primary:hover {
      background-color: #3a5ce9;
      border-color: #3a5ce9;
    }
    
    .btn-outline {
      background-color: transparent;
      border-color: #4a6cf7;
      color: #4a6cf7;
    }
    
    .btn-outline:hover {
      background-color: rgba(74, 108, 247, 0.1);
    }
    
    .btn-text {
      background: none;
      border: none;
      color: #4a6cf7;
      text-decoration: underline;
      padding: 0;
      cursor: pointer;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
    }
    
    .form-control {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }
    
    textarea.form-control {
      min-height: 100px;
      resize: vertical;
    }
    
    label {
      display: block;
      margin-bottom: 6px;
      font-weight: 500;
      color: #333;
    }
    
    /* Modal Styles */
    .modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 1000;
      overflow-y: auto;
      padding: 20px;
      box-sizing: border-box;
    }
    
    .modal.show {
      display: flex;
      align-items: flex-start;
      justify-content: center;
    }
    
    .modal-content {
      background-color: white;
      border-radius: 8px;
      width: 100%;
      max-width: 800px;
      margin: 40px 0;
      position: relative;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      animation: modalFadeIn 0.3s ease;
    }
    
    @keyframes modalFadeIn {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .close {
      position: absolute;
      right: 20px;
      top: 15px;
      font-size: 24px;
      cursor: pointer;
      color: #666;
    }
    
    .close:hover {
      color: #333;
    }
    
    /* Profile Modal */
    .profile-container {
      padding: 30px;
    }
    
    .profile-header {
      display: flex;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #eee;
    }
    
    .profile-photo {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      margin-right: 30px;
      border: 4px solid #f5f7ff;
    }
    
    .profile-info h2 {
      margin: 0 0 8px;
      color: #2d3748;
    }
    
    .specialty {
      color: #4a6cf7;
      font-weight: 500;
      margin: 0 0 12px;
      display: block;
    }
    
    .profile-sections {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 30px;
    }
    
    .profile-section h3 {
      color: #2d3748;
      margin-top: 0;
      margin-bottom: 16px;
      font-size: 18px;
      display: flex;
      align-items: center;
    }
    
    .profile-section h3 i {
      margin-right: 8px;
      color: #4a6cf7;
    }
    
    .profile-section ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .profile-section li {
      padding: 6px 0;
      color: #4a5568;
      position: relative;
      padding-left: 20px;
    }
    
    .profile-section li:before {
      content: '•';
      color: #4a6cf7;
      position: absolute;
      left: 0;
    }
    
    .profile-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }
    
    /* Booking Form */
    .booking-form {
      max-width: 600px;
      padding: 30px;
    }
    
    .booking-form h2 {
      margin-top: 0;
      color: #2d3748;
      margin-bottom: 8px;
    }
    
    .booking-form > p {
      color: #718096;
      margin-top: 0;
      margin-bottom: 30px;
    }
    
    .file-upload {
      display: flex;
      align-items: center;
      margin-top: 8px;
    }
    
    .file-upload-label {
      background-color: #f7fafc;
      border: 1px dashed #cbd5e0;
      padding: 10px 16px;
      border-radius: 4px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      font-size: 14px;
      transition: all 0.2s ease;
    }
    
    .file-upload-label:hover {
      background-color: #edf2f7;
    }
    
    .file-upload-label i {
      margin-right: 8px;
    }
    
    .file-name {
      margin-left: 12px;
      font-size: 14px;
      color: #4a5568;
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 30px;
    }
    
    /* Confirmation Modal */
    .confirmation {
      text-align: center;
      padding: 40px 30px;
      max-width: 500px;
    }
    
    .confirmation-icon {
      font-size: 60px;
      color: #48bb78;
      margin-bottom: 20px;
    }
    
    .confirmation h2 {
      color: #2d3748;
      margin-top: 0;
      margin-bottom: 24px;
    }
    
    .confirmation-details {
      background-color: #f8fafc;
      border-radius: 6px;
      padding: 20px;
      margin-bottom: 30px;
      text-align: left;
    }
    
    .confirmation-details p {
      margin: 8px 0;
      color: #4a5568;
    }
    
    .confirmation-details strong {
      color: #2d3748;
      min-width: 100px;
      display: inline-block;
    }
    
    /* Main Component Styles */
    .book-consultation {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    }

    .header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .header h1 {
      color: #1a73e8;
      margin-bottom: 0.5rem;
    }

    .header p {
      color: #5f6368;
      max-width: 600px;
      margin: 0 auto;
    }

    .content {
      display: grid;
      grid-template-columns: 250px 1fr;
      gap: 2rem;
    }

    .filters {
      background: #fff;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      height: fit-content;
    }

    .filters h3 {
      margin-top: 0;
      margin-bottom: 1.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #e0e0e0;
    }

    .form-group {
      margin-bottom: 1.25rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #3c4043;
    }

    .form-control {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid #dadce0;
      border-radius: 4px;
      font-size: 1rem;
    }

    .doctors-list {
      flex: 1;
    }

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .sort-options select {
      padding: 0.5rem;
      border-radius: 4px;
      border: 1px solid #dadce0;
    }

    .doctors-grid {
      display: grid;
      gap: 1.5rem;
    }

    .doctor-card {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      padding: 1.5rem;
      display: flex;
      gap: 1.5rem;
    }

    .doctor-photo {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid #f0f7ff;
    }

    .doctor-info {
      flex: 1;
    }

    .doctor-info h4 {
      margin: 0 0 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .specialty {
      background: #e6f4ea;
      color: #137333;
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
    }

    .meta {
      display: flex;
      gap: 1rem;
      color: #5f6368;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }

    .rating {
      color: #fbbc04;
      margin: 0.5rem 0;
    }

    .reviews {
      color: #5f6368;
      font-size: 0.85rem;
      margin-left: 0.5rem;
    }

    .availability {
      color: #34a853;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      justify-content: center;
    }

    .btn {
      padding: 0.5rem 1rem;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      text-align: center;
      white-space: nowrap;
    }

    .btn-outline {
      border: 1px solid #1a73e8;
      color: #1a73e8;
      background: transparent;
    }

    .btn-primary {
      background: #1a73e8;
      color: white;
      border: 1px solid #1a73e8;
    }

    @media (max-width: 768px) {
      .content {
        grid-template-columns: 1fr;
      }

      .doctor-card {
        flex-direction: column;
        text-align: center;
      }

      .doctor-info h4,
      .meta {
        justify-content: center;
      }

      .actions {
        flex-direction: row;
        margin-top: 1rem;
      }
    }
  `]
})
export class BookConsultationComponent implements OnInit {
  // Component state
  filters: FilterOptions = {
    specialty: '',
    language: '',
    sortBy: 'soonest'
  };

  // Modal states
  showProfileModal = false;
  showBookingForm = false;
  bookingComplete = false;
  selectedDoctor: Doctor | null = null;
  
  // Available time slots for booking
  availableTimeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  // Booking details
  bookingDetails: any = {
    date: '',
    time: '',
    consultationType: 'video',
    reason: '',
    medicalRecord: null,
    insurance: ''
  };

  // Available options
  specialties = [
    'Medical Oncology',
    'Radiation Oncology',
    'Surgical Oncology',
    'Pediatric Oncology',
    'Hematology'
  ];

  languages = ['English', 'Arabic', 'French', 'Spanish', 'German'];

  sortOptions = [
    { value: 'soonest', label: 'Soonest Available' },
    { value: 'experience', label: 'Most Experienced' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  // Sample doctor data
  doctors: Doctor[] = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      photo: 'https://randomuser.me/api/portraits/women/44.jpg',
      specialty: 'Oncologist',
      subspecialty: 'Breast Cancer',
      experience: 12,
      languages: ['English', 'Arabic'],
      rating: 4.8,
      reviews: 124,
      nextAvailable: 'Today, 2:00 PM',
      bio: 'Dr. Johnson specializes in breast cancer treatment with over 12 years of experience. She is dedicated to providing personalized care to each patient.',
      education: ['MD, Harvard Medical School', 'Residency at Johns Hopkins'],
      certifications: ['Board Certified in Medical Oncology', 'Fellow of the American College of Physicians'],
      hospitals: ['City Medical Center', 'University Hospital']
    },
    {
      id: 2,
      name: 'Dr. Ahmed Mahmoud',
      photo: 'https://randomuser.me/api/portraits/men/32.jpg',
      specialty: 'Hematologist',
      subspecialty: 'Leukemia',
      experience: 8,
      languages: ['Arabic', 'English', 'French'],
      rating: 4.9,
      reviews: 98,
      nextAvailable: 'Tomorrow, 10:30 AM',
      bio: 'Dr. Mahmoud is a leading hematologist with expertise in leukemia treatment. He has published numerous papers on innovative treatment approaches.',
      education: ['MD, Cairo University', 'Fellowship at Mayo Clinic'],
      certifications: ['Board Certified in Hematology', 'Member of ASH'],
      hospitals: ['National Cancer Institute', 'Royal Medical Center']
    },
    {
      id: 3,
      name: 'Dr. Emily Chen',
      photo: 'https://randomuser.me/api/portraits/women/68.jpg',
      specialty: 'Radiation Oncologist',
      subspecialty: 'Prostate Cancer',
      experience: 15,
      languages: ['English', 'Spanish'],
      rating: 4.7,
      reviews: 156,
      nextAvailable: 'Today, 4:15 PM',
      bio: 'With over 15 years of experience, Dr. Chen is a pioneer in advanced radiation therapy techniques for prostate cancer treatment.',
      education: ['MD, Stanford University', 'Residency at MD Anderson'],
      certifications: ['Board Certified in Radiation Oncology'],
      hospitals: ['Memorial Cancer Center', 'City General Hospital']
    },
    {
      id: 4,
      name: 'Dr. Michael Brown',
      photo: 'https://randomuser.me/api/portraits/men/75.jpg',
      specialty: 'Surgical Oncologist',
      subspecialty: 'Lung Cancer',
      experience: 20,
      languages: ['English', 'German'],
      rating: 4.9,
      reviews: 210,
      nextAvailable: 'Tomorrow, 1:00 PM',
      bio: 'Dr. Brown is a renowned surgical oncologist specializing in minimally invasive lung cancer surgeries with exceptional success rates.',
      education: ['MD, Johns Hopkins University', 'Fellowship at Mayo Clinic'],
      certifications: ['Board Certified in Surgical Oncology', 'FACS'],
      hospitals: ['University Medical Center', 'Metro General Hospital']
    },
    {
      id: 5,
      name: 'Dr. Aisha Al-Farsi',
      photo: 'https://randomuser.me/api/portraits/women/25.jpg',
      specialty: 'Pediatric Oncologist',
      subspecialty: 'Pediatric Cancers',
      experience: 10,
      languages: ['Arabic', 'English', 'French'],
      rating: 4.8,
      reviews: 87,
      nextAvailable: 'Today, 3:45 PM',
      bio: 'Dr. Al-Farsi is dedicated to providing compassionate care to children with cancer, focusing on both treatment and quality of life.',
      education: ['MD, King Saud University', 'Fellowship at St. Jude'],
      certifications: ['Board Certified in Pediatric Oncology'],
      hospitals: ['Children\'s Hospital', 'Royal Medical Center']
    },
    {
      id: 6,
      name: 'Dr. James Wilson',
      photo: 'https://randomuser.me/api/portraits/men/65.jpg',
      specialty: 'Medical Oncologist',
      subspecialty: 'Colorectal Cancer',
      experience: 14,
      languages: ['English', 'Spanish'],
      rating: 4.6,
      reviews: 132,
      nextAvailable: 'Tomorrow, 9:00 AM',
      bio: 'Dr. Wilson specializes in the latest treatments for colorectal cancer, with a focus on personalized medicine and clinical trials.',
      education: ['MD, Yale School of Medicine', 'Fellowship at Dana-Farber'],
      certifications: ['Board Certified in Medical Oncology'],
      hospitals: ['City Cancer Center', 'University Hospital']
    }
  ];

  filteredDoctors: Doctor[] = [];

  constructor() {}

  ngOnInit(): void {
    this.filteredDoctors = [...this.doctors];
  }

  filterDoctors(): void {
    this.filteredDoctors = this.doctors.filter(doctor => {
      const matchesSpecialty = !this.filters.specialty || 
        doctor.subspecialty.toLowerCase().includes(this.filters.specialty.toLowerCase());
      
      const matchesLanguage = !this.filters.language || 
        doctor.languages.some((lang: string) => 
          lang.toLowerCase().includes(this.filters.language.toLowerCase())
        );
      
      return matchesSpecialty && matchesLanguage;
    });

    this.sortDoctors();
  }

  sortDoctors(): void {
    if (this.filters.sortBy === 'experience') {
      this.filteredDoctors.sort((a, b) => b.experience - a.experience);
    } else if (this.filters.sortBy === 'rating') {
      this.filteredDoctors.sort((a, b) => b.rating - a.rating);
    } else {
      // Default: sort by soonest available (already in order in the sample data)
      this.filteredDoctors = [...this.filteredDoctors];
    }
  }

  getStars(rating: number): number[] {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(1);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(0.5);
      } else {
        stars.push(0);
      }
    }
    
    return stars;
  }

  viewProfile(doctor: Doctor): void {
    this.selectedDoctor = doctor;
    this.showProfileModal = true;
  }

  closeProfile(): void {
    this.showProfileModal = false;
  }

  startBooking(doctor: Doctor): void {
    this.selectedDoctor = doctor;
    this.showProfileModal = false;
    this.bookingDetails = {
      doctorId: doctor.id,
      doctorName: doctor.name,
      date: new Date().toISOString().split('T')[0], // Today's date as default
      time: '',
      consultationType: 'video',
      reason: '',
      medicalRecord: null,
      insurance: ''
    };
    this.showBookingForm = true;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // In a real app, you would upload the file to a server
      this.bookingDetails.medicalRecord = {
        name: file.name,
        size: file.size,
        type: file.type
      };
    }
  }

  submitBooking(): void {
    // In a real app, this would submit the booking to a backend service
    console.log('Submitting booking:', this.bookingDetails);
    this.bookingComplete = true;
    this.showBookingForm = false;
    
    // In a real app, you would handle the API response here
    // and show appropriate success/error messages
  }

  resetForm(): void {
    this.bookingDetails = {
      date: new Date().toISOString().split('T')[0],
      time: '',
      consultationType: 'video',
      reason: '',
      medicalRecord: null,
      insurance: ''
    };
    this.showBookingForm = false;
    this.bookingComplete = false;
    this.showProfileModal = false;
  }

  addToCalendar(): void {
    // In a real app, this would generate an .ics file or integrate with calendar APIs
    if (this.selectedDoctor && this.bookingDetails.date && this.bookingDetails.time) {
      const event = {
        title: `Appointment with ${this.selectedDoctor.name}`,
        start: new Date(`${this.bookingDetails.date}T${this.bookingDetails.time}`),
        end: new Date(new Date(`${this.bookingDetails.date}T${this.bookingDetails.time}`).getTime() + 30 * 60000), // 30 minutes
        location: this.bookingDetails.consultationType === 'in-person' ? 
                 'Hospital/Clinic Address' : 'Video/Phone Consultation',
        description: `Consultation with ${this.selectedDoctor.name}\n` +
                    `Reason: ${this.bookingDetails.reason || 'Not specified'}`
      };
      
      // This is a simplified example - in a real app, you would use a proper calendar integration
      console.log('Adding to calendar:', event);
      alert('Calendar event created successfully!');
    }
  }
}
