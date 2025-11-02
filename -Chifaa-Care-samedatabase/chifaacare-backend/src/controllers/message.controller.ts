import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { getIO } from '../socket';

const prisma = new PrismaClient();

// GET /api/v1/messages/conversations/:userId
export const getConversations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params as { userId: string };
    if (!userId) return res.status(400).json({ status: 'error', message: 'userId is required' });

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
    const conversationsMap = new Map<string, { otherUserId: string; lastMessage: string; lastMessageTime: string; unreadCount: number }>();

    for (const m of messages) {
      const otherId = m.senderId === userId ? m.recipientId : m.senderId;
      if (!conversationsMap.has(otherId)) {
        conversationsMap.set(otherId, {
          otherUserId: otherId,
          lastMessage: m.content,
          lastMessageTime: m.createdAt.toISOString(),
          unreadCount: m.recipientId === userId && !m.isRead ? 1 : 0,
        });
      } else {
        const c = conversationsMap.get(otherId)!;
        if (m.recipientId === userId && !m.isRead) c.unreadCount += 1;
      }
    }

    // Fetch user display info for participants
    const otherIds = Array.from(conversationsMap.keys());
    const users = await prisma.user.findMany({ where: { id: { in: otherIds } } });
    const userMap = new Map(users.map(u => [u.id, u] as const));

    const conversations = Array.from(conversationsMap.values()).map(c => {
      const other = userMap.get(c.otherUserId);
      const name = other ? `${other.firstName} ${other.lastName}`.trim() : 'Unknown';
      const role = other?.role || 'USER';
      return { ...c, name, role };
    });

    res.status(200).json({ status: 'success', results: conversations.length, data: { conversations } });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/messages/thread?userId=&otherUserId=
export const getThread = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, otherUserId } = req.query as { userId?: string; otherUserId?: string };
    if (!userId || !otherUserId) return res.status(400).json({ status: 'error', message: 'userId and otherUserId are required' });

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
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/messages/send { senderId, recipientId, content, appointmentId? }
export const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { senderId, recipientId, content, appointmentId } = req.body as { senderId?: string; recipientId?: string; content?: string; appointmentId?: string };
    if (!senderId || !recipientId || !content) return res.status(400).json({ status: 'error', message: 'senderId, recipientId and content are required' });

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
      const io = getIO();
      io.to(`user:${recipientId}`).emit('message:new', created);
      io.to(`user:${senderId}`).emit('message:sent', created);
    } catch {}

    res.status(201).json({ status: 'success', data: { message: created } });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/messages/mark-read { userId, otherUserId }
export const markThreadRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, otherUserId } = req.body as { userId?: string; otherUserId?: string };
    if (!userId || !otherUserId) return res.status(400).json({ status: 'error', message: 'userId and otherUserId are required' });

    const result = await prisma.message.updateMany({
      where: { recipientId: userId, senderId: otherUserId, isRead: false },
      data: { isRead: true },
    });

    res.status(200).json({ status: 'success', data: { updated: result.count } });
  } catch (err) {
    next(err);
  }
};
