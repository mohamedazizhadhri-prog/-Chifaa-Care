import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private socket: Socket | null = null;

  connect(userId: string) {
    if (this.socket) return;
    this.socket = io(environment.apiUrl.replace('/api/v1', ''), {
      transports: ['websocket'],
    });
    this.socket.on('connect', () => {
      this.socket?.emit('join', userId);
    });
  }

  on<T = any>(event: string, handler: (payload: T) => void) {
    this.socket?.on(event, handler as any);
  }

  off(event: string, handler?: (...args: any[]) => void) {
    if (!this.socket) return;
    if (handler) this.socket.off(event, handler);
    else this.socket.off(event);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  ngOnDestroy() {
    this.disconnect();
  }
}
