import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Conversation {
  otherUserId: string;
  name: string;
  role: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  email?: string;
  profileImage?: string;
  specialization?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profileImage?: string;
  specialization?: string;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class MessageService {
  private api = `${environment.apiUrl}/messages`;
  constructor(private http: HttpClient) {}

  getConversations(userId: string): Observable<{ status: string; data: { conversations: Conversation[] } }> {
    return this.http.get<{ status: string; data: { conversations: Conversation[] } }>(`${this.api}/conversations/${userId}`);
  }

  getThread(userId: string, otherUserId: string): Observable<{ status: string; data: { messages: ChatMessage[] } }> {
    return this.http.get<{ status: string; data: { messages: ChatMessage[] } }>(`${this.api}/thread`, { params: { userId, otherUserId } });
  }

  sendMessage(senderId: string, recipientId: string, content: string, appointmentId?: string): Observable<{ status: string; data: { message: ChatMessage } }> {
    return this.http.post<{ status: string; data: { message: ChatMessage } }>(`${this.api}/send`, { senderId, recipientId, content, appointmentId });
  }

  markThreadRead(userId: string, otherUserId: string): Observable<{ status: string; data: { updated: number } }> {
    return this.http.patch<{ status: string; data: { updated: number } }>(`${this.api}/mark-read`, { userId, otherUserId });
  }

  /**
   * Clean up messages from/to inactive users
   * This will delete all message threads with users that have been deactivated
   */
  cleanupInactiveMessages(userId: string): Observable<{ status: string; data: { deleted: number; inactiveUserCount: number; message: string } }> {
    return this.http.delete<{ status: string; data: { deleted: number; inactiveUserCount: number; message: string } }>(`${this.api}/cleanup-inactive/${userId}`);
  }

  /**
   * Get fresh user information (to refresh cached data like names)
   */
  getUserInfo(userId: string): Observable<{ status: string; data: { user: UserInfo } }> {
    return this.http.get<{ status: string; data: { user: UserInfo } }>(`${this.api}/user-info/${userId}`);
  }
}
