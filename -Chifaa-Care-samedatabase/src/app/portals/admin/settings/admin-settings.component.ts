import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <h2>System Settings</h2>
      <p>Feature flags, environment indicators, data tools.</p>
    </div>
  `
})
export class AdminSettingsComponent {}
