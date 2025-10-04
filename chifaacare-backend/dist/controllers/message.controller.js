"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markThreadRead = exports.sendMessage = exports.getThread = exports.getConversations = void 0;
const client_1 = require("@prisma/client");
const socket_1 = require("../socket");
const prisma = new client_1.PrismaClient();
// GET /api/v1/messages/conversations/:userId
const getConversations = async (req, res, next) => {
    try {
        const { userId } = req.params;
        if (!userId)
            return res.status(400).json({ status: 'error', message: 'userId is required' });
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { recipientId: userId },
                ],
            },
            orderBy: { createdAt: 'desc' },
        });
        // Build conversations grouped by the other participant
        const conversationsMap = new Map();
        for (const m of messages) {
            const otherId = m.senderId === userId ? m.recipientId : m.senderId;
            if (!conversationsMap.has(otherId)) {
                conversationsMap.set(otherId, {
                    otherUserId: otherId,
                    lastMessage: m.content,
                    lastMessageTime: m.createdAt.toISOString(),
                    unreadCount: m.recipientId === userId && !m.isRead ? 1 : 0,
                });
            }
            else {
                const c = conversationsMap.get(otherId);
                if (m.recipientId === userId && !m.isRead)
                    c.unreadCount += 1;
            }
        }
        // Fetch user display info for participants
        const otherIds = Array.from(conversationsMap.keys());
        const users = await prisma.user.findMany({ where: { id: { in: otherIds } } });
        const userMap = new Map(users.map(u => [u.id, u]));
        const conversations = Array.from(conversationsMap.values()).map(c => {
            const other = userMap.get(c.otherUserId);
            const name = other ? `${other.firstName} ${other.lastName}`.trim() : 'Unknown';
            const role = (other === null || other === void 0 ? void 0 : other.role) || 'USER';
            return { ...c, name, role };
        });
        res.status(200).json({ status: 'success', results: conversations.length, data: { conversations } });
    }
    catch (err) {
        next(err);
    }
};
exports.getConversations = getConversations;
// GET /api/v1/messages/thread?userId=&otherUserId=
const getThread = async (req, res, next) => {
    try {
        const { userId, otherUserId } = req.query;
        if (!userId || !otherUserId)
            return res.status(400).json({ status: 'error', message: 'userId and otherUserId are required' });
        const thread = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId, recipientId: otherUserId },
                    { senderId: otherUserId, recipientId: userId },
                ],
            },
            orderBy: { createdAt: 'asc' },
        });
        res.status(200).json({ status: 'success', results: thread.length, data: { messages: thread } });
    }
    catch (err) {
        next(err);
    }
};
exports.getThread = getThread;
// POST /api/v1/messages/send { senderId, recipientId, content, appointmentId? }
const sendMessage = async (req, res, next) => {
    try {
        const { senderId, recipientId, content, appointmentId } = req.body;
        if (!senderId || !recipientId || !content)
            return res.status(400).json({ status: 'error', message: 'senderId, recipientId and content are required' });
        const created = await prisma.message.create({
            data: {
                senderId,
                recipientId,
                content,
                appointmentId: appointmentId || null,
            },
        });
        // Emit to recipient and sender rooms
        try {
            const io = (0, socket_1.getIO)();
            io.to(`user:${recipientId}`).emit('message:new', created);
            io.to(`user:${senderId}`).emit('message:sent', created);
        }
        catch (_a) { }
        res.status(201).json({ status: 'success', data: { message: created } });
    }
    catch (err) {
        next(err);
    }
};
exports.sendMessage = sendMessage;
// PATCH /api/v1/messages/mark-read { userId, otherUserId }
const markThreadRead = async (req, res, next) => {
    try {
        const { userId, otherUserId } = req.body;
        if (!userId || !otherUserId)
            return res.status(400).json({ status: 'error', message: 'userId and otherUserId are required' });
        const result = await prisma.message.updateMany({
            where: { recipientId: userId, senderId: otherUserId, isRead: false },
            data: { isRead: true },
        });
        res.status(200).json({ status: 'success', data: { updated: result.count } });
    }
    catch (err) {
        next(err);
    }
};
exports.markThreadRead = markThreadRead;
