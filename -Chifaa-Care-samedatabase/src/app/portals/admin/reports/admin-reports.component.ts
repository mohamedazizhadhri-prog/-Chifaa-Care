import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-reports">
      <div class="header">
        <div class="title-section">
          <h2>📊 Reports & Analytics</h2>
          <p>Comprehensive insights and system analytics</p>
        </div>
        <div class="header-actions">
          <select [(ngModel)]="timeRange" (change)="onTimeRangeChange()" class="time-range-select">
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Last Year</option>
          </select>
          <button class="btn-primary" (click)="downloadReport()">
            📥 Download Report
          </button>
        </div>
      </div>

      <!-- Overview Cards -->
      <div class="overview-cards">
        <div class="overview-card revenue">
          <div class="card-icon">💰</div>
          <div class="card-content">
            <div class="card-value">$125,450</div>
            <div class="card-label">Total Revenue</div>
            <div class="card-change positive">+12.5% from last period</div>
          </div>
        </div>
        <div class="overview-card appointments">
          <div class="card-icon">📅</div>
          <div class="card-content">
            <div class="card-value">2,453</div>
            <div class="card-label">Appointments</div>
            <div class="card-change positive">+8.3% from last period</div>
          </div>
        </div>
        <div class="overview-card patients">
          <div class="card-icon">👥</div>
          <div class="card-content">
            <div class="card-value">1,892</div>
            <div class="card-label">Active Patients</div>
            <div class="card-change positive">+15.2% from last period</div>
          </div>
        </div>
        <div class="overview-card satisfaction">
          <div class="card-icon">⭐</div>
          <div class="card-content">
            <div class="card-value">4.8</div>
            <div class="card-label">Patient Satisfaction</div>
            <div class="card-change positive">+0.3 from last period</div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-grid">
        <!-- Appointment Trends -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>📈 Appointment Trends</h3>
            <button class="btn-icon" (click)="refreshChart('appointments')">🔄</button>
          </div>
          <div class="chart-placeholder">
            <div class="chart-bars">
              <div class="bar" style="height: 60%"><span>Mon</span></div>
              <div class="bar" style="height: 75%"><span>Tue</span></div>
              <div class="bar" style="height: 85%"><span>Wed</span></div>
              <div class="bar" style="height: 70%"><span>Thu</span></div>
              <div class="bar" style="height: 90%"><span>Fri</span></div>
              <div class="bar" style="height: 55%"><span>Sat</span></div>
              <div class="bar" style="height: 40%"><span>Sun</span></div>
            </div>
          </div>
        </div>

        <!-- Revenue Chart -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>💰 Revenue Overview</h3>
            <button class="btn-icon" (click)="refreshChart('revenue')">🔄</button>
          </div>
          <div class="chart-placeholder">
            <div class="line-chart">
              <svg viewBox="0 0 200 100" class="chart-svg">
                <polyline 
                  points="0,80 30,60 60,40 90,50 120,30 150,35 180,20" 
                  fill="none" 
                  stroke="#4CAF50" 
                  stroke-width="3"
                />
              </svg>
              <div class="chart-legend">
                <span class="legend-item"><span class="dot revenue"></span> Revenue</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Patient Demographics -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>👥 Patient Demographics</h3>
            <button class="btn-icon" (click)="refreshChart('demographics')">🔄</button>
          </div>
          <div class="chart-placeholder">
            <div class="demographics-chart">
              <div class="demo-item">
                <div class="demo-label">18-30 years</div>
                <div class="demo-bar" style="width: 35%">
                  <span>35%</span>
                </div>
              </div>
              <div class="demo-item">
                <div class="demo-label">31-45 years</div>
                <div class="demo-bar" style="width: 45%">
                  <span>45%</span>
                </div>
              </div>
              <div class="demo-item">
                <div class="demo-label">46-60 years</div>
                <div class="demo-bar" style="width: 15%">
                  <span>15%</span>
                </div>
              </div>
              <div class="demo-item">
                <div class="demo-label">60+ years</div>
                <div class="demo-bar" style="width: 5%">
                  <span>5%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Services -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>🏆 Top Services</h3>
            <button class="btn-icon" (click)="refreshChart('services')">🔄</button>
          </div>
          <div class="chart-placeholder">
            <div class="services-list">
              <div class="service-item">
                <div class="service-info">
                  <span class="service-rank">1</span>
                  <span class="service-name">General Checkup</span>
                </div>
                <span class="service-count">523</span>
              </div>
              <div class="service-item">
                <div class="service-info">
                  <span class="service-rank">2</span>
                  <span class="service-name">Dental Care</span>
                </div>
                <span class="service-count">412</span>
              </div>
              <div class="service-item">
                <div class="service-info">
                  <span class="service-rank">3</span>
                  <span class="service-name">Cardiology</span>
                </div>
                <span class="service-count">356</span>
              </div>
              <div class="service-item">
                <div class="service-info">
                  <span class="service-rank">4</span>
                  <span class="service-name">Dermatology</span>
                </div>
                <span class="service-count">289</span>
              </div>
              <div class="service-item">
                <div class="service-info">
                  <span class="service-rank">5</span>
                  <span class="service-name">Pediatrics</span>
                </div>
                <span class="service-count">234</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Metrics -->
      <div class="metrics-section">
        <h3>📊 Performance Metrics</h3>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-label">Average Wait Time</div>
            <div class="metric-value">12 mins</div>
            <div class="metric-trend positive">-3 mins from last month</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Appointment Completion Rate</div>
            <div class="metric-value">94.5%</div>
            <div class="metric-trend positive">+2.1% from last month</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Patient Retention Rate</div>
            <div class="metric-value">87.3%</div>
            <div class="metric-trend positive">+5.2% from last month</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Average Session Duration</div>
            <div class="metric-value">28 mins</div>
            <div class="metric-trend neutral">No change</div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="recent-activity">
        <h3>📋 Recent Activity Summary</h3>
        <div class="activity-list">
          <div class="activity-item">
            <span class="activity-icon">✅</span>
            <div class="activity-content">
              <div class="activity-title">523 appointments completed this week</div>
              <div class="activity-time">2 hours ago</div>
            </div>
          </div>
          <div class="activity-item">
            <span class="activity-icon">👥</span>
            <div class="activity-content">
              <div class="activity-title">156 new patients registered</div>
              <div class="activity-time">5 hours ago</div>
            </div>
          </div>
          <div class="activity-item">
            <span class="activity-icon">💰</span>
            <div class="activity-content">
              <div class="activity-title">$45,230 revenue generated</div>
              <div class="activity-time">1 day ago</div>
            </div>
          </div>
          <div class="activity-item">
            <span class="activity-icon">⭐</span>
            <div class="activity-content">
              <div class="activity-title">128 positive reviews received</div>
              <div class="activity-time">2 days ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-reports {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }

    .title-section h2 {
      margin: 0;
      font-size: 28px;
      color: #1a1a1a;
    }

    .title-section p {
      margin: 4px 0 0 0;
      color: #666;
      font-size: 14px;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .time-range-select {
      padding: 12px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
      background: white;
    }

    .btn-primary {
      padding: 12px 24px;
      background: #2196F3;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-primary:hover {
      background: #1976D2;
      transform: translateY(-2px);
    }

    .overview-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .overview-card {
      background: white;
      padding: 24px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.3s;
    }

    .overview-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }

    .overview-card.revenue {
      background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
      color: white;
    }

    .overview-card.appointments {
      background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
      color: white;
    }

    .overview-card.patients {
      background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
      color: white;
    }

    .overview-card.satisfaction {
      background: linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%);
      color: white;
    }

    .card-icon {
      font-size: 48px;
    }

    .card-value {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .card-label {
      font-size: 14px;
      opacity: 0.9;
      margin-bottom: 8px;
    }

    .card-change {
      font-size: 12px;
      font-weight: 500;
    }

    .card-change.positive {
      color: rgba(255, 255, 255, 0.9);
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .chart-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .chart-header h3 {
      margin: 0;
      font-size: 16px;
      color: #333;
    }

    .btn-icon {
      padding: 6px;
      border: none;
      background: #f5f5f5;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
    }

    .btn-icon:hover {
      background: #e0e0e0;
    }

    .chart-placeholder {
      height: 200px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }

    .chart-bars {
      display: flex;
      align-items: flex-end;
      gap: 12px;
      height: 100%;
      width: 100%;
      padding: 20px 0;
    }

    .bar {
      flex: 1;
      background: linear-gradient(180deg, #2196F3 0%, #1976D2 100%);
      border-radius: 4px 4px 0 0;
      position: relative;
      transition: all 0.3s;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }

    .bar:hover {
      opacity: 0.8;
      transform: translateY(-4px);
    }

    .bar span {
      font-size: 11px;
      color: #666;
      padding: 4px 0;
    }

    .line-chart {
      width: 100%;
      height: 100%;
      position: relative;
    }

    .chart-svg {
      width: 100%;
      height: 80%;
    }

    .chart-legend {
      position: absolute;
      bottom: 0;
      left: 0;
      display: flex;
      gap: 16px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #666;
    }

    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }

    .dot.revenue {
      background: #4CAF50;
    }

    .demographics-chart {
      display: flex;
      flex-direction: column;
      gap: 16px;
      width: 100%;
      padding: 20px 0;
    }

    .demo-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .demo-label {
      width: 100px;
      font-size: 13px;
      color: #666;
    }

    .demo-bar {
      background: linear-gradient(90deg, #9C27B0 0%, #7B1FA2 100%);
      height: 30px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 0 10px;
      color: white;
      font-size: 12px;
      font-weight: 600;
      transition: width 0.3s;
    }

    .services-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 20px 0;
    }

    .service-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background: #f9f9f9;
      border-radius: 8px;
      transition: background 0.3s;
    }

    .service-item:hover {
      background: #f0f0f0;
    }

    .service-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .service-rank {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 13px;
    }

    .service-name {
      font-weight: 500;
      color: #333;
    }

    .service-count {
      font-weight: 700;
      color: #2196F3;
    }

    .metrics-section {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 32px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .metrics-section h3 {
      margin: 0 0 20px 0;
      font-size: 20px;
      color: #333;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
    }

    .metric-card {
      padding: 16px;
      background: #f9f9f9;
      border-radius: 8px;
    }

    .metric-label {
      font-size: 13px;
      color: #666;
      margin-bottom: 8px;
    }

    .metric-value {
      font-size: 28px;
      font-weight: 700;
      color: #333;
      margin-bottom: 4px;
    }

    .metric-trend {
      font-size: 12px;
      font-weight: 500;
    }

    .metric-trend.positive {
      color: #4CAF50;
    }

    .metric-trend.neutral {
      color: #999;
    }

    .recent-activity {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .recent-activity h3 {
      margin: 0 0 20px 0;
      font-size: 20px;
      color: #333;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: #f9f9f9;
      border-radius: 8px;
      transition: background 0.3s;
    }

    .activity-item:hover {
      background: #f0f0f0;
    }

    .activity-icon {
      font-size: 24px;
    }

    .activity-content {
      flex: 1;
    }

    .activity-title {
      font-weight: 500;
      color: #333;
      margin-bottom: 4px;
    }

    .activity-time {
      font-size: 12px;
      color: #999;
    }
  `]
})
export class AdminReportsComponent implements OnInit {
  timeRange = '30';

  ngOnInit() {
    console.log('Reports component initialized');
  }

  onTimeRangeChange() {
    console.log('Time range changed to:', this.timeRange);
  }

  refreshChart(chartType: string) {
    console.log('Refreshing chart:', chartType);
  }

  downloadReport() {
    alert('Download comprehensive report\n\nThis will generate a PDF report with all analytics data');
  }
}
