import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-patients',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <h2>Patients</h2>
      <p>Global patient list with filters, profiles, records, and plans.</p>
    </div>
  `
})
export class AdminPatientsComponent {}
