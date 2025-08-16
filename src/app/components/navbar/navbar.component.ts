import { Component, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { LoginModalComponent } from '../login-modal/login-modal.component';
import { AuthService, User } from '../../services/auth.service';

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

        <!-- Auth Area -->
        <div class="navbar-auth" *ngIf="!(currentUser); else userBadgeTpl">
          <button class="signup-btn" (click)="authModal.switchMode('signup'); openLoginModal()">
            <i class="fas fa-user-plus"></i>
            Sign Up
          </button>
          <button class="login-btn" (click)="authModal.switchMode('login'); openLoginModal()">
            <i class="fas fa-user"></i>
            Login
          </button>
        </div>
        <ng-template #userBadgeTpl>
          <div class="nav-user-wrap" #userBadgeRef>
            <button class="nav-user-badge" type="button" (click)="toggleUserMenu()" [class.patient]="currentUser?.role==='patient'" [class.doctor]="currentUser?.role==='doctor'">
              <div class="nav-id-badge">
                <div class="strap"></div>
                <div class="clip"></div>
                <div class="emblem">
                  <span class="cross"></span>
                </div>
                <div class="id-lines">
                  <div class="id-name">{{ currentUser?.name }}</div>
                  <div class="id-role" [class.patient]="currentUser?.role==='patient'" [class.doctor]="currentUser?.role==='doctor'">{{ currentUser?.role | titlecase }}</div>
                </div>
              </div>
              <i class="fas fa-chevron-down caret" [class.open]="isUserMenuOpen"></i>
            </button>
            <div class="user-menu" *ngIf="isUserMenuOpen">
              <button class="user-menu__item" type="button" (click)="onAccount()">
                <i class="fas fa-user-circle"></i>
                Account
              </button>
              <button class="user-menu__item danger" type="button" (click)="logout()">
                <i class="fas fa-sign-out-alt"></i>
                Log out
              </button>
            </div>
          </div>
        </ng-template>

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
        <ng-container *ngIf="!currentUser; else mobileUser">
          <button class="mobile-signup-btn" (click)="authModal.switchMode('signup'); openLoginModal(); closeMobileMenu()">
            <i class="fas fa-user-plus"></i>
            Sign Up
          </button>
          <button class="mobile-login-btn" (click)="authModal.switchMode('login'); openLoginModal(); closeMobileMenu()">
            <i class="fas fa-user"></i>
            Login
          </button>
        </ng-container>
        <ng-template #mobileUser>
          <div class="nav-user-badge" [class.patient]="currentUser?.role==='patient'" [class.doctor]="currentUser?.role==='doctor'">
            <div class="nav-id-badge">
              <div class="strap"></div>
              <div class="clip"></div>
              <div class="emblem"><span class="cross"></span></div>
              <div class="id-lines">
                <div class="id-name">{{ currentUser?.name }}</div>
                <div class="id-role" [class.patient]="currentUser?.role==='patient'" [class.doctor]="currentUser?.role==='doctor'">{{ currentUser?.role | titlecase }}</div>
              </div>
            </div>
          </div>
        </ng-template>
      </div>
    </nav>

    <!-- Login Modal -->
    <app-login-modal 
      #authModal
      [isOpen]="isLoginModalOpen" 
      (close)="closeLoginModal()"
      (animationStart)="onAuthAnimation($event)">
    </app-login-modal>

    <!-- Global centered badge overlay during auth animation -->
    <div class="auth-badge-portal" *ngIf="showBadgeOverlay">
      <div class="auth-badge-portal__backdrop"></div>
      <div class="auth-badge-portal__center">
        <div class="id-badge" [class.patient]="overlayRole==='patient'" [class.doctor]="overlayRole==='doctor'" [class.slideUp]="overlaySlideUp">
          <div class="scanner" [class.scan]="overlayScanner"></div>
          <img class="avatar" [src]="getRoleAvatar(overlayRole)" (error)="onAvatarError($event, overlayRole)" alt="User avatar" />
          <div class="badge-info">
            <div class="name">{{ overlayName }}</div>
            <div class="role" [class.role-patient]="overlayRole==='patient'" [class.role-doctor]="overlayRole==='doctor'">{{ overlayRole | titlecase }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  isScrolled = false;
  isMobileMenuOpen = false;
  isLoginModalOpen = false;
  currentUser: User | null = null;

  // Overlay animation state
  showBadgeOverlay = false;
  overlayRole: 'patient' | 'doctor' = 'patient';
  overlayName = '';
  overlayScanner = false;
  overlaySlideUp = false;
  isUserMenuOpen = false;
  @ViewChild('userBadgeRef') userBadgeRef?: ElementRef;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.auth.currentUser$.subscribe(u => this.currentUser = u);
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

  onAuthAnimation(evt: { role: 'patient'|'doctor'; name: string; durationMs: number }) {
    // Immediately hide modal
    this.isLoginModalOpen = false;
    // Configure overlay
    this.overlayRole = evt.role;
    this.overlayName = evt.name;
    this.showBadgeOverlay = true;
    // start scanner and slide timings
    setTimeout(() => this.overlayScanner = true, 100);
    setTimeout(() => this.overlaySlideUp = true, 1400);
    // remove overlay after total duration
    setTimeout(() => { this.showBadgeOverlay = false; this.overlayScanner = false; this.overlaySlideUp = false; }, evt.durationMs);
  }

  getRoleAvatar(role?: 'patient'|'doctor'): string {
    // Prefer PNG if available (as per user's provided assets), otherwise fall back to SVG
    return role === 'doctor' ? 'assets/avatars/doc.png' : 'assets/avatars/pat.png';
  }

  onAvatarError(ev: Event, role?: 'patient'|'doctor') {
    const img = ev.target as HTMLImageElement;
    // Fallback to SVG if PNG missing
    img.src = role === 'doctor' ? 'assets/avatars/doc.svg' : 'assets/avatars/pat.svg';
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent) {
    if (!this.isUserMenuOpen) return;
    const host = this.userBadgeRef?.nativeElement as HTMLElement | undefined;
    if (host && ev.target instanceof Node && !host.contains(ev.target)) {
      this.isUserMenuOpen = false;
    }
  }

  onAccount() {
    this.isUserMenuOpen = false;
    this.router.navigate(['/account']);
  }

  logout() {
    this.auth.logout();
    this.isUserMenuOpen = false;
  }
}