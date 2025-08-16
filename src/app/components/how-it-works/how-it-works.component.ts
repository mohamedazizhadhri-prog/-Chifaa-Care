import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="how-it-works-section" id="how-it-works">
      <div class="how-it-works-container">
        <div class="section-header">
          <h2 class="section-title">Simple, Fast, Life-Changing</h2>
          <p class="section-subtitle">Your journey to better care in three easy steps</p>
        </div>
        <!-- Progress path SVG overlay -->
        <svg class="progress-svg" viewBox="0 0 1000 200" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#2E86C1" />
              <stop offset="100%" stop-color="#28B463" />
            </linearGradient>
          </defs>
          <path id="progress-path" d="M 80 100 C 250 0, 400 200, 540 100 C 700 0, 850 200, 1000 100" />
        </svg>

        <div class="steps-container">
          <div class="step-card" data-step="1">
            <div class="step-icon">
              <span class="step-emoji">💻</span>
            </div>
            <div class="step-content">
              <h3 class="step-title">Consult Online</h3>
              <p class="step-description">
                Schedule a video consultation with certified Tunisian oncologists from the comfort of your home
              </p>
            </div>
            <div class="step-number" data-target="1">0</div>
          </div>

          <div class="step-arrow">
            <i class="fas fa-arrow-right"></i>
          </div>

          <div class="step-card" data-step="2">
            <div class="step-icon">
              <span class="step-emoji">📋</span>
            </div>
            <div class="step-content">
              <h3 class="step-title">Personalized Plan</h3>
              <p class="step-description">
                Receive a comprehensive treatment plan tailored to your specific condition and needs
              </p>
            </div>
            <div class="step-number" data-target="2">0</div>
          </div>

          <div class="step-arrow">
            <i class="fas fa-arrow-right"></i>
          </div>

          <div class="step-card" data-step="3">
            <div class="step-icon">
              <span class="step-emoji">🏥</span>
            </div>
            <div class="step-content">
              <h3 class="step-title">Local Care</h3>
              <p class="step-description">
                Receive treatment at trusted Libyan clinics with remote supervision from your specialist
              </p>
            </div>
            <div class="step-number" data-target="3">0</div>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrls: ['./how-it-works.component.scss']
})
export class HowItWorksComponent implements OnInit {
  ngOnInit() {
    this.setupScrollAnimation();
  }

  private setupScrollAnimation() {
    const section = document.querySelector('.how-it-works-section');
    if (!section) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        // Add reveal class to trigger progress path draw
        const container = section.querySelector('.how-it-works-container');
        container?.classList.add('reveal');

        // Animate steps in sequence with distinct effects
        const stepCards = Array.from(section.querySelectorAll<HTMLElement>('.step-card'));
        stepCards.forEach((card, index) => {
          setTimeout(() => {
            const step = card.getAttribute('data-step');
            card.classList.add('animate-in');
            if (step === '1') card.classList.add('slide-left');
            if (step === '2') card.classList.add('fade-bounce');
            if (step === '3') card.classList.add('slide-right');
            // Light up icon in sync with progress path draw (approx positions along the curve)
            const lightDelays = [400, 900, 1400]; // ms within 1600ms draw
            setTimeout(() => card.querySelector('.step-icon')?.classList.add('lit'), lightDelays[index] || 600);
          }, index * 220);
        });

        // Count-up numbers 0 -> target
        const numbers = Array.from(section.querySelectorAll<HTMLElement>('.step-number'));
        numbers.forEach((el, i) => this.countUp(el, Number(el.dataset['target'] || '0'), 600 + i * 150));

        // Only run once
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.35 });

    observer.observe(section);
  }

  private countUp(el: HTMLElement, target: number, duration = 800) {
    let start = 0;
    const startTs = performance.now();
    const step = (ts: number) => {
      const p = Math.min(1, (ts - startTs) / duration);
      const val = Math.floor(p * target);
      if (val !== start) {
        start = val;
        el.textContent = String(val);
      }
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = String(target);
    };
    requestAnimationFrame(step);
  }
}
 