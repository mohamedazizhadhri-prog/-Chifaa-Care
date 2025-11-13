import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ai-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card lift">
      <div class="card-header">AI Health Reports</div>
      <div style="height:240px;background:linear-gradient(90deg,rgba(46,204,113,.15),rgba(52,152,219,.15));border-radius:12px;"></div>
      <div class="grid" style="margin-top:12px;gap:8px;">
        <div class="card lift"><span class="badge badge-green">Stable</span> Blood Pressure</div>
        <div class="card lift"><span class="badge badge-yellow">Caution</span> Glucose trend</div>
        <div class="card lift"><span class="badge badge-red">Urgent</span> Cardio arrhythmia sign</div>
      </div>
    </div>
  `,
  styles: [`:host{display:block}`]
})
export class AiReportsComponent {}
