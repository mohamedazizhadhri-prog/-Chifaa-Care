import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ContactService, ContactFormData } from '../../services/contact.service';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, FooterComponent],
  template: `
    <div class="contact-page">
      <!-- Hero Section -->
      <div class="contact-hero">
        <div class="hero-content animate-on-scroll">
          <h1>Get in Touch</h1>
          <p>Ready to transform healthcare delivery? Contact us to learn more about ChifaaCare's services and partnership opportunities.</p>
        </div>
        <div class="hero-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
        </div>
      </div>

      <div class="contact-container">
        <div class="contact-grid">
          <!-- Contact Information -->
          <div class="contact-info animate-on-scroll" data-delay="0">
            <h2>Contact Information</h2>
            <p>We're here to help you get started with ChifaaCare. Reach out to us through any of the channels below.</p>
            
            <div class="info-items">
              <div class="info-item animate-on-scroll" data-delay="100">
                <div class="info-icon">
                  <i class="fas fa-map-marker-alt"></i>
                </div>
                <div class="info-content">
                  <h4>Libya Office</h4>
                  <p>{{ contactInfo.libya.address }}<br>{{ contactInfo.libya.hours }}</p>
                </div>
              </div>
              
              <div class="info-item animate-on-scroll" data-delay="200">
                <div class="info-icon">
                  <i class="fas fa-map-marker-alt"></i>
                </div>
                <div class="info-content">
                  <h4>Tunisia Office</h4>
                  <p>{{ contactInfo.tunisia.address }}<br>{{ contactInfo.tunisia.hours }}</p>
                </div>
              </div>
              
              <div class="info-item animate-on-scroll" data-delay="300">
                <div class="info-icon">
                  <i class="fas fa-phone"></i>
                </div>
                <div class="info-content">
                  <h4>Phone</h4>
                  <p>{{ contactInfo.libya.phone }} (Libya)<br>{{ contactInfo.tunisia.phone }} (Tunisia)</p>
                </div>
              </div>
              
              <div class="info-item animate-on-scroll" data-delay="400">
                <div class="info-icon">
                  <i class="fas fa-envelope"></i>
                </div>
                <div class="info-content">
                  <h4>Email</h4>
                  <p>{{ contactInfo.libya.email }}<br>{{ contactInfo.tunisia.email }}</p>
                </div>
              </div>
              
              <div class="info-item animate-on-scroll" data-delay="500">
                <div class="info-icon">
                  <i class="fas fa-clock"></i>
                </div>
                <div class="info-content">
                  <h4>Business Hours</h4>
                  <p>{{ businessHours.libya.weekdays }}<br>{{ businessHours.libya.weekend }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Form -->
          <div class="contact-form animate-on-scroll" data-delay="200">
            <h2>Send us a Message</h2>
            <p>Fill out the form below and we'll get back to you within 24 hours.</p>
            
            <form (ngSubmit)="onSubmit()" #contactForm="ngForm">
              <div class="form-group animate-on-scroll" data-delay="300">
                <label for="name">Full Name *</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  [(ngModel)]="formData.name" 
                  required 
                  placeholder="Enter your full name">
              </div>
              
              <div class="form-group animate-on-scroll" data-delay="400">
                <label for="email">Email Address *</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  [(ngModel)]="formData.email" 
                  required 
                  placeholder="Enter your email address">
              </div>
              
              <div class="form-group animate-on-scroll" data-delay="500">
                <label for="phone">Phone Number</label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone" 
                  [(ngModel)]="formData.phone" 
                  placeholder="Enter your phone number">
              </div>
              
              <div class="form-group animate-on-scroll" data-delay="600">
                <label for="organization">Organization</label>
                <input 
                  type="text" 
                  id="organization" 
                  name="organization" 
                  [(ngModel)]="formData.organization" 
                  placeholder="Enter your organization name">
              </div>
              
              <div class="form-group animate-on-scroll" data-delay="700">
                <label for="subject">Subject *</label>
                <select 
                  id="subject" 
                  name="subject" 
                  [(ngModel)]="formData.subject" 
                  required>
                  <option value="">Select a subject</option>
                  <option value="partnership">Partnership Inquiry</option>
                  <option value="services">Services Information</option>
                  <option value="support">Technical Support</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div class="form-group animate-on-scroll" data-delay="800">
                <label for="message">Message *</label>
                <textarea 
                  id="message" 
                  name="message" 
                  [(ngModel)]="formData.message" 
                  required 
                  rows="5" 
                  placeholder="Tell us how we can help you"></textarea>
              </div>
              
              <button type="submit" class="submit-btn animate-on-scroll" data-delay="900" [disabled]="!contactForm.form.valid || isSubmitting">
                <span *ngIf="!isSubmitting">Send Message</span>
                <span *ngIf="isSubmitting">Sending...</span>
              </button>
            </form>
          </div>
        </div>

        <!-- Additional Information -->
        <div class="additional-info">
          <div class="info-cards">
            <div class="info-card animate-on-scroll" data-delay="0">
              <div class="card-icon">
                <i class="fas fa-users"></i>
              </div>
              <h3>For Healthcare Providers</h3>
              <p>Join our network of clinics and start providing world-class care to your patients with support from Tunisian specialists.</p>
              <a routerLink="/services" class="card-link">Learn More →</a>
            </div>
            
            <div class="info-card animate-on-scroll" data-delay="200">
              <div class="card-icon">
                <i class="fas fa-user-md"></i>
              </div>
              <h3>For Medical Specialists</h3>
              <p>Partner with us to extend your expertise to patients across Libya and contribute to improving healthcare outcomes.</p>
              <a routerLink="/about" class="card-link">Learn More →</a>
            </div>
            
            <div class="info-card animate-on-scroll" data-delay="400">
              <div class="card-icon">
                <i class="fas fa-question-circle"></i>
              </div>
              <h3>Need Help?</h3>
              <p>Our support team is available to answer your questions and help you get started with ChifaaCare.</p>
              <a href="mailto:{{ contactInfo.libya.email }}" class="card-link">Email Support →</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <app-footer></app-footer>
  `,
  styles: [`
    .contact-page {
      background: #f8fafc;
      min-height: 100vh;
    }

    .contact-hero {
      background: linear-gradient(135deg, #2563eb, #10b981);
      color: white;
      padding: 120px 2rem 4rem;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .hero-shapes {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    .shape {
      position: absolute;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      animation: float-shape 8s ease-in-out infinite;
    }

    .shape-1 {
      width: 100px;
      height: 100px;
      top: 20%;
      left: 10%;
      animation-delay: 0s;
    }

    .shape-2 {
      width: 60px;
      height: 60px;
      top: 60%;
      right: 15%;
      animation-delay: 2s;
    }

    .shape-3 {
      width: 80px;
      height: 80px;
      bottom: 20%;
      left: 20%;
      animation-delay: 4s;
    }

    @keyframes float-shape {
      0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.1; }
      50% { transform: translateY(-30px) rotate(180deg); opacity: 0.3; }
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

    .contact-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 4rem 2rem;
    }

    .contact-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      margin-bottom: 4rem;
    }

    .contact-info, .contact-form {
      opacity: 0;
      transform: translateY(50px);
      transition: all 0.8s ease-out;
    }

    .contact-info.animate-in, .contact-form.animate-in {
      opacity: 1;
      transform: translateY(0);
    }

    .contact-info h2, .contact-form h2 {
      font-size: 2rem;
      color: #1f2937;
      margin-bottom: 1rem;
      font-weight: 600;
    }

    .contact-info p, .contact-form p {
      color: #6b7280;
      margin-bottom: 2rem;
      line-height: 1.6;
    }

    .info-items {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .info-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1.5rem;
      background: white;
      border-radius: 15px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      opacity: 0;
      transform: translateX(-30px);
      position: relative;
      overflow: hidden;
    }

    .info-item::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(37, 99, 235, 0.1), transparent);
      transition: left 0.5s;
    }

    .info-item:hover::before {
      left: 100%;
    }

    .info-item.animate-in {
      opacity: 1;
      transform: translateX(0);
    }

    .info-item:hover {
      transform: translateY(-5px) scale(1.02);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
    }

    .info-icon {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #2563eb, #10b981);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.3s ease;
    }

    .info-item:hover .info-icon {
      transform: scale(1.1) rotate(5deg);
      box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
    }

    .info-icon i {
      font-size: 1.2rem;
      color: white;
      transition: all 0.3s ease;
    }

    .info-item:hover .info-icon i {
      transform: scale(1.1);
    }

    .info-content h4 {
      color: #1f2937;
      margin-bottom: 0.5rem;
      font-weight: 600;
      transition: color 0.3s ease;
    }

    .info-item:hover .info-content h4 {
      color: #2563eb;
    }

    .info-content p {
      color: #6b7280;
      margin: 0;
      line-height: 1.5;
      transition: color 0.3s ease;
    }

    .info-item:hover .info-content p {
      color: #374151;
    }

    .contact-form {
      background: white;
      padding: 2.5rem;
      border-radius: 20px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      position: relative;
      overflow: hidden;
    }

    .contact-form::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
    }

    .form-group {
      margin-bottom: 1.5rem;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.6s ease-out;
    }

    .form-group.animate-in {
      opacity: 1;
      transform: translateY(0);
    }

    .form-group label {
      display: block;
      color: #374151;
      margin-bottom: 0.5rem;
      font-weight: 500;
      transition: color 0.3s ease;
    }

    .form-group:focus-within label {
      color: #2563eb;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      font-size: 1rem;
      transition: all 0.3s ease;
      font-family: inherit;
      background: white;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
      transform: translateY(-2px);
    }

    .form-group textarea {
      resize: vertical;
      min-height: 120px;
    }

    .submit-btn {
      width: 100%;
      padding: 1rem 2rem;
      background: linear-gradient(135deg, #2563eb, #10b981);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      opacity: 0;
      transform: translateY(20px);
    }

    .submit-btn.animate-in {
      opacity: 1;
      transform: translateY(0);
    }

    .submit-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s;
    }

    .submit-btn:hover::before {
      left: 100%;
    }

    .submit-btn:hover:not(:disabled) {
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 15px 35px rgba(37, 99, 235, 0.3);
    }

    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .additional-info {
      margin-top: 4rem;
      position: relative;
    }

    .additional-info::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
    }

    .info-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .info-card {
      background: white;
      padding: 2rem;
      border-radius: 15px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
      text-align: center;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      opacity: 0;
      transform: translateY(30px);
      position: relative;
      overflow: hidden;
    }

    .info-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(37, 99, 235, 0.1), transparent);
      transition: left 0.5s;
    }

    .info-card:hover::before {
      left: 100%;
    }

    .info-card.animate-in {
      opacity: 1;
      transform: translateY(0);
    }

    .info-card:hover {
      transform: translateY(-10px) scale(1.02);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
    }

    .card-icon {
      width: 70px;
      height: 70px;
      background: linear-gradient(135deg, #2563eb, #10b981);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .card-icon::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
      animation: rotate 15s linear infinite;
    }

    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .info-card:hover .card-icon {
      transform: scale(1.1) rotate(5deg);
      box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
    }

    .card-icon i {
      font-size: 1.8rem;
      color: white;
      position: relative;
      z-index: 2;
      transition: all 0.3s ease;
    }

    .info-card:hover .card-icon i {
      transform: scale(1.1);
    }

    .info-card h3 {
      color: #1f2937;
      margin-bottom: 1rem;
      font-weight: 600;
      transition: color 0.3s ease;
    }

    .info-card:hover h3 {
      color: #2563eb;
    }

    .info-card p {
      color: #6b7280;
      margin-bottom: 1.5rem;
      line-height: 1.6;
      transition: color 0.3s ease;
    }

    .info-card:hover p {
      color: #374151;
    }

    .card-link {
      color: #2563eb;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s ease;
      position: relative;
    }

    .card-link::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 0;
      height: 2px;
      background: #2563eb;
      transition: width 0.3s ease;
    }

    .card-link:hover {
      color: #1d4ed8;
    }

    .card-link:hover::after {
      width: 100%;
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
      
      .contact-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
      
      .contact-container {
        padding: 2rem 1rem;
      }
      
      .info-cards {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ContactComponent implements OnInit, OnDestroy {
  isSubmitting = false;
  
  formData: ContactFormData = {
    name: '',
    email: '',
    phone: '',
    organization: '',
    subject: '',
    message: ''
  };

  contactInfo = this.contactService.getContactInfo();
  businessHours = this.contactService.getBusinessHours();
  private observer: IntersectionObserver | null = null;

  constructor(
    private contactService: ContactService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

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

  onSubmit() {
    if (this.isSubmitting) return;
    
    this.isSubmitting = true;
    
    this.contactService.submitContactForm(this.formData).subscribe({
      next: (response) => {
        alert(response.message);
        
        // Reset form
        this.formData = {
          name: '',
          email: '',
          phone: '',
          organization: '',
          subject: '',
          message: ''
        };
        
        this.isSubmitting = false;
      },
      error: (error) => {
        alert('Sorry, there was an error sending your message. Please try again.');
        this.isSubmitting = false;
      }
    });
  }
} 