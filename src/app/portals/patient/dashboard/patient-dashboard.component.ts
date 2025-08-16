import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="container">
      <div class="grid cols-3 fade-in">
        <!-- Welcome -->
        <div class="card lift" style="grid-column: span 3;">
          <div class="card-header">Welcome back, Sarah!</div>
          <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
            <img src="https://i.pravatar.cc/80?img=47" alt="avatar" style="width:56px;height:56px;border-radius:50%;"/>
            <p class="muted" style="margin:0;">Wishing you a healthy day. Here’s your snapshot.</p>
          </div>
        </div>

        <!-- Upcoming appointment -->
        <div class="card lift" style="grid-column: span 2;">
          <div class="card-header">Upcoming Appointment</div>
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
            <div>
              <div style="color:var(--c-blue);font-weight:700;">Dr. Adam Noor — Cardiology</div>
              <div class="badge badge-green" style="margin-top:6px;">Sep 21, 10:30 AM</div>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <button class="btn btn-green"><i class="fa-solid fa-video"></i> Join Call</button>
              <button class="btn btn-blue-outline"><i class="fa-solid fa-calendar"></i> Reschedule</button>
            </div>
          </div>
        </div>

        <!-- Quick actions -->
        <div class="card lift">
          <div class="card-header">Quick Action</div>
          <button class="btn btn-blue"><i class="fa-solid fa-stethoscope"></i> Book Consultation</button>
        </div>
        <div class="card lift">
          <div class="card-header">Quick Action</div>
          <button class="btn btn-green"><i class="fa-solid fa-clipboard-check"></i> View Plan</button>
        </div>
        <div class="card lift">
          <div class="card-header">Quick Action</div>
          <button class="btn btn-blue-outline"><i class="fa-solid fa-file-arrow-up"></i> Upload Records</button>
        </div>

        <!-- Medications -->
        <div class="card lift" style="grid-column: span 2;">
          <div class="card-header">Medications</div>
          <div class="grid cols-2">
            <div>
              <div><strong>Metformin 500mg</strong></div>
              <div class="muted">2x daily with meals</div>
            </div>
            <div>
              <div><strong>Atorvastatin 10mg</strong></div>
              <div class="muted">Once daily at night</div>
            </div>
          </div>
        </div>

        <!-- Lab results (mini cards) -->
        <div class="card lift">
          <div class="card-header">Latest Labs</div>
          <div class="grid cols-2">
            <div class="badge badge-yellow">A1C 6.8%</div>
            <div class="badge badge-green">Cholesterol 175</div>
          </div>
        </div>

        <!-- AI summary chart placeholder -->
        <div class="card lift" style="grid-column: span 3;">
          <div class="card-header">AI Health Summary</div>
          <div style="height:180px;background:linear-gradient(90deg,rgba(46,204,113,.15),rgba(52,152,219,.15));border-radius:12px;"></div>
        </div>

        <!-- Messages -->
        <div class="card lift" style="grid-column: span 2;">
          <div class="card-header">Messages</div>
          <div class="grid" style="gap:8px;">
            <div><span class="badge badge-green">New</span> Dr. Noor shared your updated plan.</div>
            <div><span class="badge">Info</span> Your lab results are available.</div>
          </div>
        </div>
        <div class="card lift">
          <div class="card-header">Wellness Tip</div>
          <p class="muted" style="margin:0;">Take a 15-minute walk after lunch to improve glucose control.</p>
        </div>
      </div>
    </section>
  `,
  styles: [`:host{display:block}`]
})
export class PatientDashboardComponent {}
