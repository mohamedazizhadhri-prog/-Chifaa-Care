import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private socket: Socket | null = null;
  private currentUserId: string | null = null;

  connect(userId: string) {
    console.log('[SocketService] Connect called for user:', userId);
    
    // If already connected with the same user and socket is connected, just ensure we're in the room
    if (this.socket?.connected && this.currentUserId === userId) {
      console.log('[SocketService] Already connected, re-joining room');
      this.socket.emit('join', userId);
      return;
    }
    
    // If socket exists but not connected, or user changed, disconnect old one
    if (this.socket) {
      console.log('[SocketService] Cleaning up old socket connection');
      // Remove all listeners before disconnecting
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.currentUserId = userId;
    const socketUrl = environment.apiUrl.replace('/api/v1', '');
    console.log('[SocketService] Connecting to:', socketUrl);
    
    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      forceNew: true // Force new connection
    });
    
    this.socket.on('connect', () => {
      console.log('[SocketService] Connected successfully, socket ID:', this.socket?.id);
      console.log('[SocketService] Joining room for user:', userId);
      this.socket?.emit('join', userId);
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('[SocketService] Connection error:', error);
    });
    
    this.socket.on('disconnect', (reason) => {
      console.warn('[SocketService] Disconnected:', reason);
      // Only try to reconnect if it wasn't a manual disconnect
      if (reason === 'io server disconnect') {
        // Server disconnected us, try to reconnect
        console.log('[SocketService] Server disconnected, attempting reconnect...');
      }
    });
    
    this.socket.on('reconnect', (attemptNumber) => {
      console.log('[SocketService] Reconnected after', attemptNumber, 'attempts');
      if (this.currentUserId) {
        console.log('[SocketService] Re-joining room after reconnection');
        this.socket?.emit('join', this.currentUserId);
      }
    });
  }

  on<T = any>(event: string, handler: (payload: T) => void) {
    if (!this.socket) {
      console.warn('[SocketService] Socket not initialized for event:', event, '- will retry in 1 second');
      // Wait and try again - socket might be connecting
      setTimeout(() => {
        if (this.socket?.connected) {
          console.log('[SocketService] Socket now ready, listening to event:', event);
          this.socket.on(event, handler as any);
        } else {
          console.error('[SocketService] Socket still not ready after wait, cannot listen to:', event);
        }
      }, 1000);
      return;
    }
    
    if (!this.socket.connected) {
      console.warn('[SocketService] Socket not connected yet for event:', event, '- will listen when connected');
      // Set up the listener anyway - it will work once connected
      this.socket.on(event, handler as any);
      return;
    }
    
    console.log('[SocketService] Listening to event:', event);
    this.socket.on(event, handler as any);
  }

  once<T = any>(event: string, handler: (payload: T) => void) {
    if (!this.socket) {
      console.warn('[SocketService] Cannot listen to event (once), socket not connected:', event);
      return;
    }
    this.socket.once(event, handler as any);
  }

  emit<T = any>(event: string, payload?: T) {
    if (!this.socket || !this.socket.connected) {
      console.error('[SocketService] Cannot emit event, socket not connected:', event);
      return;
    }
    console.log('[SocketService] Emitting event:', event, payload);
    this.socket.emit(event, payload as any);
  }

  off(event: string, handler?: (...args: any[]) => void) {
    if (!this.socket) return;
    if (handler) this.socket.off(event, handler);
    else this.socket.off(event);
    console.log('[SocketService] Stopped listening to event:', event);
  }

  disconnect() {
    if (this.socket) {
      console.log('[SocketService] Disconnecting socket...');
      this.socket.removeAllListeners(); // Remove all event listeners
      this.socket.disconnect();
      this.socket = null;
      this.currentUserId = null;
      console.log('[SocketService] Socket disconnected and cleaned up');
    }
  }
  
  isConnected(): boolean {
    return this.socket !== null && this.socket.connected;
  }
  
  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  ngOnDestroy() {
    this.disconnect();
  }
}
