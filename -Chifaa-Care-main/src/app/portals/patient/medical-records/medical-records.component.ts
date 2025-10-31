import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-medical-records',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="grid cols-3">
      <div class="card lift" *ngFor="let f of [1,2,3,4,5,6]">
        <div class="card-header"><i class="fa-regular fa-file-pdf" style="color:var(--c-blue)"></i> Lab Report</div>
        <div style="color:#6b7b88">Uploaded 12 Aug 2025</div>
        <div style="display:flex;gap:8px;margin-top:10px;">
          <button class="btn btn-blue-outline">Download</button>
          <button class="btn btn-green">Delete</button>
        </div>
      </div>
    </section>
  `,
  styles: [`:host{display:block}`]
})
export class MedicalRecordsComponent {}
