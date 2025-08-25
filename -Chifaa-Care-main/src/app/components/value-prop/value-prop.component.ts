import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-value-prop',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="value-prop-section" id="value-prop">
      <div class="value-prop-container">
        <div class="section-header">
          <h2 class="section-title">Why Choose ChifaaCare?</h2>
          <p class="section-subtitle">Discover the advantages that make us the preferred choice for oncology care</p>
        </div>
        
        <div class="value-grid">
          <div class="value-item" data-value="1">
            <div class="value-icon">
              <i class="fas fa-plane-slash"></i>
            </div>
            <div class="value-content">
              <h3 class="value-title">No Travel Abroad</h3>
              <p class="value-description">Stay in Libya while receiving world-class care from Tunisian specialists</p>
            </div>
          </div>

          <div class="value-item" data-value="2">
            <div class="value-icon">
              <i class="fas fa-user-md"></i>
            </div>
            <div class="value-content">
              <h3 class="value-title">Certified Oncologists</h3>
              <p class="value-description">Expert care from board-certified Tunisian oncology specialists</p>
            </div>
          </div>

          <div class="value-item" data-value="3">
            <div class="value-icon">
              <i class="fas fa-robot"></i>
            </div>
            <div class="value-content">
              <h3 class="value-title">AI Health Monitoring</h3>
              <p class="value-description">Advanced AI-powered health tracking and early warning systems</p>
            </div>
          </div>

          <div class="value-item" data-value="4">
            <div class="value-icon">
              <i class="fas fa-hospital"></i>
            </div>
            <div class="value-content">
              <h3 class="value-title">Local Clinics</h3>
              <p class="value-description">Treatment at trusted Libyan medical facilities with remote supervision</p>
            </div>
          </div>

          <div class="value-item" data-value="5">
            <div class="value-icon">
              <i class="fas fa-coins"></i>
            </div>
            <div class="value-content">
              <h3 class="value-title">Affordable Care</h3>
              <p class="value-description">Cost-effective treatment without international travel expenses</p>
            </div>
          </div>

          <div class="value-item" data-value="6">
            <div class="value-icon">
              <i class="fas fa-clock"></i>
            </div>
            <div class="value-content">
              <h3 class="value-title">24/7 Support</h3>
              <p class="value-description">Round-the-clock medical support and emergency assistance</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrls: ['./value-prop.component.scss']
})
export class ValuePropComponent implements OnInit {
  ngOnInit() {
    this.setupScrollAnimation();
  }

  private setupScrollAnimation() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const valueItems = entry.target.querySelectorAll('.value-item');
          valueItems.forEach((item, index) => {
            setTimeout(() => {
              item.classList.add('animate-in');
            }, index * 100);
          });
        }
      });
    }, { threshold: 0.2 });

    const section = document.querySelector('.value-prop-section');
    if (section) {
      observer.observe(section);
    }
  }
} 