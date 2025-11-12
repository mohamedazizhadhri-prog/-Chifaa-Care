import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-problem',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="problem-section" id="problem">
      <div class="problem-container">
        <div class="problem-content">
          <!-- Left Side - Image -->
          <div class="problem-image">
            <div class="image-placeholder">
              <i class="fas fa-plane-departure"></i>
              <span>Patient with luggage in airport</span>
            </div>
          </div>

          <!-- Right Side - Text -->
          <div class="problem-text">
            <h2 class="problem-title">The Crisis in Libyan Oncology Care</h2>
            <p class="problem-description">
              Every year, thousands of Libyan cancer patients are forced to travel abroad to receive basic oncology treatment, facing physical vulnerability, financial strain, and emotional hardship.
            </p>
            <div class="problem-stats">
              <div class="stat-item">
                <div class="stat-number">Thousands</div>
                <div class="stat-label">Patients travel abroad annually</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">High</div>
                <div class="stat-label">Financial burden on families</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">Severe</div>
                <div class="stat-label">Emotional and physical stress</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrls: ['./problem.component.scss']
})
export class ProblemComponent implements OnInit {
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

    const elements = document.querySelectorAll('.problem-image, .problem-text');
    elements.forEach(el => observer.observe(el));
  }
} 