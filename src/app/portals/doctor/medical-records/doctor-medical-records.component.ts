import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RecordsService } from '../../../services/records.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-doctor-medical-records',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  template: `
    <section class="container grid cols-2" style="gap:12px;">
      <!-- Create Record -->
      <form [formGroup]="recordForm" class="card lift" (ngSubmit)="onCreateRecord()" style="gap:12px;padding:12px;display:flex;flex-direction:column;">
        <div class="card-header">Create Medical Record</div>
        <label>Patient ID<br>
          <input formControlName="patientId" placeholder="patient-uuid" style="width:100%;padding:.7rem 1rem;border-radius:12px;border:1px solid #e5e7eb" />
        </label>
        <label>Condition<br>
          <input formControlName="condition" placeholder="e.g. Diabetes Mellitus" style="width:100%;padding:.7rem 1rem;border-radius:12px;border:1px solid #e5e7eb" />
        </label>
        <label>Diagnosis Date<br>
          <input type="date" formControlName="diagnosisDate" style="width:100%;padding:.7rem 1rem;border-radius:12px;border:1px solid #e5e7eb" />
        </label>
        <label>Status<br>
          <input formControlName="status" placeholder="e.g. OPEN / RESOLVED" style="width:100%;padding:.7rem 1rem;border-radius:12px;border:1px solid #e5e7eb" />
        </label>
        <label>Notes<br>
          <textarea formControlName="notes" rows="3" placeholder="optional" style="width:100%;padding:.7rem 1rem;border-radius:12px;border:1px solid #e5e7eb"></textarea>
        </label>

        <div class="card" style="padding:12px;">
          <div style="font-weight:600;margin-bottom:6px;">Vitals (key/value)</div>
          <div formArrayName="vitals" style="display:flex;flex-direction:column;gap:8px;">
            <div *ngFor="let v of vitals.controls; index as i" [formGroupName]="i" style="display:flex;gap:8px;align-items:center;">
              <input formControlName="key" placeholder="e.g. BP" style="padding:.6rem 1rem;border:1px solid #e5e7eb;border-radius:12px;min-width:120px;" />
              <input formControlName="value" placeholder="e.g. 120/80" style="padding:.6rem 1rem;border:1px solid #e5e7eb;border-radius:12px;min-width:160px;" />
              <button class="btn btn-blue-outline" type="button" (click)="removeVital(i)">Remove</button>
            </div>
          </div>
          <button class="btn btn-blue" type="button" style="margin-top:8px;" (click)="addVital()">Add Vital</button>
        </div>

        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn btn-green" type="submit" [disabled]="recordForm.invalid || creating">Create</button>
          <div *ngIf="message" class="muted">{{ message }}</div>
        </div>
      </form>

      <!-- Attachments & Export -->
      <div class="card lift" style="padding:12px;">
        <div class="card-header">Attachments & Export</div>
        <div style="display:flex;gap:8px;align-items:end;flex-wrap:wrap;">
          <label>Record ID<br>
            <input [(ngModel)]="targetRecordId" placeholder="record-uuid" style="padding:.6rem 1rem;border:1px solid #e5e7eb;border-radius:12px;min-width:260px;" />
          </label>
          <label>URL<br>
            <input [(ngModel)]="attachUrl" placeholder="https://..." style="padding:.6rem 1rem;border:1px solid #e5e7eb;border-radius:12px;min-width:260px;" />
          </label>
          <label>Name<br>
            <input [(ngModel)]="attachName" placeholder="Report name" style="padding:.6rem 1rem;border:1px solid #e5e7eb;border-radius:12px;" />
          </label>
          <button class="btn btn-green" (click)="onAddAttachment()" [disabled]="!targetRecordId || !attachUrl">Add Attachment</button>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;">
          <label>Export Patient ID<br>
            <input [(ngModel)]="exportPatientId" placeholder="patient-uuid" style="padding:.6rem 1rem;border:1px solid #e5e7eb;border-radius:12px;min-width:260px;" />
          </label>
          <button class="btn btn-blue-outline" (click)="exportCsv()" [disabled]="!exportPatientId">Export CSV</button>
          <button class="btn btn-blue-outline" (click)="exportPdf()" [disabled]="!exportPatientId">Export PDF</button>
        </div>
        <div *ngIf="subMessage" class="muted" style="margin-top:6px;">{{ subMessage }}</div>
      </div>
    </section>
  `,
  styles: [`:host{display:block}`]
})
export class DoctorMedicalRecordsComponent {
  creating = false;
  message = '';
  subMessage = '';
  targetRecordId = '';
  attachUrl = '';
  attachName = '';
  exportPatientId = '';

  recordForm = this.fb.group({
    patientId: ['', Validators.required],
    condition: ['', Validators.required],
    diagnosisDate: ['', Validators.required],
    status: ['', Validators.required],
    notes: [''],
    vitals: this.fb.array([] as any[])
  });

  constructor(private fb: FormBuilder, private records: RecordsService, private auth: AuthService) {}

  get vitals(): FormArray { return this.recordForm.get('vitals') as FormArray; }
  addVital() { this.vitals.push(this.fb.group({ key: [''], value: [''] })); }
  removeVital(i: number) { this.vitals.removeAt(i); }

  onCreateRecord() {
    if (this.recordForm.invalid) return;
    this.creating = true; this.message = '';
    const v = this.recordForm.value as any;
    const vitalsText = (v.vitals || []).filter((x: any) => x.key || x.value).map((x: any) => `${x.key}: ${x.value}`).join('; ');
    const combinedNotes = [v.notes, vitalsText ? `Vitals: ${vitalsText}` : ''].filter(Boolean).join('\n');
    const isoDate = new Date(v.diagnosisDate + 'T00:00:00');
    this.records.create({ patientId: v.patientId, condition: v.condition, diagnosisDate: isoDate.toISOString(), status: v.status, notes: combinedNotes || undefined }).subscribe({
      next: (record) => {
        this.creating = false;
        this.message = `Record created: ${record.id}`;
        this.targetRecordId = record.id;
      },
      error: (err) => { console.error(err); this.message = 'Failed to create record'; this.creating = false; }
    });
  }

  onAddAttachment() {
    if (!this.targetRecordId || !this.attachUrl) return;
    this.subMessage = 'Adding attachment…';
    this.records.addAttachment(this.targetRecordId, { url: this.attachUrl, name: this.attachName || undefined }).subscribe({
      next: () => { this.subMessage = 'Attachment added.'; this.attachUrl = ''; this.attachName = ''; },
      error: (err) => { console.error(err); this.subMessage = 'Failed to add attachment.'; }
    });
  }

  exportCsv() { window.open(`/api/v1/records/export/csv?patientId=${encodeURIComponent(this.exportPatientId)}`, '_blank'); }
  exportPdf() { window.open(`/api/v1/records/export/pdf?patientId=${encodeURIComponent(this.exportPatientId)}`, '_blank'); }
}
