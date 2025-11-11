import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="avatar" [ngStyle]="{ width: size + 'px', height: size + 'px' }" [class.circle]="shape === 'circle'" [class.rounded]="shape === 'rounded'">
      <ng-container *ngIf="src; else fallback">
        <img [src]="src" [alt]="alt || name || 'avatar'" />
      </ng-container>
      <ng-template #fallback>
        <div class="initials">{{ initials }}</div>
      </ng-template>
      <span *ngIf="badge" class="badge" [style.background]="badgeColor">{{ badge }}</span>
    </div>
  `,
  styles: [`
    :host { display: inline-block; }
    .avatar { position: relative; display: inline-flex; align-items: center; justify-content: center; overflow: hidden; background: #f1f5f9; color: #334155; border: 1px solid #e5e7eb; }
    .avatar.circle { border-radius: 999px; }
    .avatar.rounded { border-radius: 12px; }
    .avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .initials { font-weight: 600; letter-spacing: .5px; }
    .badge { position: absolute; right: -2px; bottom: -2px; border-radius: 999px; color: #fff; font-size: 10px; line-height: 1; padding: 4px 6px; border: 2px solid #fff; }
  `]
})
export class AvatarComponent {
  @Input() src: string | null = null;
  @Input() name: string | null = null;
  @Input() alt: string | null = null;
  @Input() size = 48;
  @Input() shape: 'circle' | 'rounded' = 'circle';
  @Input() badge: string | null = null; // e.g., 'Dr' or 'P'
  @Input() badgeColor: string = '#22c55e';

  get initials(): string {
    if (!this.name) return '?';
    const parts = this.name.split(' ').filter(Boolean);
    const first = parts[0]?.[0] || '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  }
}
