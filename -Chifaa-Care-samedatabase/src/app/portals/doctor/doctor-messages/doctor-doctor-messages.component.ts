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
  private audioCtx?: AudioContext;
  private ringOsc?: OscillatorNode;
  private ringGain?: GainNode;
  
  // Auto-refresh intervals
  private conversationRefreshInterval = 5000; // 5 seconds
  private messageRefreshInterval = 3000; // 3 seconds
  private doctorRefreshInterval = 30000; // 30 seconds
  
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
    
    this.messageService.getThread(this.currentUser.id, this.selectedChatId).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          const previousLength = this.currentMessages.length;
          this.currentMessages = response.data.messages.map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            senderId: msg.senderId,
            timestamp: new Date(msg.createdAt),
            isRead: msg.isRead
          }));
          
          // Only scroll if new messages were added
          if (this.currentMessages.length > previousLength) {
            this.scrollToBottom();
          }
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
    this.socketService.on('message:new', (message: any) => {
      this.handleNewMessage(message);
    });

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
    });

    this.socketService.on('call:ice-candidate', async (p: { fromUserId: string; toUserId: string; candidate: any }) => {
      if (!this.currentUser || p.toUserId !== this.currentUser.id) return;
      try {
        if (p.candidate) await this.pc?.addIceCandidate(new RTCIceCandidate(p.candidate));
      } catch {}
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
    
    this.messageService.sendMessage(
      this.currentUser.id,
      this.selectedChatId,
      content
    ).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.scrollToBottom();
          // Immediately refresh to show the sent message
          this.refreshMessages();
        }
      },
      error: (error) => {
        console.error('Error sending message:', error);
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

  async startCall(type: 'audio' | 'video'): Promise<void> {
    this.showCallMenu = false;
    if (!this.currentUser?.id || !this.selectedChatId) return;
    this.mediaType = type;
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

    const conversation = this.conversations.find(c => c.doctorId === message.senderId);
    if (conversation) {
      conversation.lastMessage = message.content;
      conversation.lastMessageTime = new Date();
      
      if (message.senderId !== this.currentUser?.id) {
        conversation.unreadCount = (conversation.unreadCount || 0) + 1;
      }
      
      this.conversations = [
        conversation,
        ...this.conversations.filter(c => c.id !== conversation.id)
      ];
      this.filteredChats = [...this.conversations];
    }

    if (this.selectedChatId === message.senderId) {
      this.currentMessages.push(chatMessage);
      this.scrollToBottom();
      
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

  // WebRTC Methods
  private async preparePeer(type: 'audio' | 'video'): Promise<void> {
    this.cleanupCall();
    this.pc = new RTCPeerConnection({ 
      iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }] 
    });
    
    this.pc.onicecandidate = (e) => {
      if (e.candidate && this.currentUser?.id && this.selectedChatId) {
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
    
    const constraints = type === 'audio' 
      ? { video: false, audio: true } 
      : { video: true, audio: true };
      
    this.localStream = await navigator.mediaDevices.getUserMedia(constraints as MediaStreamConstraints);
    this.localStream.getTracks().forEach(t => this.pc!.addTrack(t, this.localStream!));
    
    if (this.localVideo?.nativeElement) {
      this.localVideo.nativeElement.srcObject = this.localStream;
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
