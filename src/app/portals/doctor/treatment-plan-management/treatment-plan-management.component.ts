import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TreatmentService, TreatmentPlan, Medication, TreatmentNote } from '../../../services/treatment.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-treatment-plan-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  template: `
    <section class="container grid cols-2" style="gap:12px;">
      <!-- Create / Update Plan -->
      <form [formGroup]="planForm" class="card lift" (ngSubmit)="onSavePlan()" style="gap:12px;padding:12px;display:flex;flex-direction:column;">
        <div class="card-header">Treatment Plan Management</div>
        <label>Patient ID<br>
          <input formControlName="patientId" placeholder="patient-uuid" style="width:100%;padding:.7rem 1rem;border-radius:12px;border:1px solid #e5e7eb" />
        </label>
        <label>Title<br>
          <input formControlName="title" placeholder="e.g. Oncology Plan" style="width:100%;padding:.7rem 1rem;border-radius:12px;border:1px solid #e5e7eb" />
        </label>
        <label>Diagnosis<br>
          <input formControlName="diagnosis" placeholder="e.g. Breast cancer" style="width:100%;padding:.7rem 1rem;border-radius:12px;border:1px solid #e5e7eb" />
        </label>
        <label>Goals<br>
          <textarea formControlName="goals" rows="2" style="width:100%;padding:.7rem 1rem;border-radius:12px;border:1px solid #e5e7eb"></textarea>
        </label>
        <label>Care Plan<br>
          <textarea formControlName="carePlan" rows="3" style="width:100%;padding:.7rem 1rem;border-radius:12px;border:1px solid #e5e7eb"></textarea>
        </label>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn btn-green" type="submit" [disabled]="planForm.invalid || saving">{{ selectedPlan ? 'Update' : 'Create' }}</button>
          <button class="btn btn-blue-outline" type="button" (click)="resetForm()">Clear</button>
        </div>
        <div *ngIf="error" style="color:var(--c-red)">{{ error }}</div>
      </form>

      <!-- Existing Plans List -->
      <div class="card lift">
        <div class="card-header">My Recent Plans</div>
        <div *ngIf="plans.length === 0" class="muted">No plans yet.</div>
        <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px;">
          <li *ngFor="let p of plans" (click)="selectPlan(p)" style="padding:8px;border:1px solid #e5e7eb;border-radius:12px;cursor:pointer;">
            <div style="font-weight:600">{{ p.title }}</div>
            <div class="muted">{{ p.diagnosis || '—' }}</div>
          </li>
        </ul>
      </div>

      <!-- Medications & Notes Management (only when a plan is selected) -->
      <div class="card lift" *ngIf="selectedPlan" style="grid-column: span 2;">
        <div class="card-header">Medications & Notes — {{ selectedPlan.title }}</div>
        <div class="grid cols-2" style="gap:12px;">
          <form [formGroup]="medForm" (ngSubmit)="onAddMedication()" class="card" style="padding:12px;display:flex;flex-direction:column;gap:8px;">
            <div style="font-weight:600">Add Medication</div>
            <input formControlName="name" placeholder="Name" style="padding:.6rem 1rem;border-radius:12px;border:1px solid #e5e7eb" />
            <input formControlName="dose" placeholder="Dose" style="padding:.6rem 1rem;border-radius:12px;border:1px solid #e5e7eb" />
            <input formControlName="frequency" placeholder="Frequency" style="padding:.6rem 1rem;border-radius:12px;border:1px solid #e5e7eb" />
            <div style="display:flex;gap:8px;">
              <button class="btn btn-green" type="submit" [disabled]="medForm.invalid || saving">Add</button>
            </div>
          </form>

          <form [formGroup]="noteForm" (ngSubmit)="onAddNote()" class="card" style="padding:12px;display:flex;flex-direction:column;gap:8px;">
            <div style="font-weight:600">Add Note</div>
            <textarea formControlName="content" rows="3" placeholder="Write a note" style="padding:.6rem 1rem;border-radius:12px;border:1px solid #e5e7eb"></textarea>
            <label style="display:flex;align-items:center;gap:8px;">
              <input type="checkbox" formControlName="isImportant" /> Important
            </label>
            <div style="display:flex;gap:8px;">
              <button class="btn btn-blue" type="submit" [disabled]="noteForm.invalid || saving">Add Note</button>
            </div>
          </form>
        </div>

        <div class="grid cols-2" style="gap:12px;">
          <div>
            <div style="font-weight:600;margin:8px 0;">Medications</div>
            <div *ngIf="medications.length === 0" class="muted">No medications yet.</div>
            <table *ngIf="medications.length" style="width:100%;border-collapse:separate;border-spacing:0 8px;">
              <thead>
                <tr style="color:var(--c-blue);text-align:left">
                  <th>Name</th><th>Dose</th><th>Frequency</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let m of medications">
                  <td>{{ m.name }}</td>
                  <td>{{ m.dose || '—' }}</td>
                  <td>{{ m.frequency || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <div style="font-weight:600;margin:8px 0;">Notes</div>
            <div *ngIf="notes.length === 0" class="muted">No notes yet.</div>
            <div *ngFor="let n of notes" style="background:rgba(52,152,219,.06);padding:12px;border-radius:12px;margin-bottom:8px;">
              <span *ngIf="n.isImportant" class="badge badge-blue" style="margin-right:6px;">Important</span>
              {{ n.content }}
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`:host{display:block}`]
})
export class TreatmentPlanManagementComponent implements OnInit {
  plans: TreatmentPlan[] = [];
  medications: Medication[] = [];
  notes: TreatmentNote[] = [];
  selectedPlan: TreatmentPlan | null = null;
  error: string | null = null;
  saving = false;

  planForm = this.fb.group({
    patientId: ['', Validators.required],
    title: ['', Validators.required],
    diagnosis: [''],
    goals: [''],
    carePlan: [''],
  });

  medForm = this.fb.group({
    name: ['', Validators.required],
    dose: [''],
    frequency: [''],
  });

  noteForm = this.fb.group({
    content: ['', Validators.required],
    isImportant: [false],
  });

  constructor(private fb: FormBuilder, private treatment: TreatmentService, private auth: AuthService) {}

  ngOnInit(): void {
    this.loadMyPlans();
  }

  loadMyPlans() {
    this.error = null;
    // Doctor sees only own plans via backend scoping
    this.treatment.listPlans().subscribe({
      next: (list) => { this.plans = list || []; },
      error: (err) => { console.error(err); this.error = 'Failed to load plans'; }
    });
  }

  selectPlan(p: TreatmentPlan) {
    this.selectedPlan = p;
    this.planForm.patchValue({
      patientId: p.patientId,
      title: p.title,
      diagnosis: p.diagnosis || '',
      goals: p.goals || '',
      carePlan: p.carePlan || '',
    });
    this.loadDetails(p.id);
  }

  resetForm() {
    this.selectedPlan = null;
    this.planForm.reset({ patientId: '', title: '', diagnosis: '', goals: '', carePlan: '' });
    this.medications = [];
    this.notes = [];
  }

  onSavePlan() {
    if (this.planForm.invalid) return;
    this.saving = true;
    const value = this.planForm.value as any;
    const call$ = this.selectedPlan
      ? this.treatment.updatePlan(this.selectedPlan.id, value)
      : this.treatment.createPlan(value);
    call$.subscribe({
      next: (plan) => {
        this.saving = false;
        this.loadMyPlans();
        this.selectPlan(plan);
      },
      error: (err) => { console.error(err); this.error = 'Failed to save plan'; this.saving = false; }
    });
  }

  onAddMedication() {
    if (!this.selectedPlan || this.medForm.invalid) return;
    this.saving = true;
    this.treatment.addMedication(this.selectedPlan.id, this.medForm.value as any).subscribe({
      next: (med) => {
        this.saving = false;
        this.medForm.reset({ name: '', dose: '', frequency: '' });
        this.loadDetails(this.selectedPlan!.id);
      },
      error: (err) => { console.error(err); this.error = 'Failed to add medication'; this.saving = false; }
    });
  }

  onAddNote() {
    if (!this.selectedPlan || this.noteForm.invalid) return;
    this.saving = true;
    this.treatment.addNote(this.selectedPlan.id, this.noteForm.value as any).subscribe({
      next: (note) => {
        this.saving = false;
        this.noteForm.reset({ content: '', isImportant: false });
        this.loadDetails(this.selectedPlan!.id);
      },
      error: (err) => { console.error(err); this.error = 'Failed to add note'; this.saving = false; }
    });
  }

  private loadDetails(planId: string) {
    Promise.all([
      this.treatment.listMedications(planId).toPromise(),
      this.treatment.listNotes(planId).toPromise(),
    ]).then(([meds, notes]) => {
      this.medications = meds || [];
      this.notes = notes || [];
    }).catch(err => {
      console.error(err);
      this.error = 'Failed to load plan details';
    });
  }
}
