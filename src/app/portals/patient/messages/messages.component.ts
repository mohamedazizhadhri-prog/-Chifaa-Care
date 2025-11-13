import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User, Patient } from '../../../services/auth.service';
import { MessageService, Conversation, ChatMessage } from '../../../services/message.service';
import { SocketService } from '../../../services/socket.service';
import { DoctorService } from '../../../services/doctor.service';
import { DoctorUser } from '../../../models/doctor.model';

@Component({
  selector: 'app-patient-messages',
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
          <div class="sidebar-actions" style="margin-bottom: 8px; display: flex; gap: 8px;">
            <button class="btn btn-outline" (click)="toggleDoctorPicker()" [disabled]="doctors.length === 0" title="{{ doctors.length === 0 ? 'No doctors available' : '' }}">
              <i class="fa-solid fa-user-doctor"></i> New chat
            </button>
          </div>
          <div class="chat-search">
            <input type="text" placeholder="Search doctors..." class="search-input" [(ngModel)]="searchQuery" (input)="filterChats()">
            <i class="fa-solid fa-search search-icon"></i>
          </div>
          <!-- Doctor Picker -->
          <div *ngIf="showDoctorPicker" class="doctor-picker card" style="padding: 8px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 8px;">
            <div style="font-weight: 600; margin-bottom: 6px;">Start a new chat</div>
            <div *ngIf="doctors.length === 0" style="font-size: 0.9rem; color: #64748b;">No doctors available.</div>
            <div *ngFor="let d of doctors" (click)="startChatWithDoctor(d)" style="display: flex; align-items: center; gap: 8px; padding: 8px; border-radius: 8px; cursor: pointer;">
              <div class="chat-avatar" style="background:#22c55e; width:32px; height:32px;">
                <i class="fa-solid fa-user-doctor"></i>
              </div>
              <div style="flex:1; min-width:0;">
                <div style="font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">{{ d.firstName }} {{ d.lastName }}</div>
                <div style="font-size: 0.8rem; color:#64748b;">{{ d.doctorProfile?.specialization || 'Doctor' }}</div>
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
                <i class="fa-solid fa-user-doctor"></i>
              </div>
              <div class="chat-info">
                <div class="chat-name">{{ chat.doctorName }}</div>
                <div class="chat-specialty">{{ chat.specialty }}</div>
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
            <div class="chat-doctor-info">
              <div class="doctor-avatar">
                <i class="fa-solid fa-user-doctor"></i>
              </div>
              <div class="doctor-details">
                <strong>{{ selectedChat.doctorName }}</strong>
                <div class="doctor-specialty">{{ selectedChat.specialty }}</div>
                <span class="doctor-status" [class.online]="selectedChat.isOnline">
                  <i class="fa-solid fa-circle"></i>
                  {{ selectedChat.isOnline ? 'Online' : 'Offline' }}
                </span>
                <span class="call-status" *ngIf="dialing">Ringing...</span>
              </div>
            </div>
            <div class="chat-actions">
              <div class="dropdown">
                <button class="btn btn-outline" (click)="toggleCallMenu()">
                  <i class="fa-solid fa-phone"></i> Request Call
                </button>
                <div class="dropdown-menu" *ngIf="showCallMenu">
                  <button class="dropdown-item" (click)="startCall('audio')"><i class="fa-solid fa-microphone"></i> Voice only</button>
                  <button class="dropdown-item" (click)="startCall('video')"><i class="fa-solid fa-video"></i> Video + Voice</button>
                </div>
              </div>
              <button class="btn btn-outline" (click)="bookAppointment()">
                <i class="fa-solid fa-calendar-plus"></i> Book Appointment
              </button>
            </div>
          </div>

          <!-- Messages Area -->
          <!-- Incoming call banner -->
          <div class="incoming-banner" *ngIf="incomingCall">
            <div>
              <strong>Incoming {{ mediaType }} call</strong>
            </div>
            <div class="incoming-actions">
              <button class="btn btn-success" (click)="acceptIncoming()"><i class="fa-solid fa-phone"></i> Accept</button>
              <button class="btn btn-danger" (click)="declineIncoming()"><i class="fa-solid fa-phone-slash"></i> Decline</button>
            </div>
          </div>
          <div class="messages-area" #messagesContainer>
            <div class="message-date" *ngFor="let date of getMessageDates()">
              {{ date }}
            </div>
            <div *ngFor="let message of selectedChat.messages" 
                 class="message" 
                 [class.sent]="message.senderId === currentPatientId"
                 [class.received]="message.senderId !== currentPatientId">
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

          <!-- Call Panel -->
          <div class="call-panel card lift" *ngIf="inCall">
            <div class="call-header">
              <strong>Call with {{ selectedChat?.doctorName }}</strong>
              <span class="badge" [class.badge-video]="mediaType==='video'" [class.badge-audio]="mediaType==='audio'">{{ mediaType | uppercase }}</span>
            </div>
            <div class="videos" [class.audio-only]="mediaType==='audio'">
              <video #localVideo autoplay playsinline muted></video>
              <video #remoteVideo autoplay playsinline [muted]="false"></video>
            </div>
            <div class="call-actions">
              <button class="btn btn-danger" (click)="endCall()"><i class="fa-solid fa-phone-slash"></i> End</button>
            </div>
          </div>
        </section>

        <!-- Empty State -->
        <div class="empty-chat-state" *ngIf="!selectedChat">
          <i class="fa-solid fa-comments"></i>
          <h3>Select a conversation</h3>
          <p>Choose a doctor from the list to start messaging</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .messages-container {
      height: calc(100vh - 120px);
      max-height: 800px;
      min-height: 500px;
    }
    .messages-layout {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 16px;
      height: 100%;
      overflow: hidden;
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
      background: #22c55e;
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
    .chat-specialty {
      font-size: 0.8rem;
      color: #22c55e;
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
      min-height: 0;
      overflow: hidden;
    }
    .chat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      border-bottom: 1px solid #e2e8f0;
      flex-shrink: 0;
    }
    .chat-doctor-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .doctor-avatar {
      width: 48px;
      height: 48px;
      background: #22c55e;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.2rem;
    }
    .doctor-specialty {
      font-size: 0.85rem;
      color: #22c55e;
      margin-bottom: 2px;
    }
    .doctor-status {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.85rem;
      color: #64748b;
    }
    .doctor-status.online {
      color: #22c55e;
    }
    .call-status { margin-left: 8px; font-size: 0.85rem; color: #f59e0b; }
    .chat-actions {
      display: flex;
      gap: 8px;
    }
    .incoming-banner { display:flex; align-items:center; justify-content: space-between; background:#fff7ed; border:1px solid #fed7aa; padding:8px 12px; margin:8px 16px; border-radius:8px; }
    .incoming-actions { display:flex; gap:8px; }
    .messages-area {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      overflow-x: hidden;
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-height: 0;
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
      flex-shrink: 0;
      background: white;
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
    .dropdown { position: relative; }
    .dropdown-menu { position: absolute; right: 0; top: 100%; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px; display: flex; flex-direction: column; gap: 4px; z-index: 10; }
    .dropdown-item { background: none; border: none; padding: 8px 12px; text-align: left; cursor: pointer; border-radius: 6px; }
    .dropdown-item:hover { background: #f1f5f9; }
    .call-panel { margin: 12px; padding: 12px; }
    .call-header { display:flex; align-items:center; justify-content: space-between; margin-bottom: 8px; }
    .badge { padding: 2px 8px; border-radius: 999px; font-size: 0.75rem; }
    .badge-video { background: #3b82f6; color: white; }
    .badge-audio { background: #10b981; color: white; }
    .videos { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .videos.audio-only video { display: none; }
    video { width: 100%; background: #000; border-radius: 8px; min-height: 160px; }
    .call-actions { display:flex; justify-content:center; margin-top: 8px; }
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
export class PatientMessagesComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  currentPatientId = '';
  selectedChatId: string | null = null;
  selectedChat: any = null;
  newMessage = '';
  searchQuery = '';
  showDoctorPicker = false;
  showCallMenu = false;
  doctors: DoctorUser[] = [];
  
  // Conversations loaded from backend mapped to the UI chat model
  allChats: Array<{ id: string; doctorName: string; specialty: string; lastMessage: string; lastMessageTime: string; unreadCount: number; isOnline: boolean; messages: Array<{ id: string; senderId: string; text: string; timestamp: string; recipientId?: string; }> }> = [];
  filteredChats = this.allChats;
  private selectedOtherUserId: string | null = null;

  // WebRTC
  inCall = false;
  mediaType: 'audio' | 'video' = 'audio';
  private pc: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private currentCallId: string | null = null;
  private iceCandidateQueue: RTCIceCandidate[] = [];
  @ViewChild('localVideo') localVideo?: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo?: ElementRef<HTMLVideoElement>;
  @ViewChild('messagesContainer') messagesContainer?: ElementRef<HTMLDivElement>;
  // Ringing state
  dialing = false; // caller side
  incomingCall = false; // callee side
  incomingFromUserId: string | null = null;
  private audioCtx?: AudioContext;
  private ringOsc?: OscillatorNode;
  private ringGain?: GainNode;

  constructor(private authService: AuthService, private messageService: MessageService, private socket: SocketService, private doctorService: DoctorService) {}

  ngOnInit() {
    // Clear any cached data on init
    this.allChats = [];
    this.filteredChats = [];
    this.selectedChat = null;
    this.selectedChatId = null;
    this.doctors = [];
    
    // Subscribe to current user and load conversations
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user?.id) {
        this.currentPatientId = user.id;
        this.loadConversations();
        this.loadDoctors();
        // Connect sockets and listen for incoming messages
        this.socket.connect(user.id);
        // Realtime message (incoming only - not self-sent to avoid duplicates)
        this.socket.on<any>('message:new', (m) => {
          if (!m) return;
          const isSelf = m.senderId === this.currentPatientId;
          const isToMe = m.recipientId === this.currentPatientId;
          
          // IMPORTANT: Skip if this is a message I sent (to prevent duplicates)
          if (isSelf) {
            // Update chat list preview for messages I sent from this client
            const otherId = m.recipientId;
            const chat = this.allChats.find(c => c.id === otherId);
            if (chat) {
              chat.lastMessage = m.content;
              chat.lastMessageTime = 'Just now';
            }
            return;
          }
          
          if (!isToMe) return; // not related to me

          const otherId = m.senderId;
          // If the selected chat is with the other participant, append
          if (this.selectedOtherUserId === otherId && this.selectedChat) {
            const mapped = { id: m.id, senderId: m.senderId, recipientId: m.recipientId, text: m.content, timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
            this.selectedChat.messages.push(mapped);
            this.selectedChat.lastMessage = mapped.text;
            this.selectedChat.lastMessageTime = 'Just now';
            // Scroll to bottom after new message
            this.scrollToBottom();
          } else {
            const chat = this.allChats.find(c => c.id === otherId);
            if (chat) {
              // Only bump unread if I am the recipient
              chat.unreadCount = (chat.unreadCount || 0) + 1;
              chat.lastMessage = m.content;
              chat.lastMessageTime = 'Just now';
            } else {
              // New conversation
              this.allChats.unshift({
                id: otherId,
                doctorName: 'New Message',
                specialty: '',
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

        // Listen signaling events
        this.setupSignalingListeners();

        // Presence
        this.socket.on<any>('presence:update', (p: { userId: string; online: boolean }) => {
          const chat = this.allChats.find(c => c.id === p.userId);
          if (chat) chat.isOnline = p.online;
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.cleanupCall();
  }

  getDisplayName(): string {
    if (!this.currentUser?.name) return 'Patient';
    return this.currentUser.name;
  }

  filterChats() {
    if (!this.searchQuery.trim()) {
      this.filteredChats = this.allChats;
    } else {
      this.filteredChats = this.allChats.filter(chat => 
        chat.doctorName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        chat.specialty.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  }

  selectChat(chatId: string) {
    this.selectedChatId = chatId;
    this.selectedChat = this.allChats.find(chat => chat.id === chatId);
    this.selectedOtherUserId = chatId;
    
    if (!this.currentPatientId || !this.selectedOtherUserId) return;
    // Load thread from backend
    this.messageService.getThread(this.currentPatientId, this.selectedOtherUserId).subscribe(res => {
      const msgs = res.data.messages;
      const mapped = msgs.map(m => ({ id: m.id, senderId: m.senderId, recipientId: m.recipientId, text: m.content, timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }));
      if (this.selectedChat) {
        this.selectedChat.messages = mapped;
        this.selectedChat.unreadCount = 0;
      }
      // Mark as read
      this.messageService.markThreadRead(this.currentPatientId!, this.selectedOtherUserId!).subscribe();
      // Scroll to bottom after loading messages
      setTimeout(() => this.scrollToBottom(), 100);
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
    if (!this.newMessage.trim() || !this.selectedChat || !this.currentPatientId || !this.selectedOtherUserId) return;
    const content = this.newMessage.trim();
    this.messageService.sendMessage(this.currentPatientId, this.selectedOtherUserId, content).subscribe(res => {
      const m = res.data.message;
      const mapped = { id: m.id, senderId: m.senderId, recipientId: m.recipientId, text: m.content, timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      this.selectedChat.messages.push(mapped);
      this.selectedChat.lastMessage = mapped.text;
      this.selectedChat.lastMessageTime = 'Just now';
      this.newMessage = '';
      // Scroll to bottom after sending message
      this.scrollToBottom();
    });
  }

  attachFile() {
    console.log('Attach file clicked');
    // Implement file attachment functionality
  }

  toggleCallMenu() {
    this.showCallMenu = !this.showCallMenu;
  }

  async startCall(type: 'audio' | 'video') {
    this.showCallMenu = false;
    if (!this.currentPatientId || !this.selectedOtherUserId) return;
    this.mediaType = type;
    
    // Just send request, don't create peer yet
    this.socket.emit('call:request', { fromUserId: this.currentPatientId, toUserId: this.selectedOtherUserId, media: type });
    this.startRinging(true);
    this.dialing = true;
  }

  bookAppointment() {
    console.log('Booking appointment with', this.selectedChat?.doctorName);
    // Navigate to book consultation page
  }

  private async loadConversations() {
    if (!this.currentPatientId) return;
    
    try {
      console.log('[Patient Messages] Loading conversations...');
      
      // Get all doctors from the database
      const doctors = await this.doctorService.getDoctors().toPromise();
      if (!doctors) {
        console.error('[Patient Messages] No doctors found');
        return;
      }

      // Create a map of doctor IDs for quick lookup - only active doctors
      const activeDoctors = doctors.filter(d => d.role === 'DOCTOR' && d.doctorProfile && d.isActive !== false);
      console.log(`[Patient Messages] Found ${activeDoctors.length} active doctors:`, 
        activeDoctors.map(d => `${d.firstName} ${d.lastName} (${d.id})`));
      const doctorMap = new Map(activeDoctors.map(d => [d.id, d]));

      // Get all conversations
      const res = await this.messageService.getConversations(this.currentPatientId).toPromise();
      
      if (res?.data?.conversations) {
        // Filter conversations to only include those with doctors
        this.allChats = res.data.conversations
          .filter(conversation => {
            // Skip if this is the current user
            if (conversation.otherUserId === this.currentPatientId) {
              return false;
            }
            
            // Only include if the other user is an active doctor
            const isDoctor = doctorMap.has(conversation.otherUserId);
            if (!isDoctor) {
              console.log(`Filtering out non-doctor user: ${conversation.name} (${conversation.otherUserId})`);
              return false;
            }
            
            return true;
          })
          .map(conversation => {
            const doctor = doctorMap.get(conversation.otherUserId);
            const doctorName = doctor ? `${doctor.firstName} ${doctor.lastName}`.trim() : 'Doctor';
            const specialty = doctor?.doctorProfile?.specialization || 'General Practitioner';
            
            return {
              id: conversation.otherUserId,
              doctorName: doctorName,
              specialty: specialty,
              lastMessage: conversation.lastMessage,
              lastMessageTime: new Date(conversation.lastMessageTime).toLocaleString(),
              unreadCount: conversation.unreadCount || 0,
              isOnline: false,
              messages: []
            };
          });

        console.log('[Patient Messages] Filtered conversations:', {
          total: res.data.conversations.length,
          doctorConversations: this.allChats.length,
          filteredOut: res.data.conversations.length - this.allChats.length,
          loadedDoctors: this.allChats.map(c => c.doctorName),
          activeDoctorIds: activeDoctors.map(d => d.id)
        });

        this.filteredChats = [...this.allChats];
        console.log('[Patient Messages] Load complete. Total conversations:', this.allChats.length);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
}

  private loadDoctors() {
    this.doctorService.getDoctors().subscribe(list => {
      const activeDoctors = (list || []).filter(d => 
        d.role === 'DOCTOR' && 
        d.doctorProfile && 
        d.isActive !== false
      );
      this.doctors = activeDoctors;
      console.log(`[Patient Messages] Available doctors for new chat: ${this.doctors.length}`, 
        this.doctors.map(d => `${d.firstName} ${d.lastName}`));
    });
  }

  toggleDoctorPicker() {
    if (this.doctors.length === 0) return;
    this.showDoctorPicker = !this.showDoctorPicker;
  }

  startChatWithDoctor(d: DoctorUser) {
    const doctorId = d.id;
    const name = `${d.firstName} ${d.lastName}`.trim();
    const specialty = d.doctorProfile?.specialization || 'Doctor';

    // If chat doesn't exist yet, create a placeholder conversation locally
    let chat = this.allChats.find(c => c.id === doctorId);
    if (!chat) {
      chat = {
        id: doctorId,
        doctorName: name || 'Doctor',
        specialty,
        lastMessage: '',
        lastMessageTime: '',
        unreadCount: 0,
        isOnline: false,
        messages: []
      };
      this.allChats.unshift(chat);
      this.filteredChats = this.allChats;
    }

    this.showDoctorPicker = false;
    this.selectChat(doctorId);
  }

  // --- WebRTC signaling and lifecycle ---
  private setupSignalingListeners() {
    // Incoming call request
    this.socket.on<any>('call:incoming', async (p: { fromUserId: string; toUserId: string; media: 'audio' | 'video' }) => {
      if (!this.currentPatientId || p.toUserId !== this.currentPatientId) return;
      this.mediaType = p.media;
      this.selectedOtherUserId = p.fromUserId;
      // Show incoming UI and ring
      this.incomingCall = true;
      this.incomingFromUserId = p.fromUserId;
      this.startRinging(false);
    });

    // Offer from remote
    this.socket.on<any>('call:offer', async (p: { fromUserId: string; toUserId: string; sdp: any }) => {
      if (!this.currentPatientId || p.toUserId !== this.currentPatientId) return;
      if (!this.pc) await this.preparePeer(this.mediaType);
      await this.pc!.setRemoteDescription(new RTCSessionDescription(p.sdp));
      await this.processQueuedIceCandidates();
      const answer = await this.pc!.createAnswer();
      await this.pc!.setLocalDescription(answer);
      this.socket.emit('call:answer', { fromUserId: this.currentPatientId, toUserId: p.fromUserId, sdp: answer });
      this.stopRinging();
      this.inCall = true;
      this.incomingCall = false;
    });

    // Answer from remote
    this.socket.on<any>('call:answer', async (p: { fromUserId: string; toUserId: string; sdp: any }) => {
      if (!this.currentPatientId || p.toUserId !== this.currentPatientId) return;
      await this.pc?.setRemoteDescription(new RTCSessionDescription(p.sdp));
      await this.processQueuedIceCandidates();
    });

    // ICE candidates
    this.socket.on<any>('call:ice-candidate', async (p: { fromUserId: string; toUserId: string; candidate: any }) => {
      if (!this.currentPatientId || p.toUserId !== this.currentPatientId) return;
      try {
        if (!this.pc) {
          console.warn('Received ICE candidate but no peer connection');
          return;
        }
        if (!this.pc.remoteDescription) {
          console.log('Queueing ICE candidate');
          this.iceCandidateQueue.push(new RTCIceCandidate(p.candidate));
          return;
        }
        await this.pc.addIceCandidate(new RTCIceCandidate(p.candidate));
        console.log('Added ICE candidate');
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    });

    // Ended
    this.socket.on<any>('call:ended', (p: { fromUserId: string; toUserId: string }) => {
      if (!this.currentPatientId || p.toUserId !== this.currentPatientId) return;
      this.cleanupCall();
    });

    // Accepted (for caller)
    this.socket.on<any>('call:accepted', async (p: { fromUserId: string; toUserId: string }) => {
      if (!this.currentPatientId || p.toUserId !== this.currentPatientId) return;
      this.stopRinging();
      this.dialing = false;
      // Store call id
      const anyP: any = p as any;
      if (anyP.callId) this.currentCallId = anyP.callId;
      await this.preparePeer(this.mediaType);
      const offer = await this.pc!.createOffer();
      await this.pc!.setLocalDescription(offer);
      this.socket.emit('call:offer', { fromUserId: this.currentPatientId, toUserId: p.fromUserId, sdp: offer });
      this.inCall = true;
    });

    // Declined (for caller)
    this.socket.on<any>('call:declined', (p: { fromUserId: string; toUserId: string }) => {
      if (!this.currentPatientId || p.toUserId !== this.currentPatientId) return;
      this.stopRinging();
      this.dialing = false;
      this.cleanupCall();
      // Optionally show a toast
      console.log('Call declined');
    });

    // Call started (for callee)
    this.socket.on<any>('call:started', (p: { callId: string; startedAt: string }) => {
      if (p?.callId) this.currentCallId = p.callId;
    });

    // Call ended (either side): rely on backend-emitted system message via 'message:new'
    this.socket.on<any>('call:ended', (p: { callId?: string; durationSec?: number }) => {
      if (p?.callId && this.currentCallId === p.callId) {
        // no local UI injection; messages will arrive through message:new
      }
      this.currentCallId = null;
    });
  }

  private async preparePeer(type: 'audio' | 'video') {
    this.cleanupCall();
    
    const config: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ]
    };
    
    this.pc = new RTCPeerConnection(config);
    
    this.pc.onicecandidate = (e) => {
      if (e.candidate && this.currentPatientId && this.selectedOtherUserId) {
        this.socket.emit('call:ice-candidate', { fromUserId: this.currentPatientId, toUserId: this.selectedOtherUserId, candidate: e.candidate });
      }
    };
    
    this.pc.ontrack = (ev) => {
      console.log('Received remote track:', ev.track.kind);
      if (!this.remoteStream) this.remoteStream = new MediaStream();
      this.remoteStream.addTrack(ev.track);
      if (this.remoteVideo?.nativeElement) {
        this.remoteVideo.nativeElement.srcObject = this.remoteStream;
      }
    };
    
    this.pc.onconnectionstatechange = () => {
      console.log('Connection state:', this.pc?.connectionState);
      if (this.pc?.connectionState === 'failed' || 
          this.pc?.connectionState === 'disconnected' ||
          this.pc?.connectionState === 'closed') {
        this.endCall();
      }
    };
    
    const constraints = type === 'audio' ? { video: false, audio: true } : { video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }, audio: true };
    
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints as MediaStreamConstraints);
      this.localStream.getTracks().forEach(t => this.pc!.addTrack(t, this.localStream!));
      if (this.localVideo?.nativeElement) {
        this.localVideo.nativeElement.srcObject = this.localStream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Could not access camera/microphone. Please check permissions.');
      this.cleanupCall();
      throw error;
    }
  }

  endCall() {
    if (this.currentPatientId && this.selectedOtherUserId) {
      this.socket.emit('call:end', { fromUserId: this.currentPatientId, toUserId: this.selectedOtherUserId, callId: this.currentCallId });
    }
    this.cleanupCall();
  }

  private cleanupCall() {
    this.inCall = false;
    this.dialing = false;
    this.incomingCall = false;
    this.incomingFromUserId = null;
    this.stopRinging();
    this.iceCandidateQueue = [];
    
    if (this.pc) {
      this.pc.onicecandidate = null;
      this.pc.ontrack = null as any;
      this.pc.onconnectionstatechange = null;
      try { this.pc.close(); } catch (error) {
        console.error('Error closing peer connection:', error);
      }
    }
    this.pc = null;
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(t => t.stop());
    }
    this.localStream = null;
    this.remoteStream = null;
    
    if (this.localVideo?.nativeElement) this.localVideo.nativeElement.srcObject = null;
    if (this.remoteVideo?.nativeElement) this.remoteVideo.nativeElement.srcObject = null;
    this.currentCallId = null;
  }

  private async processQueuedIceCandidates() {
    if (this.iceCandidateQueue.length === 0) return;
    console.log(`Processing ${this.iceCandidateQueue.length} queued ICE candidates`);
    for (const candidate of this.iceCandidateQueue) {
      try {
        await this.pc?.addIceCandidate(candidate);
      } catch (error) {
        console.error('Error adding queued ICE candidate:', error);
      }
    }
    this.iceCandidateQueue = [];
  }

  // Ringtone via Web Audio (no external asset)
  private startRinging(outgoing: boolean) {
    try {
      this.stopRinging();
      this.audioCtx = this.audioCtx || new (window.AudioContext || (window as any).webkitAudioContext)();
      this.ringOsc = this.audioCtx.createOscillator();
      this.ringGain = this.audioCtx.createGain();
      this.ringOsc.type = 'sine';
      this.ringOsc.frequency.value = outgoing ? 440 : 480; // different tone caller/callee
      this.ringGain.gain.value = 0.05; // low volume
      this.ringOsc.connect(this.ringGain).connect(this.audioCtx.destination);
      this.ringOsc.start();
    } catch {}
  }

  private stopRinging() {
    try {
      if (this.ringOsc) { this.ringOsc.stop(); this.ringOsc.disconnect(); }
      if (this.ringGain) { this.ringGain.disconnect(); }
    } catch {}
    this.ringOsc = undefined as any;
    this.ringGain = undefined as any;
  }

  // UI handlers for incoming call
  acceptIncoming() {
    if (!this.currentPatientId || !this.incomingFromUserId) return;
    this.socket.emit('call:accept', { fromUserId: this.currentPatientId, toUserId: this.incomingFromUserId });
    // Wait for offer to arrive, then we answer in the 'call:offer' handler
  }

  declineIncoming() {
    if (!this.currentPatientId || !this.incomingFromUserId) return;
    this.socket.emit('call:decline', { fromUserId: this.currentPatientId, toUserId: this.incomingFromUserId });
    this.cleanupCall();
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.messagesContainer?.nativeElement) {
        const element = this.messagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    }, 50);
  }
}
