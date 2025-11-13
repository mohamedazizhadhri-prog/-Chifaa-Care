"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserInfo = exports.cleanupInactiveMessages = exports.markThreadRead = exports.sendMessage = exports.getThread = exports.getConversations = void 0;
const client_1 = require("@prisma/client");
const socket_1 = require("../socket");
const prisma = new client_1.PrismaClient();
// GET /api/v1/messages/conversations/:userId
const getConversations = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        if (!userId)
            return res.status(400).json({ status: 'error', message: 'userId is required' });
        const messages = yield prisma.message.findMany({
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
        // Fetch user display info for participants - ONLY ACTIVE USERS
        const otherIds = Array.from(conversationsMap.keys());
        const users = yield prisma.user.findMany({
            where: {
                id: { in: otherIds },
                isActive: true // Only fetch active users
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
                email: true,
                profileImage: true,
                doctorProfile: {
                    select: {
                        specialization: true
                    }
                }
            }
        });
        const userMap = new Map(users.map(u => [u.id, u]));
        // Filter out conversations with deleted/inactive users
        const conversations = Array.from(conversationsMap.values())
            .filter(c => userMap.has(c.otherUserId)) // Only include if user exists and is active
            .map(c => {
            var _a, _b;
            const other = userMap.get(c.otherUserId);
            const name = `${other.firstName} ${other.lastName}`.trim();
            const role = other.role || 'USER';
            const specialization = (_b = (_a = other.doctorProfile) === null || _a === void 0 ? void 0 : _a.specialization) !== null && _b !== void 0 ? _b : undefined;
            return Object.assign(Object.assign({}, c), { name,
                role, email: other.email, profileImage: other.profileImage, specialization });
        });
        res.status(200).json({ status: 'success', results: conversations.length, data: { conversations } });
    }
    catch (err) {
        next(err);
    }
});
exports.getConversations = getConversations;
// GET /api/v1/messages/thread?userId=&otherUserId=
const getThread = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, otherUserId } = req.query;
        if (!userId || !otherUserId)
            return res.status(400).json({ status: 'error', message: 'userId and otherUserId are required' });
        // Check if the other user exists and is active
        const otherUser = yield prisma.user.findFirst({
            where: {
                id: otherUserId,
                isActive: true
            }
        });
        if (!otherUser) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found or has been deactivated'
            });
        }
        const thread = yield prisma.message.findMany({
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
});
exports.getThread = getThread;
// POST /api/v1/messages/send { senderId, recipientId, content, appointmentId? }
const sendMessage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { senderId, recipientId, content, appointmentId } = req.body;
        if (!senderId || !recipientId || !content)
            return res.status(400).json({ status: 'error', message: 'senderId, recipientId and content are required' });
        // Check if both users exist and are active
        const [sender, recipient] = yield Promise.all([
            prisma.user.findFirst({ where: { id: senderId, isActive: true } }),
            prisma.user.findFirst({ where: { id: recipientId, isActive: true } })
        ]);
        if (!sender || !recipient) {
            return res.status(400).json({
                status: 'error',
                message: 'Sender or recipient not found or has been deactivated'
            });
        }
        const created = yield prisma.message.create({
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
        catch (_c) { }
        res.status(201).json({ status: 'success', data: { message: created } });
    }
    catch (err) {
        next(err);
    }
});
exports.sendMessage = sendMessage;
// PATCH /api/v1/messages/mark-read { userId, otherUserId }
const markThreadRead = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, otherUserId } = req.body;
        if (!userId || !otherUserId)
            return res.status(400).json({ status: 'error', message: 'userId and otherUserId are required' });
        const result = yield prisma.message.updateMany({
            where: { recipientId: userId, senderId: otherUserId, isRead: false },
            data: { isRead: true },
        });
        res.status(200).json({ status: 'success', data: { updated: result.count } });
    }
    catch (err) {
        next(err);
    }
});
exports.markThreadRead = markThreadRead;
// DELETE /api/v1/messages/cleanup-inactive/:userId
// Cleanup messages from/to inactive users
const cleanupInactiveMessages = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        if (!userId)
            return res.status(400).json({ status: 'error', message: 'userId is required' });
        // Find all inactive user IDs
        const inactiveUsers = yield prisma.user.findMany({
            where: { isActive: false },
            select: { id: true }
        });
        const inactiveUserIds = inactiveUsers.map(u => u.id);
        if (inactiveUserIds.length === 0) {
            return res.status(200).json({
                status: 'success',
                data: { deleted: 0, message: 'No inactive users found' }
            });
        }
        // Delete messages where either sender or recipient is inactive
        const result = yield prisma.message.deleteMany({
            where: {
                AND: [
                    {
                        OR: [
                            { senderId: userId },
                            { recipientId: userId }
                        ]
                    },
                    {
                        OR: [
                            { senderId: { in: inactiveUserIds } },
                            { recipientId: { in: inactiveUserIds } }
                        ]
                    }
                ]
            }
        });
        res.status(200).json({
            status: 'success',
            data: {
                deleted: result.count,
                inactiveUserCount: inactiveUserIds.length,
                message: `Cleaned up ${result.count} messages from ${inactiveUserIds.length} inactive users`
            }
        });
    }
    catch (err) {
        next(err);
    }
});
exports.cleanupInactiveMessages = cleanupInactiveMessages;
// GET /api/v1/messages/user-info/:userId
// Get fresh user info for a specific user (to refresh cached data)
const getUserInfo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { userId } = req.params;
        if (!userId)
            return res.status(400).json({ status: 'error', message: 'userId is required' });
        const user = yield prisma.user.findFirst({
            where: {
                id: userId,
                isActive: true
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                profileImage: true,
                isActive: true,
                doctorProfile: {
                    select: {
                        specialization: true
                    }
                }
            }
        });
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found or has been deactivated'
            });
        }
        res.status(200).json({
            status: 'success',
            data: {
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    profileImage: user.profileImage,
                    specialization: (_b = (_a = user.doctorProfile) === null || _a === void 0 ? void 0 : _a.specialization) !== null && _b !== void 0 ? _b : undefined,
                    isActive: user.isActive
                }
            }
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getUserInfo = getUserInfo;
