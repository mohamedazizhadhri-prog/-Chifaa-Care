import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-clinic-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="reports-page">
      <div class="page-header">
        <div>
          <h1><i class="fas fa-chart-bar"></i> Reports & Analytics</h1>
          <p>View clinic performance and generate reports</p>
        </div>
        <button class="btn btn-primary" (click)="generateReport()">
          <i class="fas fa-file-pdf"></i> Generate PDF Report
        </button>
      </div>

      <div class="reports-grid">
        <div class="report-card" (click)="viewReport('patients')">
          <i class="fas fa-users"></i>
          <h3>Patient Reports</h3>
          <p>View patient statistics and demographics</p>
          <button class="btn btn-outline"><i class="fas fa-arrow-right"></i></button>
        </div>
        <div class="report-card" (click)="viewReport('revenue')">
          <i class="fas fa-dollar-sign"></i>
          <h3>Revenue Reports</h3>
          <p>Financial overview and billing reports</p>
          <button class="btn btn-outline"><i class="fas fa-arrow-right"></i></button>
        </div>
        <div class="report-card" (click)="viewReport('appointments')">
          <i class="fas fa-calendar"></i>
          <h3>Appointment Reports</h3>
          <p>Appointment statistics and trends</p>
          <button class="btn btn-outline"><i class="fas fa-arrow-right"></i></button>
        </div>
        <div class="report-card" (click)="viewReport('doctors')">
          <i class="fas fa-user-doctor"></i>
          <h3>Doctor Performance</h3>
          <p>Doctor workload and ratings</p>
          <button class="btn btn-outline"><i class="fas fa-arrow-right"></i></button>
        </div>
      </div>

      <div class="stats-section">
        <h2>Quick Stats</h2>
        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-number">248</div>
            <div class="stat-label">Total Patients</div>
            <div class="stat-change positive">+12% this month</div>
          </div>
          <div class="stat-box">
            <div class="stat-number">$45,230</div>
            <div class="stat-label">Monthly Revenue</div>
            <div class="stat-change positive">+8% vs last month</div>
          </div>
          <div class="stat-box">
            <div class="stat-number">156</div>
            <div class="stat-label">Appointments</div>
            <div class="stat-change">This month</div>
          </div>
          <div class="stat-box">
            <div class="stat-number">4.8</div>
            <div class="stat-label">Avg Rating</div>
            <div class="stat-change positive">+0.2 improvement</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reports-page { padding: 24px 5%; max-width: 1400px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
    .page-header h1 { font-size: 28px; font-weight: 700; color: #0f172a; margin: 0; display: flex; align-items: center; gap: 12px; }
    .page-header h1 i { color: #3b82f6; }
    .page-header p { color: #64748b; margin: 4px 0 0; font-size: 14px; }
    
    .reports-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-bottom: 32px; }
    .report-card { background: white; padding: 28px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); cursor: pointer; transition: all 0.3s; position: relative; }
    .report-card:hover { transform: translateY(-8px); box-shadow: 0 12px 24px rgba(0,0,0,0.15); }
    .report-card i { font-size: 48px; color: #3b82f6; margin-bottom: 16px; }
    .report-card h3 { margin: 0 0 8px; font-size: 20px; font-weight: 700; color: #0f172a; }
    .report-card p { color: #64748b; margin: 0 0 16px; font-size: 14px; }
    .report-card .btn { position: absolute; bottom: 28px; right: 28px; }
    
    .stats-section { background: white; padding: 32px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .stats-section h2 { font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 24px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; }
    .stat-box { text-align: center; padding: 24px; background: linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1)); border-radius: 12px; }
    .stat-number { font-size: 36px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
    .stat-label { font-size: 14px; color: #64748b; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
    .stat-change { font-size: 13px; color: #64748b; }
    .stat-change.positive { color: #22c55e; font-weight: 600; }
    
    .btn { padding: 10px 20px; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s; }
    .btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
    .btn-outline { background: white; border: 1px solid #e2e8f0; color: #64748b; padding: 8px 16px; }
    .btn:hover { transform: translateY(-2px); }
  `]
})
export class ClinicReportsComponent {
  viewReport(type: string) {
    alert(`Opening ${type} report...`);
  }
  
  generateReport() {
    alert('Generating comprehensive PDF report...');
  }
}
