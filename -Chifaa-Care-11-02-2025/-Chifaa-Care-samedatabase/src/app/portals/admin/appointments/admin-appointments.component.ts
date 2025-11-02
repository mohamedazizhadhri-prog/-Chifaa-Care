import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-appointments',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <h2>Appointments</h2>
      <p>Global appointments calendar/table with filters and actions.</p>
    </div>
  `
})
export class AdminAppointmentsComponent {}
