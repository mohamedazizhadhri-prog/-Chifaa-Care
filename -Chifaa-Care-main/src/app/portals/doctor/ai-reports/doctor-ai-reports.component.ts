import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-doctor-ai-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card lift">
      <div class="card-header">AI Alerts</div>
      <div class="grid" style="gap:8px;">
        <div class="card lift"><span class="badge badge-green">Stable</span> Patient BP</div>
        <div class="card lift"><span class="badge badge-yellow">Caution</span> Patient glucose</div>
        <div class="card lift"><span class="badge badge-red">Urgent</span> ECG irregularities</div>
      </div>
    </div>
  `,
  styles: [`:host{display:block}`]
})
export class DoctorAiReportsComponent {}
