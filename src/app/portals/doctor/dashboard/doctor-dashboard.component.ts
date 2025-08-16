import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="container">
      <div class="grid cols-3 fade-in">
        <!-- Welcome -->
        <div class="card lift" style="grid-column: span 3;">
          <div class="card-header">Welcome, Dr. Smith</div>
          <p class="muted" style="margin:0;">Here is your overview for today.</p>
        </div>

        <!-- Schedule -->
        <div class="card lift" style="grid-column: span 2;">
          <div class="card-header">Today's Schedule</div>
          <div class="grid" style="gap:10px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span class="badge badge-green">09:00</span>
              <strong>Sarah Johnson</strong><span class="muted"> — Follow up</span>
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <span class="badge badge-green">10:30</span>
              <strong>Ahmed Ali</strong><span class="muted"> — New patient</span>
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <span class="badge badge-yellow">12:00</span>
              <strong>Team Huddle</strong><span class="muted"> — Care review</span>
            </div>
          </div>
        </div>

        <!-- Alerts -->
        <div class="card lift">
          <div class="card-header">Patient Alerts</div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            <div><span class="badge badge-red">Urgent</span> ECG anomaly detected on J. Baker</div>
            <div><span class="badge badge-yellow">Watch</span> Rising glucose trend for S. Lee</div>
          </div>
        </div>

        <!-- Patient Queue -->
        <div class="card lift" style="grid-column: span 2;">
          <div class="card-header">Patient Queue</div>
          <div class="grid cols-2">
            <div class="card lift" style="padding:12px;">
              <div><strong>Sarah Johnson</strong></div>
              <div class="muted">F/U • Room 3</div>
            </div>
            <div class="card lift" style="padding:12px;">
              <div><strong>Ahmed Ali</strong></div>
              <div class="muted">New • Room 1</div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="card lift">
          <div class="card-header">Quick Actions</div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <button class="btn btn-blue"><i class="fa-solid fa-video"></i> Start Consultation</button>
            <button class="btn btn-green"><i class="fa-solid fa-prescription"></i> New Plan</button>
          </div>
        </div>

        <!-- Insights -->
        <div class="card lift" style="grid-column: span 3;">
          <div class="card-header">Care Insights</div>
          <div style="height:180px;background:linear-gradient(90deg,rgba(52,152,219,.15),rgba(46,204,113,.15));border-radius:12px;"></div>
        </div>
      </div>
    </section>
  `,
  styles: [`:host{display:block}`]
})
export class DoctorDashboardComponent {}
