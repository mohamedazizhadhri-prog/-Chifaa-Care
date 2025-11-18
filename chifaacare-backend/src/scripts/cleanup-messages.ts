/**
 * Message Cleanup Script
 * 
 * This script cleans up messages from inactive/deleted users in the database.
 * It removes orphaned messages where either the sender or recipient no longer exists
 * or has been deactivated (isActive = false).
 * 
 * Usage:
 *   npm run cleanup-messages
 * 
 * Or programmatically:
 *   import { cleanupMessages } from './scripts/cleanup-messages';
 *   await cleanupMessages();
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CleanupResult {
  deletedMessagesCount: number;
  inactiveUserIds: string[];
  affectedConversations: number;
  timestamp: Date;
}

/**
 * Main cleanup function
 * Removes all messages where sender or recipient is inactive
 */
export async function cleanupMessages(): Promise<CleanupResult> {
  console.log('🧹 Starting message cleanup...');
  const startTime = Date.now();

  try {
    // Step 1: Find all inactive users
    const inactiveUsers = await prisma.user.findMany({
      where: { isActive: false },
      select: { 
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true
      }
    });

    console.log(`📊 Found ${inactiveUsers.length} inactive users`);
    
    if (inactiveUsers.length === 0) {
      console.log('✅ No inactive users found. Nothing to clean up.');
      return {
        deletedMessagesCount: 0,
        inactiveUserIds: [],
        affectedConversations: 0,
        timestamp: new Date()
      };
    }

    const inactiveUserIds = inactiveUsers.map(u => u.id);

    // Log inactive users for debugging
    inactiveUsers.forEach(user => {
      console.log(`  - ${user.firstName} ${user.lastName} (${user.email}) [${user.role}]`);
    });

    // Step 2: Count messages that will be deleted (for reporting)
    const messagesToDelete = await prisma.message.count({
      where: {
        OR: [
          { senderId: { in: inactiveUserIds } },
          { recipientId: { in: inactiveUserIds } }
        ]
      }
    });

    console.log(`📨 Found ${messagesToDelete} messages to delete`);

    // Step 3: Count unique conversations affected
    const affectedMessages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: { in: inactiveUserIds } },
          { recipientId: { in: inactiveUserIds } }
        ]
      },
      select: {
        senderId: true,
        recipientId: true
      }
    });

    // Get unique conversation pairs
    const conversationPairs = new Set<string>();
    affectedMessages.forEach(msg => {
      const pair = [msg.senderId, msg.recipientId].sort().join('-');
      conversationPairs.add(pair);
    });

    console.log(`💬 ${conversationPairs.size} unique conversations will be affected`);

    // Step 4: Delete the messages
    if (messagesToDelete > 0) {
      const deleteResult = await prisma.message.deleteMany({
        where: {
          OR: [
            { senderId: { in: inactiveUserIds } },
            { recipientId: { in: inactiveUserIds } }
          ]
        }
      });

      console.log(`✅ Deleted ${deleteResult.count} messages`);

      // Step 5: Verify deletion
      const remainingMessages = await prisma.message.count({
        where: {
          OR: [
            { senderId: { in: inactiveUserIds } },
            { recipientId: { in: inactiveUserIds } }
          ]
        }
      });

      if (remainingMessages > 0) {
        console.warn(`⚠️ Warning: ${remainingMessages} messages still remain. Deletion may have been incomplete.`);
      } else {
        console.log('✅ All target messages successfully deleted');
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`⏱️ Cleanup completed in ${duration}s`);

      return {
        deletedMessagesCount: deleteResult.count,
        inactiveUserIds,
        affectedConversations: conversationPairs.size,
        timestamp: new Date()
      };
    } else {
      console.log('✅ No messages to delete');
      return {
        deletedMessagesCount: 0,
        inactiveUserIds,
        affectedConversations: 0,
        timestamp: new Date()
      };
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Cleanup messages for a specific user
 * Useful when deactivating a user
 */
export async function cleanupUserMessages(userId: string): Promise<number> {
  console.log(`🧹 Cleaning up messages for user: ${userId}`);

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        firstName: true,
        lastName: true,
        email: true,
        isActive: true
      }
    });

    if (!user) {
      console.log('❌ User not found');
      return 0;
    }

    console.log(`👤 User: ${user.firstName} ${user.lastName} (${user.email})`);
    console.log(`📊 Active status: ${user.isActive}`);

    const deleteResult = await prisma.message.deleteMany({
      where: {
        OR: [
          { senderId: userId },
          { recipientId: userId }
        ]
      }
    });

    console.log(`✅ Deleted ${deleteResult.count} messages for user ${userId}`);
    return deleteResult.count;

  } catch (error) {
    console.error('❌ Error cleaning up user messages:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Get statistics about messages from inactive users
 * Useful for reporting without actually deleting
 */
export async function getCleanupStats(): Promise<{
  inactiveUsersCount: number;
  messagesFromInactive: number;
  messagesToInactive: number;
  totalAffectedMessages: number;
  affectedConversations: number;
}> {
  try {
    const inactiveUsers = await prisma.user.findMany({
      where: { isActive: false },
      select: { id: true }
    });

    const inactiveUserIds = inactiveUsers.map(u => u.id);

    if (inactiveUserIds.length === 0) {
      return {
        inactiveUsersCount: 0,
        messagesFromInactive: 0,
        messagesToInactive: 0,
        totalAffectedMessages: 0,
        affectedConversations: 0
      };
    }

    const [messagesFromInactive, messagesToInactive, totalAffected] = await Promise.all([
      prisma.message.count({ where: { senderId: { in: inactiveUserIds } } }),
      prisma.message.count({ where: { recipientId: { in: inactiveUserIds } } }),
      prisma.message.count({
        where: {
          OR: [
            { senderId: { in: inactiveUserIds } },
            { recipientId: { in: inactiveUserIds } }
          ]
        }
      })
    ]);

    const affectedMessages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: { in: inactiveUserIds } },
          { recipientId: { in: inactiveUserIds } }
        ]
      },
      select: { senderId: true, recipientId: true }
    });

    const conversationPairs = new Set<string>();
    affectedMessages.forEach(msg => {
      const pair = [msg.senderId, msg.recipientId].sort().join('-');
      conversationPairs.add(pair);
    });

    return {
      inactiveUsersCount: inactiveUsers.length,
      messagesFromInactive,
      messagesToInactive,
      totalAffectedMessages: totalAffected,
      affectedConversations: conversationPairs.size
    };

  } catch (error) {
    console.error('❌ Error getting cleanup stats:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// CLI execution
if (require.main === module) {
  console.log('🚀 Running message cleanup script...\n');
  
  cleanupMessages()
    .then(result => {
      console.log('\n📋 Cleanup Summary:');
      console.log('═══════════════════════════════════════');
      console.log(`🗑️  Deleted Messages: ${result.deletedMessagesCount}`);
      console.log(`👥 Inactive Users: ${result.inactiveUserIds.length}`);
      console.log(`💬 Affected Conversations: ${result.affectedConversations}`);
      console.log(`⏰ Timestamp: ${result.timestamp.toISOString()}`);
      console.log('═══════════════════════════════════════\n');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Cleanup failed:', error);
      process.exit(1);
    });
}
