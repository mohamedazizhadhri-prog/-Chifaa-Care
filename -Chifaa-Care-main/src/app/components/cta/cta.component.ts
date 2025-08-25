import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cta',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="cta-section" id="cta">
      <div class="cta-container">
        <div class="cta-content">
          <h2 class="cta-title">Join us in transforming oncology care in Libya</h2>
          <p class="cta-description">
            Together, we can ease suffering and bring hope home. Start your journey to better care today.
          </p>
          <div class="cta-buttons">
            <button class="cta-primary">
              <i class="fas fa-calendar-check"></i>
              Book Now
            </button>
            <button class="cta-secondary">
              <i class="fas fa-envelope"></i>
              Contact Us
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
export class CtaComponent implements OnInit {
  ngOnInit() {
    this.setupScrollAnimation();
  }

  private setupScrollAnimation() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, { threshold: 0.3 });

    const ctaContent = document.querySelector('.cta-content');
    if (ctaContent) {
      observer.observe(ctaContent);
    }
  }
} 