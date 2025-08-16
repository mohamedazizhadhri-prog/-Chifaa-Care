import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-treatment-plan-management',
  standalone: true,
  imports: [CommonModule],
  template: `
    <form class="card lift grid" style="gap:12px;">
      <div class="card-header">Treatment Plan Management</div>
      <label>Medications<br><textarea rows="3" style="width:100%;padding:.7rem 1rem;border-radius:12px;border:1px solid #e5e7eb"></textarea></label>
      <label>Procedures<br><textarea rows="3" style="width:100%;padding:.7rem 1rem;border-radius:12px;border:1px solid #e5e7eb"></textarea></label>
      <label>Follow-up<br><input style="width:100%;padding:.7rem 1rem;border-radius:12px;border:1px solid #e5e7eb"></label>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-green" type="button">Save</button>
        <button class="btn btn-blue-outline" type="button">Update</button>
      </div>
    </form>
  `,
  styles: [`:host{display:block}`]
})
export class TreatmentPlanManagementComponent {}
