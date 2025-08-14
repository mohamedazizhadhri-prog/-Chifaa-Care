import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="footer-section" id="footer">
      <div class="footer-container">
        <div class="footer-content">
          <!-- Logo and Description -->
          <div class="footer-brand">
            <div class="footer-logo">
              <i class="fas fa-heartbeat"></i>
              <span>ChifaaCare</span>
            </div>
            <p class="footer-description">
              We Care, Wherever You Are. Bringing Tunisian Expert Oncology Care to Libyan Patients — Without Leaving Home.
            </p>
          </div>

          <!-- Quick Links -->
          <div class="footer-links">
            <h3 class="footer-title">Quick Links</h3>
            <ul class="footer-nav">
              <li><a routerLink="/home">Home</a></li>
              <li><a routerLink="/about">About</a></li>
              <li><a routerLink="/services">Services</a></li>
              <li><a routerLink="/team">Team</a></li>
              <li><a routerLink="/contact">Contact</a></li>
            </ul>
          </div>

          <!-- Services -->
          <div class="footer-services">
            <h3 class="footer-title">Our Services</h3>
            <ul class="footer-nav">
              <li><a href="#solution">Teleconsultations</a></li>
              <li><a href="#solution">AI Health Monitoring</a></li>
              <li><a href="#solution">Local Treatment</a></li>
              <li><a href="#solution">24/7 Support</a></li>
            </ul>
          </div>

          <!-- Contact Info -->
          <div class="footer-contact">
            <h3 class="footer-title">Contact Us</h3>
            <div class="contact-info">
              <div class="contact-item">
                <i class="fas fa-envelope"></i>
                <span>info&#64;chifaacare.ly</span>
              </div>
              <div class="contact-item">
                <i class="fas fa-phone"></i>
                <span>+218 21 123 4567</span>
              </div>
              <div class="contact-item">
                <i class="fas fa-map-marker-alt"></i>
                <span>Tripoli, Libya</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Social Links and Copyright -->
        <div class="footer-bottom">
          <div class="social-links">
            <a href="#" class="social-link" aria-label="LinkedIn">
              <i class="fab fa-linkedin"></i>
            </a>
            <a href="#" class="social-link" aria-label="Facebook">
              <i class="fab fa-facebook"></i>
            </a>
            <a href="#" class="social-link" aria-label="Instagram">
              <i class="fab fa-instagram"></i>
            </a>
            <a href="#" class="social-link" aria-label="Twitter">
              <i class="fab fa-twitter"></i>
            </a>
          </div>
          
          <div class="copyright">
            <p>&copy; 2024 ChifaaCare. All rights reserved. | We Care, Wherever You Are</p>
          </div>
        </div>
      </div>
    </footer>
  `,
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
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
    }, { threshold: 0.1 });

    const footer = document.querySelector('.footer-section');
    if (footer) {
      observer.observe(footer);
    }
  }
} 