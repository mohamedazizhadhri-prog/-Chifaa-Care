import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { NurseNouraComponent } from './components/nurse-noura/nurse-noura.component';
import { DnaScrollComponent } from './components/dna-scroll/dna-scroll.component';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, NurseNouraComponent, DnaScrollComponent],
  template: `
    <app-navbar></app-navbar>
    <main>
      <router-outlet></router-outlet>
    </main>
    <!-- Global Nurse Noura Chatbot -->
    <app-nurse-noura></app-nurse-noura>
    <!-- DNA Scroll Button -->
    <app-dna-scroll></app-dna-scroll>
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