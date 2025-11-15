import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MessagingService, Conversation, Message } from '../../services/messaging/messaging.service';
import { WebRTCService, CallState } from '../../services/messaging/webrtc.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-doctor-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doctor-messages.component.html',
  styleUrls: ['./doctor-messages.component.scss']
})
export class DoctorMessagesComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;

  activeTab: 'patients' | 'doctors' = 'patients';
  conversations: Conversation[] = [];
  patientConversations: Conversation[] = [];
  doctorConversations: Conversation[] = [];
  selectedConversation: Conversation | null = null;
  messages: Message[] = [];
  newMessage = '';
  isTyping = false;
  typingUsers = new Set<string>();
  
  // Call state
  callState: CallState | null = null;
  isMuted = false;
  isVideoOff = false;
  showCallModal = false;
  
  // Loading states
  isLoadingConversations = true;
  isLoadingMessages = false;
  isSendingMessage = false;

  // Computed properties for template
  get patientUnreadCount(): number {
    return this.patientConversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  }

  get doctorUnreadCount(): number {
    return this.doctorConversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  }

  get displayedConversations(): Conversation[] {
    return this.activeTab === 'patients' ? this.patientConversations : this.doctorConversations;
  }

  // Helper methods for template to avoid arrow function issues
  getPatientUnreadCount(): number {
    return this.patientUnreadCount;
  }

  getDoctorUnreadCount(): number {
    return this.doctorUnreadCount;
  }

  private subscriptions: Subscription[] = [];

  constructor(
    public messagingService: MessagingService,
    public webrtcService: WebRTCService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadConversations();
    this.subscribeToMessages();
    this.subscribeToConversations();
    this.subscribeToTyping();
    this.subscribeToCallState();
    this.subscribeToStreams();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private subscribeToConversations(): void {
    const sub = this.messagingService.conversations$.subscribe(conversations => {
      this.conversations = conversations;
      this.filterConversations();
      this.isLoadingConversations = false;
    });
    this.subscriptions.push(sub);
  }

  private subscribeToMessages(): void {
    const sub = this.messagingService.messages$.subscribe(message => {
      if (this.selectedConversation && message.conversationId === this.selectedConversation.id) {
        this.messages.push(message);
        this.scrollToBottom();
        
        // Mark as read
        if (message.senderId !== this.authService.getCurrentUser()?.id) {
          this.messagingService.markAsRead(this.selectedConversation.id, [message.id]);
        }
      }
      
      // Play notification sound
      this.playNotificationSound();
    });
    this.subscriptions.push(sub);
  }

  private subscribeToTyping(): void {
    const sub = this.messagingService.typing$.subscribe(data => {
      if (this.selectedConversation && data.conversationId === this.selectedConversation.id) {
        if (data.isTyping) {
          this.typingUsers.add(data.userId);
        } else {
          this.typingUsers.delete(data.userId);
        }
      }
    });
    this.subscriptions.push(sub);
  }

  private subscribeToCallState(): void {
    const sub = this.webrtcService.callState$.subscribe(state => {
      this.callState = state;
      this.showCallModal = state !== null;
      
      if (state && state.isIncoming && !state.isActive) {
        this.playRingtone();
      } else {
        this.stopRingtone();
      }
    });
    this.subscriptions.push(sub);
  }

  private subscribeToStreams(): void {
    const localSub = this.webrtcService.localStream$.subscribe(stream => {
      if (stream && this.localVideo) {
        this.localVideo.nativeElement.srcObject = stream;
      }
    });
    this.subscriptions.push(localSub);

    const remoteSub = this.webrtcService.remoteStream$.subscribe(stream => {
      if (stream && this.remoteVideo) {
        this.remoteVideo.nativeElement.srcObject = stream;
      }
    });
    this.subscriptions.push(remoteSub);
  }

  switchTab(tab: 'patients' | 'doctors'): void {
    this.activeTab = tab;
    this.filterConversations();
    this.selectedConversation = null;
    this.messages = [];
  }

  private filterConversations(): void {
    this.patientConversations = this.conversations.filter(c => c.type === 'patient');
    this.doctorConversations = this.conversations.filter(c => c.type === 'doctor');
  }

  loadConversations(): void {
    this.messagingService.loadConversations();
  }

  selectConversation(conversation: Conversation): void {
    this.selectedConversation = conversation;
    this.messages = [];
    this.isLoadingMessages = true;
    
    this.messagingService.getMessages(conversation.id).subscribe({
      next: messages => {
        this.messages = messages;
        this.isLoadingMessages = false;
        this.scrollToBottom();
        
        // Mark unread messages as read
        const unreadIds = messages.filter(m => !m.read && m.senderId !== this.authService.getCurrentUser()?.id).map(m => m.id);
        if (unreadIds.length > 0) {
          this.messagingService.markAsRead(conversation.id, unreadIds);
        }
      },
      error: error => {
        console.error('Failed to load messages:', error);
        this.isLoadingMessages = false;
      }
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedConversation || this.isSendingMessage) return;

    this.isSendingMessage = true;
    this.messagingService.sendMessage(this.selectedConversation.id, this.newMessage.trim());
    this.newMessage = '';
    this.isSendingMessage = false;
    
    if (this.messageInput) {
      this.messageInput.nativeElement.focus();
    }
  }

  onTyping(): void {
    if (!this.selectedConversation) return;
    
    if (!this.isTyping) {
      this.isTyping = true;
      this.messagingService.startTyping(this.selectedConversation.id);
      
      setTimeout(() => {
        this.isTyping = false;
        this.messagingService.stopTyping(this.selectedConversation!.id);
      }, 3000);
    }
  }

  // Call functions
  startVoiceCall(): void {
    if (!this.selectedConversation) return;
    
    const recipient = this.selectedConversation.participants.find(
      p => p.id !== this.authService.getCurrentUser()?.id
    );
    
    if (recipient) {
      this.webrtcService.initiateCall(
        recipient.id,
        recipient.name,
        this.selectedConversation.id,
        'voice'
      );
    }
  }

  startVideoCall(): void {
    if (!this.selectedConversation) return;
    
    const recipient = this.selectedConversation.participants.find(
      p => p.id !== this.authService.getCurrentUser()?.id
    );
    
    if (recipient) {
      this.webrtcService.initiateCall(
        recipient.id,
        recipient.name,
        this.selectedConversation.id,
        'video'
      );
    }
  }

  answerCall(): void {
    if (this.callState) {
      this.webrtcService.answerCall(this.callState.callType);
    }
  }

  rejectCall(): void {
    this.webrtcService.rejectCall();
  }

  endCall(): void {
    this.webrtcService.endCall();
  }

  toggleMute(): void {
    this.isMuted = !this.webrtcService.toggleMicrophone();
  }

  toggleVideo(): void {
    this.isVideoOff = !this.webrtcService.toggleCamera();
  }

  switchCamera(): void {
    this.webrtcService.switchCamera();
  }

  // Utility functions
  isUserOnline(userId: string): boolean {
    return this.messagingService.isUserOnline(userId);
  }

  getOtherParticipant(conversation: Conversation): any {
    return conversation.participants.find(
      p => p.id !== this.authService.getCurrentUser()?.id
    );
  }

  formatTime(date: Date): string {
    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return messageDate.toLocaleDateString();
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer) {
        const element = this.messagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    }, 100);
  }

  private playNotificationSound(): void {
    try {
      const audio = new Audio('assets/sounds/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Could not play notification sound'));
    } catch (e) {
      console.log('Notification sound not available');
    }
  }

  private ringtoneAudio: HTMLAudioElement | null = null;

  private playRingtone(): void {
    try {
      this.ringtoneAudio = new Audio('assets/sounds/ringtone.mp3');
      this.ringtoneAudio.loop = true;
      this.ringtoneAudio.play().catch(e => console.log('Could not play ringtone'));
    } catch (e) {
      console.log('Ringtone not available');
    }
  }

  private stopRingtone(): void {
    if (this.ringtoneAudio) {
      this.ringtoneAudio.pause();
      this.ringtoneAudio.currentTime = 0;
      this.ringtoneAudio = null;
    }
  }
}
