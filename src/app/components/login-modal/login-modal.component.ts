import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
  <div class="backdrop" *ngIf="isOpen" (click)="onClose()"></div>
  <div class="modal" *ngIf="isOpen" (click)="$event.stopPropagation()">
    <h3>Sign in</h3>
    <form (ngSubmit)="onSubmit()">
      <label>Email<input type="email" [(ngModel)]="email" name="email" required /></label>
      <label>Password<input type="password" [(ngModel)]="password" name="password" required /></label>
      <div class="actions">
        <button type="button" class="muted" (click)="onClose()">Cancel</button>
        <button type="submit" class="primary">Login</button>
      </div>
      <div class="error" *ngIf="error">{{error}}</div>
    </form>
  </div>
  `,
  styles: [`
    .backdrop{ position:fixed; inset:0; background:rgba(2,6,23,0.5); }
    .modal{ position:fixed; left:50%; top:50%; transform:translate(-50%,-50%); background:#fff; width:min(420px, 92vw); border-radius:12px; border:1px solid #e2e8f0; box-shadow:0 20px 60px rgba(0,0,0,0.2); padding:16px; }
    form{ display:grid; gap:8px; }
    label{ display:flex; flex-direction:column; gap:4px; }
    .actions{ display:flex; justify-content:flex-end; gap:8px; margin-top:6px; }
    .primary{ background:#0f766e; color:#fff; border:none; padding:8px 12px; border-radius:8px; }
    .muted{ background:#e2e8f0; color:#0f172a; border:none; padding:8px 12px; border-radius:8px; }
    .error{ color:#b91c1c; }
  `]
})
export class LoginModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() animationStart = new EventEmitter<{ role: 'patient'|'doctor'|'admin'|'clinic'; name: string; durationMs: number }>();
  @Input() isOpen = false;
  authMode: 'login'|'signup' = 'login';
  email = '';
  password = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  open(){ this.isOpen = true; this.error = ''; }
  onClose(){ this.isOpen = false; this.close.emit(); }
  switchMode(mode: 'login'|'signup'){ this.authMode = mode; }

  async onSubmit(){
    this.error = '';
    try{
      const res = await this.auth.login(this.email, this.password).toPromise();
      const role = res?.user?.role || 'patient';
      const name = res?.user?.name || this.email.split('@')[0];
      // Emit animation event so navbar can show overlay if desired
      this.animationStart.emit({ role: role as any, name, durationMs: 2000 });
      this.onClose();
      if (role === 'admin') this.router.navigate(['/admin','dashboard']);
      else if (role === 'doctor') this.router.navigate(['/doctor','dashboard']);
      else if (role === 'clinic') this.router.navigate(['/clinic','dashboard']);
      else this.router.navigate(['/patient','dashboard']);
    }catch(e:any){
      this.error = e?.message || 'Login failed';
    }
  }
}
