import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { TreatmentService, TreatmentPlan, Medication, TreatmentNote } from '../../../services/treatment.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-treatment-plan',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule],
  template: `
    <section class="container">
      <div class="card lift" *ngIf="loading">
        <div class="card-header">Loading Treatment Plan…</div>
        <div class="skeleton" style="height:16px;width:60%;margin:8px 0"></div>
        <div class="skeleton" style="height:16px;width:40%;margin:8px 0"></div>
      </div>

      <div class="card lift" *ngIf="error">
        <div class="card-header" style="color:var(--c-red)">Error</div>
        <div>{{ error }}</div>
      </div>

      <ng-container *ngIf="!loading && !error">
        <div class="card lift" *ngIf="currentPlan; else noPlan">
          <div class="card-header">Treatment Plan — {{ currentPlan.title }}</div>
          <div class="muted" style="margin-bottom:8px;">
            {{ currentPlan.diagnosis || '—' }}
          </div>
          <div class="badge badge-green" *ngIf="currentPlan.status === 'ACTIVE'">Active</div>
          <div class="badge" *ngIf="currentPlan.status !== 'ACTIVE'">{{ currentPlan.status }}</div>
        </div>

        <ng-template #noPlan>
          <div class="card lift">
            <div class="card-header">No Treatment Plan</div>
            <p class="muted">You currently have no active treatment plans.</p>
          </div>
        </ng-template>

        <!-- Medications -->
        <div class="card lift">
          <div class="card-header">Medications</div>
          <table *ngIf="medications.length; else noMeds" style="width:100%;border-collapse:separate;border-spacing:0 8px;">
            <thead>
              <tr style="color:var(--c-blue);text-align:left">
                <th>Name</th><th>Dosage</th><th>Frequency</th><th>Active</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let m of medications">
                <td>{{ m.name }}</td>
                <td>{{ m.dose || '—' }}</td>
                <td>{{ m.frequency || '—' }}</td>
                <td>
                  <span class="badge" [class.badge-green]="m.isActive" [class.badge-blue]="!m.isActive">{{ m.isActive ? 'Yes' : 'No' }}</span>
                </td>
              </tr>
            </tbody>
          </table>
          <ng-template #noMeds>
            <div class="muted">No medications found.</div>
          </ng-template>
        </div>

        <!-- Notes -->
        <div class="card lift">
          <div class="card-header">Doctor Notes</div>
          <div *ngIf="notes.length; else noNotes" style="display:flex;flex-direction:column;gap:8px;">
            <div *ngFor="let n of notes" style="background:rgba(52,152,219,.06);padding:12px;border-radius:12px;">
              <span *ngIf="n.isImportant" class="badge badge-blue" style="margin-right:6px;">Important</span>
              {{ n.content }}
            </div>
          </div>
          <ng-template #noNotes><div class="muted">No notes yet.</div></ng-template>
          <button class="btn btn-green" style="margin-top:12px;" (click)="downloadPdf()">Download PDF</button>
        </div>
      </ng-container>
    </section>
  `,
  styles: [`:host{display:block}`]
})
export class TreatmentPlanComponent implements OnInit {
  loading = false;
  error: string | null = null;
  currentPlan: TreatmentPlan | null = null;
  medications: Medication[] = [];
  notes: TreatmentNote[] = [];

  constructor(private treatment: TreatmentService, private auth: AuthService) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    if (!user) {
      this.error = 'You must be logged in to view treatment plans.';
      return;
    }

    this.loading = true;
    this.treatment.listPlans({ patientId: user.id }).subscribe({
      next: (plans) => {
        this.currentPlan = plans?.[0] || null;
        if (this.currentPlan) {
          this.loadDetails(this.currentPlan.id);
        } else {
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error loading plans', err);
        this.error = 'Failed to load treatment plans.';
        this.loading = false;
      }
    });
  }

  private loadDetails(planId: string) {
    Promise.all([
      this.treatment.listMedications(planId).toPromise(),
      this.treatment.listNotes(planId).toPromise(),
    ]).then(([meds, notes]) => {
      this.medications = meds || [];
      this.notes = notes || [];
      this.loading = false;
    }).catch(err => {
      console.error('Error loading plan details', err);
      this.error = 'Failed to load plan details.';
      this.loading = false;
    });
  }

  downloadPdf() {
    // Minimal placeholder for now: print page section
    window.print();
  }
}
