import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroComponent } from '../hero/hero.component';
import { ProblemComponent } from '../problem/problem.component';
import { SolutionComponent } from '../solution/solution.component';
import { HowItWorksComponent } from '../how-it-works/how-it-works.component';
import { ValuePropComponent } from '../value-prop/value-prop.component';
import { TeamComponent } from '../team/team.component';
import { CtaComponent } from '../cta/cta.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeroComponent,
    ProblemComponent,
    SolutionComponent,
    HowItWorksComponent,
    ValuePropComponent,
    TeamComponent,
    CtaComponent,
    FooterComponent
  ],
  template: `
    <app-hero></app-hero>
    <app-problem></app-problem>
    <app-solution></app-solution>
    <app-how-it-works></app-how-it-works>
    <app-value-prop></app-value-prop>
    <app-team></app-team>
    <app-cta></app-cta>
    <app-footer></app-footer>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class HomeComponent implements OnInit {
  ngOnInit() {
    // Add smooth scrolling to all anchor links
    this.setupSmoothScrolling();
  }

  private setupSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href') || '');
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }
} 