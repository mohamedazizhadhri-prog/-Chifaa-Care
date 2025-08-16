import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-consultations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card lift">
      <div class="card-header">Consultations</div>
      <div style="height:340px;border-radius:12px;background:linear-gradient(135deg, rgba(52,152,219,.15), rgba(46,204,113,.15));"></div>
      <button class="btn btn-green" style="margin-top:12px;">Start Call</button>
    </div>
  `,
  styles: [`:host{display:block}`]
})
export class ConsultationsComponent {}
