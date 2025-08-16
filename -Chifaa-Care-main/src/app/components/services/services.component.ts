import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="services-page">
      <div class="services-container">
        <h1>Our Services</h1>
        <p>This is a placeholder page for the Services section. Content will be added here.</p>
        <a routerLink="/home" class="back-link">← Back to Home</a>
      </div>
    </div>
  `,
  styles: [`
    .services-page {
      padding: 120px 2rem 4rem;
      min-height: 100vh;
      background: #f8fafc;
    }
    
    .services-container {
      max-width: 800px;
      margin: 0 auto;
      text-align: center;
    }
    
    h1 {
      font-size: 3rem;
      color: #1f2937;
      margin-bottom: 2rem;
    }
    
    p {
      font-size: 1.2rem;
      color: #6b7280;
      margin-bottom: 3rem;
    }
    
    .back-link {
      display: inline-block;
      padding: 1rem 2rem;
      background: linear-gradient(135deg, #2563eb, #10b981);
      color: white;
      text-decoration: none;
      border-radius: 50px;
      font-weight: 600;
      transition: all 0.3s ease;
    }
    
    .back-link:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 30px rgba(37, 99, 235, 0.3);
    }
  `]
})
export class ServicesComponent {} 