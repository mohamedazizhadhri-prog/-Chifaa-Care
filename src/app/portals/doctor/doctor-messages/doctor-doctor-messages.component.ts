import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MessageService } from '../../../services/message.service';
import { DoctorService } from '../../../services/doctor.service';
import { SocketService } from '../../../services/socket.service';
import { Subject, interval } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';

interface Chat {
  id: string;
  doctorName: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline: boolean;
  doctorId: string;
  messages?: Message[];
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: Date;
  isRead: boolean;
}

@Component({
  selector: 'app-doctor-doctor-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './doctor-doctor-messages.component.html',
  styleUrls: ['./doctor-doctor-messages.component.scss']
})
export class DoctorDoctorMessagesComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('localVideo') localVideo?: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo?: ElementRef<HTMLVideoElement>;
  
  currentUser: any;
  conversations: Chat[] = [];
  filteredChats: Chat[] = [];
  selectedChatId: string | null = null;
  selectedChat: Chat | null = null;
  currentMessages: Message[] = [];
  newMessage = '';
  searchQuery = '';
  showDoctorPicker = false;
  otherDoctors: any[] = [];
  showCallMenu = false;
  
  // WebRTC call state
  inCall = false;
  dialing = false;
  incomingCall = false;
  incomingFromUserId: string | null = null;
  mediaType: 'audio' | 'video' = 'audio';
  private pc: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private currentCallId: string | null = null;
  private iceCandidateQueue: RTCIceCandidate[] = [];
  private audioCtx?: AudioContext;
  private ringOsc?: OscillatorNode;
  private ringGain?: GainNode;
  
  // Auto-refresh intervals
  private conversationRefreshInterval = 5000; // 5 seconds
  private messageRefreshInterval = 3000; // 3 seconds
  private doctorRefreshInterval = 30000; // 30 seconds
  
  // Track when we last sent a message to prevent immediate refresh duplicates
  private lastMessageSentTime = 0;
  
  // Cleanup state
  isCleaningUp = false;
  cleanupMessage = '';
  
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
        if (user?.id) {
          this.initializeComponent();
        }
      });
  }

  ngOnDestroy(): void {
    this.cleanupCall();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeComponent(): void {
    this.cleanupInactiveConversations(); // Clean up on init
    this.loadConversations();
    this.loadDoctors();
    this.setupSocketListeners();
    this.setupSignalingListeners();
    this.setupAutoRefresh();
    
    if (this.currentUser?.id) {
      this.socketService.connect(this.currentUser.id);
    }
  }

  private setupAutoRefresh(): void {
    // Auto-refresh conversations every 5 seconds
    interval(this.conversationRefreshInterval)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.loadConversations())
      )
      .subscribe();

    // Auto-refresh current messages every 3 seconds if chat is selected
    interval(this.messageRefreshInterval)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.selectedChatId) {
          this.refreshMessages();
        }
      });

    // Auto-refresh doctor list every 30 seconds
    interval(this.doctorRefreshInterval)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadDoctors();
      });
  }

  private async loadConversations(): Promise<void> {
    if (!this.currentUser?.id) return;
    
    try {
      const doctors = await this.doctorService.getDoctors().toPromise();
      // Create a map of active doctors only
      const activeDoctors = doctors?.filter(d => d.role === 'DOCTOR' && d.doctorProfile) || [];
      const doctorMap = new Map(activeDoctors.map(d => [d.id, d]));
      const doctorIds = new Set(activeDoctors.map(d => d.id));
      
      const response = await this.messageService.getConversations(this.currentUser.id).toPromise();
      
      if (response?.status === 'success') {
        const previousConversations = [...this.conversations];
        
        this.conversations = response.data.conversations
          .filter(conv => {
            // Only show conversations with active doctors
            const isDoctor = conv.role === 'doctor' || conv.role === 'Doctor' || conv.role === 'DOCTOR';
            const isActiveDoctor = doctorIds.has(conv.otherUserId);
            const isNotSelf = conv.otherUserId !== this.currentUser?.id;
            
            // Must be a doctor AND must be in the active doctors list
            return (isDoctor || isActiveDoctor) && isNotSelf && isActiveDoctor;
          })
          .map(conv => {
            const doctor = doctorMap.get(conv.otherUserId);
            const previousChat = previousConversations.find(c => c.id === conv.otherUserId);
            
            // Only use doctor data if the doctor exists (is active)
            if (!doctor) {
              console.warn(`[Doctor Chat] Doctor ${conv.otherUserId} no longer exists or is inactive`);
              return null; // Will be filtered out below
            }
            
            const doctorName = `${doctor.firstName || 'Doctor'} ${doctor.lastName || ''}`.trim();
            
            return {
              id: conv.otherUserId,
              doctorId: conv.otherUserId,
              doctorName: doctorName,
              lastMessage: conv.lastMessage,
              lastMessageTime: new Date(conv.lastMessageTime),
              unreadCount: conv.unreadCount || 0,
              isOnline: previousChat?.isOnline || false
            };
          })
          .filter(conv => conv !== null) as Chat[]; // Remove null entries
          
        this.filteredChats = [...this.conversations];
        
        // Update selected chat if it exists and is still active
        if (this.selectedChatId) {
          const stillExists = this.conversations.find(c => c.id === this.selectedChatId);
          if (stillExists) {
            this.selectedChat = stillExists;
          } else {
            // Selected doctor was deleted, clear selection
            console.warn(`[Doctor Chat] Selected doctor ${this.selectedChatId} is no longer active`);
            this.selectedChatId = null;
            this.selectedChat = null;
            this.currentMessages = [];
          }
        }
      }
    } catch (error) {
      console.error('[Doctor Chat] Error loading conversations:', error);
    }
  }

  private loadDoctors(): void {
    if (!this.currentUser?.id) return;
    
    this.doctorService.getDoctors().subscribe({
      next: (doctors) => {
        this.otherDoctors = doctors
          .filter(doctor => {
            const isDoctor = doctor.role === 'DOCTOR' && doctor.doctorProfile;
            const isNotCurrentUser = doctor.id !== this.currentUser?.id;
            const isActive = doctor.isActive !== false; // Check if doctor is active
            return isDoctor && isNotCurrentUser && isActive;
          })
          .map(doctor => ({
            id: doctor.id,
            firstName: doctor.firstName || 'Doctor',
            lastName: doctor.lastName || '',
            email: doctor.email,
            specialization: doctor.doctorProfile?.specialization || 'General Practitioner',
            avatar: 'assets/images/default-avatar.png'
          }));
          
        console.log(`[Doctor Chat] Loaded ${this.otherDoctors.length} active doctors`);
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
      }
    });
  }

  private refreshMessages(): void {
    if (!this.selectedChatId || !this.currentUser?.id) return;
    
    // Don't refresh if we just sent a message (within last 5 seconds)
    // This prevents the refresh from adding the sent message twice
    const timeSinceLastSend = Date.now() - this.lastMessageSentTime;
    if (timeSinceLastSend < 5000) {
      console.log('[Doctor Chat] Skipping refresh - message just sent');
      return;
    }
    
    this.messageService.getThread(this.currentUser.id, this.selectedChatId).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          const previousLength = this.currentMessages.length;
          const serverMessages = response.data.messages.map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            senderId: msg.senderId,
            timestamp: new Date(msg.createdAt),
            isRead: msg.isRead
          }));
          
          // Only add messages that don't already exist (avoid duplicates during refresh)
          const existingIds = new Set(this.currentMessages.map(m => m.id));
          const newMessages = serverMessages.filter(msg => !existingIds.has(msg.id) && !msg.id.startsWith('temp-'));
          
          if (newMessages.length > 0) {
            // Add only new messages
            this.currentMessages = [...this.currentMessages, ...newMessages];
            this.scrollToBottom();
          }
          
          // Update read status for existing messages
          this.currentMessages.forEach(currentMsg => {
            const serverMsg = serverMessages.find(sm => sm.id === currentMsg.id);
            if (serverMsg && serverMsg.isRead !== currentMsg.isRead) {
              currentMsg.isRead = serverMsg.isRead;
            }
          });
        }
      },
      error: (error) => {
        console.error('Error refreshing messages:', error);
        // If doctor was deleted, the backend will return 404
        if (error.status === 404) {
          console.warn(`[Doctor Chat] Doctor ${this.selectedChatId} no longer exists, clearing chat`);
          this.selectedChatId = null;
          this.selectedChat = null;
          this.currentMessages = [];
          // Reload conversations to remove deleted doctor
          this.loadConversations();
        }
      }
    });
  }

  private setupSocketListeners(): void {
    // Real-time message updates
    this.socketService.on('message:new', (message: any) => {
      this.handleNewMessage(message);
    });

    // Real-time conversation updates (when messages are sent/received)
    // Throttle conversation reloads to avoid excessive updates
    let lastConversationReload = 0;
    const RELOAD_THROTTLE_MS = 2000; // Only reload every 2 seconds at most
    
    this.socketService.on('conversation:updated', () => {
      const now = Date.now();
      if (now - lastConversationReload > RELOAD_THROTTLE_MS) {
        lastConversationReload = now;
        // Only reload conversations if we're not currently viewing a chat
        // or if the update is for a conversation we're not currently viewing
        this.loadConversations();
      }
    });

    // Real-time message read updates
    this.socketService.on('message:read', (data: { userId: string; otherUserId: string }) => {
      if (data.otherUserId === this.currentUser?.id || data.userId === this.selectedChatId) {
        // Refresh messages to show read status
        this.refreshMessages();
      }
    });

    // Online/offline status updates
    this.socketService.on('presence:update', (p: { userId: string; online: boolean }) => {
      const chat = this.conversations.find(c => c.id === p.userId);
      if (chat) chat.isOnline = p.online;
    });
  }

  private setupSignalingListeners(): void {
    this.socketService.on('call:incoming', async (p: { fromUserId: string; toUserId: string; media: 'audio' | 'video' }) => {
      if (!this.currentUser || p.toUserId !== this.currentUser.id) return;
      this.mediaType = p.media;
      this.selectedChatId = p.fromUserId;
      this.incomingCall = true;
      this.incomingFromUserId = p.fromUserId;
      this.startRinging(false);
    });

    this.socketService.on('call:offer', async (p: { fromUserId: string; toUserId: string; sdp: any }) => {
      if (!this.currentUser || p.toUserId !== this.currentUser.id) return;
      if (!this.pc) await this.preparePeer(this.mediaType);
      await this.pc!.setRemoteDescription(new RTCSessionDescription(p.sdp));
      await this.processQueuedIceCandidates();
      const answer = await this.pc!.createAnswer();
      await this.pc!.setLocalDescription(answer);
      this.socketService.emit('call:answer', { 
        fromUserId: this.currentUser.id, 
        toUserId: p.fromUserId, 
        sdp: answer,
        callId: this.currentCallId
      });
      this.stopRinging();
      this.inCall = true;
      this.incomingCall = false;
    });

    this.socketService.on('call:answer', async (p: { fromUserId: string; toUserId: string; sdp: any }) => {
      if (!this.currentUser || p.toUserId !== this.currentUser.id) return;
      await this.pc?.setRemoteDescription(new RTCSessionDescription(p.sdp));
      await this.processQueuedIceCandidates();
    });

    this.socketService.on('call:ice-candidate', async (p: { fromUserId: string; toUserId: string; candidate: any }) => {
      if (!this.currentUser || p.toUserId !== this.currentUser.id) return;
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

    this.socketService.on('call:ended', (p: { fromUserId: string; toUserId: string }) => {
      if (!this.currentUser || p.toUserId !== this.currentUser.id) return;
      this.cleanupCall();
    });

    this.socketService.on('call:accepted', async (p: { fromUserId: string; toUserId: string; callId?: string }) => {
      if (!this.currentUser || p.toUserId !== this.currentUser.id) return;
      this.stopRinging();
      this.dialing = false;
      if (p.callId) this.currentCallId = p.callId;
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

    this.socketService.on('call:declined', (p: { fromUserId: string; toUserId: string }) => {
      if (!this.currentUser || p.toUserId !== this.currentUser.id) return;
      this.stopRinging();
      this.dialing = false;
      this.cleanupCall();
    });

    this.socketService.on('call:started', (p: { callId: string; startedAt: string }) => {
      if (p?.callId) this.currentCallId = p.callId;
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
          this.currentMessages = response.data.messages.map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            senderId: msg.senderId,
            timestamp: new Date(msg.createdAt),
            isRead: msg.isRead
          }));
          this.scrollToBottom();
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
      return;
    }
    
    const content = this.newMessage.trim();
    this.newMessage = '';
    
    // Track when we sent this message
    this.lastMessageSentTime = Date.now();
    
    // Optimistically add the message to UI immediately
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      content: content,
      senderId: this.currentUser.id,
      timestamp: new Date(),
      isRead: false
    };
    this.currentMessages.push(tempMessage);
    this.scrollToBottom();
    
    this.messageService.sendMessage(
      this.currentUser.id,
      this.selectedChatId,
      content
    ).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          // Replace temp message with real message
          const index = this.currentMessages.findIndex(m => m.id === tempMessage.id);
          if (index !== -1) {
            this.currentMessages[index] = {
              ...tempMessage,
              id: response.data.message.id
            };
          }
          console.log('[Doctor Chat] Message sent successfully, refresh blocked for 5 seconds');
          // WebSocket will handle updating other clients
        }
      },
      error: (error) => {
        console.error('Error sending message:', error);
        // Remove the temp message on error
        this.currentMessages = this.currentMessages.filter(m => m.id !== tempMessage.id);
        this.newMessage = content;
        // Reset the timer since send failed
        this.lastMessageSentTime = 0;
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

  async startCall(type: 'audio' | 'video'): Promise<void> {
    this.showCallMenu = false;
    if (!this.currentUser?.id || !this.selectedChatId) return;
    this.mediaType = type;
    
    // Just send request, don't create peer yet
    this.socketService.emit('call:request', { 
      fromUserId: this.currentUser.id, 
      toUserId: this.selectedChatId, 
      media: type 
    });
    this.dialing = true;
    this.startRinging(true);
  }

  attachFile(): void {
    console.log('Attach file functionality');
  }

  private handleNewMessage(message: any): void {
    if (!message || !message.senderId || !message.content) {
      return;
    }
    
    const chatMessage: Message = {
      id: message.id || `temp-${Date.now()}`,
      content: message.content,
      senderId: message.senderId,
      timestamp: new Date(message.createdAt || Date.now()),
      isRead: message.isRead || false
    };

    // IMPORTANT: Skip messages sent by the current user to prevent duplicates
    // (they're already added optimistically in sendMessage)
    const isSentByMe = message.senderId === this.currentUser?.id;
    
    // If this message is for the currently selected chat
    if (this.selectedChatId === message.senderId || 
        (this.selectedChatId === message.recipientId && isSentByMe)) {
      
      // Only add incoming messages from others (not our own sent messages)
      if (!isSentByMe) {
        // Check if message already exists (to avoid duplicates)
        const exists = this.currentMessages.some(m => m.id === chatMessage.id);
        if (!exists) {
          this.currentMessages.push(chatMessage);
          this.scrollToBottom();
        }
        
        // Mark as read if we're viewing this conversation and it's from the other person
        if (this.selectedChatId === message.senderId) {
          this.markAsRead(message.senderId);
        }
      }
    }

    // Update the conversation list in-place without full reload
    const conversationUserId = message.senderId === this.currentUser?.id ? message.recipientId : message.senderId;
    const conversation = this.conversations.find(c => c.doctorId === conversationUserId);
    
    if (conversation) {
      // Update existing conversation
      conversation.lastMessage = message.content;
      conversation.lastMessageTime = new Date();
      
      // Only increment unread if it's not from us and we're not viewing this chat
      if (message.senderId !== this.currentUser?.id && this.selectedChatId !== message.senderId) {
        conversation.unreadCount = (conversation.unreadCount || 0) + 1;
      }
      
      // Move this conversation to the top
      this.conversations = [
        conversation,
        ...this.conversations.filter(c => c.id !== conversation.id)
      ];
      this.filteredChats = [...this.conversations];
    } else {
      // New conversation from a doctor we haven't chatted with yet
      // Only reload if the message is from a doctor (to avoid spam)
      // The auto-refresh will pick it up within 5 seconds anyway
      console.log('[Doctor Chat] New conversation detected, will appear on next auto-refresh');
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

  // WebRTC Methods
  private async preparePeer(type: 'audio' | 'video'): Promise<void> {
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
      if (e.candidate && this.currentUser?.id && this.selectedChatId) {
        if (this.currentCallId) {
          this.socketService.emit('call:ice-candidate', { 
            callId: this.currentCallId, 
            candidate: e.candidate 
          });
        } else {
          this.socketService.emit('call:ice-candidate', { 
            fromUserId: this.currentUser.id,
            toUserId: this.selectedChatId,
            candidate: e.candidate 
          });
        }
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
    
    const constraints = type === 'audio' 
      ? { video: false, audio: true } 
      : { 
          video: { 
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          }, 
          audio: true 
        };
      
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

  endCall(): void {
    if (this.currentUser?.id && this.selectedChatId) {
      this.socketService.emit('call:end', { 
        fromUserId: this.currentUser.id, 
        toUserId: this.selectedChatId, 
        callId: this.currentCallId 
      });
    }
    this.cleanupCall();
  }

  private cleanupCall(): void {
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
      try { 
        this.pc.close(); 
      } catch (error) {
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

  private startRinging(outgoing: boolean): void {
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

  private stopRinging(): void {
    try {
      if (this.ringOsc) { this.ringOsc.stop(); this.ringOsc.disconnect(); }
      if (this.ringGain) { this.ringGain.disconnect(); }
    } catch {}
    this.ringOsc = undefined as any;
    this.ringGain = undefined as any;
  }

  acceptIncoming(): void {
    if (!this.currentUser?.id || !this.incomingFromUserId) return;
    this.socketService.emit('call:accept', { 
      fromUserId: this.currentUser.id,
      toUserId: this.incomingFromUserId
    });
  }

  declineIncoming(): void {
    if (!this.currentUser?.id || !this.incomingFromUserId) return;
    this.socketService.emit('call:decline', { 
      fromUserId: this.currentUser.id, 
      toUserId: this.incomingFromUserId 
    });
    this.cleanupCall();
  }

  /**
   * Clean up messages from inactive/deleted doctors
   * This removes conversation threads with doctors who have been deleted or deactivated
   */
  cleanupInactiveConversations(): void {
    if (!this.currentUser?.id || this.isCleaningUp) return;
    
    this.isCleaningUp = true;
    this.cleanupMessage = '';
    
    this.messageService.cleanupInactiveMessages(this.currentUser.id).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          const { deleted, inactiveUserCount } = response.data;
          
          if (deleted > 0) {
            console.log(`[Doctor Chat] Cleaned up ${deleted} messages from ${inactiveUserCount} inactive doctors`);
            this.cleanupMessage = `Removed ${deleted} messages from ${inactiveUserCount} inactive doctor(s)`;
            
            // Reload conversations to reflect changes
            this.loadConversations();
            
            // Clear the message after 5 seconds
            setTimeout(() => {
              this.cleanupMessage = '';
            }, 5000);
          } else {
            console.log('[Doctor Chat] No inactive conversations found');
          }
        }
        this.isCleaningUp = false;
      },
      error: (error) => {
        console.error('[Doctor Chat] Error cleaning up inactive conversations:', error);
        this.cleanupMessage = 'Error cleaning up conversations';
        this.isCleaningUp = false;
        
        setTimeout(() => {
          this.cleanupMessage = '';
        }, 5000);
      }
    });
  }

  /**
   * Manual refresh - cleans up and reloads everything
   */
  refreshConversations(): void {
    this.cleanupInactiveConversations();
  }
}
