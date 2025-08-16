import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PillModelService } from '../../services/pill-model.service';

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
              <button class="cta-primary">
                <i class="fas fa-calendar-check"></i>
                Book Your Consultation
              </button>
              <button class="cta-secondary">
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

  constructor() {
    this.pillModelService = new PillModelService();
    this.checkMobile();
  }

  ngOnInit() {
    this.checkMobile();
    window.addEventListener('resize', () => this.checkMobile());
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

  private checkMobile() {
    this.isMobile = window.innerWidth < 768;
  }

  private initPillScene() {
    if (this.pillSceneRef && this.pillSceneRef.nativeElement) {
      this.pillModelService.init(this.pillSceneRef.nativeElement);
    }
  }
} 