import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-clinics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="toolbar">
    <button class="primary" (click)="toggleCreate()">+ Add Clinic</button>
    <button (click)="load()">Refresh</button>
  </div>

  <div class="card" *ngIf="showCreate">
    <h3>Create Clinic</h3>
    <div class="form-grid">
      <input [(ngModel)]="create.name" placeholder="Name" />
      <input [(ngModel)]="create.address" placeholder="Address" />
      <input [(ngModel)]="create.city" placeholder="City" />
      <input [(ngModel)]="create.state" placeholder="State" />
      <input [(ngModel)]="create.country" placeholder="Country" />
      <input [(ngModel)]="create.postalCode" placeholder="Postal Code" />
      <input [(ngModel)]="create.phone" placeholder="Phone" />
      <input [(ngModel)]="create.email" placeholder="Email" />
      <input [(ngModel)]="create.password" placeholder="Admin Password" type="password" />
      <input [(ngModel)]="create.website" placeholder="Website (optional)" />
    </div>
    <button class="primary" (click)="createClinic()">Create</button>
    <button (click)="toggleCreate()">Cancel</button>
  </div>

  <div class="card">
    <table class="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Address</th>
          <th>Contact</th>
          <th>Status</th>
          <th>Users</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let c of clinics">
          <td>{{c.name}}</td>
          <td>{{c.address}}, {{c.city}} {{c.postalCode}}</td>
          <td>{{c.phone}} | {{c.email}}</td>
          <td>{{c.status}}</td>
          <td>{{c.users?.length || 0}}</td>
          <td>
            <button (click)="activate(c)" *ngIf="c.status!=='ACTIVE'">Activate</button>
            <button (click)="deactivate(c)" *ngIf="c.status==='ACTIVE'">Deactivate</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  `,
  styles: [`
    .toolbar { display:flex; gap:8px; margin-bottom:12px; }
    .card { background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:12px; margin-bottom:12px; }
    .table { width:100%; border-collapse: collapse; }
    .table th, .table td { padding:8px; border-bottom:1px solid #e2e8f0; text-align:left; }
    .form-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap:8px; margin-bottom:8px; }
    .primary { background:#0f766e; color:#fff; border:none; padding:8px 12px; border-radius:6px; }
  `]
})
export class AdminClinicsComponent {
  private http = inject(HttpClient);
  private API_ADMIN = (environment as any).adminApiUrl || 'http://localhost:3000/api/admin';

  clinics: any[] = [];
  showCreate = false;
  create: any = { name:'', address:'', city:'', state:'', country:'', postalCode:'', phone:'', email:'', password:'', website:'' };

  ngOnInit() { this.load(); }

  toggleCreate(){ this.showCreate = !this.showCreate; }

  load() {
    this.http.get<any>(`${this.API_ADMIN}/clinics`).subscribe({
      next: (res) => this.clinics = res?.data?.items || [],
      error: (err) => console.error('Failed to load clinics', err)
    });
  }

  createClinic() {
    this.http.post<any>(`${this.API_ADMIN}/create-clinic`, this.create).subscribe({
      next: () => { this.toggleCreate(); this.create = { name:'', address:'', city:'', state:'', country:'', postalCode:'', phone:'', email:'', password:'', website:'' }; this.load(); },
      error: (err) => console.error('Failed to create clinic', err)
    });
  }

  activate(c:any){ this.updateStatus(c, 'ACTIVE'); }
  deactivate(c:any){ this.updateStatus(c, 'INACTIVE'); }

  private updateStatus(c:any, status:string){
    this.http.patch<any>(`${this.API_ADMIN}/update-clinic/${c.id}`, { status }).subscribe({
      next: () => this.load(),
      error: (err) => console.error('Failed to update clinic', err)
    });
  }
}
