import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginComponent } from '../login/login.component';
import { SignupComponent } from '../signup/signup.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, LoginComponent, SignupComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  isMenuOpen = false;
  isLoginModalOpen = false;
  isSignupModalOpen = false;
  currentUser$ = this.authService.currentUser$;
  isAuthenticated$ = this.authService.isAuthenticated();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  openLoginModal(): void {
    this.isLoginModalOpen = true;
    this.isMenuOpen = false;
  }

  closeLoginModal(): void {
    this.isLoginModalOpen = false;
  }

  openSignupModal(): void {
    this.isSignupModalOpen = true;
    this.isMenuOpen = false;
  }

  closeSignupModal(): void {
    this.isSignupModalOpen = false;
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        this.router.navigate(['/login']);
      }
    });
  }

  navigateToDashboard(): void {
    this.currentUser$.subscribe(user => {
      if (user) {
        if (user.role === 'PATIENT') {
          this.router.navigate(['/patient-dashboard']);
        } else if (user.role === 'DOCTOR') {
          this.router.navigate(['/doctor-dashboard']);
        }
      }
    }).unsubscribe();
  }

  onLoginSuccess(): void {
    this.closeLoginModal();
    this.navigateToDashboard();
  }

  onSignupSuccess(): void {
    this.closeSignupModal();
    this.navigateToDashboard();
  }

  onAuthError(): void {
    this.closeLoginModal();
    this.closeSignupModal();
  }
} 