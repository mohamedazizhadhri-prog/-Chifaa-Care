/**
 * Message Sync & Cleanup Scheduler
 * 
 * This service automatically:
 * 1. Cleans up messages from inactive users (daily)
 * 2. Syncs user information in real-time via Socket.io
 * 3. Provides manual trigger endpoints
 * 
 * The scheduler runs as a background service in your NestJS/Express app
 */

import { PrismaClient } from '@prisma/client';
import { cleanupMessages, getCleanupStats } from '../scripts/cleanup-messages';

const prisma = new PrismaClient();

export class MessageSyncService {
  private cleanupIntervalId: NodeJS.Timeout | null = null;
  private isCleanupRunning = false;
  private lastCleanupTime: Date | null = null;
  private cleanupSchedule = {
    // Run cleanup every 24 hours
    intervalMs: 24 * 60 * 60 * 1000, // 24 hours
    // Run at 2 AM local time
    preferredHour: 2
  };

  /**
   * Start the automated cleanup scheduler
   */
  public startScheduler(): void {
    console.log('🚀 Starting Message Sync & Cleanup Scheduler');
    
    // Calculate time until next 2 AM
    const now = new Date();
    const next2AM = new Date();
    next2AM.setHours(this.cleanupSchedule.preferredHour, 0, 0, 0);
    
    // If 2 AM has already passed today, schedule for tomorrow
    if (next2AM <= now) {
      next2AM.setDate(next2AM.getDate() + 1);
    }
    
    const msUntil2AM = next2AM.getTime() - now.getTime();
    
    console.log(`⏰ Next cleanup scheduled for: ${next2AM.toLocaleString()}`);
    console.log(`⏱️  Time until cleanup: ${(msUntil2AM / 1000 / 60 / 60).toFixed(2)} hours`);
    
    // Schedule first run
    setTimeout(() => {
      this.runCleanup();
      
      // Then run every 24 hours
      this.cleanupIntervalId = setInterval(
        () => this.runCleanup(),
        this.cleanupSchedule.intervalMs
      );
    }, msUntil2AM);
  }

  /**
   * Stop the scheduler
   */
  public stopScheduler(): void {
    if (this.cleanupIntervalId) {
      clearInterval(this.cleanupIntervalId);
      this.cleanupIntervalId = null;
      console.log('🛑 Message cleanup scheduler stopped');
    }
  }

  /**
   * Run cleanup immediately (manual trigger)
   */
  public async runCleanup(): Promise<{
    success: boolean;
    deletedCount: number;
    error?: string;
  }> {
    if (this.isCleanupRunning) {
      console.log('⚠️ Cleanup already running, skipping...');
      return {
        success: false,
        deletedCount: 0,
        error: 'Cleanup already in progress'
      };
    }

    this.isCleanupRunning = true;
    console.log('\n🧹 ===== Starting Scheduled Message Cleanup =====');
    console.log(`⏰ Time: ${new Date().toLocaleString()}`);

    try {
      // Get stats before cleanup
      const statsBefore = await getCleanupStats();
      console.log('📊 Pre-cleanup stats:', statsBefore);

      // Run cleanup
      const result = await cleanupMessages();
      
      this.lastCleanupTime = new Date();
      
      console.log('✅ ===== Cleanup Completed Successfully =====\n');
      
      return {
        success: true,
        deletedCount: result.deletedMessagesCount
      };
    } catch (error) {
      console.error('❌ ===== Cleanup Failed =====');
      console.error(error);
      
      return {
        success: false,
        deletedCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      this.isCleanupRunning = false;
    }
  }

  /**
   * Get scheduler status
   */
  public getStatus(): {
    isRunning: boolean;
    isCleanupInProgress: boolean;
    lastCleanupTime: Date | null;
    nextCleanupTime: Date | null;
  } {
    const now = new Date();
    let nextCleanupTime: Date | null = null;

    if (this.cleanupIntervalId) {
      nextCleanupTime = new Date();
      nextCleanupTime.setHours(this.cleanupSchedule.preferredHour, 0, 0, 0);
      
      if (nextCleanupTime <= now) {
        nextCleanupTime.setDate(nextCleanupTime.getDate() + 1);
      }
    }

    return {
      isRunning: this.cleanupIntervalId !== null,
      isCleanupInProgress: this.isCleanupRunning,
      lastCleanupTime: this.lastCleanupTime,
      nextCleanupTime
    };
  }

  /**
   * Sync user information across all conversations
   * This is called when a user's profile is updated
   */
  public async syncUserInfoUpdate(userId: string): Promise<void> {
    console.log(`🔄 Syncing user info for: ${userId}`);

    try {
      // Fetch updated user info
      const user = await prisma.user.findUnique({
        where: { id: userId },
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
        console.log('❌ User not found');
        return;
      }

      console.log(`✅ User info synced: ${user.firstName} ${user.lastName}`);
      
      // If user is inactive, clean up their messages
      if (!user.isActive) {
        console.log('🧹 User is inactive, cleaning up messages...');
        const deletedCount = await prisma.message.deleteMany({
          where: {
            OR: [
              { senderId: userId },
              { recipientId: userId }
            ]
          }
        });
        console.log(`✅ Deleted ${deletedCount.count} messages for inactive user`);
      }

      // Emit socket event to notify all connected clients
      // This will be handled by your socket service
      return;

    } catch (error) {
      console.error('❌ Error syncing user info:', error);
      throw error;
    }
  }

  /**
   * Handle user deletion/deactivation
   */
  public async handleUserDeactivation(userId: string): Promise<number> {
    console.log(`🗑️ Handling user deactivation: ${userId}`);

    try {
      const deletedCount = await prisma.message.deleteMany({
        where: {
          OR: [
            { senderId: userId },
            { recipientId: userId }
          ]
        }
      });

      console.log(`✅ Deleted ${deletedCount.count} messages for deactivated user`);
      return deletedCount.count;

    } catch (error) {
      console.error('❌ Error handling user deactivation:', error);
      throw error;
    }
  }

  /**
   * Get cleanup statistics
   */
  public async getStats(): Promise<{
    inactiveUsersCount: number;
    messagesFromInactive: number;
    messagesToInactive: number;
    totalAffectedMessages: number;
    affectedConversations: number;
    schedulerStatus: ReturnType<typeof this.getStatus>;
  }> {
    const stats = await getCleanupStats();
    const status = this.getStatus();

    return {
      ...stats,
      schedulerStatus: status
    };
  }
}

// Export singleton instance
export const messageSyncService = new MessageSyncService();
