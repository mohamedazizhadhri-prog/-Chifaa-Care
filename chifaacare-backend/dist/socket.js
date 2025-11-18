"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = initSocket;
exports.getIO = getIO;
const socket_io_1 = require("socket.io");
const client_1 = require("@prisma/client");
let io = null;
const prisma = new client_1.PrismaClient();
// Track online presence: userId -> connection count
const presence = new Map();
function initSocket(server) {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST', 'PATCH']
        }
    });
    io.on('connection', (socket) => {
        // Client should emit 'join' with their userId to receive direct events
        socket.on('join', (userId) => {
            if (userId) {
                socket.join(`user:${userId}`);
                socket.data.userId = userId;
                // presence increment
                const c = presence.get(userId) || 0;
                presence.set(userId, c + 1);
                if (c === 0) {
                    io === null || io === void 0 ? void 0 : io.emit('presence:update', { userId, online: true });
                }
            }
        });
        // Doctor-only join: verifies role before joining doctors' room
        socket.on('doctor:join', async (userId) => {
            try {
                if (!userId)
                    return;
                const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
                if (!user || user.role !== 'DOCTOR') {
                    socket.emit('doctor:join:error', { message: 'Only doctor accounts can join doctor chat' });
                    return;
                }
                socket.join('doctors');
                socket.join(`user:${userId}`);
                socket.data.userId = userId;
            }
            catch (e) {
                // swallow
            }
        });
        // --- WebRTC signaling events ---
        // Request a call (notify callee)
        socket.on('call:request', (payload) => {
            try {
                if (!(payload === null || payload === void 0 ? void 0 : payload.fromUserId) || !(payload === null || payload === void 0 ? void 0 : payload.toUserId))
                    return;
                io === null || io === void 0 ? void 0 : io.to(`user:${payload.toUserId}`).emit('call:incoming', payload);
            }
            catch (e) {
                // swallow
            }
        });
        // Exchange SDP offer/answer
        socket.on('call:offer', (payload) => {
            try {
                if (!(payload === null || payload === void 0 ? void 0 : payload.fromUserId) || !(payload === null || payload === void 0 ? void 0 : payload.toUserId) || !(payload === null || payload === void 0 ? void 0 : payload.sdp))
                    return;
                io === null || io === void 0 ? void 0 : io.to(`user:${payload.toUserId}`).emit('call:offer', payload);
            }
            catch (_a) { }
        });
        socket.on('call:answer', (payload) => {
            try {
                if (!(payload === null || payload === void 0 ? void 0 : payload.fromUserId) || !(payload === null || payload === void 0 ? void 0 : payload.toUserId) || !(payload === null || payload === void 0 ? void 0 : payload.sdp))
                    return;
                io === null || io === void 0 ? void 0 : io.to(`user:${payload.toUserId}`).emit('call:answer', payload);
            }
            catch (_a) { }
        });
        // ICE candidates
        socket.on('call:ice-candidate', (payload) => {
            try {
                if (!(payload === null || payload === void 0 ? void 0 : payload.fromUserId) || !(payload === null || payload === void 0 ? void 0 : payload.toUserId) || !(payload === null || payload === void 0 ? void 0 : payload.candidate))
                    return;
                io === null || io === void 0 ? void 0 : io.to(`user:${payload.toUserId}`).emit('call:ice-candidate', payload);
            }
            catch (_a) { }
        });
        // Accept/Decline
        socket.on('call:accept', async (payload) => {
            try {
                if (!(payload === null || payload === void 0 ? void 0 : payload.fromUserId) || !(payload === null || payload === void 0 ? void 0 : payload.toUserId))
                    return;
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
                    io === null || io === void 0 ? void 0 : io.to(`user:${payload.fromUserId}`).emit('message:new', startMsg);
                    io === null || io === void 0 ? void 0 : io.to(`user:${payload.toUserId}`).emit('message:new', startMsg);
                }
                catch (_a) { }
                io === null || io === void 0 ? void 0 : io.to(`user:${payload.toUserId}`).emit('call:accepted', { ...payload, callId: log.id, startedAt: log.startedAt });
                io === null || io === void 0 ? void 0 : io.to(`user:${payload.fromUserId}`).emit('call:started', { callId: log.id, startedAt: log.startedAt });
            }
            catch (_b) { }
        });
        socket.on('call:decline', async (payload) => {
            try {
                if (!(payload === null || payload === void 0 ? void 0 : payload.fromUserId) || !(payload === null || payload === void 0 ? void 0 : payload.toUserId))
                    return;
                // Optionally persist a declined call log
                await prisma.callLog.create({
                    data: {
                        callerId: payload.toUserId,
                        calleeId: payload.fromUserId,
                        status: 'DECLINED'
                    }
                }).catch(() => { });
                io === null || io === void 0 ? void 0 : io.to(`user:${payload.toUserId}`).emit('call:declined', payload);
            }
            catch (_a) { }
        });
        // End call
        socket.on('call:end', async (payload) => {
            try {
                if (!(payload === null || payload === void 0 ? void 0 : payload.fromUserId) || !(payload === null || payload === void 0 ? void 0 : payload.toUserId))
                    return;
                let endedPayload = payload;
                // Update CallLog if callId present
                if (payload.callId) {
                    const updated = await prisma.callLog.update({
                        where: { id: payload.callId },
                        data: { endedAt: new Date(), status: 'ENDED' }
                    }).catch(() => null);
                    if (updated) {
                        const dur = Math.max(0, Math.floor((updated.endedAt.getTime() - updated.startedAt.getTime()) / 1000));
                        await prisma.callLog.update({ where: { id: updated.id }, data: { durationSec: dur } }).catch(() => { });
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
                            io === null || io === void 0 ? void 0 : io.to(`user:${payload.toUserId}`).emit('message:new', endMsg);
                            io === null || io === void 0 ? void 0 : io.to(`user:${payload.fromUserId}`).emit('message:new', endMsg);
                        }
                        catch (_a) { }
                    }
                }
                io === null || io === void 0 ? void 0 : io.to(`user:${payload.toUserId}`).emit('call:ended', endedPayload);
                io === null || io === void 0 ? void 0 : io.to(`user:${payload.fromUserId}`).emit('call:ended', endedPayload);
            }
            catch (_b) { }
        });
        socket.on('disconnect', () => {
            const userId = socket.data.userId;
            if (userId) {
                const c = presence.get(userId) || 0;
                if (c <= 1) {
                    presence.delete(userId);
                    io === null || io === void 0 ? void 0 : io.emit('presence:update', { userId, online: false });
                }
                else {
                    presence.set(userId, c - 1);
                }
            }
        });
    });
    return io;
}
function getIO() {
    if (!io)
        throw new Error('Socket.io has not been initialized');
    return io;
}
