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
}

export interface ChatMessage {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
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
}
