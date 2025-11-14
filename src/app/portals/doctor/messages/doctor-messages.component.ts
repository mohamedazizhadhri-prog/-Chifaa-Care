import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MessageService } from '../../../services/message.service';
import { SocketService } from '../../../services/socket.service';
import { PatientService } from '../../../services/patient.service';
import { Subscription } from 'rxjs';
import { User as PatientUser } from '../../../models/user.model';

interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  text: string;
  timestamp: string;
  isRead?: boolean;
  senderName?: string;
}

interface Chat {
  id: string;
  patientName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  messages: Message[];
}

@Component({
  selector: 'app-doctor-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="messages-container fade-in">
      <div class="messages-layout">
        <!-- Chat List Sidebar -->
        <aside class="chat-sidebar card lift">
          <div class="sidebar-header">
            <div class="card-header">
              <span>Patient Messages</span>
              <div class="unread-count" *ngIf="getUnreadCount() > 0">
                {{ getUnreadCount() }}
              </div>
            </div>
          </div>
          <div class="sidebar-actions" style="margin-bottom: 8px; display: flex; gap: 8px;">
            <button class="btn btn-outline" (click)="togglePatientPicker()">
              <i class="fa-solid fa-user"></i> New chat
            </button>
          </div>
          <div class="chat-search">
            <input type="text" placeholder="Search patients..." class="search-input" [(ngModel)]="searchQuery" (input)="filterChats()">
            <i class="fa-solid fa-search search-icon"></i>
          </div>
          <!-- Patient Picker -->
          <div *ngIf="showPatientPicker" class="patient-picker card" style="padding: 8px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 8px;">
            <div style="font-weight: 600; margin-bottom: 6px;">Start a new chat</div>
            <div *ngIf="patients.length === 0" style="font-size: 0.9rem; color: #64748b;">No patients available.</div>
            <div *ngFor="let p of patients" (click)="startChatWithPatient(p)" style="display: flex; align-items: center; gap: 8px; padding: 8px; border-radius: 8px; cursor: pointer;">
              <div class="chat-avatar" style="background:#3498db; width:32px; height:32px;">
                <i class="fa-solid fa-user"></i>
              </div>
              <div style="flex:1; min-width:0;">
                <div style="font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">{{ p.firstName }} {{ p.lastName }}</div>
              </div>
            </div>
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
                <div class="chat-time">{{ formatTime(chat.lastMessageTime) }}</div>
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
              <button class="btn btn-outline" (click)="viewPatientProfile()">
                <i class="fa-solid fa-user"></i> Profile
              </button>
            </div>
          </div>

          <!-- Messages Area -->
          <div class="messages-area" #messagesContainer>
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
export class DoctorMessagesComponent implements OnInit, OnDestroy, AfterViewChecked {
  private subscriptions: Subscription[] = [];
  private shouldScrollToBottom = false;
  isLoadingMessages = false;
  
  currentDoctorId = '';
  selectedChatId: string | null = null;
  selectedChat: Chat | null = null;
  newMessage = '';
  searchQuery = '';
  showPatientPicker = false;
  patients: PatientUser[] = [];
  
  allChats: Chat[] = [];
  filteredChats: Chat[] = [];

  @ViewChild('messagesContainer') messagesContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('messageInput') messageInput?: ElementRef<HTMLInputElement>;

  constructor(
    private authService: AuthService,
    private messageService: MessageService,
    private socketService: SocketService,
    private patientService: PatientService,
    private router: Router
  ) { }

  ngOnInit() {
    console.log('[Doctor Messages] Initializing component...');
    
    const userSub = this.authService.currentUser$.subscribe(user => {
      if (user?.id) {
        console.log('[Doctor Messages] User authenticated:', user.id);
        this.currentDoctorId = user.id;
        this.loadConversations();
        this.loadPatients();
        this.socketService.connect(user.id);
        this.setupSocketListeners();
      }
    });
    
    this.subscriptions.push(userSub);
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy(): void {
    console.log('[Doctor Messages] Destroying component...');
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.socketService.disconnect();
  }

  private setupSocketListeners() {
    console.log('[Doctor Messages] Setting up socket listeners...');
    
    this.socketService.on<any>('message:new', (m) => {
      if (!m) return;
      console.log('[Doctor Messages] New message received:', m);
      
      const isSelf = m.senderId === this.currentDoctorId;
      const isToMe = m.recipientId === this.currentDoctorId;
      if (!isSelf && !isToMe) return;

      const otherId = isSelf ? m.recipientId : m.senderId;
      const mapped: Message = {
        id: m.id,
        senderId: m.senderId,
        recipientId: m.recipientId,
        text: m.content,
        timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: m.isRead || false,
        senderName: isSelf ? 'You' : (m.senderName || 'Patient')
      };

      if (this.selectedChatId === otherId && this.selectedChat) {
        const exists = this.selectedChat.messages.some((msg: Message) => msg.id === mapped.id);
        if (!exists) {
          this.selectedChat.messages.push(mapped);
          this.selectedChat.lastMessage = mapped.text;
          this.selectedChat.lastMessageTime = new Date().toISOString();
          this.shouldScrollToBottom = true;
          
          if (isToMe && !isSelf) {
            this.messageService.markThreadRead(this.currentDoctorId, otherId).subscribe();
          }
        }
      } else {
        const chat = this.allChats.find(c => c.id === otherId);
        if (chat) {
          if (isToMe && !isSelf) {
            chat.unreadCount = (chat.unreadCount || 0) + 1;
          }
          chat.lastMessage = m.content;
          chat.lastMessageTime = new Date().toISOString();
          
          this.allChats = [chat, ...this.allChats.filter(c => c.id !== otherId)];
          this.filterChats();
        } else if (isToMe && !isSelf) {
          this.loadConversations();
        }
      }
    });

    this.socketService.on<any>('presence:update', (p: { userId: string; online: boolean }) => {
      console.log('[Doctor Messages] Presence update:', p);
      const chat = this.allChats.find(c => c.id === p.userId);
      if (chat) {
        chat.isOnline = p.online;
        if (this.selectedChat && this.selectedChat.id === p.userId) {
          this.selectedChat.isOnline = p.online;
        }
      }
    });

    this.socketService.on<any>('message:read', (data: { userId: string; otherUserId: string }) => {
      if (data.otherUserId === this.currentDoctorId && this.selectedChat?.id === data.userId) {
        this.selectedChat.messages.forEach((msg: Message) => {
          if (msg.senderId === this.currentDoctorId) {
            msg.isRead = true;
          }
        });
      }
    });
  }

  getMessageDates(): string[] {
    if (!this.selectedChat) return [];
    const dates = new Set<string>();
    this.selectedChat.messages.forEach(msg => {
      const date = new Date(msg.timestamp).toLocaleDateString();
      dates.add(date);
    });
    return Array.from(dates);
  }

  filterChats() {
    if (!this.searchQuery.trim()) {
      this.filteredChats = [...this.allChats];
    } else {
      const query = this.searchQuery.toLowerCase().trim();
      this.filteredChats = this.allChats.filter(chat => 
        chat.patientName.toLowerCase().includes(query) ||
        chat.lastMessage.toLowerCase().includes(query)
      );
    }
  }

  formatTime(time: string): string {
    if (!time) return '';
    const date = new Date(time);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }

  selectChat(chatId: string) {
    console.log('[Doctor Messages] Selecting chat:', chatId);
    
    this.selectedChatId = chatId;
    this.selectedChat = this.allChats.find(chat => chat.id === chatId) || null;
    
    if (!this.selectedChat || !this.currentDoctorId) return;
    
    this.loadMessages(chatId);
    
    if (this.selectedChat.unreadCount > 0) {
      this.messageService.markThreadRead(this.currentDoctorId, chatId).subscribe(() => {
        if (this.selectedChat) {
          this.selectedChat.unreadCount = 0;
        }
      });
    }
    
    setTimeout(() => {
      this.messageInput?.nativeElement.focus();
    }, 100);
  }

  private loadMessages(chatId: string) {
    if (this.isLoadingMessages) return;
    
    console.log('[Doctor Messages] Loading messages for chat:', chatId);
    this.isLoadingMessages = true;
    
    this.messageService.getThread(this.currentDoctorId, chatId).subscribe({
      next: (res) => {
        console.log('[Doctor Messages] Messages loaded:', res.data.messages.length);
        
        const mapped = res.data.messages.map((m: any) => ({
          id: m.id,
          senderId: m.senderId,
          recipientId: m.recipientId,
          text: m.content,
          timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: m.isRead,
          senderName: m.senderId === this.currentDoctorId ? 'You' : this.selectedChat?.patientName
        }));
        
        if (this.selectedChat && this.selectedChat.id === chatId) {
          this.selectedChat.messages = mapped;
          this.shouldScrollToBottom = true;
        }
        
        this.isLoadingMessages = false;
      },
      error: (err) => {
        console.error('[Doctor Messages] Error loading messages:', err);
        this.isLoadingMessages = false;
      }
    });
  }

  getUnreadCount(): number {
    return this.allChats.reduce((total, chat) => total + (chat.unreadCount || 0), 0);
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedChat || !this.currentDoctorId || !this.selectedChatId) {
      return;
    }
    
    const content = this.newMessage.trim();
    const tempId = `temp-${Date.now()}`;
    
    const tempMessage: Message = {
      id: tempId,
      senderId: this.currentDoctorId,
      recipientId: this.selectedChatId,
      text: content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      senderName: 'You'
    };
    
    this.selectedChat.messages.push(tempMessage);
    this.selectedChat.lastMessage = content;
    this.selectedChat.lastMessageTime = new Date().toISOString();
    this.shouldScrollToBottom = true;
    
    const messageToSend = this.newMessage;
    this.newMessage = '';
    
    this.messageService.sendMessage(this.currentDoctorId, this.selectedChatId, content).subscribe({
      next: (res) => {
        const m = res.data.message;
        
        const index = this.selectedChat!.messages.findIndex((msg: Message) => msg.id === tempId);
        if (index !== -1) {
          this.selectedChat!.messages[index] = {
            id: m.id,
            senderId: m.senderId,
            recipientId: m.recipientId,
            text: m.content,
            timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isRead: m.isRead,
            senderName: 'You'
          };
        }
        
        console.log('[Doctor Messages] Message sent successfully');
      },
      error: (err) => {
        console.error('[Doctor Messages] Error sending message:', err);
        
        const index = this.selectedChat!.messages.findIndex((msg: Message) => msg.id === tempId);
        if (index !== -1) {
          this.selectedChat!.messages.splice(index, 1);
        }
        
        this.newMessage = messageToSend;
        alert('Failed to send message. Please try again.');
      }
    });
  }

  attachFile() {
    console.log('[Doctor Messages] Attach file clicked');
    // TODO: Implement file attachment
  }

  private scrollToBottom() {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('[Doctor Messages] Error scrolling:', err);
    }
  }

  viewPatientProfile() {
    console.log('[Doctor Messages] Viewing profile of', this.selectedChat?.patientName);
    if (this.selectedChatId) {
      this.router.navigate(['/doctor/patients', this.selectedChatId]);
    }
  }

  private loadConversations() {
    console.log('[Doctor Messages] Loading conversations...');
    
    this.messageService.getConversations(this.currentDoctorId).subscribe({
      next: (res) => {
        console.log('[Doctor Messages] Conversations loaded:', res.data.conversations.length);
        
        const patientConversations = res.data.conversations.filter((c: any) => 
          c.role === 'patient' || c.role === 'Patient'
        );
        
        this.allChats = patientConversations.map((c: any) => ({
          id: c.otherUserId,
          patientName: c.name,
          lastMessage: c.lastMessage || '',
          lastMessageTime: c.lastMessageTime,
          unreadCount: c.unreadCount || 0,
          isOnline: false,
          messages: []
        }));
        
        this.allChats.sort((a, b) => {
          const timeA = new Date(a.lastMessageTime).getTime();
          const timeB = new Date(b.lastMessageTime).getTime();
          return timeB - timeA;
        });
        
        this.filterChats();
        
        console.log('[Doctor Messages] Processed chats:', this.allChats.length);
      },
      error: (err) => {
        console.error('[Doctor Messages] Error loading conversations:', err);
      }
    });
  }

  private loadPatients() {
    console.log('[Doctor Messages] Loading patients...');
    
    this.patientService.getPatients().subscribe({
      next: (list) => {
        this.patients = list || [];
        console.log('[Doctor Messages] Patients loaded:', this.patients.length);
      },
      error: (err) => {
        console.error('[Doctor Messages] Error loading patients:', err);
      }
    });
  }

  togglePatientPicker() {
    this.showPatientPicker = !this.showPatientPicker;
    if (this.showPatientPicker && this.patients.length === 0) {
      this.loadPatients();
    }
  }

  startChatWithPatient(p: PatientUser) {
    const patientId = p.id;
    const name = `${p.firstName} ${p.lastName}`.trim() || 'Patient';

    let chat = this.allChats.find(c => c.id === patientId);
    if (!chat) {
      chat = {
        id: patientId,
        patientName: name,
        lastMessage: '',
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
        isOnline: false,
        messages: []
      };
      this.allChats.unshift(chat);
      this.filterChats();
    }

    this.showPatientPicker = false;
    this.searchQuery = '';
    this.filterChats();
    this.selectChat(patientId);
  }
}
