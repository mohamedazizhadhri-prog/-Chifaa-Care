import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card lift">
      <div class="card-header">Patients</div>
      <table style="width:100%;border-collapse:separate;border-spacing:0 8px;">
        <thead>
          <tr style="color:var(--c-blue);text-align:left"><th>Name</th><th>Diagnosis</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of [1,2,3]">
            <td style="color:var(--c-blue)">Sarah Johnson</td>
            <td style="color:#6b7b88">Hypertension</td>
            <td><span class="badge badge-green">Stable</span></td>
            <td><button class="btn btn-green">View Profile</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`:host{display:block}`]
})
export class PatientListComponent {}
