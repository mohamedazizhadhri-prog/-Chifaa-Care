import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: Server | null = null;

export function initSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH']
    }
  });

  io.on('connection', (socket: Socket) => {
    // Client should emit 'join' with their userId to receive direct events
    socket.on('join', (userId: string) => {
      if (userId) {
        socket.join(`user:${userId}`);
      }
    });

    socket.on('disconnect', () => {
      // No-op for now
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.io has not been initialized');
  return io;
}
