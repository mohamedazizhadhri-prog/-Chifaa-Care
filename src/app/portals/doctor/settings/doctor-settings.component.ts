import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-doctor-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <form class="card lift grid" style="gap:12px;">
      <div class="card-header">Profile & Settings</div>
      <label>Availability<br><input type="text" placeholder="e.g. Mon-Fri 9-17" style="width:100%;padding:.7rem 1rem;border-radius:12px;border:1px solid #e5e7eb"></label>
      <label>License Number<br><input style="width:100%;padding:.7rem 1rem;border-radius:12px;border:1px solid #e5e7eb"></label>
      <button class="btn btn-green" type="button">Save</button>
    </form>
  `,
  styles: [`:host{display:block}`]
})
export class DoctorSettingsComponent {}
