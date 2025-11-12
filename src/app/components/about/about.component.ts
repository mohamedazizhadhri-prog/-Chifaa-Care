import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink, FooterComponent],
  template: `
    <div class="about-page">
      <!-- Hero Section -->
      <div class="about-hero">
        <div class="hero-content animate-on-scroll">
          <h1>About ChifaaCare</h1>
          <p>Revolutionizing healthcare delivery across North Africa through innovative telemedicine and home care solutions</p>
        </div>
        <div class="hero-particles">
          <div class="particle" *ngFor="let i of [1,2,3,4,5,6,7,8]" [style.animation-delay]="(i * 0.5) + 's'"></div>
        </div>
      </div>

      <!-- Mission & Vision Section -->
      <div class="mission-vision">
        <div class="container">
          <div class="mission-card animate-on-scroll" data-delay="0">
            <div class="icon">
              <i class="fas fa-bullseye"></i>
            </div>
            <h3>Our Mission</h3>
            <p>To bridge healthcare gaps between Libya and Tunisia by providing accessible, high-quality oncology care and home healthcare services, ensuring every patient receives the specialized treatment they deserve regardless of geographical barriers.</p>
          </div>
          
          <div class="vision-card animate-on-scroll" data-delay="200">
            <div class="icon">
              <i class="fas fa-eye"></i>
            </div>
            <h3>Our Vision</h3>
            <p>To become the leading digital health platform in North Africa, connecting patients with world-class specialists and revolutionizing how healthcare is delivered across borders.</p>
          </div>
        </div>
      </div>

      <!-- Story Section -->
      <div class="story-section">
        <div class="container">
          <h2 class="animate-on-scroll">Our Story</h2>
          <div class="story-content">
            <div class="story-text animate-on-scroll" data-delay="0">
              <p>ChifaaCare was born from a simple yet powerful observation: the healthcare needs of Libyan patients often exceeded the local capacity, while just across the border in Tunisia, world-class oncology specialists were available but inaccessible due to geographical and logistical barriers.</p>
              
              <p>Founded by a team of healthcare professionals, technology experts, and entrepreneurs from both countries, ChifaaCare emerged as a solution to bridge this critical gap. We recognized that the future of healthcare lies not in building more hospitals, but in connecting existing expertise with patients who need it most.</p>
              
              <p>Today, we're proud to serve as the digital bridge between Libyan patients and Tunisian specialists, while empowering local Libyan clinics to deliver world-class home care services. Our platform represents the convergence of medical expertise, cutting-edge technology, and compassionate care delivery.</p>
            </div>
            <div class="story-image animate-on-scroll" data-delay="400">
              <div class="image-placeholder">
                <i class="fas fa-heartbeat"></i>
                <p>Healthcare Innovation</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Values Section -->
      <div class="values-section">
        <div class="container">
          <h2 class="animate-on-scroll">Our Core Values</h2>
          <div class="values-grid">
            <div class="value-item animate-on-scroll" data-delay="0">
              <div class="value-icon">
                <i class="fas fa-heart"></i>
              </div>
              <h4>Patient-Centered Care</h4>
              <p>Every decision we make is guided by what's best for our patients and their families.</p>
            </div>
            
            <div class="value-item animate-on-scroll" data-delay="100">
              <div class="value-icon">
                <i class="fas fa-handshake"></i>
              </div>
              <h4>Collaboration</h4>
              <p>We believe in the power of partnership between healthcare providers, technology, and communities.</p>
            </div>
            
            <div class="value-item animate-on-scroll" data-delay="200">
              <div class="value-icon">
                <i class="fas fa-shield-alt"></i>
              </div>
              <h4>Trust & Security</h4>
              <p>We maintain the highest standards of data security and medical confidentiality.</p>
            </div>
            
            <div class="value-item animate-on-scroll" data-delay="300">
              <div class="value-icon">
                <i class="fas fa-lightbulb"></i>
              </div>
              <h4>Innovation</h4>
              <p>We continuously seek new ways to improve healthcare delivery and patient outcomes.</p>
            </div>
            
            <div class="value-item animate-on-scroll" data-delay="400">
              <div class="value-icon">
                <i class="fas fa-globe-africa"></i>
              </div>
              <h4>Regional Impact</h4>
              <p>We're committed to strengthening healthcare systems across North Africa.</p>
            </div>
            
            <div class="value-item animate-on-scroll" data-delay="500">
              <div class="value-icon">
                <i class="fas fa-award"></i>
              </div>
              <h4>Excellence</h4>
              <p>We strive for excellence in every aspect of our service delivery and platform development.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Impact Section removed per request -->

      <!-- Team Section -->
      <div class="team-section">
        <div class="container">
          <h2 class="animate-on-scroll">Leadership Team</h2>
          <div class="team-grid">
            <div class="team-member animate-on-scroll" data-delay="0">
              <div class="member-photo">
                <i class="fas fa-user-md"></i>
              </div>
              <h4>Dr. Ahmed Ben Salem</h4>
              <p class="position">Chief Medical Officer</p>
              <p class="bio">Leading oncologist with 20+ years of experience in cancer treatment and telemedicine innovation.</p>
            </div>
            
            <div class="team-member animate-on-scroll" data-delay="200">
              <div class="member-photo">
                <i class="fas fa-user-tie"></i>
              </div>
              <h4>Fatima Al-Zahra</h4>
              <p class="position">Chief Executive Officer</p>
              <p class="bio">Healthcare technology entrepreneur passionate about bridging healthcare gaps in North Africa.</p>
            </div>
            
            <div class="team-member animate-on-scroll" data-delay="400">
              <div class="member-photo">
                <i class="fas fa-laptop-code"></i>
              </div>
              <h4>Omar Mansouri</h4>
              <p class="position">Chief Technology Officer</p>
              <p class="bio">Technology leader with expertise in healthcare platforms and secure telemedicine solutions.</p>
            </div>
            
            <div class="team-member animate-on-scroll" data-delay="600">
              <div class="member-photo">
                <i class="fas fa-user-nurse"></i>
              </div>
              <h4>Dr. Leila Trabelsi</h4>
              <p class="position">Head of Clinical Operations</p>
              <p class="bio">Experienced healthcare administrator focused on optimizing care delivery and patient outcomes.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA Section (redesigned) -->
      <div class="cta-section">
        <div class="container">
          <div class="cta-inner animate-on-scroll" data-delay="0">
            <div class="badge">Ready to start?</div>
            <h3 class="cta-title">Join Us in Transforming Healthcare</h3>
            <p class="cta-subtitle">Whether you're a healthcare provider, patient, or partner, be part of the healthcare revolution across North Africa.</p>

            <div class="cta-actions">
              <a routerLink="/services" class="btn btn-primary">
                <i class="fas fa-stethoscope"></i>
                Explore Our Services
              </a>
              <a routerLink="/contact" class="btn btn-outline">
                <i class="fas fa-envelope"></i>
                Get in Touch
              </a>
            </div>
          </div>
        </div>
        <div class="cta-accent"></div>
      </div>
    </div>

    <!-- Footer -->
    <app-footer></app-footer>
  `,
  styles: [`
    .about-page {
      background: #f8fafc;
      min-height: 100vh;
    }

    .about-hero {
      background: linear-gradient(135deg, #1f2937, #374151);
      color: white;
      padding: 120px 2rem 4rem;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .hero-particles {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    .particle {
      position: absolute;
      width: 4px;
      height: 4px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      animation: float-particle 6s ease-in-out infinite;
    }

    .particle:nth-child(1) { top: 20%; left: 10%; }
    .particle:nth-child(2) { top: 60%; left: 20%; }
    .particle:nth-child(3) { top: 40%; left: 80%; }
    .particle:nth-child(4) { top: 80%; left: 70%; }
    .particle:nth-child(5) { top: 30%; left: 50%; }
    .particle:nth-child(6) { top: 70%; left: 90%; }
    .particle:nth-child(7) { top: 10%; left: 30%; }
    .particle:nth-child(8) { top: 90%; left: 40%; }

    @keyframes float-particle {
      0%, 100% { transform: translateY(0px) scale(1); opacity: 0.3; }
      50% { transform: translateY(-20px) scale(1.2); opacity: 0.6; }
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
      max-width: 700px;
      margin: 0 auto;
      line-height: 1.6;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .mission-vision {
      padding: 4rem 0;
      background: white;
      position: relative;
    }

    .mission-vision::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
    }

    .mission-vision .container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 3rem;
    }

    .mission-card, .vision-card {
      text-align: center;
      padding: 3rem 2rem;
      border-radius: 20px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      opacity: 0;
      transform: translateY(50px);
      position: relative;
      overflow: hidden;
    }

    .mission-card::before, .vision-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s;
    }

    .mission-card:hover::before, .vision-card:hover::before {
      left: 100%;
    }

    .mission-card.animate-in, .vision-card.animate-in {
      opacity: 1;
      transform: translateY(0);
    }

    .mission-card {
      background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
      border: 2px solid #2563eb;
    }

    .vision-card {
      background: linear-gradient(135deg, #f0fdf4, #dcfce7);
      border: 2px solid #10b981;
    }

    .mission-card:hover, .vision-card:hover {
      transform: translateY(-15px) scale(1.02);
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
    }

    .icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #2563eb, #10b981);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      transition: all 0.3s ease;
    }

    .mission-card:hover .icon, .vision-card:hover .icon {
      transform: scale(1.1) rotate(5deg);
      box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
    }

    .icon i {
      font-size: 2rem;
      color: white;
      transition: all 0.3s ease;
    }

    .mission-card:hover .icon i, .vision-card:hover .icon i {
      transform: scale(1.1);
    }

    .mission-card h3, .vision-card h3 {
      font-size: 1.8rem;
      color: #1f2937;
      margin-bottom: 1rem;
      font-weight: 600;
      transition: color 0.3s ease;
    }

    .mission-card:hover h3, .vision-card:hover h3 {
      color: #2563eb;
    }

    .mission-card p, .vision-card p {
      color: #374151;
      line-height: 1.6;
      font-size: 1.1rem;
    }

    .story-section {
      padding: 4rem 0;
      background: #f1f5f9;
      position: relative;
    }

    .story-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
    }

    .story-section h2 {
      font-size: 2.5rem;
      color: #1f2937;
      text-align: center;
      margin-bottom: 3rem;
      font-weight: 600;
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.8s ease-out;
    }

    .story-section h2.animate-in {
      opacity: 1;
      transform: translateY(0);
    }

    .story-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 3rem;
      align-items: center;
    }

    .story-text {
      opacity: 0;
      transform: translateX(-30px);
      transition: all 0.8s ease-out;
    }

    .story-text.animate-in {
      opacity: 1;
      transform: translateX(0);
    }

    .story-text p {
      color: #374151;
      line-height: 1.8;
      margin-bottom: 1.5rem;
      font-size: 1.1rem;
      transition: all 0.3s ease;
    }

    .story-text p:hover {
      color: #1f2937;
      transform: translateX(5px);
    }

    .story-image {
      text-align: center;
      opacity: 0;
      transform: translateX(30px);
      transition: all 0.8s ease-out;
    }

    .story-image.animate-in {
      opacity: 1;
      transform: translateX(0);
    }

    .image-placeholder {
      width: 200px;
      height: 200px;
      background: linear-gradient(135deg, #2563eb, #10b981);
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      margin: 0 auto;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .image-placeholder::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
      animation: rotate 20s linear infinite;
    }

    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .story-image:hover .image-placeholder {
      transform: scale(1.1) rotate(5deg);
      box-shadow: 0 15px 35px rgba(37, 99, 235, 0.3);
    }

    .image-placeholder i {
      font-size: 3rem;
      margin-bottom: 1rem;
      position: relative;
      z-index: 2;
      transition: all 0.3s ease;
    }

    .story-image:hover .image-placeholder i {
      transform: scale(1.1);
    }

    .image-placeholder p {
      font-size: 0.9rem;
      opacity: 0.9;
      position: relative;
      z-index: 2;
    }

    .values-section {
      padding: 4rem 0;
      background: white;
      position: relative;
    }

    .values-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
    }

    .values-section h2 {
      font-size: 2.5rem;
      color: #1f2937;
      text-align: center;
      margin-bottom: 3rem;
      font-weight: 600;
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.8s ease-out;
    }

    .values-section h2.animate-in {
      opacity: 1;
      transform: translateY(0);
    }

    .values-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .value-item {
      text-align: center;
      padding: 2rem;
      border-radius: 15px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      opacity: 0;
      transform: translateY(30px);
      position: relative;
      overflow: hidden;
    }

    .value-item::before {
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

    .value-item.animate-in {
      opacity: 1;
      transform: translateY(0);
    }

    .value-item:hover {
      transform: translateY(-10px) scale(1.02);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
    }

    .value-item:hover::before {
      opacity: 1;
    }

    .value-icon {
      width: 70px;
      height: 70px;
      background: linear-gradient(135deg, #2563eb, #10b981);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      transition: all 0.3s ease;
    }

    .value-item:hover .value-icon {
      transform: scale(1.1) rotate(5deg);
      box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
    }

    .value-icon i {
      font-size: 1.8rem;
      color: white;
      transition: all 0.3s ease;
    }

    .value-item:hover .value-icon i {
      transform: scale(1.1);
    }

    .value-item h4 {
      color: #1f2937;
      margin-bottom: 1rem;
      font-weight: 600;
      font-size: 1.2rem;
      transition: color 0.3s ease;
    }

    .value-item:hover h4 {
      color: #2563eb;
    }

    .value-item p {
      color: #6b7280;
      line-height: 1.6;
      transition: color 0.3s ease;
    }

    .value-item:hover p {
      color: #374151;
    }

    .impact-section {
      padding: 4rem 0;
      background: linear-gradient(135deg, #2563eb, #10b981);
      color: white;
      position: relative;
      overflow: hidden;
    }

    .impact-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23dots)"/></svg>');
      animation: float 15s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }

    .impact-section h2 {
      font-size: 2.5rem;
      text-align: center;
      margin-bottom: 3rem;
      font-weight: 600;
      position: relative;
      z-index: 2;
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.8s ease-out;
    }

    .impact-section h2.animate-in {
      opacity: 1;
      transform: translateY(0);
    }

    .impact-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
      text-align: center;
      position: relative;
      z-index: 2;
    }

    .stat-item {
      padding: 1rem;
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.6s ease-out;
    }

    .stat-item.animate-in {
      opacity: 1;
      transform: translateY(0);
    }

    .stat-number {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      transition: all 0.3s ease;
    }

    .stat-item:hover .stat-number {
      transform: scale(1.1);
      text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
    }

    .stat-label {
      font-size: 1.1rem;
      opacity: 0.9;
      transition: opacity 0.3s ease;
    }

    .stat-item:hover .stat-label {
      opacity: 1;
    }

    .team-section {
      padding: 4rem 0;
      background: white;
      position: relative;
    }

    .team-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
    }

    .team-section h2 {
      font-size: 2.5rem;
      color: #1f2937;
      text-align: center;
      margin-bottom: 3rem;
      font-weight: 600;
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.8s ease-out;
    }

    .team-section h2.animate-in {
      opacity: 1;
      transform: translateY(0);
    }

    .team-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
    }

    .team-member {
      text-align: center;
      padding: 2rem;
      border-radius: 15px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      opacity: 0;
      transform: translateY(30px);
      position: relative;
      overflow: hidden;
    }

    .team-member::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(37, 99, 235, 0.1), transparent);
      transition: left 0.5s;
    }

    .team-member:hover::before {
      left: 100%;
    }

    .team-member.animate-in {
      opacity: 1;
      transform: translateY(0);
    }

    .team-member:hover {
      transform: translateY(-10px) scale(1.02);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
    }

    .member-photo {
      width: 100px;
      height: 100px;
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

    .member-photo::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
      animation: rotate 15s linear infinite;
    }

    .team-member:hover .member-photo {
      transform: scale(1.1) rotate(5deg);
      box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
    }

    .member-photo i {
      font-size: 2.5rem;
      color: white;
      position: relative;
      z-index: 2;
      transition: all 0.3s ease;
    }

    .team-member:hover .member-photo i {
      transform: scale(1.1);
    }

    .team-member h4 {
      color: #1f2937;
      margin-bottom: 0.5rem;
      font-weight: 600;
      font-size: 1.2rem;
      transition: color 0.3s ease;
    }

    .team-member:hover h4 {
      color: #2563eb;
    }

    .position {
      color: #2563eb;
      font-weight: 600;
      margin-bottom: 1rem;
      font-size: 0.9rem;
      transition: color 0.3s ease;
    }

    .team-member:hover .position {
      color: #1d4ed8;
    }

    .bio {
      color: #6b7280;
      line-height: 1.6;
      font-size: 0.9rem;
      transition: color 0.3s ease;
    }

    .team-member:hover .bio {
      color: #374151;
    }

    .cta-section {
      background: radial-gradient(1200px 400px at 50% 0%, rgba(37, 99, 235, 0.15), transparent),
                  radial-gradient(1200px 400px at 50% 100%, rgba(16, 185, 129, 0.15), transparent),
                  linear-gradient(135deg, #1f2937, #374151);
      color: #fff;
      padding: 5rem 0;
      position: relative;
      overflow: hidden;
    }

    .cta-accent {
      position: absolute;
      inset: 0;
      background: radial-gradient(600px 200px at 10% 10%, rgba(255,255,255,0.06), transparent),
                  radial-gradient(600px 200px at 90% 90%, rgba(255,255,255,0.06), transparent);
      pointer-events: none;
    }

    .cta-inner {
      margin: 0 auto;
      max-width: 920px;
      padding: 2.5rem;
      border-radius: 24px;
      background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04));
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.12);
      box-shadow: 0 20px 60px rgba(0,0,0,0.35);
      text-align: center;
    }

    .badge {
      display: inline-block;
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.02em;
      color: #0ea5e9;
      background: rgba(14,165,233,0.15);
      border: 1px solid rgba(14,165,233,0.35);
      margin-bottom: 1rem;
    }

    .cta-title {
      font-size: 2.25rem;
      font-weight: 700;
      margin: 0 0 0.75rem;
      background: linear-gradient(135deg, #ffffff, #e0f2fe);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .cta-subtitle {
      font-size: 1.125rem;
      color: rgba(255,255,255,0.85);
      max-width: 680px;
      margin: 0 auto 1.75rem;
      line-height: 1.7;
    }

    .cta-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
      margin-top: 0.5rem;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.875rem 1.5rem;
      border-radius: 14px;
      text-decoration: none;
      font-weight: 700;
      letter-spacing: 0.02em;
      transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
      box-shadow: 0 10px 25px rgba(0,0,0,0.25);
    }

    .btn i { font-size: 1rem; }

    .btn-primary {
      background: linear-gradient(135deg, #2563eb, #10b981);
      color: #fff;
      border: 1px solid rgba(255,255,255,0.2);
    }

    .btn-primary:hover {
      transform: translateY(-3px);
      box-shadow: 0 16px 40px rgba(37, 99, 235, 0.35);
    }

    .btn-outline {
      background: rgba(255,255,255,0.06);
      color: #fff;
      border: 1px solid rgba(255,255,255,0.25);
    }

    .btn-outline:hover {
      background: rgba(255,255,255,0.12);
      transform: translateY(-3px);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
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
      
      .mission-vision .container {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
      
      .story-content {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
      
      .values-grid {
        grid-template-columns: 1fr;
      }
      
      .team-grid {
        grid-template-columns: 1fr;
      }
      
      .cta-buttons {
        flex-direction: column;
        align-items: center;
      }
    }
  `]
})
export class AboutComponent implements OnInit, OnDestroy {
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