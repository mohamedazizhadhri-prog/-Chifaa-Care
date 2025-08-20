import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LoginModalComponent } from '../login-modal/login-modal.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LoginModalComponent],
  template: `
    <nav class="navbar" [class.scrolled]="isScrolled">
      <div class="navbar-container">
        <!-- Logo -->
        <div class="navbar-logo">
          <i class="fas fa-heartbeat"></i>
          <span>ChifaaCare</span>
        </div>

        <!-- Navigation Links -->
        <div class="navbar-links">
          <a routerLink="/home" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Home</a>
          <a routerLink="/about" routerLinkActive="active">About</a>
          <a routerLink="/services" routerLinkActive="active">Services</a>
          <a routerLink="/team" routerLinkActive="active">Team</a>
          <a routerLink="/contact" routerLinkActive="active">Contact</a>
        </div>

        <!-- Login Button -->
        <div class="navbar-auth">
          <button class="login-btn" (click)="openLoginModal()">
            <i class="fas fa-user"></i>
            Login
          </button>
        </div>

        <!-- Mobile Menu Toggle -->
        <div class="navbar-toggle" (click)="toggleMobileMenu()">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div class="mobile-menu" [class.active]="isMobileMenuOpen">
        <a routerLink="/home" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeMobileMenu()">Home</a>
        <a routerLink="/about" routerLinkActive="active" (click)="closeMobileMenu()">About</a>
        <a routerLink="/services" routerLinkActive="active" (click)="closeMobileMenu()">Services</a>
        <a routerLink="/team" routerLinkActive="active" (click)="closeMobileMenu()">Team</a>
        <a routerLink="/contact" routerLinkActive="active" (click)="closeMobileMenu()">Contact</a>
        <button class="mobile-login-btn" (click)="openLoginModal(); closeMobileMenu()">
          <i class="fas fa-user"></i>
          Login
        </button>
      </div>
    </nav>

    <!-- Login Modal -->
    <app-login-modal 
      [isOpen]="isLoginModalOpen" 
      (closeModalEvent)="closeLoginModal()">
    </app-login-modal>
  `,
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  isScrolled = false;
  isMobileMenuOpen = false;
  isLoginModalOpen = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  ngOnInit() {
    setTimeout(() => {
      const navbar = document.querySelector('.navbar');
      if (navbar) {
        navbar.classList.add('fade-in');
      }
    }, 100);
  }

  openLoginModal() {
    this.isLoginModalOpen = true;
  }

  closeLoginModal() {
    this.isLoginModalOpen = false;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }
} 