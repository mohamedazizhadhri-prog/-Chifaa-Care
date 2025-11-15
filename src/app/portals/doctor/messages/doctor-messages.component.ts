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
  templateUrl: './doctor-messages-patient.template.html',
  styleUrls: []
})
export class DoctorMessagesComponent implements OnInit, OnDestroy, AfterViewChecked {
  private subscriptions: Subscription[] = [];
  private shouldScrollToBottom = false;
  private lastMessageSentTime = 0;
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

  // UI state
  hoveredPatientId: string | null = null;
  
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

  @ViewChild('messagesContainer') messagesContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('messageInput') messageInput?: ElementRef<HTMLInputElement>;
  @ViewChild('localVideo') localVideo?: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo?: ElementRef<HTMLVideoElement>;

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
    this.cleanupCall();
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.socketService.disconnect();
  }

  private setupSocketListeners() {
    console.log('[Doctor Messages] Setting up socket listeners...');
    this.setupSignalingListeners();
    
    this.socketService.on<any>('message:new', (m) => {
      if (!m) return;
      console.log('[Doctor Messages] New message received:', m);
      
      const isSelf = m.senderId === this.currentDoctorId;
      const isToMe = m.recipientId === this.currentDoctorId;
      if (!isSelf && !isToMe) return;

      const now = Date.now();
      if (isSelf && (now - this.lastMessageSentTime) < 2000) {
        console.log('[Doctor Messages] Ignoring own message from socket (just sent)');
        return;
      }

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
    
    this.lastMessageSentTime = Date.now();
    
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
        this.lastMessageSentTime = 0;
        alert('Failed to send message. Please try again.');
      }
    });
  }

  attachFile() {
    console.log('[Doctor Messages] Attach file clicked');
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

  async startCall(type: 'audio' | 'video'): Promise<void> {
    if (!this.currentDoctorId || !this.selectedChatId) return;
    this.mediaType = type;
    
    console.log('[Doctor Messages] Starting call:', {
      from: this.currentDoctorId,
      to: this.selectedChatId,
      type: type
    });
    
    this.socketService.emit('call:request', { 
      fromUserId: this.currentDoctorId, 
      toUserId: this.selectedChatId, 
      media: type 
    });
    this.dialing = true;
    this.startRinging(true);
  }

  // WebRTC Methods
  private setupSignalingListeners(): void {
    this.socketService.on('call:incoming', async (p: { fromUserId: string; toUserId: string; media: 'audio' | 'video' }) => {
      console.log('[Doctor Messages] Incoming call:', p);
      if (!this.currentDoctorId || p.toUserId !== this.currentDoctorId) return;
      this.mediaType = p.media;
      this.selectedChatId = p.fromUserId;
      this.incomingCall = true;
      this.incomingFromUserId = p.fromUserId;
      this.startRinging(false);
    });

    this.socketService.on('call:offer', async (p: { fromUserId: string; toUserId: string; sdp: any }) => {
      if (!this.currentDoctorId || p.toUserId !== this.currentDoctorId) return;
      if (!this.pc) await this.preparePeer(this.mediaType);
      await this.pc!.setRemoteDescription(new RTCSessionDescription(p.sdp));
      await this.processQueuedIceCandidates();
      const answer = await this.pc!.createAnswer();
      await this.pc!.setLocalDescription(answer);
      this.socketService.emit('call:answer', { 
        fromUserId: this.currentDoctorId, 
        toUserId: p.fromUserId, 
        sdp: answer
      });
      this.stopRinging();
      this.inCall = true;
      this.incomingCall = false;
    });

    this.socketService.on('call:answer', async (p: { fromUserId: string; toUserId: string; sdp: any }) => {
      if (!this.currentDoctorId || p.toUserId !== this.currentDoctorId) return;
      await this.pc?.setRemoteDescription(new RTCSessionDescription(p.sdp));
      await this.processQueuedIceCandidates();
    });

    this.socketService.on('call:ice-candidate', async (p: { fromUserId: string; toUserId: string; candidate: any }) => {
      if (!this.currentDoctorId || p.toUserId !== this.currentDoctorId) return;
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
      if (!this.currentDoctorId || p.toUserId !== this.currentDoctorId) return;
      this.cleanupCall();
    });

    this.socketService.on('call:accepted', async (p: { fromUserId: string; toUserId: string; callId?: string }) => {
      if (!this.currentDoctorId || p.toUserId !== this.currentDoctorId) return;
      this.stopRinging();
      this.dialing = false;
      if (p.callId) this.currentCallId = p.callId;
      await this.preparePeer(this.mediaType);
      const offer = await this.pc!.createOffer();
      await this.pc!.setLocalDescription(offer);
      this.socketService.emit('call:offer', { 
        fromUserId: this.currentDoctorId,
        toUserId: p.fromUserId,
        sdp: offer
      });
      this.inCall = true;
    });

    this.socketService.on('call:declined', (p: { fromUserId: string; toUserId: string }) => {
      if (!this.currentDoctorId || p.toUserId !== this.currentDoctorId) return;
      this.stopRinging();
      this.dialing = false;
      this.cleanupCall();
    });

    this.socketService.on('call:started', (p: { callId: string; startedAt: string }) => {
      if (p?.callId) this.currentCallId = p.callId;
    });
  }

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
      if (e.candidate && this.currentDoctorId && this.selectedChatId) {
        this.socketService.emit('call:ice-candidate', { 
          fromUserId: this.currentDoctorId,
          toUserId: this.selectedChatId,
          candidate: e.candidate 
        });
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
    if (this.currentDoctorId && this.selectedChatId) {
      this.socketService.emit('call:end', { 
        fromUserId: this.currentDoctorId, 
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
    if (!this.currentDoctorId || !this.incomingFromUserId) return;
    this.socketService.emit('call:accept', { 
      fromUserId: this.currentDoctorId,
      toUserId: this.incomingFromUserId
    });
  }

  declineIncoming(): void {
    if (!this.currentDoctorId || !this.incomingFromUserId) return;
    this.socketService.emit('call:decline', { 
      fromUserId: this.currentDoctorId, 
      toUserId: this.incomingFromUserId 
    });
    this.cleanupCall();
  }

  private loadConversations() {
    console.log('[Doctor Messages] Loading conversations for doctor:', this.currentDoctorId);
    
    if (!this.currentDoctorId) {
      console.error('[Doctor Messages] No doctor ID available!');
      return;
    }
    
    this.messageService.getConversations(this.currentDoctorId).subscribe({
      next: (res) => {
        const patientConversations = res.data.conversations.filter((c: any) => {
          const role = (c.role || '').toUpperCase().trim();
          return role === 'PATIENT' || role === 'USER';
        });
        
        if (patientConversations.length === 0) {
          this.allChats = res.data.conversations.map((c: any) => ({
            id: c.otherUserId,
            patientName: `${c.name} [${c.role}]`,
            lastMessage: c.lastMessage || 'No messages yet',
            lastMessageTime: c.lastMessageTime || new Date().toISOString(),
            unreadCount: c.unreadCount || 0,
            isOnline: false,
            messages: []
          }));
        } else {
          this.allChats = patientConversations.map((c: any) => ({
            id: c.otherUserId,
            patientName: c.name || 'Unknown Patient',
            lastMessage: c.lastMessage || 'No messages yet',
            lastMessageTime: c.lastMessageTime || new Date().toISOString(),
            unreadCount: c.unreadCount || 0,
            isOnline: false,
            messages: []
          }));
        }
        
        this.allChats.sort((a, b) => {
          const timeA = new Date(a.lastMessageTime).getTime();
          const timeB = new Date(b.lastMessageTime).getTime();
          return timeB - timeA;
        });
        
        this.filterChats();
        
        if (this.allChats.length > 0 && !this.selectedChatId) {
          setTimeout(() => {
            this.selectChat(this.allChats[0].id);
          }, 100);
        }
      },
      error: (err) => {
        console.error('[Doctor Messages] Error loading conversations:', err);
      }
    });
  }

  private loadPatients() {
    this.patientService.getPatients().subscribe({
      next: (list) => {
        this.patients = list || [];
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
