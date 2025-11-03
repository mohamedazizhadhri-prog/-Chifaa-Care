import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MessageService } from '../../../services/message.service';
import { DoctorService } from '../../../services/doctor.service';
import { SocketService } from '../../../services/socket.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DoctorUser } from '../../../models/doctor.model';

interface Chat {
  id: string;
  doctorName: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline: boolean;
  doctorId: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: Date;
  isRead: boolean;
}

interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  createdAt: string | Date;
  isRead: boolean;
}

@Component({
  selector: 'app-doctor-doctor-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="messages-container">
      <div class="messages-layout">
        <!-- Chat List Sidebar -->
        <aside class="chat-sidebar card">
          <div class="sidebar-header">
            <div class="card-header">
              <span>Doctor Messages</span>
              <div class="unread-count" *ngIf="getUnreadCount() > 0">
                {{ getUnreadCount() }}
              </div>
            </div>
          </div>
          
          <div class="sidebar-actions">
            <button class="btn btn-outline" (click)="toggleDoctorPicker()">
              <i class="fa-solid fa-user-doctor"></i> New chat
            </button>
          </div>

          <!-- Doctor Picker -->
          <div *ngIf="showDoctorPicker" class="doctor-picker card">
            <div class="picker-header">Start a new chat with a doctor</div>
            <div *ngIf="otherDoctors.length === 0" class="no-doctors">
              No other doctors available.
            </div>
            <div 
              *ngFor="let doctor of otherDoctors" 
              class="doctor-item"
              (click)="startChatWithDoctor(doctor)">
              <div class="chat-avatar">
                <img [src]="doctor.avatar" [alt]="doctor.firstName + ' ' + doctor.lastName" class="avatar-img" onerror="this.src='assets/images/default-avatar.png'">
              </div>
              <div class="doctor-info">
                <div class="doctor-name">{{ doctor.firstName }} {{ doctor.lastName }}</div>
                <div class="doctor-specialty">{{ doctor.specialization }}</div>
              </div>
              <div class="doctor-action">
                <i class="fa-solid fa-comment-dots"></i>
              </div>
            </div>
          </div>

          <div class="chat-search">
            <input 
              type="text" 
              placeholder="Search doctors..." 
              [(ngModel)]="searchQuery" 
              (input)="filterChats()">
            <i class="fa-solid fa-search"></i>
          </div>

          <div class="chat-list">
            <div 
              *ngFor="let chat of filteredChats"
              class="chat-item"
              [class.active]="selectedChatId === chat.id"
              [class.unread]="chat.unreadCount > 0"
              (click)="selectChat(chat.id)">
              <div class="chat-avatar">
                <i class="fa-solid fa-user-doctor"></i>
              </div>
              <div class="chat-info">
                <div class="chat-name">{{ chat.doctorName || 'Doctor' }}</div>
                <div class="chat-preview">{{ chat.lastMessage || 'No messages yet' }}</div>
              </div>
              <div class="chat-status">
                <span class="chat-time">{{ chat.lastMessageTime | date:'shortTime' }}</span>
                <span *ngIf="chat.unreadCount > 0" class="unread-badge">
                  {{ chat.unreadCount }}
                </span>
                <i 
                  class="fa-solid fa-circle status-indicator" 
                  [class.online]="chat.isOnline"
                  [class.offline]="!chat.isOnline">
                </i>
              </div>
            </div>
          </div>
        </aside>

        <!-- Chat Area -->
        <div class="chat-area" *ngIf="selectedChat">
          <div class="chat-header">
            <div class="chat-doctor-info">
              <div class="doctor-avatar">
                <i class="fa-solid fa-user-doctor"></i>
              </div>
              <div class="doctor-details">
                <strong>{{ selectedChat.doctorName || 'Doctor' }}</strong>
                <span class="doctor-status" [class.online]="selectedChat.isOnline">
                  <i class="fa-solid fa-circle"></i>
                  {{ selectedChat.isOnline ? 'Online' : 'Offline' }}
                </span>
                <span *ngIf="dialing" class="call-status">Ringing...</span>
              </div>
            </div>
            <div class="chat-actions">
              <div class="dropdown">
                <button class="btn btn-outline" (click)="toggleCallMenu()">
                  <i class="fa-solid fa-phone"></i> Request Call
                </button>
                <div *ngIf="showCallMenu" class="dropdown-menu">
                  <button class="dropdown-item" (click)="startCall('audio')">
                    <i class="fa-solid fa-microphone"></i> Voice only
                  </button>
                  <button class="dropdown-item" (click)="startCall('video')">
                    <i class="fa-solid fa-video"></i> Video + Voice
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div #messagesContainer class="chat-messages">
            <div 
              *ngFor="let msg of currentMessages" 
              class="message" 
              [class.sent]="msg.senderId === currentUser?.id" 
              [class.received]="msg.senderId !== currentUser?.id">
              <div class="message-content">{{ msg.content }}</div>
              <div class="message-time">
                {{ msg.timestamp | date:'shortTime' }}
                <i 
                  *ngIf="msg.senderId === currentUser?.id" 
                  class="message-status" 
                  [class.read]="msg.isRead">
                  {{ msg.isRead ? '✓✓' : '✓' }}
                </i>
              </div>
            </div>
          </div>
          
          <div class="message-input-container">
            <form (ngSubmit)="sendMessage()" class="message-form" #messageForm="ngForm">
              <div class="message-input-wrapper">
                <textarea 
                  #messageInput
                  class="message-input" 
                  [(ngModel)]="newMessage" 
                  name="message" 
                  placeholder="Type a message..."
                  (keydown)="onTextareaKeydown($event)"
                  rows="1">
                </textarea>
                <div class="message-actions">
                  <button type="button" class="btn-icon" (click)="attachFile()">
                    <i class="fa-solid fa-paperclip"></i>
                  </button>
                </div>
              </div>
              <button type="submit" class="send-button" [disabled]="!newMessage.trim()">
                <i class="fa-solid fa-paper-plane"></i>
              </button>
            </form>
          </div>
        </div>
        
        <!-- No chat selected -->
        <div *ngIf="!selectedChat" class="no-chat-selected">
          <div class="no-chat-content">
            <i class="fa-solid fa-comments no-chat-icon"></i>
            <h3>No conversation selected</h3>
            <p>Select a chat or start a new conversation with a doctor</p>
            <button class="btn btn-primary" (click)="toggleDoctorPicker()">
              <i class="fa-solid fa-plus"></i> New Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Messages container */
    .messages-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background-color: #f8fafc;
      padding: 1rem;
    }

    .messages-layout {
      display: flex;
      height: 100%;
      gap: 1rem;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
    }

    /* Chat sidebar */
    .chat-sidebar {
      width: 350px;
      display: flex;
      flex-direction: column;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .sidebar-header {
      padding: 1rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .unread-count {
      background-color: #ef4444;
      color: white;
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      min-width: 1.5rem;
      text-align: center;
    }

    .sidebar-actions {
      padding: 0.75rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-outline {
      background: white;
      border: 1px solid #e2e8f0;
      color: #3b82f6;
    }

    .btn-outline:hover {
      background-color: #f8fafc;
    }

    .btn-primary {
      background-color: #3b82f6;
      color: white;
      border: none;
    }

    .btn-primary:hover {
      background-color: #2563eb;
    }

    .btn-icon {
      background: none;
      border: none;
      color: #64748b;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-icon:hover {
      background-color: #f1f5f9;
    }

    .doctor-picker {
      margin: 0.5rem;
      padding: 0.5rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      max-height: 400px;
      overflow-y: auto;
    }

    .picker-header {
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .no-doctors {
      color: #64748b;
      font-size: 0.875rem;
      padding: 0.5rem 0;
    }

    .doctor-item {
      display: flex;
      align-items: center;
      padding: 0.75rem;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: 0.5rem;
      border: 1px solid #e2e8f0;
    }

    .doctor-item:hover {
      background-color: #f8fafc;
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .doctor-item:active {
      transform: translateY(0);
    }

    .doctor-item .chat-avatar {
      width: 3rem;
      height: 3rem;
      margin-right: 1rem;
    }

    .doctor-item .avatar-img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }

    .doctor-item .doctor-info {
      flex: 1;
      min-width: 0;
    }

    .doctor-item .doctor-name {
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 0.25rem;
    }

    .doctor-item .doctor-specialty {
      font-size: 0.875rem;
      color: #64748b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .doctor-item .doctor-action {
      margin-left: 1rem;
      color: #3b82f6;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .doctor-item:hover .doctor-action {
      opacity: 1;
    }

    .chat-search {
      position: relative;
      padding: 0.75rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .chat-search input {
      width: 100%;
      padding: 0.5rem 2rem 0.5rem 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.375rem;
      font-size: 0.875rem;
    }

    .chat-search i {
      position: absolute;
      right: 1.5rem;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
    }

    .chat-list {
      flex: 1;
      overflow-y: auto;
    }

    .chat-item {
      display: flex;
      padding: 0.75rem;
      border-bottom: 1px solid #f1f5f9;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .chat-item:hover {
      background-color: #f8fafc;
    }

    .chat-item.active {
      background-color: #f1f5f9;
    }

    .chat-item.unread {
      background-color: #f0f9ff;
    }

    .chat-avatar {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      background-color: #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 0.75rem;
      flex-shrink: 0;
    }

    .chat-avatar i {
      color: #64748b;
    }

    .chat-info {
      flex: 1;
      min-width: 0;
    }

    .chat-name {
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .chat-preview {
      font-size: 0.875rem;
      color: #64748b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .chat-status {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      margin-left: 0.5rem;
    }

    .chat-time {
      font-size: 0.75rem;
      color: #94a3b8;
      margin-bottom: 0.25rem;
    }

    .unread-badge {
      background-color: #3b82f6;
      color: white;
      font-size: 0.75rem;
      padding: 0.125rem 0.375rem;
      border-radius: 9999px;
      min-width: 1.25rem;
      text-align: center;
      line-height: 1;
    }

    .status-indicator {
      font-size: 0.5rem;
    }

    .status-indicator.online {
      color: #10b981;
    }

    .status-indicator.offline {
      color: #94a3b8;
    }

    /* Chat area */
    .chat-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      background-color: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .chat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .chat-doctor-info {
      display: flex;
      align-items: center;
    }

    .doctor-avatar {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      background-color: #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 0.75rem;
    }

    .doctor-avatar i {
      color: #64748b;
    }

    .doctor-details {
      display: flex;
      flex-direction: column;
    }

    .doctor-status {
      display: flex;
      align-items: center;
      font-size: 0.875rem;
      color: #64748b;
      margin-top: 0.25rem;
    }

    .doctor-status i {
      font-size: 0.5rem;
      margin-right: 0.25rem;
    }

    .doctor-status.online i {
      color: #10b981;
    }

    .call-status {
      margin-left: 0.5rem;
      color: #3b82f6;
      font-size: 0.875rem;
    }

    .dropdown {
      position: relative;
    }

    .dropdown-menu {
      position: absolute;
      right: 0;
      top: 100%;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 0.375rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      z-index: 10;
      min-width: 10rem;
      margin-top: 0.5rem;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      width: 100%;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      color: #1e293b;
      background: none;
      border: none;
      text-align: left;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .dropdown-item:hover {
      background-color: #f8fafc;
    }

    .dropdown-item i {
      margin-right: 0.5rem;
      width: 1rem;
      text-align: center;
    }

    .chat-messages {
      flex: 1;
      padding: 1rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .message {
      max-width: 70%;
      padding: 0.75rem 1rem;
      border-radius: 1rem;
      position: relative;
      word-wrap: break-word;
      line-height: 1.5;
    }

    .message.sent {
      align-self: flex-end;
      background-color: #3b82f6;
      color: white;
      border-bottom-right-radius: 0.25rem;
    }

    .message.received {
      align-self: flex-start;
      background-color: #f1f5f9;
      color: #1e293b;
      border-bottom-left-radius: 0.25rem;
    }

    .message-time {
      font-size: 0.75rem;
      margin-top: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }

    .message.sent .message-time {
      color: rgba(255, 255, 255, 0.8);
    }

    .message.received .message-time {
      color: #94a3b8;
    }

    .message-status {
      margin-left: 0.25rem;
      font-size: 0.75rem;
    }

    .message-status.read {
      color: #34d399;
    }

    .message-input-container {
      padding: 1rem;
      border-top: 1px solid #e2e8f0;
    }

    .message-form {
      display: flex;
      align-items: flex-end;
      gap: 0.5rem;
    }

    .message-input-wrapper {
      flex: 1;
      position: relative;
    }

    .message-input {
      width: 100%;
      padding: 0.75rem 2.5rem 0.75rem 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 1.5rem;
      resize: none;
      min-height: 3rem;
      max-height: 7.5rem;
      font-family: inherit;
      line-height: 1.5;
    }

    .message-input:focus {
      outline: none;
      border-color: #93c5fd;
      box-shadow: 0 0 0 3px rgba(147, 197, 253, 0.5);
    }

    .message-actions {
      position: absolute;
      right: 0.5rem;
      bottom: 0.5rem;
    }

    .send-button {
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      background-color: #3b82f6;
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: background-color 0.2s;
    }

    .send-button:hover:not(:disabled) {
      background-color: #2563eb;
    }

    .send-button:disabled {
      background-color: #cbd5e1;
      cursor: not-allowed;
    }

    /* No chat selected */
    .no-chat-selected {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: #64748b;
      padding: 2rem;
    }

    .no-chat-content {
      max-width: 20rem;
    }

    .no-chat-icon {
      font-size: 3rem;
      color: #e2e8f0;
      margin-bottom: 1rem;
    }

    .no-chat-content h3 {
      margin: 0 0 0.5rem;
      color: #1e293b;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .no-chat-content p {
      margin-bottom: 1.5rem;
      color: #64748b;
      line-height: 1.5;
    }

    /* Animations */
    .fade-in {
      animation: fadeIn 0.3s ease-in-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class DoctorDoctorMessagesComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  
  // Component state
  currentUser: any;
  conversations: Chat[] = [];
  filteredChats: Chat[] = [];
  selectedChatId: string | null = null;
  selectedChat: Chat | null = null;
  currentMessages: Message[] = [];
  newMessage = '';
  searchQuery = '';
  showDoctorPicker = false;
  doctors: any[] = [];
  otherDoctors: any[] = [];
  showCallMenu = false;
  dialing = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private messageService: MessageService,
    private doctorService: DoctorService,
    private socketService: SocketService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        this.initializeComponent();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeComponent(): void {
    this.loadConversations();
    this.loadDoctors();
    this.setupSocketListeners();
  }

  private async loadConversations(): Promise<void> {
    if (!this.currentUser?.id) return;
    
    try {
      // First, get all doctors to verify which conversations are with actual doctors
      const doctors = await this.doctorService.getDoctors().toPromise();
      const doctorIds = new Set(doctors?.filter(d => d.role === 'DOCTOR' && d.doctorProfile)?.map(d => d.id) || []);
      
      // Now get all conversations
      const response = await this.messageService.getConversations(this.currentUser.id).toPromise();
      
      if (response?.status === 'success') {
        // Filter conversations to only include doctor-doctor conversations
        this.conversations = response.data.conversations
          .filter(conv => {
            const isWithDoctor = doctorIds.has(conv.otherUserId);
            if (!isWithDoctor) {
              console.log(`[Doctor Chat] Filtering out conversation with ${conv.name} (ID: ${conv.otherUserId}) - Not a doctor or invalid profile`);
              return false;
            }
            
            // Additional check to ensure we don't include the current user's own conversations
            if (conv.otherUserId === this.currentUser?.id) {
              console.log(`[Doctor Chat] Filtering out conversation with self (ID: ${conv.otherUserId})`);
              return false;
            }
            
            return true;
          })
          .map(conv => {
            const doctor = doctors?.find(d => d.id === conv.otherUserId);
            return {
              id: conv.otherUserId,
              doctorId: conv.otherUserId,
              doctorName: conv.name || 'Unknown Doctor',
              lastMessage: conv.lastMessage,
              lastMessageTime: new Date(conv.lastMessageTime),
              unreadCount: conv.unreadCount || 0,
              isOnline: false,
              specialization: doctor?.doctorProfile?.specialization || 'General Practitioner'
            };
          });
          
        console.log('[Doctor Chat] Loaded conversations:', {
          totalConversations: response.data.conversations.length,
          doctorConversations: this.conversations.length,
          conversations: this.conversations
        });
        
        this.filteredChats = [...this.conversations];
      }
    } catch (error) {
      console.error('[Doctor Chat] Error loading conversations:', error);
      // You might want to show an error message to the user here
    }
  }

  private loadDoctors(): void {
    if (!this.currentUser?.id) return;
    
    this.doctorService.getDoctors().subscribe({
      next: (doctors) => {
        console.log('Fetched doctors:', doctors);
        
        // Filter out non-doctors and the current user
        this.otherDoctors = doctors
          .filter(doctor => {
            const isDoctor = doctor.role === 'DOCTOR' && doctor.doctorProfile;
            const isNotCurrentUser = doctor.id !== this.currentUser?.id;
            if (!isDoctor) {
              console.log(`Excluding user ${doctor.firstName} ${doctor.lastName}: Not a doctor or missing profile`);
            }
            return isDoctor && isNotCurrentUser;
          })
          .map(doctor => {
            const fullName = `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim();
            console.log(`Including doctor: ${fullName} (ID: ${doctor.id})`);
            return {
              id: doctor.id,
              firstName: doctor.firstName || 'Doctor',
              lastName: doctor.lastName || '',
              email: doctor.email,
              specialization: doctor.doctorProfile?.specialization || 'General Practitioner',
              avatar: 'assets/images/default-avatar.png' // Default avatar
            };
          });
          
        console.log('Filtered doctors list:', this.otherDoctors);
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
        // Optionally show error to user
      }
    });
  }

  private setupSocketListeners(): void {
    this.socketService.on('new-message', (message: any) => {
      this.handleNewMessage(message);
    });
  }

  getUnreadCount(): number {
    return this.conversations.reduce((count, chat) => count + (chat.unreadCount || 0), 0);
  }

  toggleDoctorPicker(): void {
    this.showDoctorPicker = !this.showDoctorPicker;
  }

  filterChats(): void {
    if (!this.searchQuery.trim()) {
      this.filteredChats = [...this.conversations];
      return;
    }
    
    const query = this.searchQuery.toLowerCase();
    this.filteredChats = this.conversations.filter(chat => 
      (chat.doctorName || '').toLowerCase().includes(query) ||
      (chat.lastMessage || '').toLowerCase().includes(query)
    );
  }

  selectChat(chatId: string): void {
    this.selectedChatId = chatId;
    this.selectedChat = this.conversations.find(c => c.id === chatId) || null;
    if (this.selectedChat) {
      this.loadMessages(chatId);
      this.markAsRead(chatId);
    }
  }

  private loadMessages(chatId: string): void {
    if (!this.currentUser?.id) return;
    
    this.messageService.getThread(this.currentUser.id, chatId).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.currentMessages = response.data.messages.map(msg => ({
            id: msg.id,
            content: msg.content,
            senderId: msg.senderId,
            timestamp: new Date(msg.createdAt),
            isRead: msg.isRead
          }));
          this.scrollToBottom();
          this.markAsRead(chatId);
        }
      },
      error: (error) => {
        console.error('Error loading messages:', error);
      }
    });
  }

  private markAsRead(chatId: string): void {
    if (!this.currentUser?.id) return;
    
    this.messageService.markThreadRead(this.currentUser.id, chatId).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          // Update unread count in the UI
          const conversation = this.conversations.find(c => c.id === chatId);
          if (conversation) {
            conversation.unreadCount = 0;
          }
        }
      },
      error: (error) => {
        console.error('Error marking messages as read:', error);
      }
    });
  }

  startChatWithDoctor(doctor: any): void {
    const existingChat = this.conversations.find(c => c.doctorId === doctor.id);
    
    if (existingChat) {
      this.selectChat(existingChat.id);
    } else {
      // Create a new conversation
      const newChat: Chat = {
        id: doctor.id,
        doctorId: doctor.id,
        doctorName: `${doctor.firstName} ${doctor.lastName}`,
        lastMessage: '',
        lastMessageTime: new Date(),
        unreadCount: 0,
        isOnline: false
      };
      
      this.conversations.unshift(newChat);
      this.filteredChats = [...this.conversations];
      this.selectChat(doctor.id);
    }
    
    this.showDoctorPicker = false;
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedChatId || !this.currentUser) {
      console.warn('Cannot send message: Missing required data', {
        hasMessage: !!this.newMessage.trim(),
        selectedChatId: this.selectedChatId,
        currentUser: !!this.currentUser
      });
      return;
    }
    
    const content = this.newMessage.trim();
    this.newMessage = '';
    
    console.log('Sending message to doctor ID:', this.selectedChatId, 'Content:', content);
    
    this.messageService.sendMessage(
      this.currentUser.id,
      this.selectedChatId,
      content
    ).subscribe({
      next: (response) => {
        console.log('Message sent successfully:', response);
        if (response.status === 'success') {
          // The message will be added to the UI via the socket listener
          this.scrollToBottom();
        } else {
          console.error('Unexpected response status:', response.status);
        }
      },
      error: (error) => {
        console.error('Error sending message:', {
          error: error,
          status: error.status,
          message: error.message,
          url: error.url,
          statusText: error.statusText
        });
        // Show error to user
        // You might want to implement a toast or alert service here
        alert('Failed to send message. Please try again.');
        // Re-add the message to the input if sending failed
        this.newMessage = content;
      }
    });
  }


  onTextareaKeydown(event: any): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  toggleCallMenu(): void {
    this.showCallMenu = !this.showCallMenu;
  }

  startCall(type: 'audio' | 'video'): void {
    this.showCallMenu = false;
    this.dialing = true;
    // TODO: Implement start call
  }

  attachFile(): void {
    // TODO: Implement file attachment
  }

  private handleNewMessage(message: ChatMessage): void {
    console.log('Received new message via WebSocket:', message);
    
    if (!message || !message.senderId || !message.content) {
      console.error('Invalid message format received:', message);
      return;
    }
    
    const chatMessage: Message = {
      id: message.id || `temp-${Date.now()}`,
      content: message.content,
      senderId: message.senderId,
      timestamp: new Date(message.createdAt || Date.now()),
      isRead: message.isRead || false
    };

    // Update the conversation list
    const conversation = this.conversations.find(c => c.doctorId === message.senderId);
    if (conversation) {
      conversation.lastMessage = message.content;
      conversation.lastMessageTime = new Date();
      
      if (message.senderId !== this.currentUser?.id) {
        conversation.unreadCount = (conversation.unreadCount || 0) + 1;
      }
      
      // Move the conversation to the top
      this.conversations = [
        conversation,
        ...this.conversations.filter(c => c.id !== conversation.id)
      ];
      this.filteredChats = [...this.conversations];
    }

    // If this message is for the currently open chat
    if (this.selectedChatId === message.senderId) {
      this.currentMessages.push(chatMessage);
      this.scrollToBottom();
      
      // Mark as read if it's not our own message
      if (message.senderId !== this.currentUser?.id) {
        this.markAsRead(message.senderId);
      }
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        setTimeout(() => {
          this.messagesContainer.nativeElement.scrollTop = 
            this.messagesContainer.nativeElement.scrollHeight;
        }, 0);
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }
}