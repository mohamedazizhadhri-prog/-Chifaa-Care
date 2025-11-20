import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface AuditLog {
  id: string;
  user: string;
  action: string;
  resource: string;
  resourceId?: string;
  timestamp: string;
  ipAddress: string;
  userAgent?: string;
  status: 'SUCCESS' | 'FAILED';
  details?: string;
}

@Component({
  selector: 'app-admin-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-audit-logs">
      <div class="header">
        <div class="title-section">
          <h2>📜 Audit Logs</h2>
          <p>Track all system activities and user actions</p>
        </div>
        <div class="header-actions">
          <button class="btn-secondary" (click)="exportLogs()">
            📊 Export Logs
          </button>
          <button class="btn-primary" (click)="refreshLogs()">
            🔄 Refresh
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search by user, action, or resource..." 
            [(ngModel)]="searchQuery"
            (input)="onSearch()"
          />
        </div>
        <div class="filter-group">
          <select [(ngModel)]="actionFilter" (change)="onFilterChange()">
            <option value="">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="LOGIN">Login</option>
            <option value="LOGOUT">Logout</option>
            <option value="ACCESS">Access</option>
          </select>
        </div>
        <div class="filter-group">
          <select [(ngModel)]="statusFilter" (change)="onFilterChange()">
            <option value="">All Status</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
        <div class="filter-group">
          <input 
            type="date" 
            [(ngModel)]="dateFilter" 
            (change)="onFilterChange()"
          />
        </div>
      </div>

      <!-- Statistics -->
      <div class="stats-cards">
        <div class="stat-card total">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <div class="stat-value">{{ totalLogs }}</div>
            <div class="stat-label">Total Logs</div>
          </div>
        </div>
        <div class="stat-card success">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <div class="stat-value">{{ successCount }}</div>
            <div class="stat-label">Successful Actions</div>
          </div>
        </div>
        <div class="stat-card failed">
          <div class="stat-icon">❌</div>
          <div class="stat-content">
            <div class="stat-value">{{ failedCount }}</div>
            <div class="stat-label">Failed Actions</div>
          </div>
        </div>
        <div class="stat-card today">
          <div class="stat-icon">📅</div>
          <div class="stat-content">
            <div class="stat-value">{{ todayCount }}</div>
            <div class="stat-label">Today's Actions</div>
          </div>
        </div>
      </div>

      <!-- Audit Logs Table -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Resource</th>
              <th>IP Address</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let log of logs">
              <td>
                <div class="timestamp-info">
                  <span class="date">{{ formatDateTime(log.timestamp) }}</span>
                </div>
              </td>
              <td>
                <div class="user-info">
                  <span class="user-icon">👤</span>
                  <span>{{ log.user }}</span>
                </div>
              </td>
              <td>
                <span 
                  class="action-badge" 
                  [class.create]="log.action === 'CREATE'"
                  [class.update]="log.action === 'UPDATE'"
                  [class.delete]="log.action === 'DELETE'"
                  [class.login]="log.action === 'LOGIN'"
                >
                  {{ log.action }}
                </span>
              </td>
              <td>
                <div class="resource-info">
                  <span class="resource-name">{{ log.resource }}</span>
                  <span class="resource-id" *ngIf="log.resourceId">ID: {{ log.resourceId.substring(0, 8) }}</span>
                </div>
              </td>
              <td>
                <span class="ip-badge">{{ log.ipAddress }}</span>
              </td>
              <td>
                <span 
                  class="status-badge" 
                  [class.success]="log.status === 'SUCCESS'"
                  [class.failed]="log.status === 'FAILED'"
                >
                  {{ log.status }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="btn-icon" (click)="viewLogDetails(log)" title="View Details">
                    👁️
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="loading">
              <td colspan="7" class="loading-row">
                <div class="loader"></div>
                <span>Loading audit logs...</span>
              </td>
            </tr>
            <tr *ngIf="!loading && logs.length === 0">
              <td colspan="7" class="empty-row">
                <span class="empty-icon">📭</span>
                <p>No audit logs found</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination" *ngIf="totalPages > 1">
        <button [disabled]="currentPage === 1" (click)="goToPage(currentPage - 1)">
          ← Previous
        </button>
        <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
        <button [disabled]="currentPage === totalPages" (click)="goToPage(currentPage + 1)">
          Next →
        </button>
      </div>

      <!-- Modal -->
      <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>📋 Audit Log Details</h3>
            <button class="close-btn" (click)="closeModal()">✖️</button>
          </div>
          <div class="modal-body">
            <div class="log-details">
              <div class="detail-row">
                <strong>Log ID:</strong>
                <span>{{ selectedLog.id }}</span>
              </div>
              <div class="detail-row">
                <strong>Timestamp:</strong>
                <span>{{ formatDateTime(selectedLog.timestamp) }}</span>
              </div>
              <div class="detail-row">
                <strong>User:</strong>
                <span>{{ selectedLog.user }}</span>
              </div>
              <div class="detail-row">
                <strong>Action:</strong>
                <span class="action-badge">{{ selectedLog.action }}</span>
              </div>
              <div class="detail-row">
                <strong>Resource:</strong>
                <span>{{ selectedLog.resource }}</span>
              </div>
              <div class="detail-row" *ngIf="selectedLog.resourceId">
                <strong>Resource ID:</strong>
                <span>{{ selectedLog.resourceId }}</span>
              </div>
              <div class="detail-row">
                <strong>IP Address:</strong>
                <span>{{ selectedLog.ipAddress }}</span>
              </div>
              <div class="detail-row" *ngIf="selectedLog.userAgent">
                <strong>User Agent:</strong>
                <span class="small-text">{{ selectedLog.userAgent }}</span>
              </div>
              <div class="detail-row">
                <strong>Status:</strong>
                <span class="status-badge" [class]="selectedLog.status.toLowerCase()">
                  {{ selectedLog.status }}
                </span>
              </div>
              <div class="detail-row full-width" *ngIf="selectedLog.details">
                <strong>Details:</strong>
                <pre class="details-text">{{ selectedLog.details }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-audit-logs {
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
    }

    .btn-primary, .btn-secondary {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-primary {
      background: #673AB7;
      color: white;
    }

    .btn-primary:hover {
      background: #5E35B1;
      transform: translateY(-2px);
    }

    .btn-secondary {
      background: #f5f5f5;
      color: #333;
    }

    .btn-secondary:hover {
      background: #e0e0e0;
    }

    .filters {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .search-box {
      flex: 1;
      min-width: 300px;
      position: relative;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 18px;
    }

    .search-box input {
      width: 100%;
      padding: 12px 12px 12px 40px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
    }

    .search-box input:focus {
      outline: none;
      border-color: #673AB7;
    }

    .filter-group select,
    .filter-group input[type="date"] {
      padding: 12px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
      background: white;
    }

    .stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.3s;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }

    .stat-card.total {
      background: linear-gradient(135deg, #673AB7 0%, #5E35B1 100%);
      color: white;
    }

    .stat-card.success {
      background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
      color: white;
    }

    .stat-card.failed {
      background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
      color: white;
    }

    .stat-card.today {
      background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
      color: white;
    }

    .stat-icon {
      font-size: 32px;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 700;
    }

    .stat-label {
      font-size: 13px;
      opacity: 0.9;
    }

    .table-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 900px;
    }

    .data-table thead {
      background: #f5f5f5;
    }

    .data-table th {
      padding: 16px;
      text-align: left;
      font-weight: 600;
      color: #333;
      font-size: 14px;
      border-bottom: 2px solid #e0e0e0;
    }

    .data-table td {
      padding: 16px;
      border-bottom: 1px solid #f0f0f0;
      font-size: 14px;
      color: #666;
    }

    .data-table tbody tr:hover {
      background: #f9f9f9;
    }

    .timestamp-info .date {
      font-size: 13px;
      color: #666;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .user-icon {
      font-size: 18px;
    }

    .action-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .action-badge.create {
      background: #e8f5e9;
      color: #4CAF50;
    }

    .action-badge.update {
      background: #e3f2fd;
      color: #2196F3;
    }

    .action-badge.delete {
      background: #ffebee;
      color: #f44336;
    }

    .action-badge.login {
      background: #f3e5f5;
      color: #9C27B0;
    }

    .resource-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .resource-name {
      font-weight: 500;
      color: #333;
    }

    .resource-id {
      font-size: 11px;
      color: #999;
      font-family: monospace;
    }

    .ip-badge {
      padding: 4px 8px;
      background: #f0f0f0;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-badge.success {
      background: #e8f5e9;
      color: #4CAF50;
    }

    .status-badge.failed {
      background: #ffebee;
      color: #f44336;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
    }

    .btn-icon {
      padding: 8px;
      border: none;
      background: #f5f5f5;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.2s;
    }

    .btn-icon:hover {
      background: #e0e0e0;
      transform: scale(1.1);
    }

    .loading-row, .empty-row {
      text-align: center;
      padding: 48px !important;
    }

    .loader {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #673AB7;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .empty-icon {
      font-size: 48px;
      display: block;
      margin-bottom: 16px;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
      margin-top: 24px;
    }

    .pagination button {
      padding: 8px 16px;
      border: 2px solid #673AB7;
      background: white;
      color: #673AB7;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }

    .pagination button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .pagination button:not(:disabled):hover {
      background: #673AB7;
      color: white;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.2s;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 700px;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideUp 0.3s;
    }

    .modal-header {
      padding: 24px;
      border-bottom: 2px solid #f0f0f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 22px;
      color: #1a1a1a;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #999;
      padding: 4px;
    }

    .close-btn:hover {
      color: #333;
    }

    .modal-body {
      padding: 24px;
    }

    .log-details {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 12px;
      background: #f9f9f9;
      border-radius: 8px;
    }

    .detail-row.full-width {
      flex-direction: column;
      gap: 8px;
    }

    .detail-row strong {
      color: #333;
      min-width: 120px;
    }

    .small-text {
      font-size: 12px;
      word-break: break-all;
    }

    .details-text {
      background: white;
      padding: 12px;
      border-radius: 4px;
      font-size: 12px;
      overflow-x: auto;
      margin: 0;
    }
  `]
})
export class AdminAuditLogsComponent implements OnInit {
  logs: AuditLog[] = [
    {
      id: '1',
      user: 'admin@chifaa.com',
      action: 'CREATE',
      resource: 'User',
      resourceId: 'user_12345',
      timestamp: new Date().toISOString(),
      ipAddress: '192.168.1.1',
      status: 'SUCCESS',
      userAgent: 'Mozilla/5.0...',
      details: 'Created new doctor account'
    },
    {
      id: '2',
      user: 'doctor@chifaa.com',
      action: 'UPDATE',
      resource: 'Patient Record',
      resourceId: 'patient_67890',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      ipAddress: '192.168.1.5',
      status: 'SUCCESS',
      userAgent: 'Mozilla/5.0...'
    },
    {
      id: '3',
      user: 'admin@chifaa.com',
      action: 'DELETE',
      resource: 'Appointment',
      resourceId: 'appt_54321',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      ipAddress: '192.168.1.1',
      status: 'SUCCESS'
    },
    {
      id: '4',
      user: 'user@chifaa.com',
      action: 'LOGIN',
      resource: 'Authentication',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      ipAddress: '192.168.1.10',
      status: 'FAILED',
      details: 'Invalid credentials'
    },
  ];

  loading = false;
  searchQuery = '';
  actionFilter = '';
  statusFilter = '';
  dateFilter = '';
  currentPage = 1;
  pageSize = 20;
  totalLogs = 0;
  totalPages = 0;
  successCount = 0;
  failedCount = 0;
  todayCount = 0;

  showModal = false;
  selectedLog: any = {};

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.loading = true;
    setTimeout(() => {
      this.totalLogs = this.logs.length;
      this.totalPages = Math.ceil(this.totalLogs / this.pageSize);
      this.updateStats();
      this.loading = false;
    }, 500);
  }

  updateStats() {
    this.successCount = this.logs.filter(l => l.status === 'SUCCESS').length;
    this.failedCount = this.logs.filter(l => l.status === 'FAILED').length;
    const today = new Date().toDateString();
    this.todayCount = this.logs.filter(l => new Date(l.timestamp).toDateString() === today).length;
  }

  onSearch() {
    this.currentPage = 1;
    this.loadLogs();
  }

  onFilterChange() {
    this.currentPage = 1;
    this.loadLogs();
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.loadLogs();
  }

  formatDateTime(timestamp: string): string {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  viewLogDetails(log: AuditLog) {
    this.selectedLog = { ...log };
    this.showModal = true;
  }

  exportLogs() {
    alert('Export audit logs\n\nThis will generate a CSV file with all audit log data');
  }

  refreshLogs() {
    this.loadLogs();
  }

  closeModal() {
    this.showModal = false;
    this.selectedLog = {};
  }
}
