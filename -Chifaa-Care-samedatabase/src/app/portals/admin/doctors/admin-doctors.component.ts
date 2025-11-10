import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-doctors',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <h2>Doctors</h2>
      <p>Global view of doctors, profiles, availability, and assignments.</p>
    </div>
  `
})
export class AdminDoctorsComponent {}
