import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

interface SchedulerStatus {
  isRunning: boolean;
  isCleanupInProgress: boolean;
  lastCleanupTime: string | null;
  nextCleanupTime: string | null;
}

interface CleanupStats {
  inactiveUsers: number;
  messagesFromInactive: number;
  messagesToInactive: number;
  totalAffectedMessages: number;
  affectedConversations: number;
}

@Component({
  selector: 'app-message-cleanup-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message-cleanup-admin.component.html',
  styleUrls: ['./message-cleanup-admin.component.scss']
})
export class MessageCleanupAdminComponent implements OnInit, OnDestroy {
  schedulerStatus: SchedulerStatus | null = null;
  stats: CleanupStats | null = null;
  lastCleanupResult: { deletedMessages: number; timestamp: string } | null = null;
  loading = false;
  cleanupInProgress = false;
  error: string | null = null;
  successMessage: string | null = null;
  
  private refreshSubscription?: Subscription;
  private readonly API_BASE = '/api/v1/messages/sync';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadData();
    
    // Auto-refresh every 30 seconds
    this.refreshSubscription = interval(30000)
      .pipe(switchMap(() => this.http.get<any>(`${this.API_BASE}/status`)))
      .subscribe({
        next: (response) => {
          this.schedulerStatus = response.data.scheduler;
        },
        error: (err) => console.error('Auto-refresh error:', err)
      });
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;

    Promise.all([
      this.http.get<any>(`${this.API_BASE}/status`).toPromise(),
      this.http.get<any>(`${this.API_BASE}/stats`).toPromise()
    ])
      .then(([statusRes, statsRes]) => {
        this.schedulerStatus = statusRes.data.scheduler;
        this.stats = statsRes.data.statistics;
      })
      .catch((err) => {
        this.error = 'Failed to load data: ' + (err.message || 'Unknown error');
      })
      .finally(() => {
        this.loading = false;
      });
  }

  triggerCleanup(): void {
    if (confirm('Are you sure you want to run cleanup now? This will delete messages from inactive users.')) {
      this.cleanupInProgress = true;
      this.error = null;
      this.successMessage = null;

      this.http.post<any>(`${this.API_BASE}/trigger-cleanup`, {}).subscribe({
        next: (response) => {
          this.lastCleanupResult = response.data;
          this.successMessage = `Successfully deleted ${response.data.deletedMessages} messages!`;
          this.loadData();
        },
        error: (err) => {
          this.error = 'Cleanup failed: ' + (err.error?.message || err.message);
        },
        complete: () => {
          this.cleanupInProgress = false;
        }
      });
    }
  }

  startScheduler(): void {
    this.loading = true;
    this.error = null;

    this.http.post<any>(`${this.API_BASE}/start-scheduler`, {}).subscribe({
      next: (response) => {
        this.schedulerStatus = response.data;
        this.successMessage = 'Scheduler started successfully!';
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (err) => {
        this.error = 'Failed to start scheduler: ' + (err.error?.message || err.message);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  stopScheduler(): void {
    if (confirm('Are you sure you want to stop the scheduler? Automated cleanups will not run.')) {
      this.loading = true;
      this.error = null;

      this.http.post<any>(`${this.API_BASE}/stop-scheduler`, {}).subscribe({
        next: (response) => {
          this.schedulerStatus = response.data;
          this.successMessage = 'Scheduler stopped successfully!';
          setTimeout(() => this.successMessage = null, 3000);
        },
        error: (err) => {
          this.error = 'Failed to stop scheduler: ' + (err.error?.message || err.message);
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }
}
