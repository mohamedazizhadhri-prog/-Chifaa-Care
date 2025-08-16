import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-partner-clinics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card lift">
      <div class="card-header">Clinics Map</div>
      <div style="height:240px;background:rgba(46,204,113,.12);border-radius:12px"></div>
    </div>
    <section class="grid" style="margin-top:12px;">
      <div class="card lift" *ngFor="let c of [1,2,3,4]">
        <div class="card-header">GreenCare Clinic</div>
        <div>123 Health St • +212 600 000 000</div>
        <div class="badge badge-blue" style="margin-top:6px;">Cardiology, Pediatrics</div>
      </div>
    </section>
  `,
  styles: [`:host{display:block}`]
})
export class PartnerClinicsComponent {}
