import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, User } from '../../../services/auth.service';
import { MessageService } from '../../../services/message.service';
import { SocketService } from '../../../services/socket.service';
import { PatientService } from '../../../services/patient.service';
import { User as PatientUser } from '../../../models/user.model';

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
              <button class="btn btn-outline" (click)="viewPatientProfile()">
                <i class="fa-solid fa-user"></i> Profile
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

          <!-- Call Panel -->
          <div class="call-panel card lift" *ngIf="inCall">
            <div class="call-header">
              <strong>Call with {{ selectedChat?.patientName }}</strong>
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
export class DoctorMessagesComponent implements OnInit, OnDestroy {
  currentDoctorId = '';
  selectedChatId: string | null = null;
  selectedChat: any = null;
  newMessage = '';
  searchQuery = '';
  showPatientPicker = false;
  showCallMenu = false;
  patients: PatientUser[] = [];
  
  allChats: Array<{ id: string; patientName: string; lastMessage: string; lastMessageTime: string; unreadCount: number; isOnline: boolean; messages: Array<{ id: string; senderId: string; text: string; timestamp: string; recipientId?: string; }> }> = [];
  
  filteredChats = this.allChats;

  // WebRTC
  inCall = false;
  mediaType: 'audio' | 'video' = 'audio';
  private pc: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  @ViewChild('localVideo') localVideo?: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo?: ElementRef<HTMLVideoElement>;
  private currentCallId: string | null = null;
  // Socket is now accessed through socketService 
  // Ringing and incoming state
  dialing = false;
  incomingCall = false;
  incomingFromUserId: string | null = null;
  private audioCtx?: AudioContext;
  private ringOsc?: OscillatorNode;
  private ringGain?: GainNode;

  constructor(
    private authService: AuthService,
    private messageService: MessageService,
    private socketService: SocketService,
    private patientService: PatientService,
    private router: Router
  ) { }

  ngOnInit() {
    // Load current user then conversations
    this.authService.currentUser$.subscribe(user => {
      if (user?.id) {
        this.currentDoctorId = user.id;
        this.loadConversations();
        this.loadPatients();
        this.socketService.connect(user.id);
        
        // Use socketService for all socket operations
        this.socketService.on<any>('message:new', (m) => {
          if (!m) return;
          const isSelf = m.senderId === this.currentDoctorId;
          const isToMe = m.recipientId === this.currentDoctorId;
          if (!isSelf && !isToMe) return;

          const otherId = isSelf ? m.recipientId : m.senderId;
          if (this.selectedChatId === otherId && this.selectedChat) {
            const mapped = { id: m.id, senderId: m.senderId, recipientId: m.recipientId, text: m.content, timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
            this.selectedChat.messages.push(mapped);
            this.selectedChat.lastMessage = mapped.text;
            this.selectedChat.lastMessageTime = 'Just now';
          } else {
            const chat = this.allChats.find(c => c.id === otherId);
            if (chat) {
              if (isToMe && !isSelf) chat.unreadCount = (chat.unreadCount || 0) + 1;
              chat.lastMessage = m.content;
              chat.lastMessageTime = 'Just now';
            } else {
              this.allChats.unshift({
                id: otherId,
                patientName: 'New Message',
                lastMessage: m.content,
                lastMessageTime: 'Just now',
                unreadCount: isToMe && !isSelf ? 1 : 0,
                isOnline: false,
                messages: []
              });
              this.filteredChats = this.allChats;
            }
          }
        });

        // Presence updates
        this.socketService.on<any>('presence:update', (p: { userId: string; online: boolean }) => {
          const chat = this.allChats.find(c => c.id === p.userId);
          if (chat) chat.isOnline = p.online;
        });

        // Signaling listeners
        this.setupSignalingListeners();
      }
    });
  }

  ngOnDestroy(): void {
    this.cleanupCall();
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

  toggleCallMenu() {
    this.showCallMenu = !this.showCallMenu;
  }

  async startCall(type: 'audio' | 'video') {
    this.showCallMenu = false;
    if (!this.currentDoctorId || !this.selectedChatId) return;
    this.mediaType = type;
    // Wait for accept; play dialing
    this.socketService.emit('call:request', { fromUserId: this.currentDoctorId, toUserId: this.selectedChatId, media: type });
    this.startRinging(true);
  }

  viewPatientProfile() {
    console.log('Viewing profile of', this.selectedChat?.patientName);
    this.navigateToDoctorMessages();
  }

  navigateToDoctorMessages() {
    this.router.navigate(['/doctor/doctor-messages']);
  }

  navigateToDoctorToDoctorMessages() {
    this.router.navigate(['/doctor/doctor-messages']);
  }

  private loadConversations() {
    this.messageService.getConversations(this.currentDoctorId).subscribe(res => {
      this.allChats = res.data.conversations.map((c: any) => ({
        id: c.otherUserId, // Using otherUserId as the ID
        patientName: c.name, // Using name as patientName
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

  private loadPatients() {
    this.patientService.getPatients().subscribe(list => {
      this.patients = list || [];
    });
  }

  togglePatientPicker() {
    this.showPatientPicker = !this.showPatientPicker;
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
        lastMessageTime: '',
        unreadCount: 0,
        isOnline: false,
        messages: []
      };
      this.allChats.unshift(chat);
      this.filteredChats = this.allChats;
    }

    this.showPatientPicker = false;
    this.selectChat(patientId);
  }

  // --- WebRTC signaling and lifecycle ---
  private setupSignalingListeners() {
    // Incoming call
    this.socketService.on<any>('call:incoming', async (p: { fromUserId: string; toUserId: string; media: 'audio' | 'video' }) => {
      if (!this.currentDoctorId || p.toUserId !== this.currentDoctorId) return;
      this.mediaType = p.media;
      this.selectedChatId = p.fromUserId;
      this.incomingCall = true;
      this.incomingFromUserId = p.fromUserId;
      this.startRinging(false);
    });

    // Offer from remote
    this.socketService.on<any>('call:offer', async (p: { fromUserId: string; toUserId: string; sdp: any }) => {
      if (!this.currentDoctorId || p.toUserId !== this.currentDoctorId) return;
      if (!this.pc) await this.preparePeer(this.mediaType);
      await this.pc!.setRemoteDescription(new RTCSessionDescription(p.sdp));
      const answer = await this.pc!.createAnswer();
      await this.pc!.setLocalDescription(answer);
      this.socketService.emit('call:answer', { 
        fromUserId: this.currentDoctorId, 
        toUserId: p.fromUserId, 
        sdp: answer,
        callId: this.currentCallId
      });
      this.stopRinging();
      this.inCall = true;
      this.incomingCall = false;
    });

    // Answer from remote
    this.socketService.on<any>('call:answer', async (p: { fromUserId: string; toUserId: string; sdp: any }) => {
      if (!this.currentDoctorId || p.toUserId !== this.currentDoctorId) return;
      await this.pc?.setRemoteDescription(new RTCSessionDescription(p.sdp));
    });

    // ICE candidates
    this.socketService.on<any>('call:ice-candidate', async (p: { fromUserId: string; toUserId: string; candidate: any }) => {
      if (!this.currentDoctorId || p.toUserId !== this.currentDoctorId) return;
      try {
        if (p.candidate) await this.pc?.addIceCandidate(new RTCIceCandidate(p.candidate));
      } catch {}
    });

    // Ended
    this.socketService.on<any>('call:ended', (p: { fromUserId: string; toUserId: string }) => {
      if (!this.currentDoctorId || p.toUserId !== this.currentDoctorId) return;
      this.cleanupCall();
    });

    // Accepted (caller side)
    this.socketService.on<any>('call:accepted', async (p: { fromUserId: string; toUserId: string }) => {
      if (!this.currentDoctorId || p.toUserId !== this.currentDoctorId) return;
      this.stopRinging();
      this.dialing = false;
      const anyP: any = p as any;
      if (anyP.callId) this.currentCallId = anyP.callId;
      await this.preparePeer(this.mediaType);
      const offer = await this.pc!.createOffer();
      await this.pc!.setLocalDescription(offer);
      if (this.currentCallId) {
        this.socketService.emit('call:offer', { 
          callId: this.currentCallId, 
          offer 
        });
      }
      this.inCall = true;
    });

    // Declined (caller side)
    this.socketService.on<any>('call:declined', (p: { fromUserId: string; toUserId: string }) => {
      if (!this.currentDoctorId || p.toUserId !== this.currentDoctorId) return;
      this.stopRinging();
      this.dialing = false;
      this.cleanupCall();
      console.log('Call declined');
    });

    // Call started (callee side)
    this.socketService.on<any>('call:started', (p: { callId: string; startedAt: string }) => {
      if (p?.callId) this.currentCallId = p.callId;
    });

    // Call ended: rely on backend-emitted system message via 'message:new'
    this.socketService.on<any>('call:ended', (p: { callId?: string; durationSec?: number }) => {
      if (p?.callId && this.currentCallId === p.callId) {
        // no local UI injection; messages will arrive through message:new
      }
      this.currentCallId = null;
    });
  }

  private async preparePeer(type: 'audio' | 'video') {
    this.cleanupCall();
    this.pc = new RTCPeerConnection({ iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }] });
    this.pc.onicecandidate = (e) => {
      if (e.candidate && this.currentDoctorId && this.selectedChatId) {
        if (this.currentCallId) {
        this.socketService.emit('call:ice-candidate', { 
          callId: this.currentCallId, 
          candidate: e.candidate 
        });
      }
      }
    };
    this.pc.ontrack = (ev) => {
      if (!this.remoteStream) this.remoteStream = new MediaStream();
      this.remoteStream.addTrack(ev.track);
      if (this.remoteVideo?.nativeElement) {
        this.remoteVideo.nativeElement.srcObject = this.remoteStream;
      }
    };
    const constraints = type === 'audio' ? { video: false, audio: true } : { video: true, audio: true };
    this.localStream = await navigator.mediaDevices.getUserMedia(constraints as MediaStreamConstraints);
    this.localStream.getTracks().forEach(t => this.pc!.addTrack(t, this.localStream!));
    if (this.localVideo?.nativeElement) {
      this.localVideo.nativeElement.srcObject = this.localStream;
    }
  }

  endCall() {
    if (this.currentDoctorId && this.selectedChatId) {
      this.socketService.emit('message:send', { fromUserId: this.currentDoctorId, toUserId: this.selectedChatId, callId: this.currentCallId });
    }
    this.cleanupCall();
  }

  private cleanupCall() {
    this.inCall = false;
    this.dialing = false;
    this.incomingCall = false;
    this.incomingFromUserId = null;
    this.stopRinging();
    if (this.pc) {
      this.pc.onicecandidate = null;
      this.pc.ontrack = null as any;
      try { this.pc.close(); } catch {}
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

  // Ringtone helpers
  private startRinging(outgoing: boolean) {
    try {
      this.stopRinging();
      this.audioCtx = this.audioCtx || new (window.AudioContext || (window as any).webkitAudioContext)();
      this.ringOsc = this.audioCtx.createOscillator();
      this.ringGain = this.audioCtx.createGain();
      this.ringOsc.type = 'sine';
      this.ringOsc.frequency.value = outgoing ? 440 : 480;
      this.ringGain.gain.value = 0.05;
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

  // Incoming UI actions
  acceptIncoming() {
    if (!this.currentDoctorId || !this.incomingFromUserId || !this.currentCallId) return;
    this.socketService.emit('call:accept', { 
      callId: this.currentCallId,
      fromUserId: this.currentDoctorId,
      toUserId: this.incomingFromUserId
    });
    // We'll create/answer on 'call:offer'
  }

  declineIncoming() {
    if (!this.currentDoctorId || !this.incomingFromUserId) return;
    this.socketService.emit('call:decline', { fromUserId: this.currentDoctorId, toUserId: this.incomingFromUserId });
    this.cleanupCall();
  }
}
