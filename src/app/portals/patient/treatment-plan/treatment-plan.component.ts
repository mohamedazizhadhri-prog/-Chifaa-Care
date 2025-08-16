import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-treatment-plan',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="grid">
      <div class="card lift">
        <div class="card-header">Progress</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <span class="badge badge-green">Checkup ✓</span>
          <span class="badge badge-green">Blood tests ✓</span>
          <span class="badge badge-blue">Follow-up</span>
        </div>
      </div>
      <div class="card lift">
        <div class="card-header">Medications</div>
        <table style="width:100%;border-collapse:separate;border-spacing:0 8px;">
          <thead>
            <tr style="color:var(--c-blue);text-align:left">
              <th>Name</th><th>Dosage</th><th>Frequency</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Atorvastatin</td><td>10mg</td><td>Daily</td>
            </tr>
            <tr>
              <td>Metformin</td><td>500mg</td><td>2x/day</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="card lift">
        <div class="card-header">Doctor Notes</div>
        <div style="background:rgba(52,152,219,.06);padding:12px;border-radius:12px;">Maintain low-sugar diet and light exercise.</div>
        <button class="btn btn-green" style="margin-top:12px;">Download PDF</button>
      </div>
    </section>
  `,
  styles: [`:host{display:block}`]
})
export class TreatmentPlanComponent {}
