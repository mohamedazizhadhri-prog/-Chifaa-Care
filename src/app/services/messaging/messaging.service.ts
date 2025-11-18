import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth.service';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  recipientId: string;
  recipientName: string;
  content: string;
  timestamp: Date;
  read: boolean;
  type: 'text' | 'voice' | 'video' | 'file';
  metadata?: any;
}

export interface Conversation {
  id: string;
  participants: Array<{
    id: string;
    name: string;
    role: string;
    avatar?: string;
  }>;
  lastMessage?: Message;
  unreadCount: number;
  type: 'patient' | 'doctor';
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  private socket: Socket | null = null;
  private messagesSubject = new Subject<Message>();
  private conversationsSubject = new BehaviorSubject<Conversation[]>([]);
  private onlineUsersSubject = new BehaviorSubject<Set<string>>(new Set());
  private typingSubject = new Subject<{ conversationId: string; userId: string; isTyping: boolean }>();
  
  messages$ = this.messagesSubject.asObservable();
  conversations$ = this.conversationsSubject.asObservable();
  onlineUsers$ = this.onlineUsersSubject.asObservable();
  typing$ = this.typingSubject.asObservable();

  private readonly SOCKET_URL = environment.socketUrl || 'http://localhost:3000';
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;

  constructor(private authService: AuthService) {
    this.initializeSocket();
  }

  private initializeSocket(): void {
    const token = this.authService.getToken();
    if (!token) return;

    this.socket = io(this.SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.MAX_RECONNECT_ATTEMPTS
    });

    this.setupSocketListeners();
  }

  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket connected');
      this.reconnectAttempts = 0;
      this.loadConversations();
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    this.socket.on('message:new', (message: Message) => {
      console.log('📩 New message received:', message);
      this.messagesSubject.next(message);
      this.updateConversationWithMessage(message);
      this.playNotificationSound();
    });

    this.socket.on('message:read', (data: { conversationId: string; messageIds: string[] }) => {
      console.log('✓ Messages marked as read');
      this.updateReadStatus(data);
    });

    this.socket.on('user:online', (userId: string) => {
      const users = this.onlineUsersSubject.value;
      users.add(userId);
      this.onlineUsersSubject.next(users);
    });

    this.socket.on('user:offline', (userId: string) => {
      const users = this.onlineUsersSubject.value;
      users.delete(userId);
      this.onlineUsersSubject.next(users);
    });

    this.socket.on('typing:start', (data: { conversationId: string; userId: string }) => {
      this.typingSubject.next({ ...data, isTyping: true });
    });

    this.socket.on('typing:stop', (data: { conversationId: string; userId: string }) => {
      this.typingSubject.next({ ...data, isTyping: false });
    });

    this.socket.on('call:incoming', (data: any) => {
      console.log('📞 Incoming call:', data);
      // Will be handled by WebRTC service
    });

    this.socket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });
  }

  // Load all conversations
  loadConversations(): void {
    if (!this.socket) return;

    this.socket.emit('conversations:list', {}, (response: { conversations: Conversation[] }) => {
      if (response && response.conversations) {
        this.conversationsSubject.next(response.conversations);
      }
    });
  }

  // Send a text message
  sendMessage(conversationId: string, content: string): void {
    if (!this.socket) return;

    const message = {
      conversationId,
      content,
      type: 'text',
      timestamp: new Date()
    };

    this.socket.emit('message:send', message);
  }

  // Send a file
  sendFile(conversationId: string, file: File): Observable<{ progress: number; message?: Message }> {
    return new Observable(observer => {
      // TODO: Implement file upload with progress
      observer.next({ progress: 100 });
      observer.complete();
    });
  }

  // Mark messages as read
  markAsRead(conversationId: string, messageIds: string[]): void {
    if (!this.socket) return;

    this.socket.emit('message:read', { conversationId, messageIds });
  }

  // Start typing indicator
  startTyping(conversationId: string): void {
    if (!this.socket) return;
    this.socket.emit('typing:start', { conversationId });
  }

  // Stop typing indicator
  stopTyping(conversationId: string): void {
    if (!this.socket) return;
    this.socket.emit('typing:stop', { conversationId });
  }

  // Get conversation by ID
  getConversation(conversationId: string): Observable<Conversation> {
    return new Observable(observer => {
      if (!this.socket) {
        observer.error('Socket not connected');
        return;
      }

      this.socket.emit('conversation:get', { conversationId }, (response: { conversation: Conversation }) => {
        if (response && response.conversation) {
          observer.next(response.conversation);
          observer.complete();
        } else {
          observer.error('Conversation not found');
        }
      });
    });
  }

  // Get messages for a conversation
  getMessages(conversationId: string, limit: number = 50, offset: number = 0): Observable<Message[]> {
    return new Observable(observer => {
      if (!this.socket) {
        observer.error('Socket not connected');
        return;
      }

      this.socket.emit('messages:get', { conversationId, limit, offset }, (response: { messages: Message[] }) => {
        if (response && response.messages) {
          observer.next(response.messages);
          observer.complete();
        } else {
          observer.error('Failed to load messages');
        }
      });
    });
  }

  // Create a new conversation
  createConversation(recipientId: string, type: 'patient' | 'doctor'): Observable<Conversation> {
    return new Observable(observer => {
      if (!this.socket) {
        observer.error('Socket not connected');
        return;
      }

      this.socket.emit('conversation:create', { recipientId, type }, (response: { conversation: Conversation }) => {
        if (response && response.conversation) {
          observer.next(response.conversation);
          observer.complete();
          this.loadConversations();
        } else {
          observer.error('Failed to create conversation');
        }
      });
    });
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    return this.onlineUsersSubject.value.has(userId);
  }

  // Get unread count
  getUnreadCount(): number {
    const conversations = this.conversationsSubject.value;
    return conversations.reduce((total, conv) => total + conv.unreadCount, 0);
  }

  // Update conversation with new message
  private updateConversationWithMessage(message: Message): void {
    const conversations = this.conversationsSubject.value;
    const index = conversations.findIndex(c => c.id === message.conversationId);
    
    if (index !== -1) {
      conversations[index].lastMessage = message;
      conversations[index].updatedAt = message.timestamp;
      
      // Increment unread count if not sender
      const currentUser = this.authService.getCurrentUser();
      if (currentUser && message.senderId !== currentUser.id) {
        conversations[index].unreadCount++;
      }
      
      // Move to top
      const updated = conversations.splice(index, 1)[0];
      conversations.unshift(updated);
      
      this.conversationsSubject.next([...conversations]);
    }
  }

  // Update read status
  private updateReadStatus(data: { conversationId: string; messageIds: string[] }): void {
    const conversations = this.conversationsSubject.value;
    const conversation = conversations.find(c => c.id === data.conversationId);
    
    if (conversation) {
      conversation.unreadCount = Math.max(0, conversation.unreadCount - data.messageIds.length);
      this.conversationsSubject.next([...conversations]);
    }
  }

  // Play notification sound
  private playNotificationSound(): void {
    try {
      const audio = new Audio('assets/sounds/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Could not play sound:', e));
    } catch (e) {
      console.log('Notification sound not available');
    }
  }

  // Disconnect socket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Reconnect socket
  reconnect(): void {
    this.disconnect();
    this.initializeSocket();
  }
}
