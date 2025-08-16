import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-book-consultation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid cols-2">
      <aside class="card lift">
        <div class="card-header">Filters</div>
        <div class="grid" style="gap:.6rem;">
          <div class="badge badge-blue">Specialty</div>
          <div class="badge badge-green">Availability</div>
          <div class="badge badge-blue">Language</div>
        </div>
      </aside>
      <section class="grid" style="gap:1rem;">
        <div class="card lift" *ngFor="let d of [1,2,3,4,5,6]">
          <div style="display:flex;gap:16px;align-items:center;">
            <img src="https://i.pravatar.cc/72" style="width:72px;height:72px;border-radius:50%"/>
            <div style="flex:1">
              <div class="card-header">Dr. Lina Mahmoud <span class="badge badge-green" style="margin-left:.5rem">Cardiology</span></div>
              <small style="color:#6b7b88">12 yrs • EN/AR</small>
            </div>
            <div style="display:flex;gap:8px;">
              <button class="btn btn-blue-outline">View Profile</button>
              <button class="btn btn-green">Book Now</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`:host{display:block}`]
})
export class BookConsultationComponent {}
