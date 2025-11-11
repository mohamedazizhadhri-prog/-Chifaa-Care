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

    // Fetch user display info for participants - ONLY ACTIVE USERS
    const otherIds = Array.from(conversationsMap.keys());
    const users = await prisma.user.findMany({ 
      where: { 
        id: { in: otherIds },
        isActive: true  // Only fetch active users
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
    const userMap = new Map(users.map(u => [u.id, u] as const));

    // Filter out conversations with deleted/inactive users
    const conversations = Array.from(conversationsMap.values())
      .filter(c => userMap.has(c.otherUserId)) // Only include if user exists and is active
      .map(c => {
        const other = userMap.get(c.otherUserId)!;
        const name = `${other.firstName} ${other.lastName}`.trim();
        const role = other.role || 'USER';
        const specialization = other.doctorProfile?.specialization;
        return { 
          ...c, 
          name, 
          role,
          email: other.email,
          profileImage: other.profileImage,
          specialization
        };
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

    // Check if the other user exists and is active
    const otherUser = await prisma.user.findFirst({
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

    // Check if both users exist and are active
    const [sender, recipient] = await Promise.all([
      prisma.user.findFirst({ where: { id: senderId, isActive: true } }),
      prisma.user.findFirst({ where: { id: recipientId, isActive: true } })
    ]);

    if (!sender || !recipient) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Sender or recipient not found or has been deactivated' 
      });
    }

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

// DELETE /api/v1/messages/cleanup-inactive/:userId
// Cleanup messages from/to inactive users
export const cleanupInactiveMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params as { userId: string };
    if (!userId) return res.status(400).json({ status: 'error', message: 'userId is required' });

    // Find all inactive user IDs
    const inactiveUsers = await prisma.user.findMany({
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
    const result = await prisma.message.deleteMany({
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
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/messages/user-info/:userId
// Get fresh user info for a specific user (to refresh cached data)
export const getUserInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params as { userId: string };
    if (!userId) return res.status(400).json({ status: 'error', message: 'userId is required' });

    const user = await prisma.user.findFirst({
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
          specialization: user.doctorProfile?.specialization,
          isActive: user.isActive
        }
      } 
    });
  } catch (err) {
    next(err);
  }
};
