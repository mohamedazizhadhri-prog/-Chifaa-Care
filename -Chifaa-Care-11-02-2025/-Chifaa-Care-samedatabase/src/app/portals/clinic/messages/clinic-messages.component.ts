import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Message {
  id: number;
  sender: string;
  senderRole?: string;
  subject: string;
  content: string;
  preview: string;
  time: string;
  read: boolean;
  category: 'inquiry' | 'appointment' | 'medical' | 'billing' | 'general';
}

@Component({
  selector: 'app-clinic-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
    <div class="messages-page">
      <div class="page-header">
        <div>
          <h1><i class="fas fa-comments"></i> Messages & Communication</h1>
          <p>Manage patient inquiries and staff communication</p>
        </div>
        <button class="btn btn-primary" (click)="openComposeModal()">
          <i class="fas fa-paper-plane"></i> New Message
        </button>
      </div>

      <div class="messages-layout">
        <!-- Sidebar -->
        <div class="messages-sidebar">
          <div class="sidebar-filters">
            <button class="filter-btn" [class.active]="activeFilter === 'all'" (click)="filterMessages('all')">
              <i class="fas fa-inbox"></i>
              <span>All Messages</span>
              <span class="count">{{messages.length}}</span>
            </button>
            <button class="filter-btn" [class.active]="activeFilter === 'unread'" (click)="filterMessages('unread')">
              <i class="fas fa-envelope"></i>
              <span>Unread</span>
              <span class="count badge-primary">{{unreadCount}}</span>
            </button>
            <button class="filter-btn" [class.active]="activeFilter === 'inquiry'" (click)="filterMessages('inquiry')">
              <i class="fas fa-question-circle"></i>
              <span>Inquiries</span>
            </button>
            <button class="filter-btn" [class.active]="activeFilter === 'appointment'" (click)="filterMessages('appointment')">
              <i class="fas fa-calendar"></i>
              <span>Appointments</span>
            </button>
            <button class="filter-btn" [class.active]="activeFilter === 'medical'" (click)="filterMessages('medical')">
              <i class="fas fa-heartbeat"></i>
              <span>Medical</span>
            </button>
          </div>

          <div class="stats-summary">
            <div class="stat-item">
              <i class="fas fa-inbox"></i>
              <div>
                <div class="stat-number">{{messages.length}}</div>
                <div class="stat-text">Total</div>
              </div>
            </div>
            <div class="stat-item">
              <i class="fas fa-clock"></i>
              <div>
                <div class="stat-number">{{todayCount}}</div>
                <div class="stat-text">Today</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Messages List -->
        <div class="messages-main">
          <div class="messages-toolbar">
            <div class="search-box">
              <i class="fas fa-search"></i>
              <input type="text" placeholder="Search messages..." [(ngModel)]="searchTerm" (input)="applyFilters()">
            </div>
            <div class="toolbar-actions">
              <button class="btn-icon" (click)="markAllRead()" title="Mark all as read">
                <i class="fas fa-check-double"></i>
              </button>
              <button class="btn-icon" (click)="refreshMessages()" title="Refresh">
                <i class="fas fa-sync-alt"></i>
              </button>
            </div>
          </div>

          <div class="messages-list" *ngIf="filteredMessages.length > 0">
            <div class="message-item" 
                 *ngFor="let msg of filteredMessages" 
                 [class.unread]="!msg.read"
                 [class.selected]="selectedMessage?.id === msg.id"
                 (click)="selectMessage(msg)">
              <div class="message-check">
                <input type="checkbox" (click)="$event.stopPropagation()">
              </div>
              <div class="message-avatar" [class]="'avatar-' + msg.category">
                {{msg.sender.charAt(0).toUpperCase()}}
              </div>
              <div class="message-details">
                <div class="message-header">
                  <strong class="sender-name">{{msg.sender}}</strong>
                  <span class="sender-role" *ngIf="msg.senderRole">{{msg.senderRole}}</span>
                  <span class="message-time">{{msg.time}}</span>
                </div>
                <div class="message-subject">{{msg.subject}}</div>
                <div class="message-preview">{{msg.preview}}</div>
                <div class="message-footer">
                  <span class="category-badge" [class]="'category-' + msg.category">
                    <i class="fas" [class.fa-question-circle]="msg.category === 'inquiry'"
                                   [class.fa-calendar]="msg.category === 'appointment'"
                                   [class.fa-heartbeat]="msg.category === 'medical'"
                                   [class.fa-dollar-sign]="msg.category === 'billing'"
                                   [class.fa-info-circle]="msg.category === 'general'"></i>
                    {{msg.category}}
                  </span>
                </div>
              </div>
              <div class="message-actions">
                <button class="btn-icon btn-reply" (click)="replyMessage(msg); $event.stopPropagation()" title="Reply">
                  <i class="fas fa-reply"></i>
                </button>
                <button class="btn-icon btn-delete" (click)="deleteMessage(msg); $event.stopPropagation()" title="Delete">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="empty-state" *ngIf="filteredMessages.length === 0">
            <i class="fas fa-inbox fa-3x"></i>
            <h3>No messages found</h3>
            <p>{{searchTerm ? 'Try adjusting your search' : 'Your inbox is empty'}}</p>
          </div>
        </div>

      </div>

      <!-- Message Detail Overlay -->
      <div class="message-detail-overlay" *ngIf="selectedMessage" (click)="closeDetail()">
        <div class="message-detail" (click)="$event.stopPropagation()">
          <div class="detail-header">
            <div class="detail-title">
              <h3>{{selectedMessage.subject}}</h3>
              <span class="category-badge" [class]="'category-' + selectedMessage.category">
                {{selectedMessage.category}}
              </span>
            </div>
            <button class="btn-close" (click)="closeDetail()">&times;</button>
          </div>
          <div class="detail-meta">
            <div class="sender-info">
              <div class="sender-avatar">{{selectedMessage.sender.charAt(0).toUpperCase()}}</div>
              <div>
                <strong>{{selectedMessage.sender}}</strong>
                <div class="meta-time">{{selectedMessage.time}}</div>
              </div>
            </div>
          </div>
          <div class="detail-content">
            <p>{{selectedMessage.content}}</p>
          </div>
          <div class="detail-actions">
            <button class="btn btn-primary" (click)="replyMessage(selectedMessage)">
              <i class="fas fa-reply"></i> Reply
            </button>
            <button class="btn btn-outline" (click)="forwardMessage(selectedMessage)">
              <i class="fas fa-share"></i> Forward
            </button>
            <button class="btn btn-outline btn-danger" (click)="deleteMessage(selectedMessage)">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Compose Modal -->
      <div class="modal" *ngIf="showComposeModal" (click)="closeComposeModal()">
        <div class="modal-dialog modal-lg" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2><i class="fas fa-paper-plane"></i> Compose Message</h2>
            <button class="btn-close" (click)="closeComposeModal()">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>To *</label>
              <input type="text" [(ngModel)]="composeForm.to" placeholder="Recipient name or email" class="form-control">
            </div>
            <div class="form-group">
              <label>Subject *</label>
              <input type="text" [(ngModel)]="composeForm.subject" placeholder="Message subject" class="form-control">
            </div>
            <div class="form-group">
              <label>Category</label>
              <select [(ngModel)]="composeForm.category" class="form-control">
                <option value="general">General</option>
                <option value="inquiry">Inquiry</option>
                <option value="appointment">Appointment</option>
                <option value="medical">Medical</option>
                <option value="billing">Billing</option>
              </select>
            </div>
            <div class="form-group">
              <label>Message *</label>
              <textarea [(ngModel)]="composeForm.message" rows="8" placeholder="Type your message here..." class="form-control"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" (click)="closeComposeModal()">Cancel</button>
            <button class="btn btn-primary" (click)="sendMessage()">
              <i class="fas fa-paper-plane"></i> Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .messages-page { padding: 24px 5%; max-width: 1400px; margin: 0 auto; min-height: calc(100vh - 100px); }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { font-size: 28px; font-weight: 700; color: #0f172a; margin: 0; display: flex; align-items: center; gap: 12px; }
    .page-header h1 i { color: #3b82f6; }
    .page-header p { margin: 4px 0 0; color: #64748b; font-size: 14px; }
    
    .messages-layout { display: grid; grid-template-columns: 260px 1fr; gap: 24px; min-height: 600px; }
    
    /* Sidebar */
    .messages-sidebar { background: white; border-radius: 12px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex; flex-direction: column; gap: 20px; }
    .sidebar-filters { display: flex; flex-direction: column; gap: 4px; }
    .filter-btn { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border: none; background: transparent; text-align: left; border-radius: 8px; cursor: pointer; transition: all 0.2s; font-size: 14px; color: #64748b; }
    .filter-btn:hover { background: #f8fafc; }
    .filter-btn.active { background: #eff6ff; color: #3b82f6; font-weight: 600; }
    .filter-btn i { width: 20px; font-size: 16px; }
    .filter-btn span:nth-child(2) { flex: 1; }
    .filter-btn .count { font-size: 12px; font-weight: 600; background: #f1f5f9; color: #64748b; padding: 2px 8px; border-radius: 12px; }
    .filter-btn .count.badge-primary { background: #3b82f6; color: white; }
    
    .stats-summary { border-top: 1px solid #e2e8f0; padding-top: 16px; display: flex; flex-direction: column; gap: 12px; }
    .stat-item { display: flex; align-items: center; gap: 12px; }
    .stat-item i { font-size: 24px; color: #3b82f6; }
    .stat-number { font-size: 20px; font-weight: 700; color: #0f172a; }
    .stat-text { font-size: 11px; color: #94a3b8; text-transform: uppercase; }
    
    /* Messages Main */
    .messages-main { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex; flex-direction: column; overflow: hidden; }
    .messages-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 16px; border-bottom: 1px solid #e2e8f0; }
    .search-box { flex: 1; display: flex; align-items: center; gap: 12px; background: #f8fafc; padding: 8px 12px; border-radius: 8px; }
    .search-box i { color: #94a3b8; }
    .search-box input { flex: 1; border: none; background: transparent; outline: none; font-size: 14px; }
    .toolbar-actions { display: flex; gap: 8px; }
    
    .messages-list { flex: 1; overflow-y: auto; }
    .message-item { display: grid; grid-template-columns: auto 50px 1fr 80px; gap: 12px; padding: 16px; border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: all 0.2s; position: relative; align-items: start; }
    .message-item:hover { background: #f8fafc; }
    .message-item.unread { background: #eff6ff; }
    .message-item.selected { background: #dbeafe; border-left: 3px solid #3b82f6; }
    .message-check { display: flex; align-items: center; justify-content: center; }
    .message-avatar { width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 18px; flex-shrink: 0; }
    .avatar-inquiry { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .avatar-appointment { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
    .avatar-medical { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
    .avatar-billing { background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); }
    .avatar-general { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); }
    .message-details { min-width: 0; overflow: hidden; }
    .message-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; flex-wrap: wrap; }
    .sender-name { font-size: 15px; font-weight: 600; color: #0f172a; }
    .sender-role { font-size: 11px; background: #e2e8f0; color: #64748b; padding: 2px 8px; border-radius: 4px; white-space: nowrap; }
    .message-time { font-size: 12px; color: #94a3b8; white-space: nowrap; }
    .message-subject { font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .message-preview { font-size: 13px; color: #64748b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; line-height: 1.4; }
    .message-footer { margin-top: 6px; }
    .category-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 10px; padding: 3px 8px; border-radius: 12px; text-transform: uppercase; font-weight: 600; }
    .category-inquiry { background: #eff6ff; color: #3b82f6; }
    .category-appointment { background: #fef2f2; color: #ef4444; }
    .category-medical { background: #fef3c7; color: #f59e0b; }
    .category-billing { background: #ecfdf5; color: #10b981; }
    .category-general { background: #f3f4f6; color: #6b7280; }
    .message-actions { display: flex; gap: 4px; opacity: 0; transition: opacity 0.2s; }
    .message-item:hover .message-actions { opacity: 1; }
    .btn-icon { width: 32px; height: 32px; border: none; background: #f1f5f9; color: #64748b; border-radius: 6px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
    .btn-icon:hover { background: #e2e8f0; }
    .btn-reply:hover { background: #3b82f6; color: white; }
    .btn-delete:hover { background: #ef4444; color: white; }
    
    /* Message Detail Overlay */
    .message-detail-overlay { position: fixed; top: 0; right: 0; bottom: 0; left: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .message-detail { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); display: flex; flex-direction: column; gap: 24px; max-width: 700px; width: 90%; max-height: 80vh; overflow-y: auto; animation: slideUp 0.3s; }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .detail-header { display: flex; justify-content: space-between; align-items: start; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0; }
    .detail-title { flex: 1; }
    .detail-title h3 { margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #0f172a; }
    .btn-close { background: none; border: none; font-size: 32px; color: #94a3b8; cursor: pointer; padding: 0; width: 40px; height: 40px; line-height: 1; transition: color 0.2s; }
    .btn-close:hover { color: #64748b; }
    .detail-meta { padding-bottom: 20px; border-bottom: 1px solid #f1f5f9; }
    .sender-info { display: flex; align-items: center; gap: 16px; }
    .sender-avatar { width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 20px; }
    .meta-time { font-size: 13px; color: #94a3b8; margin-top: 2px; }
    .detail-content { flex: 1; overflow-y: auto; padding: 20px 0; }
    .detail-content p { line-height: 1.8; color: #334155; font-size: 15px; }
    .detail-actions { display: flex; gap: 12px; flex-wrap: wrap; }
    
    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; color: #94a3b8; }
    .empty-state i { margin-bottom: 16px; color: #cbd5e1; }
    .empty-state h3 { color: #64748b; margin: 8px 0; }
    
    .btn { padding: 10px 20px; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s; }
    .btn:hover { transform: translateY(-2px); }
    .btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
    .btn-outline { background: white; border: 1px solid #e2e8f0; color: #64748b; }
    .btn-danger { border-color: #ef4444; color: #ef4444; }
    
    .modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-dialog { background: white; border-radius: 12px; max-width: 700px; width: 90%; max-height: 90vh; overflow-y: auto; }
    .modal-lg { max-width: 800px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #e2e8f0; }
    .modal-header h2 { margin: 0; font-size: 20px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
    .modal-body { padding: 20px; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 20px; border-top: 1px solid #e2e8f0; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 6px; font-size: 14px; font-weight: 600; color: #334155; }
    .form-control { width: 100%; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; font-family: inherit; }
    .form-control:focus { outline: none; border-color: #3b82f6; }
    textarea.form-control { resize: vertical; }
    
    @media (max-width: 968px) {
      .messages-page { padding: 16px 3%; }
      .messages-layout { grid-template-columns: 1fr; }
      .messages-sidebar { order: 2; margin-top: 20px; }
      .messages-main { order: 1; }
    }
    
    @media (max-width: 640px) {
      .messages-page { padding: 12px 2%; }
      .page-header { flex-direction: column; align-items: flex-start; gap: 16px; }
      .message-item { grid-template-columns: auto 40px 1fr; gap: 8px; padding: 12px; }
      .message-actions { display: none; }
      .message-avatar { width: 40px; height: 40px; font-size: 16px; }
      .message-detail { padding: 20px; max-width: 95%; }
    }
  `]
})
export class ClinicMessagesComponent implements OnInit {
  messages: Message[] = [];
  filteredMessages: Message[] = [];
  selectedMessage: Message | null = null;
  activeFilter = 'all';
  searchTerm = '';
  showComposeModal = false;
  
  composeForm = {
    to: '',
    subject: '',
    category: 'general',
    message: ''
  };

  private apiUrl = environment.apiUrl || 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadMessages();
  }

  loadMessages() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders(token ? { 'Authorization': `Bearer ${token}` } : {});
    const userId = JSON.parse(localStorage.getItem('user') || '{}').id;

    if (!userId) {
      console.log('No user ID found, using empty messages');
      this.messages = [];
      this.filteredMessages = [];
      return;
    }

    this.http.get<any>(`${this.apiUrl}/messages/conversations/${userId}`, { headers }).subscribe({
      next: (response) => {
        console.log('Messages API response:', response);
        const conversations = response.data?.conversations || response.conversations || response.data || response;
        
        this.messages = Array.isArray(conversations) ? conversations.map((conv: any, index: number) => {
          const lastMessage = conv.lastMessage || conv;
          const otherUser = conv.otherUser || conv.user || {};
          
          return {
            id: conv.id || index + 1,
            sender: `${otherUser.firstName || 'Unknown'} ${otherUser.lastName || 'User'}`.trim(),
            senderRole: otherUser.role || 'Patient',
            subject: conv.subject || lastMessage.subject || 'No Subject',
            content: lastMessage.content || conv.content || lastMessage.message || 'No content',
            preview: (lastMessage.content || conv.content || lastMessage.message || '').substring(0, 80) + '...',
            time: this.formatTime(lastMessage.createdAt || conv.createdAt || new Date()),
            read: lastMessage.isRead !== false && conv.isRead !== false,
            category: this.categorizeMessage(conv.subject || lastMessage.subject || lastMessage.content || '')
          };
        }) : [];
        
        this.filteredMessages = [...this.messages];
      },
      error: (error) => {
        console.error('Error loading messages:', error);
        console.log('Using empty messages list');
        this.messages = [];
        this.filteredMessages = [];
      }
    });
  }

  formatTime(date: any): string {
    if (!date) return 'Unknown';
    const msgDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - msgDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return msgDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return msgDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }

  categorizeMessage(text: string): 'inquiry' | 'appointment' | 'medical' | 'billing' | 'general' {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('appointment') || lowerText.includes('schedule') || lowerText.includes('booking')) {
      return 'appointment';
    } else if (lowerText.includes('medical') || lowerText.includes('prescription') || lowerText.includes('lab') || lowerText.includes('test')) {
      return 'medical';
    } else if (lowerText.includes('bill') || lowerText.includes('payment') || lowerText.includes('invoice') || lowerText.includes('insurance')) {
      return 'billing';
    } else if (lowerText.includes('question') || lowerText.includes('inquiry') || lowerText.includes('help') || lowerText.includes('registration')) {
      return 'inquiry';
    }
    return 'general';
  }

  get unreadCount(): number {
    return this.messages.filter(m => !m.read).length;
  }

  get todayCount(): number {
    return this.messages.filter(m => m.time.includes('AM') || m.time.includes('PM')).length;
  }

  filterMessages(filter: string) {
    this.activeFilter = filter;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredMessages = this.messages.filter(m => {
      const matchesFilter = this.activeFilter === 'all' || 
                           this.activeFilter === 'unread' && !m.read ||
                           this.activeFilter === m.category;
      const matchesSearch = !this.searchTerm || 
                           m.sender.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           m.subject.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           m.preview.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }

  selectMessage(msg: Message) {
    this.selectedMessage = msg;
    msg.read = true;
  }

  closeDetail() {
    this.selectedMessage = null;
  }

  markAllRead() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders(token ? { 'Authorization': `Bearer ${token}` } : {});

    this.http.patch(`${this.apiUrl}/messages/mark-read`, {}, { headers }).subscribe({
      next: () => {
        this.messages.forEach(m => m.read = true);
        alert('All messages marked as read!');
      },
      error: (error) => {
        console.error('Error marking messages as read:', error);
        this.messages.forEach(m => m.read = true);
        alert('Messages marked as read locally');
      }
    });
  }

  refreshMessages() {
    this.loadMessages();
  }

  replyMessage(msg: Message) {
    this.composeForm.to = msg.sender;
    this.composeForm.subject = `Re: ${msg.subject}`;
    this.composeForm.category = msg.category;
    this.showComposeModal = true;
  }

  forwardMessage(msg: Message) {
    this.composeForm.subject = `Fwd: ${msg.subject}`;
    this.composeForm.message = `\n\n--- Forwarded message ---\nFrom: ${msg.sender}\nSubject: ${msg.subject}\n\n${msg.content}`;
    this.showComposeModal = true;
  }

  deleteMessage(msg: Message) {
    if (confirm(`Delete message from ${msg.sender}?`)) {
      this.messages = this.messages.filter(m => m.id !== msg.id);
      this.applyFilters();
      if (this.selectedMessage?.id === msg.id) {
        this.selectedMessage = null;
      }
      alert('Message deleted!');
    }
  }

  openComposeModal() {
    this.composeForm = { to: '', subject: '', category: 'general', message: '' };
    this.showComposeModal = true;
  }

  closeComposeModal() {
    this.showComposeModal = false;
  }

  sendMessage() {
    if (!this.composeForm.to || !this.composeForm.subject || !this.composeForm.message) {
      alert('Please fill in all required fields');
      return;
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders(token ? { 'Authorization': `Bearer ${token}` } : {});
    const userId = JSON.parse(localStorage.getItem('user') || '{}').id;

    const messageData = {
      receiverId: this.composeForm.to, // Should be user ID in real implementation
      subject: this.composeForm.subject,
      content: this.composeForm.message,
      category: this.composeForm.category
    };

    this.http.post(`${this.apiUrl}/messages/send`, messageData, { headers }).subscribe({
      next: (response) => {
        alert(`Message sent successfully!`);
        this.closeComposeModal();
        this.loadMessages(); // Reload messages
      },
      error: (error) => {
        console.error('Error sending message:', error);
        alert('Message composed (API integration pending)');
        this.closeComposeModal();
      }
    });
  }
}
