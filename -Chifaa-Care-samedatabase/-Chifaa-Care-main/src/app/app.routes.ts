import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent) },
  { path: 'about', loadComponent: () => import('./components/about/about.component').then(m => m.AboutComponent) },
  { path: 'services', loadComponent: () => import('./components/services/services.component').then(m => m.ServicesComponent) },
  { path: 'team', loadComponent: () => import('./components/team/team.component').then(m => m.TeamComponent) },
  { path: 'contact', loadComponent: () => import('./components/contact/contact.component').then(m => m.ContactComponent) },
  
  // Doctor routes
  { 
    path: 'doctor', 
    children: [
      { 
        path: 'consultations', 
        loadComponent: () => import('./features/doctor/consultations/consultations.component').then(m => m.ConsultationsComponent) 
      },
      // Add more doctor routes here as needed
    ]
  },
  
  // Wildcard route must be last
  { path: '**', redirectTo: '/home' }
];