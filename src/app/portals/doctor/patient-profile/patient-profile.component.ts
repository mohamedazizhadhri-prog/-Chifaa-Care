import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="grid">
      <div class="card lift" style="background:rgba(52,152,219,.06)">
        <div class="card-header">Sarah Johnson</div>
        <div>DOB: 1992-03-21 • Blood O+</div>
      </div>
      <div class="card lift">
        <div class="card-header">AI Chart</div>
        <div style="height:200px;background:linear-gradient(90deg,rgba(46,204,113,.15),rgba(52,152,219,.15));border-radius:12px;"></div>
      </div>
      <div class="card lift">
        <div class="card-header">Medical Records</div>
        <div class="grid cols-2">
          <div class="card">ECG - 12 Aug</div>
          <div class="card">Blood test - 01 Aug</div>
        </div>
      </div>
    </section>
  `,
  styles: [`:host{display:block}`]
})
export class PatientProfileComponent {}
