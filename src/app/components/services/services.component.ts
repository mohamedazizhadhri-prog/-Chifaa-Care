import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterLink, FooterComponent],
  template: `
    <div class="services-page">
      <!-- Hero Section -->
      <div class="services-hero">
        <div class="hero-content animate-on-scroll">
          <h1>Our Healthcare Services</h1>
          <p>Bridging Libya and Tunisia through innovative remote oncology care and home healthcare solutions</p>
        </div>
      </div>

      <!-- Main Services Section -->
      <div class="services-container">
        <div class="service-card primary animate-on-scroll" data-delay="0">
          <div class="service-icon">
            <i class="fas fa-stethoscope"></i>
          </div>
          <h3>Remote Oncology Consultation</h3>
          <p>Connect Libyan patients with experienced Tunisian oncologists through our secure telemedicine platform. Get expert second opinions, treatment plans, and ongoing care management.</p>
          <ul class="service-features">
            <li>Video consultations with board-certified oncologists</li>
            <li>Secure medical record sharing</li>
            <li>Treatment plan development and monitoring</li>
            <li>Follow-up care coordination</li>
          </ul>
        </div>

        <div class="service-card animate-on-scroll" data-delay="200">
          <div class="service-icon">
            <i class="fas fa-home"></i>
          </div>
          <h3>Home Healthcare Services</h3>
          <p>Professional home care services provided by licensed Libyan clinics, ensuring patients receive quality care in the comfort of their homes.</p>
          <ul class="service-features">
            <li>Skilled nursing care</li>
            <li>Medication management</li>
            <li>Wound care and dressing changes</li>
            <li>Physical therapy and rehabilitation</li>
            <li>Patient and family education</li>
          </ul>
        </div>

        <div class="service-card animate-on-scroll" data-delay="400">
          <div class="service-icon">
            <i class="fas fa-laptop-medical"></i>
          </div>
          <h3>Digital Health Platform</h3>
          <p>Our comprehensive digital platform connects all stakeholders - patients, Libyan clinics, and Tunisian specialists - for seamless healthcare delivery.</p>
          <ul class="service-features">
            <li>Secure patient portal</li>
            <li>Electronic health records</li>
            <li>Appointment scheduling system</li>
            <li>Real-time communication tools</li>
            <li>Progress tracking and reporting</li>
          </ul>
        </div>

        <div class="service-card animate-on-scroll" data-delay="600">
          <div class="service-icon">
            <i class="fas fa-users"></i>
          </div>
          <h3>Care Coordination</h3>
          <p>Seamless coordination between Libyan home care providers and Tunisian specialists to ensure continuity of care and optimal patient outcomes.</p>
          <ul class="service-features">
            <li>Multi-disciplinary care team coordination</li>
            <li>Care plan development and updates</li>
            <li>Progress monitoring and reporting</li>
            <li>Emergency response protocols</li>
          </ul>
        </div>
      </div>

      <!-- How It Works Section -->
      <div class="how-it-works">
        <h2 class="animate-on-scroll">How Our Services Work</h2>
        <div class="steps-container">
          <div class="step animate-on-scroll" data-delay="0">
            <div class="step-number">1</div>
            <h4>Patient Registration</h4>
            <p>Patients register through our platform and provide medical history</p>
          </div>
          <div class="step animate-on-scroll" data-delay="200">
            <div class="step-number">2</div>
            <h4>Clinic Assignment</h4>
            <p>Local Libyan clinics are assigned based on patient location and needs</p>
          </div>
          <div class="step animate-on-scroll" data-delay="400">
            <div class="step-number">3</div>
            <h4>Specialist Consultation</h4>
            <p>Tunisian oncologists review cases and provide treatment recommendations</p>
          </div>
          <div class="step animate-on-scroll" data-delay="600">
            <div class="step-number">4</div>
            <h4>Home Care Delivery</h4>
            <p>Local clinics deliver care at home following specialist guidance</p>
          </div>
          <div class="step animate-on-scroll" data-delay="800">
            <div class="step-number">5</div>
            <h4>Ongoing Monitoring</h4>
            <p>Continuous care coordination and progress monitoring</p>
          </div>
        </div>
      </div>

      <!-- Benefits Section -->
      <div class="benefits-section">
        <h2 class="animate-on-scroll">Why Choose ChifaaCare?</h2>
        <div class="benefits-grid">
          <div class="benefit-item animate-on-scroll" data-delay="0">
            <i class="fas fa-globe-africa"></i>
            <h4>Cross-Border Expertise</h4>
            <p>Access to Tunisian oncology specialists while maintaining local care delivery</p>
          </div>
          <div class="benefit-item animate-on-scroll" data-delay="200">
            <i class="fas fa-clock"></i>
            <h4>24/7 Availability</h4>
            <p>Round-the-clock support and emergency response capabilities</p>
          </div>
          <div class="benefit-item animate-on-scroll" data-delay="400">
            <i class="fas fa-shield-alt"></i>
            <h4>Secure & Compliant</h4>
            <p>HIPAA-compliant platform with end-to-end encryption</p>
          </div>
          <div class="benefit-item animate-on-scroll" data-delay="600">
            <i class="fas fa-chart-line"></i>
            <h4>Better Outcomes</h4>
            <p>Improved patient outcomes through coordinated, specialized care</p>
          </div>
        </div>
      </div>

      <!-- CTA Section -->
      <div class="cta-section">
        <h3 class="animate-on-scroll">Ready to Transform Healthcare?</h3>
        <p class="animate-on-scroll" data-delay="200">Join our network of clinics and start providing world-class care to your patients</p>
        <div class="cta-buttons animate-on-scroll" data-delay="400">
          <a routerLink="/contact" class="cta-btn primary">Get Started</a>
          <a routerLink="/about" class="cta-btn secondary">Learn More</a>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <app-footer></app-footer>
  `,
  styles: [`
    .services-page {
      background: #f8fafc;
      min-height: 100vh;
    }

    .services-hero {
      background: linear-gradient(135deg, #2563eb, #10b981);
      color: white;
      padding: 120px 2rem 4rem;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .services-hero::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
      opacity: 0.3;
      animation: float 20s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(180deg); }
    }

    .hero-content {
      position: relative;
      z-index: 2;
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.8s ease-out;
    }

    .hero-content.animate-in {
      opacity: 1;
      transform: translateY(0);
    }

    .hero-content h1 {
      font-size: 3.5rem;
      margin-bottom: 1rem;
      font-weight: 700;
      background: linear-gradient(135deg, #ffffff, #e0f2fe);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-content p {
      font-size: 1.3rem;
      opacity: 0.9;
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;
    }

    .services-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 4rem 2rem;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .service-card {
      background: white;
      padding: 2.5rem;
      border-radius: 20px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      border: 2px solid transparent;
      opacity: 0;
      transform: translateY(50px);
      position: relative;
      overflow: hidden;
    }

    .service-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s;
    }

    .service-card:hover::before {
      left: 100%;
    }

    .service-card.animate-in {
      opacity: 1;
      transform: translateY(0);
    }

    .service-card:hover {
      transform: translateY(-15px) scale(1.02);
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
    }

    .service-card.primary {
      border-color: #2563eb;
      background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
    }

    .service-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #2563eb, #10b981);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
      transition: all 0.3s ease;
      position: relative;
    }

    .service-card:hover .service-icon {
      transform: scale(1.1) rotate(5deg);
      box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
    }

    .service-icon i {
      font-size: 2rem;
      color: white;
      transition: all 0.3s ease;
    }

    .service-card:hover .service-icon i {
      transform: scale(1.1);
    }

    .service-card h3 {
      font-size: 1.5rem;
      color: #1f2937;
      margin-bottom: 1rem;
      font-weight: 600;
      transition: color 0.3s ease;
    }

    .service-card:hover h3 {
      color: #2563eb;
    }

    .service-card p {
      color: #6b7280;
      margin-bottom: 1.5rem;
      line-height: 1.6;
    }

    .service-features {
      list-style: none;
      padding: 0;
    }

    .service-features li {
      padding: 0.5rem 0;
      color: #374151;
      position: relative;
      padding-left: 1.5rem;
      transition: all 0.3s ease;
      opacity: 0.8;
    }

    .service-features li:hover {
      opacity: 1;
      transform: translateX(5px);
    }

    .service-features li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #10b981;
      font-weight: bold;
      transition: all 0.3s ease;
    }

    .service-features li:hover:before {
      transform: scale(1.2);
      color: #059669;
    }

    .how-it-works {
      background: white;
      padding: 4rem 2rem;
      text-align: center;
      position: relative;
    }

    .how-it-works::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
    }

    .how-it-works h2 {
      font-size: 2.5rem;
      color: #1f2937;
      margin-bottom: 3rem;
      font-weight: 600;
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.8s ease-out;
    }

    .how-it-works h2.animate-in {
      opacity: 1;
      transform: translateY(0);
    }

    .steps-container {
      max-width: 1000px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
    }

    .step {
      padding: 1.5rem;
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.6s ease-out;
    }

    .step.animate-in {
      opacity: 1;
      transform: translateY(0);
    }

    .step-number {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #2563eb, #10b981);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: bold;
      margin: 0 auto 1rem;
      transition: all 0.3s ease;
      position: relative;
    }

    .step:hover .step-number {
      transform: scale(1.1) rotate(5deg);
      box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
    }

    .step h4 {
      color: #1f2937;
      margin-bottom: 0.5rem;
      font-weight: 600;
      transition: color 0.3s ease;
    }

    .step:hover h4 {
      color: #2563eb;
    }

    .step p {
      color: #6b7280;
      font-size: 0.9rem;
      transition: all 0.3s ease;
    }

    .step:hover p {
      color: #374151;
    }

    .benefits-section {
      background: #f1f5f9;
      padding: 4rem 2rem;
      text-align: center;
      position: relative;
    }

    .benefits-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
    }

    .benefits-section h2 {
      font-size: 2.5rem;
      color: #1f2937;
      margin-bottom: 3rem;
      font-weight: 600;
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.8s ease-out;
    }

    .benefits-section h2.animate-in {
      opacity: 1;
      transform: translateY(0);
    }

    .benefits-grid {
      max-width: 1000px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
    }

    .benefit-item {
      background: white;
      padding: 2rem;
      border-radius: 15px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      opacity: 0;
      transform: translateY(30px);
      position: relative;
      overflow: hidden;
    }

    .benefit-item::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: -1;
    }

    .benefit-item.animate-in {
      opacity: 1;
      transform: translateY(0);
    }

    .benefit-item:hover {
      transform: translateY(-10px) scale(1.02);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
    }

    .benefit-item:hover::before {
      opacity: 1;
    }

    .benefit-item i {
      font-size: 2.5rem;
      color: #2563eb;
      margin-bottom: 1rem;
      transition: all 0.3s ease;
    }

    .benefit-item:hover i {
      transform: scale(1.1) rotate(5deg);
      color: #1d4ed8;
    }

    .benefit-item h4 {
      color: #1f2937;
      margin-bottom: 1rem;
      font-weight: 600;
      transition: color 0.3s ease;
    }

    .benefit-item:hover h4 {
      color: #2563eb;
    }

    .benefit-item p {
      color: #6b7280;
      line-height: 1.6;
      transition: color 0.3s ease;
    }

    .benefit-item:hover p {
      color: #374151;
    }

    .cta-section {
      background: linear-gradient(135deg, #1f2937, #374151);
      color: white;
      padding: 4rem 2rem;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .cta-section::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
      animation: rotate 20s linear infinite;
    }

    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .cta-section h3 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      font-weight: 600;
      position: relative;
      z-index: 2;
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.8s ease-out;
    }

    .cta-section h3.animate-in {
      opacity: 1;
      transform: translateY(0);
    }

    .cta-section p {
      font-size: 1.2rem;
      margin-bottom: 2rem;
      opacity: 0.9;
      position: relative;
      z-index: 2;
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.8s ease-out;
    }

    .cta-section p.animate-in {
      opacity: 0.9;
      transform: translateY(0);
    }

    .cta-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
      position: relative;
      z-index: 2;
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.8s ease-out;
    }

    .cta-buttons.animate-in {
      opacity: 1;
      transform: translateY(0);
    }

    .cta-btn {
      padding: 1rem 2rem;
      border-radius: 50px;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      display: inline-block;
      position: relative;
      overflow: hidden;
    }

    .cta-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s;
    }

    .cta-btn:hover::before {
      left: 100%;
    }

    .cta-btn.primary {
      background: linear-gradient(135deg, #2563eb, #10b981);
      color: white;
    }

    .cta-btn.secondary {
      background: transparent;
      color: white;
      border: 2px solid white;
    }

    .cta-btn:hover {
      transform: translateY(-5px) scale(1.05);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
    }

    /* Animation classes */
    .animate-on-scroll {
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.8s ease-out;
    }

    .animate-on-scroll.animate-in {
      opacity: 1;
      transform: translateY(0);
    }

    @media (max-width: 768px) {
      .hero-content h1 {
        font-size: 2.5rem;
      }
      
      .services-container {
        grid-template-columns: 1fr;
        padding: 2rem 1rem;
      }
      
      .steps-container {
        grid-template-columns: 1fr;
      }
      
      .benefits-grid {
        grid-template-columns: 1fr;
      }
      
      .cta-buttons {
        flex-direction: column;
        align-items: center;
      }
    }
  `]
})
export class ServicesComponent implements OnInit, OnDestroy {
  private observer: IntersectionObserver | null = null;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    // Force component refresh on route change
    this.route.params.subscribe(() => {
      this.initializeComponent();
    });
    
    // Also listen to route changes
    this.router.events.subscribe(() => {
      this.initializeComponent();
    });
  }

  private initializeComponent() {
    // Reset scroll position to top
    window.scrollTo(0, 0);
    
    // Wait a bit for the page to settle, then setup animations
    setTimeout(() => {
      this.setupScrollAnimations();
    }, 100);
  }

  ngOnDestroy() {
    // Clean up observer to prevent memory leaks
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private setupScrollAnimations() {
    // Disconnect any existing observer
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          const delay = element.getAttribute('data-delay') || '0';
          
          setTimeout(() => {
            element.classList.add('animate-in');
          }, parseInt(delay));
        }
      });
    }, { 
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // Observe all elements with animate-on-scroll class
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => {
      if (this.observer) {
        this.observer.observe(el);
      }
    });
  }
} 