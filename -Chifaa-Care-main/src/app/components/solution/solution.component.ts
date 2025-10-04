import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-solution',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="solution-section" id="solution">
      <div class="solution-container">
        <div class="solution-content">
          <!-- Left Side - Text -->
          <div class="solution-text">
            <h2 class="solution-title">ChifaaCare: A Digital Bridge to Better Care</h2>
            <p class="solution-description">
              We connect Libyan patients with certified Tunisian oncologists through advanced telemedicine, eliminating the need for international travel while maintaining the highest standards of care.
            </p>
            <div class="solution-features">
              <div class="feature-item">
                <div class="feature-icon">
                  <i class="fas fa-video"></i>
                </div>
                <div class="feature-content">
                  <h3>Teleconsultations</h3>
                  <p>Direct video consultations with certified Tunisian oncologists</p>
                </div>
              </div>
              <div class="feature-item">
                <div class="feature-icon">
                  <i class="fas fa-robot"></i>
                </div>
                <div class="feature-content">
                  <h3>AI Health Monitoring</h3>
                  <p>Real-time AI-powered health tracking and alerts</p>
                </div>
              </div>
              <div class="feature-item">
                <div class="feature-icon">
                  <i class="fas fa-hospital"></i>
                </div>
                <div class="feature-content">
                  <h3>Local Treatment</h3>
                  <p>Treatment at trusted Libyan clinics with remote supervision</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Side - Image -->
          <div class="solution-image">
            <div class="image-placeholder">
              <i class="fas fa-video-camera"></i>
              <span>Doctor on video call</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrls: ['./solution.component.scss']
})
export class SolutionComponent implements OnInit {
  ngOnInit() {
    // Add scroll animation when component comes into view
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

    const elements = document.querySelectorAll('.solution-text, .solution-image');
    elements.forEach(el => observer.observe(el));
  }
} 