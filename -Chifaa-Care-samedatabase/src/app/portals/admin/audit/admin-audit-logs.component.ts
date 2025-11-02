import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-audit-logs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <h2>Audit Logs</h2>
      <p>View and filter audit logs (user, action, resource, success, date).</p>
    </div>
  `
})
export class AdminAuditLogsComponent {}
