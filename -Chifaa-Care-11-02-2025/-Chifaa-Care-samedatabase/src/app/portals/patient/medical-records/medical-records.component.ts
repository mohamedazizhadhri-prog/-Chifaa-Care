import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RecordsService, MedicalRecord } from '../../../services/records.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-medical-records',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  template: `
    <section class="container">
      <div class="card lift" *ngIf="loading">
        <div class="card-header">Loading Medical Records…</div>
        <div class="skeleton" style="height:16px;width:60%;margin:8px 0"></div>
      </div>

      <div class="card lift" *ngIf="error">
        <div class="card-header" style="color:var(--c-red)">Error</div>
        <div>{{ error }}</div>
      </div>

      <div class="card lift">
        <div class="card-header">Add Attachment to Latest Record</div>
        <div *ngIf="!latestRecord" class="muted">No record exists yet. Ask your doctor to add one.</div>
        <div *ngIf="latestRecord" style="display:flex;gap:8px;align-items:end;flex-wrap:wrap;">
          <label>URL<br>
            <input [(ngModel)]="attachUrl" placeholder="https://..." style="padding:.6rem 1rem;border:1px solid #e5e7eb;border-radius:12px;min-width:320px;" />
          </label>
          <label>Name<br>
            <input [(ngModel)]="attachName" placeholder="Report name" style="padding:.6rem 1rem;border:1px solid #e5e7eb;border-radius:12px;" />
          </label>
          <button class="btn btn-green" (click)="onAddAttachment()" [disabled]="!attachUrl">Add</button>
          <div class="muted" *ngIf="message">{{ message }}</div>
        </div>
      </div>

      <div class="grid cols-3" style="gap:12px;">
        <div class="card lift" *ngFor="let r of records">
          <div class="card-header">
            <i class="fa-regular fa-file-pdf" style="color:var(--c-blue)"></i>
            {{ r.condition }} — {{ formatDate(r.diagnosisDate) }}
          </div>
          <div class="muted">Status: {{ r.status }}</div>
          <div *ngIf="r.notes" style="margin-top:8px;">{{ r.notes }}</div>
          <div style="margin-top:10px;">
            <div style="font-weight:600;margin-bottom:6px;">Attachments</div>
            <div *ngIf="parseAttachments(r).length === 0" class="muted">No attachments</div>
            <ul style="padding-left:18px;">
              <li *ngFor="let a of parseAttachments(r)"><a [href]="a.url" target="_blank">{{ a.name || 'Attachment' }}</a></li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`:host{display:block}`]
})
export class MedicalRecordsComponent implements OnInit {
  loading = false;
  error: string | null = null;
  records: MedicalRecord[] = [];
  latestRecord: MedicalRecord | null = null;
  attachUrl = '';
  attachName = '';
  message = '';

  constructor(private recordsService: RecordsService, private auth: AuthService) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    if (!user) { this.error = 'You must be logged in.'; return; }
    this.loading = true;
    this.recordsService.list(user.id).subscribe({
      next: (list) => {
        this.records = list || [];
        this.latestRecord = this.records[0] || null;
        this.loading = false;
      },
      error: (err) => { console.error(err); this.error = 'Failed to load records.'; this.loading = false; }
    });
  }

  parseAttachments(rec: MedicalRecord) { return this.recordsService.parseAttachments(rec); }

  onAddAttachment(): void {
    if (!this.latestRecord) return;
    this.message = 'Adding…';
    this.recordsService.addAttachment(this.latestRecord.id, { url: this.attachUrl, name: this.attachName || undefined }).subscribe({
      next: (updated) => {
        // Update local view
        this.latestRecord = updated;
        const idx = this.records.findIndex(r => r.id === updated.id);
        if (idx >= 0) this.records[idx] = updated;
        this.attachUrl = '';
        this.attachName = '';
        this.message = 'Attachment added.';
      },
      error: (err) => { console.error(err); this.message = 'Failed to add attachment.'; }
    });
  }

  formatDate(iso: string) {
    const d = new Date(iso); return d.toLocaleDateString();
  }
}
