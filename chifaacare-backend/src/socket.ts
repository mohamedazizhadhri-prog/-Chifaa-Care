import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import prisma from './prisma';

let io: Server | null = null;

// Track online presence: userId -> connection count
const presence = new Map<string, number>();

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
        (socket.data as any).userId = userId;
        // presence increment
        const c = presence.get(userId) || 0;
        presence.set(userId, c + 1);
        if (c === 0) {
          io?.emit('presence:update', { userId, online: true });
        }
      }
    });

    // --- WebRTC signaling events ---
    // Request a call (notify callee)
    socket.on('call:request', (payload: { fromUserId: string; toUserId: string; media: 'audio' | 'video' }) => {
      try {
        if (!payload?.fromUserId || !payload?.toUserId) return;
        io?.to(`user:${payload.toUserId}`).emit('call:incoming', payload);
      } catch (e) {
        // swallow
      }
    });

    // Exchange SDP offer/answer
    socket.on('call:offer', (payload: { fromUserId: string; toUserId: string; sdp: any }) => {
      try {
        if (!payload?.fromUserId || !payload?.toUserId || !payload?.sdp) return;
        io?.to(`user:${payload.toUserId}`).emit('call:offer', payload);
      } catch {}
    });

    socket.on('call:answer', (payload: { fromUserId: string; toUserId: string; sdp: any }) => {
      try {
        if (!payload?.fromUserId || !payload?.toUserId || !payload?.sdp) return;
        io?.to(`user:${payload.toUserId}`).emit('call:answer', payload);
      } catch {}
    });

    // ICE candidates
    socket.on('call:ice-candidate', (payload: { fromUserId: string; toUserId: string; candidate: any }) => {
      try {
        if (!payload?.fromUserId || !payload?.toUserId || !payload?.candidate) return;
        io?.to(`user:${payload.toUserId}`).emit('call:ice-candidate', payload);
      } catch {}
    });

    // Accept/Decline
    socket.on('call:accept', async (payload: { fromUserId: string; toUserId: string }) => {
      try {
        if (!payload?.fromUserId || !payload?.toUserId) return;
        // Create CallLog
        const log = await prisma.callLog.create({
          data: {
            callerId: payload.toUserId, // the original caller
            calleeId: payload.fromUserId, // the acceptor
            status: 'ONGOING'
          }
        });
        // Persist a system-like chat message: Call started
        try {
          const startMsg = await prisma.message.create({
            data: {
              senderId: payload.toUserId, // show as from original caller
              recipientId: payload.fromUserId,
              content: '📞 Call started'
            }
          });
          // Deliver via existing chat events (both sides as 'message:new' for immediate UI update)
          io?.to(`user:${payload.fromUserId}`).emit('message:new', startMsg);
          io?.to(`user:${payload.toUserId}`).emit('message:new', startMsg);
        } catch {}
        io?.to(`user:${payload.toUserId}`).emit('call:accepted', { ...payload, callId: log.id, startedAt: log.startedAt });
        io?.to(`user:${payload.fromUserId}`).emit('call:started', { callId: log.id, startedAt: log.startedAt });
      } catch {}
    });

    socket.on('call:decline', async (payload: { fromUserId: string; toUserId: string }) => {
      try {
        if (!payload?.fromUserId || !payload?.toUserId) return;
        // Optionally persist a declined call log
        await prisma.callLog.create({
          data: {
            callerId: payload.toUserId,
            calleeId: payload.fromUserId,
            status: 'DECLINED'
          }
        }).catch(() => {});
        io?.to(`user:${payload.toUserId}`).emit('call:declined', payload);
      } catch {}
    });

    // End call
    socket.on('call:end', async (payload: { fromUserId: string; toUserId: string; callId?: string }) => {
      try {
        if (!payload?.fromUserId || !payload?.toUserId) return;
        let endedPayload: any = payload;
        // Update CallLog if callId present
        if (payload.callId) {
          const updated = await prisma.callLog.update({
            where: { id: payload.callId },
            data: { endedAt: new Date(), status: 'ENDED' }
          }).catch(() => null);
          if (updated) {
            const dur = Math.max(0, Math.floor(((updated.endedAt as any as Date).getTime() - (updated.startedAt as any as Date).getTime()) / 1000));
            await prisma.callLog.update({ where: { id: updated.id }, data: { durationSec: dur } }).catch(() => {});
            endedPayload = { ...payload, callId: updated.id, durationSec: dur, endedAt: updated.endedAt, startedAt: updated.startedAt };
            // Persist a system-like chat message: Call ended with duration
            try {
              const mins = Math.floor(dur / 60).toString().padStart(2, '0');
              const secs = Math.floor(dur % 60).toString().padStart(2, '0');
              const endMsg = await prisma.message.create({
                data: {
                  senderId: payload.fromUserId, // the user who ended the call
                  recipientId: payload.toUserId,
                  content: `📞 Call ended (${mins}:${secs})`
                }
              });
              // Deliver via existing chat events (both sides as 'message:new')
              io?.to(`user:${payload.toUserId}`).emit('message:new', endMsg);
              io?.to(`user:${payload.fromUserId}`).emit('message:new', endMsg);
            } catch {}
          }
        }
        io?.to(`user:${payload.toUserId}`).emit('call:ended', endedPayload);
        io?.to(`user:${payload.fromUserId}`).emit('call:ended', endedPayload);
      } catch {}
    });

    socket.on('disconnect', () => {
      const userId = (socket.data as any).userId;
      if (userId) {
        const c = presence.get(userId) || 0;
        if (c <= 1) {
          presence.delete(userId);
          io?.emit('presence:update', { userId, online: false });
        } else {
          presence.set(userId, c - 1);
        }
      }
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.io has not been initialized');
  return io;
}
