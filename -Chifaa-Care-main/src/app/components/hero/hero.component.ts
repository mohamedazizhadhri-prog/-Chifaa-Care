import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PillModelService } from '../../services/pill-model.service';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="hero-section">
      <!-- Background Gradient -->
      <div class="hero-background"></div>
      
      <div class="hero-container">
        <!-- Left Side - Text & CTA -->
        <div class="hero-content">
          <div class="hero-text">
            <h1 class="hero-title">
              <span class="title-line">ChifaaCare</span>
              <span class="title-line">– We Care, Wherever You Are</span>
            </h1>
            <p class="hero-subtitle">
              Bringing Tunisian Expert Oncology Care to Libyan Patients — Without Leaving Home
            </p>
            <div class="hero-cta">
              <button class="cta-primary" (click)="onBookConsultation()">
                <i class="fas fa-calendar-check"></i>
                Book Your Consultation
              </button>
              <button class="cta-secondary" (click)="onLearnMore()">
                <i class="fas fa-info-circle"></i>
                Learn More
              </button>
            </div>
          </div>
        </div>

        <!-- Right Side - Pill Capsule 3D Model -->
        <div class="hero-visual">
          <!-- Desktop Pill Capsule 3D Model -->
          <div class="pill-scene" #pillScene *ngIf="!isMobile"></div>
          
          <!-- Mobile Fallback Image -->
          <div class="mobile-fallback" *ngIf="isMobile">
            <img src="assets/images/hero-fallback.jpg" alt="ChifaaCare Hero" />
          </div>
        </div>
      </div>

      <!-- Scroll Indicator -->
      <div class="scroll-indicator">
        <div class="scroll-arrow"></div>
        <span>Scroll to explore</span>
      </div>
    </section>
  `,
  styleUrls: ['./hero.component.scss']
})
export class HeroComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('pillScene', { static: false }) pillSceneRef!: ElementRef;
  
  isMobile = false;
  private pillModelService: PillModelService;
  currentUser: User | null = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.pillModelService = new PillModelService();
    this.checkMobile();
  }

  ngOnInit() {
    this.checkMobile();
    window.addEventListener('resize', () => this.checkMobile());
    
    // Subscribe to current user changes
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngAfterViewInit() {
    if (!this.isMobile && this.pillSceneRef) {
      this.initPillScene();
    }
  }

  ngOnDestroy() {
    if (this.pillModelService) {
      this.pillModelService.dispose();
    }
    window.removeEventListener('resize', () => this.checkMobile());
  }

  onBookConsultation(): void {
    if (!this.currentUser) {
      // User not logged in, show login modal by emitting an event
      // We'll need to communicate with the parent component to show the modal
      this.showLoginModal();
    } else if (this.currentUser.role === 'patient') {
      // Patient is logged in, navigate to book consultation page
      this.router.navigate(['/patient/book-consultation']);
    } else if (this.currentUser.role === 'doctor') {
      // Doctor is logged in, show message or redirect to appropriate page
      alert('Doctors can view consultations in their dashboard. Please use the doctor portal.');
      this.router.navigate(['/doctor/consultations']);
    }
  }

  onLearnMore(): void {
    this.router.navigate(['/about']);
  }

  private showLoginModal(): void {
    // Since we can't directly access the navbar component from here,
    // we'll use a custom event that the parent can listen to
    const event = new CustomEvent('showLoginModal', { 
      detail: { mode: 'signup' },
      bubbles: true 
    });
    document.dispatchEvent(event);
  }

  private checkMobile() {
    this.isMobile = window.innerWidth < 768;
  }

  private initPillScene() {
    if (this.pillSceneRef && this.pillSceneRef.nativeElement) {
      this.pillModelService.init(this.pillSceneRef.nativeElement);
    }
  }
} 