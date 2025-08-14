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
            <div class="step-number">1</div>
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
            <div class="step-number">2</div>
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
            <div class="step-number">3</div>
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
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const stepCards = entry.target.querySelectorAll('.step-card');
          stepCards.forEach((card, index) => {
            setTimeout(() => {
              card.classList.add('animate-in');
            }, index * 200);
          });
        }
      });
    }, { threshold: 0.3 });

    const section = document.querySelector('.how-it-works-section');
    if (section) {
      observer.observe(section);
    }
  }
} 