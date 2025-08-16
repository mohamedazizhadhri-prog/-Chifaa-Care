import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-patient-messages',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid cols-2">
      <aside class="card lift">
        <div class="card-header">Chats</div>
        <div *ngFor="let c of [1,2,3,4]" class="lift" style="padding:.5rem;border-radius:10px;">Dr. Ahmed</div>
      </aside>
      <section class="card lift" style="background:var(--c-light)">
        <div style="display:flex;flex-direction:column;gap:8px;">
          <div style="align-self:flex-end;max-width:70%" class="card" [style.background]="'var(--c-green)'" [style.color]="'#fff'">Hi doctor!</div>
          <div style="align-self:flex-start;max-width:70%" class="card" [style.background]="'#fff'">Hello Sarah, how can I help?</div>
        </div>
        <div style="margin-top:12px;display:flex;gap:8px;">
          <input placeholder="Type message..." style="flex:1;padding:.7rem 1rem;border-radius:999px;border:1px solid #e5e7eb;"/>
          <button class="btn btn-green">Send</button>
        </div>
      </section>
    </div>
  `,
  styles: [`:host{display:block}`]
})
export class PatientMessagesComponent {}
