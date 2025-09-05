import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../../services/auth.service';
import { MessageService } from '../../../services/message.service';
import { SocketService } from '../../../services/socket.service';

@Component({
  selector: 'app-doctor-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="messages-container fade-in">
      <div class="messages-layout">
        <!-- Chat List Sidebar -->
        <aside class="chat-sidebar card lift">
          <div class="sidebar-header">
            <div class="card-header">Messages</div>
            <div class="unread-count" *ngIf="getUnreadCount() > 0">
              {{ getUnreadCount() }}
            </div>
          </div>
          <div class="chat-search">
            <input type="text" placeholder="Search patients..." class="search-input" [(ngModel)]="searchQuery" (input)="filterChats()">
            <i class="fa-solid fa-search search-icon"></i>
          </div>
          <div class="chat-list">
            <div *ngFor="let chat of filteredChats" 
                 class="chat-item" 
                 [class.active]="selectedChatId === chat.id"
                 [class.unread]="chat.unreadCount > 0"
                 (click)="selectChat(chat.id)">
              <div class="chat-avatar">
                <i class="fa-solid fa-user"></i>
              </div>
              <div class="chat-info">
                <div class="chat-name">{{ chat.patientName }}</div>
                <div class="chat-preview">{{ chat.lastMessage }}</div>
                <div class="chat-time">{{ chat.lastMessageTime }}</div>
              </div>
              <div class="chat-status">
                <span class="unread-badge" *ngIf="chat.unreadCount > 0">{{ chat.unreadCount }}</span>
                <i class="fa-solid fa-circle status-indicator" [class.online]="chat.isOnline"></i>
              </div>
            </div>
          </div>
        </aside>

        <!-- Chat Window -->
        <section class="chat-window card lift" *ngIf="selectedChat">
          <!-- Chat Header -->
          <div class="chat-header">
            <div class="chat-patient-info">
              <div class="patient-avatar">
                <i class="fa-solid fa-user"></i>
              </div>
              <div class="patient-details">
                <strong>{{ selectedChat.patientName }}</strong>
                <span class="patient-status" [class.online]="selectedChat.isOnline">
                  <i class="fa-solid fa-circle"></i>
                  {{ selectedChat.isOnline ? 'Online' : 'Offline' }}
                </span>
              </div>
            </div>
            <div class="chat-actions">
              <button class="btn btn-outline" (click)="startVideoCall()">
                <i class="fa-solid fa-video"></i> Video Call
              </button>
              <button class="btn btn-outline" (click)="viewPatientProfile()">
                <i class="fa-solid fa-user"></i> Profile
              </button>
            </div>
          </div>

          <!-- Messages Area -->
          <div class="messages-area" #messagesContainer>
            <div class="message-date" *ngFor="let date of getMessageDates()">
              {{ date }}
            </div>
            <div *ngFor="let message of selectedChat.messages" 
                 class="message" 
                 [class.sent]="message.senderId === currentDoctorId"
                 [class.received]="message.senderId !== currentDoctorId">
              <div class="message-content">
                <div class="message-text">{{ message.text }}</div>
                <div class="message-time">{{ message.timestamp }}</div>
              </div>
            </div>
          </div>

          <!-- Message Input -->
          <div class="message-input-area">
            <div class="input-container">
              <button class="attachment-btn" (click)="attachFile()">
                <i class="fa-solid fa-paperclip"></i>
              </button>
              <input type="text" 
                     placeholder="Type your message..." 
                     class="message-input"
                     [(ngModel)]="newMessage"
                     (keyup.enter)="sendMessage()"
                     #messageInput>
              <button class="send-btn" 
                      (click)="sendMessage()" 
                      [disabled]="!newMessage.trim()">
                <i class="fa-solid fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </section>

        <!-- Empty State -->
        <div class="empty-chat-state" *ngIf="!selectedChat">
          <i class="fa-solid fa-comments"></i>
          <h3>Select a conversation</h3>
          <p>Choose a patient from the list to start messaging</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .messages-container {
      height: calc(100vh - 120px);
      max-height: 800px;
    }
    .messages-layout {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 16px;
      height: 100%;
    }
    .chat-sidebar {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    .unread-count {
      background: #ef4444;
      color: white;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 600;
    }
    .chat-search {
      position: relative;
      margin-bottom: 16px;
    }
    .search-input {
      width: 100%;
      padding: 8px 12px 8px 36px;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      font-size: 0.9rem;
      outline: none;
    }
    .search-input:focus {
      border-color: #3498db;
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
    }
    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #64748b;
    }
    .chat-list {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .chat-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
      border: 1px solid transparent;
    }
    .chat-item:hover {
      background: #f8fafc;
    }
    .chat-item.active {
      background: #e3f2fd;
      border-color: #3498db;
    }
    .chat-item.unread {
      background: #fef3c7;
    }
    .chat-avatar {
      width: 40px;
      height: 40px;
      background: #3498db;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    .chat-info {
      flex: 1;
      min-width: 0;
    }
    .chat-name {
      font-weight: 600;
      margin-bottom: 2px;
    }
    .chat-preview {
      font-size: 0.85rem;
      color: #64748b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .chat-time {
      font-size: 0.75rem;
      color: #94a3b8;
      margin-top: 2px;
    }
    .chat-status {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .unread-badge {
      background: #ef4444;
      color: white;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      font-weight: 600;
    }
    .status-indicator {
      font-size: 0.5rem;
      color: #94a3b8;
    }
    .status-indicator.online {
      color: #22c55e;
    }
    .chat-window {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .chat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      border-bottom: 1px solid #e2e8f0;
    }
    .chat-patient-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .patient-avatar {
      width: 48px;
      height: 48px;
      background: #3498db;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.2rem;
    }
    .patient-status {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.85rem;
      color: #64748b;
    }
    .patient-status.online {
      color: #22c55e;
    }
    .chat-actions {
      display: flex;
      gap: 8px;
    }
    .messages-area {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .message {
      display: flex;
      max-width: 70%;
    }
    .message.sent {
      align-self: flex-end;
    }
    .message.received {
      align-self: flex-start;
    }
    .message-content {
      background: #f1f5f9;
      padding: 12px 16px;
      border-radius: 18px;
      position: relative;
    }
    .message.sent .message-content {
      background: #3498db;
      color: white;
    }
    .message-text {
      margin-bottom: 4px;
    }
    .message-time {
      font-size: 0.75rem;
      opacity: 0.7;
    }
    .message-input-area {
      padding: 16px;
      border-top: 1px solid #e2e8f0;
    }
    .input-container {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #f8fafc;
      border-radius: 24px;
      padding: 8px;
    }
    .attachment-btn {
      background: none;
      border: none;
      color: #64748b;
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
      transition: all 0.2s;
    }
    .attachment-btn:hover {
      background: #e2e8f0;
      color: #3498db;
    }
    .message-input {
      flex: 1;
      border: none;
      outline: none;
      background: transparent;
      padding: 8px 12px;
      font-size: 0.9rem;
    }
    .send-btn {
      background: #3498db;
      border: none;
      color: white;
      padding: 8px 12px;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .send-btn:hover:not(:disabled) {
      background: #2980b9;
    }
    .send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .empty-chat-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #64748b;
      text-align: center;
    }
    .empty-chat-state i {
      font-size: 3rem;
      margin-bottom: 16px;
      opacity: 0.5;
    }
    .empty-chat-state h3 {
      margin: 0 0 8px 0;
      color: #374151;
    }
    .empty-chat-state p {
      margin: 0;
      font-size: 0.9rem;
    }
    @media (max-width: 768px) {
      .messages-layout {
        grid-template-columns: 1fr;
      }
      .chat-sidebar {
        display: none;
      }
    }
  `]
})
export class DoctorMessagesComponent implements OnInit {
  currentDoctorId = '';
  selectedChatId: string | null = null;
  selectedChat: any = null;
  newMessage = '';
  searchQuery = '';
  
  allChats: Array<{ id: string; patientName: string; lastMessage: string; lastMessageTime: string; unreadCount: number; isOnline: boolean; messages: Array<{ id: string; senderId: string; text: string; timestamp: string; recipientId?: string; }> }> = [];
  
  filteredChats = this.allChats;

  constructor(private authService: AuthService, private messageService: MessageService, private socket: SocketService) {}

  ngOnInit() {
    // Load current user then conversations
    this.authService.currentUser$.subscribe(user => {
      if (user?.id) {
        this.currentDoctorId = user.id;
        this.loadConversations();
        this.socket.connect(user.id);
        this.socket.on<any>('message:new', (m) => {
          // For doctors, new messages likely come from patients (senderId)
          if (this.selectedChatId === m.senderId && this.selectedChat) {
            const mapped = { id: m.id, senderId: m.senderId, recipientId: m.recipientId, text: m.content, timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
            this.selectedChat.messages.push(mapped);
            this.selectedChat.lastMessage = mapped.text;
            this.selectedChat.lastMessageTime = 'Just now';
          } else {
            const chat = this.allChats.find(c => c.id === m.senderId);
            if (chat) {
              chat.unreadCount = (chat.unreadCount || 0) + 1;
              chat.lastMessage = m.content;
              chat.lastMessageTime = 'Just now';
            } else {
              this.allChats.unshift({
                id: m.senderId,
                patientName: 'New Message',
                lastMessage: m.content,
                lastMessageTime: 'Just now',
                unreadCount: 1,
                isOnline: false,
                messages: []
              });
              this.filteredChats = this.allChats;
            }
          }
        });
      }
    });
  }

  filterChats() {
    if (!this.searchQuery.trim()) {
      this.filteredChats = this.allChats;
    } else {
      this.filteredChats = this.allChats.filter(chat => 
        chat.patientName.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  }

  selectChat(chatId: string) {
    this.selectedChatId = chatId;
    this.selectedChat = this.allChats.find(chat => chat.id === chatId);
    if (!this.currentDoctorId) return;
    this.messageService.getThread(this.currentDoctorId, chatId).subscribe(res => {
      const mapped = res.data.messages.map(m => ({ id: m.id, senderId: m.senderId, recipientId: m.recipientId, text: m.content, timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }));
      if (this.selectedChat) {
        this.selectedChat.messages = mapped;
        this.selectedChat.unreadCount = 0;
      }
      this.messageService.markThreadRead(this.currentDoctorId, chatId).subscribe();
    });
  }

  getUnreadCount(): number {
    return this.allChats.reduce((total, chat) => total + chat.unreadCount, 0);
  }

  getMessageDates(): string[] {
    // This would normally extract unique dates from messages
    return ['Today'];
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedChat || !this.currentDoctorId || !this.selectedChatId) return;
    const content = this.newMessage.trim();
    this.messageService.sendMessage(this.currentDoctorId, this.selectedChatId, content).subscribe(res => {
      const m = res.data.message;
      const mapped = { id: m.id, senderId: m.senderId, recipientId: m.recipientId, text: m.content, timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      this.selectedChat.messages.push(mapped);
      this.selectedChat.lastMessage = mapped.text;
      this.selectedChat.lastMessageTime = 'Just now';
      this.newMessage = '';
    });
  }

  attachFile() {
    console.log('Attach file clicked');
    // Implement file attachment functionality
  }

  startVideoCall() {
    console.log('Starting video call with', this.selectedChat?.patientName);
    // Implement video call functionality
  }

  viewPatientProfile() {
    console.log('Viewing profile of', this.selectedChat?.patientName);
    // Navigate to patient profile
  }

  private loadConversations() {
    if (!this.currentDoctorId) return;
    this.messageService.getConversations(this.currentDoctorId).subscribe(res => {
      const convs = res.data.conversations;
      this.allChats = convs.map(c => ({
        id: c.otherUserId,
        patientName: c.name,
        lastMessage: c.lastMessage,
        lastMessageTime: new Date(c.lastMessageTime).toLocaleString(),
        unreadCount: c.unreadCount,
        isOnline: false,
        messages: []
      }));
      this.filteredChats = this.allChats;
      if (this.allChats.length > 0) {
        this.selectChat(this.allChats[0].id);
      }
    });
  }
}
