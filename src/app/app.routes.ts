import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent) },
  { path: 'about', loadComponent: () => import('./components/about/about.component').then(m => m.AboutComponent) },
  { path: 'services', loadComponent: () => import('./components/services/services.component').then(m => m.ServicesComponent) },
  { path: 'team', loadComponent: () => import('./components/team/team.component').then(m => m.TeamComponent) },
  { path: 'contact', loadComponent: () => import('./components/contact/contact.component').then(m => m.ContactComponent) },
  // Smart account redirect: sends user to the proper dashboard (or last visited portal page)
  { path: 'account', loadComponent: () => import('./shared/components/account-redirect/account-redirect.component').then(m => m.AccountRedirectComponent) },
  // Patient portal
  {
    path: 'patient',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    data: { role: 'patient' },
    loadComponent: () => import('./shared/components/portal-layout/portal-layout.component').then(m => m.PortalLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./portals/patient/dashboard/patient-dashboard.component').then(m => m.PatientDashboardComponent) },
      { path: 'book-consultation', loadComponent: () => import('./portals/patient/book-consultation/book-consultation.component').then(m => m.BookConsultationComponent) },
      { path: 'treatment-plan', loadComponent: () => import('./portals/patient/treatment-plan/treatment-plan.component').then(m => m.TreatmentPlanComponent) },
      { path: 'ai-reports', loadComponent: () => import('./portals/patient/ai-reports/ai-reports.component').then(m => m.AiReportsComponent) },
      { path: 'messages', loadComponent: () => import('./portals/patient/messages/messages.component').then(m => m.PatientMessagesComponent) },
      { path: 'medical-records', loadComponent: () => import('./portals/patient/medical-records/medical-records.component').then(m => m.MedicalRecordsComponent) },
      { path: 'partner-clinics', loadComponent: () => import('./portals/patient/partner-clinics/partner-clinics.component').then(m => m.PartnerClinicsComponent) },
      { path: 'settings', loadComponent: () => import('./portals/patient/settings/patient-settings.component').then(m => m.PatientSettingsComponent) },
    ]
  },
  // Doctor portal
  {
    path: 'doctor',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    data: { role: 'doctor' },
    loadComponent: () => import('./shared/components/portal-layout/portal-layout.component').then(m => m.PortalLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./portals/doctor/dashboard/doctor-dashboard.component').then(m => m.DoctorDashboardComponent) },
      { path: 'patients', loadComponent: () => import('./portals/doctor/patient-list/patient-list.component').then(m => m.PatientListComponent) },
      { path: 'patient-profile/:id', loadComponent: () => import('./portals/doctor/patient-profile/patient-profile.component').then(m => m.PatientProfileComponent) },
      { path: 'consultations', loadComponent: () => import('./portals/doctor/consultations/consultations.component').then(m => m.ConsultationsComponent) },
      { path: 'treatment-management', loadComponent: () => import('./portals/doctor/treatment-plan-management/treatment-plan-management.component').then(m => m.TreatmentPlanManagementComponent) },
      { path: 'ai-reports', loadComponent: () => import('./portals/doctor/ai-reports/doctor-ai-reports.component').then(m => m.DoctorAiReportsComponent) },
      { path: 'messages', loadComponent: () => import('./portals/doctor/messages/doctor-messages.component').then(m => m.DoctorMessagesComponent) },
      { path: 'settings', loadComponent: () => import('./portals/doctor/settings/doctor-settings.component').then(m => m.DoctorSettingsComponent) },
      { path: 'account', loadComponent: () => import('./shared/components/account-redirect/account-redirect.component').then(m => m.AccountRedirectComponent) },
    ]
  },
  { path: '**', redirectTo: '/home' }
]; 