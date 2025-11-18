import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MessageService } from '../../../services/message.service';
import { SocketService } from '../../../services/socket.service';
import { PatientService } from '../../../services/patient.service';
import { Subscription, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
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
  templateUrl: './doctor-messages.component.html',
  styleUrls: ['./doctor-messages.component.scss']
})
export class DoctorMessagesComponentWithCalls implements OnInit, OnDestroy, AfterViewChecked {
  private subscriptions: Subscription[] = [];
  private shouldScrollToBottom = false;
  private lastMessageSentTime = 0;
  private destroy$ = new Subject<void>();
  isLoadingMessages = false;
  
  // Basic chat properties
  currentDoctorId = '';
  selectedChatId: string | null = null;
  selectedChat: Chat | null = null;
  newMessage = '';
  searchQuery = '';
  showPatientPicker = false;
  patients: PatientUser[] = [];
  allChats: Chat[] = [];
  filteredChats: Chat[] = [];

  // WebRTC call state properties
  inCall = false;
  dialing = false;
  incomingCall = false;
  incomingFromUserId: string | null = null;
  mediaType: 'audio' | 'video' = 'audio';
  isMuted = false;
  isCameraOff = false;
  
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
        
        setTimeout(() => {
          this.setupSocketListeners();
          this.setupSignalingListeners();
        }, 500);
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
    this.destroy$.next();
    this.destroy$.complete();
  }

  // TO BE CONTINUED IN NEXT FILE...
}
