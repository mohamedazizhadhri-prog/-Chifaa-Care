import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <main>
      <router-outlet></router-outlet>
    </main>
    <!-- Optional: Nurse Noura and DNA Scroll temporarily disabled until converted to standalone -->
    <!-- <app-nurse-noura></app-nurse-noura> -->
    <!-- <app-dna-scroll></app-dna-scroll> -->
  `,
  styles: [`
    main {
      min-height: 100vh;
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'chifaacare-homepage';
  constructor(private router: Router) {}

  ngOnInit() {
    // Listen to navigation events and force page refresh
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Force page reload on route change
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
    });
  }
}