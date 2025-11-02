import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PatientService } from '../../../services/patient.service';

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="grid">
      <div class="card lift" *ngIf="loading">
        <div class="card-header">Loading...</div>
        <div>Please wait</div>
      </div>

      <div class="card lift" *ngIf="error">
        <div class="card-header">Error</div>
        <div>{{ error }}</div>
      </div>

      <ng-container *ngIf="!loading && !error && patient">
        <div class="card lift" style="background:rgba(52,152,219,.06)">
          <div class="card-header">{{ patient.firstName }} {{ patient.lastName }}</div>
          <div>
            Email: {{ patient.email }}
            <span *ngIf="patient.patientProfile?.bloodType"> • Blood {{ patient.patientProfile?.bloodType }}</span>
          </div>
        </div>

        <div class="card lift">
          <div class="card-header">Patient Profile</div>
          <div class="grid cols-2">
            <div><strong>Gender:</strong> {{ patient.gender || '—' }}</div>
            <div><strong>Phone:</strong> {{ patient.phone || '—' }}</div>
            <div><strong>Allergies:</strong> {{ patient.patientProfile?.allergies || '—' }}</div>
            <div><strong>Medications:</strong> {{ patient.patientProfile?.medications || '—' }}</div>
          </div>
        </div>

        <div class="card lift">
          <div class="card-header">Upcoming Appointments</div>
          <div *ngIf="(patient.patientAppointments || []).length === 0" class="muted">No upcoming appointments</div>
          <div class="grid" style="gap:8px" *ngIf="(patient.patientAppointments || []).length > 0">
            <div class="card" *ngFor="let a of patient.patientAppointments">
              <div><strong>{{ (a.appointmentDate | date:'mediumDate') }}</strong> at {{ (a.appointmentDate | date:'shortTime') }}</div>
              <div class="muted">With Dr. {{ a.doctor?.firstName }} {{ a.doctor?.lastName }}</div>
              <div>Status: {{ a.status }}</div>
            </div>
          </div>
        </div>
      </ng-container>
    </section>
  `,
  styles: [`:host{display:block}`]
})
export class PatientProfileComponent implements OnInit {
  patient: any = null;
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Invalid patient id';
      return;
    }
    this.loading = true;
    this.patientService.getPatientById(id).subscribe({
      next: (data) => { this.patient = data; this.loading = false; },
      error: (err) => { console.error(err); this.error = 'Failed to load patient profile'; this.loading = false; }
    });
  }
}
