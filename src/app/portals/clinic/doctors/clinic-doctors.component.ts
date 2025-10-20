import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-clinic-doctors',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="card">
    <h3>Coordinating Doctors</h3>
    <table class="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Specialization</th>
          <th>Experience</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let d of doctors">
          <td>{{d.firstName}} {{d.lastName}}</td>
          <td>{{d.email}}</td>
          <td>{{d.doctorProfile?.specialization || '-'}}</td>
          <td>{{d.doctorProfile?.experience || 0}}</td>
        </tr>
      </tbody>
    </table>
  </div>
  `,
  styles: [`
    .card { background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:12px; }
    .table { width:100%; border-collapse: collapse; }
    .table th, .table td { padding:8px; border-bottom:1px solid #e2e8f0; text-align:left; }
  `]
})
export class ClinicDoctorsComponent {
  private http = inject(HttpClient);
  private API = (environment as any).clinicApiUrl || 'http://localhost:3000/api/clinic';

  doctors: any[] = [];

  ngOnInit(){
    this.http.get<any>(`${this.API}/doctors`).subscribe({
      next: (res) => this.doctors = res?.data?.items || [],
      error: (err) => console.error('Failed to load doctors', err)
    });
  }
}
