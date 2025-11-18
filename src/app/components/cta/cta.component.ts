import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-cta',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="cta-section" id="cta" #ctaSection>
      <div class="cta-container" [class.animate-in]="isVisible">
        <div class="cta-content">
          <h2 class="cta-title" [class.slide-up]="isVisible">
            {{ currentUser?.role === 'doctor' ? 'Your Medical Dashboard' : 'Join us in transforming oncology care in Libya' }}
          </h2>
          <p class="cta-description" [class.slide-up-delay]="isVisible" *ngIf="currentUser?.role !== 'doctor'">
            Together, we can ease suffering and bring hope home. Start your journey to better care today.
          </p>
          <div class="cta-buttons" [class.fade-in-up]="isVisible">
            <button type="button" class="cta-primary" (click)="onBookNow()" [disabled]="isLoading">
              <i [class]="currentUser?.role === 'doctor' ? 'fas fa-tachometer-alt' : 'fas fa-calendar-check'"></i>
              <span>{{ currentUser?.role === 'doctor' ? 'Dashboard' : 'Book Now' }}</span>
            </button>
            <button type="button" class="cta-secondary" (click)="onContactUs()" [disabled]="isLoading" *ngIf="currentUser?.role !== 'doctor'">
              <i class="fas fa-envelope"></i>
              <span>Contact Us</span>
            </button>
          </div>
        </div>
        
        <!-- Animated Background Elements -->
        <div class="cta-background">
          <div class="wave wave-1"></div>
          <div class="wave wave-2"></div>
          <div class="wave wave-3"></div>
        </div>
      </div>
    </section>
  `,
  styleUrls: ['./cta.component.scss']
})
export class CtaComponent implements OnInit, OnDestroy {
  @ViewChild('ctaSection', { static: true }) ctaSection!: ElementRef;
  
  currentUser: User | null = null;
  isVisible = false;
  isLoading = false;
  private observer!: IntersectionObserver;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Subscribe to current user changes
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    // Set up intersection observer for scroll animations
    this.setupScrollAnimation();
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  onBookNow(): void {
    console.log('Primary action clicked!');
    if (!this.currentUser) {
      // User not logged in, show login modal by emitting an event
      this.showLoginModal();
    } else if (this.currentUser.role === 'patient') {
      // Patient is logged in, navigate to book consultation page
      this.router.navigate(['/patient/book-consultation']);
    } else if (this.currentUser.role === 'doctor') {
      // Doctor is logged in, navigate to doctor dashboard
      this.router.navigate(['/doctor/dashboard']);
    }
  }

  onContactUs(): void {
    console.log('Contact Us clicked!');
    if (this.isLoading) return;
    
    this.isLoading = true;
    
    try {
      this.router.navigate(['/contact']);
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private showLoginModal(): void {
    // Use the same custom event approach as hero component
    const event = new CustomEvent('showLoginModal', { 
      detail: { mode: 'signup' },
      bubbles: true 
    });
    document.dispatchEvent(event);
  }

  private setupScrollAnimation(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            this.isVisible = true;
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    if (this.ctaSection) {
      this.observer.observe(this.ctaSection.nativeElement);
    }
  }
}
