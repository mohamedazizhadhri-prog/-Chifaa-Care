import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <h2>Reports & Analytics</h2>
      <p>Appointments trend, user growth, top services (placeholder).</p>
    </div>
  `
})
export class AdminReportsComponent {}
