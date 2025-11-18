import { Request, Response, NextFunction } from 'express';
import { messageSyncService } from '../services/message-sync.service';
import { getCleanupStats } from '../scripts/cleanup-messages';

/**
 * POST /api/v1/messages/sync/trigger-cleanup
 * Manually trigger message cleanup
 */
export const triggerCleanup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('🔧 Manual cleanup triggered via API');
    
    const result = await messageSyncService.runCleanup();

    if (result.success) {
      res.status(200).json({
        status: 'success',
        message: 'Cleanup completed successfully',
        data: {
          deletedMessages: result.deletedCount,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: result.error || 'Cleanup failed',
        data: null
      });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/messages/sync/status
 * Get scheduler and cleanup status
 */
export const getSyncStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = messageSyncService.getStatus();
    
    res.status(200).json({
      status: 'success',
      data: {
        scheduler: {
          isRunning: status.isRunning,
          isCleanupInProgress: status.isCleanupInProgress,
          lastCleanupTime: status.lastCleanupTime,
          nextCleanupTime: status.nextCleanupTime
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/messages/sync/stats
 * Get detailed cleanup statistics
 */
export const getSyncStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await messageSyncService.getStats();
    
    res.status(200).json({
      status: 'success',
      data: {
        statistics: {
          inactiveUsers: stats.inactiveUsersCount,
          messagesFromInactive: stats.messagesFromInactive,
          messagesToInactive: stats.messagesToInactive,
          totalAffectedMessages: stats.totalAffectedMessages,
          affectedConversations: stats.affectedConversations
        },
        scheduler: stats.schedulerStatus
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/messages/sync/user-updated
 * Notify system that a user's profile has been updated
 * Body: { userId: string }
 */
export const notifyUserUpdated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.body as { userId?: string };
    
    if (!userId) {
      return res.status(400).json({
        status: 'error',
        message: 'userId is required'
      });
    }

    await messageSyncService.syncUserInfoUpdate(userId);

    res.status(200).json({
      status: 'success',
      message: 'User info sync triggered',
      data: { userId }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/messages/sync/user-deactivated
 * Handle user deactivation/deletion
 * Body: { userId: string }
 */
export const handleUserDeactivation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.body as { userId?: string };
    
    if (!userId) {
      return res.status(400).json({
        status: 'error',
        message: 'userId is required'
      });
    }

    const deletedCount = await messageSyncService.handleUserDeactivation(userId);

    res.status(200).json({
      status: 'success',
      message: 'User messages cleaned up',
      data: {
        userId,
        deletedMessages: deletedCount
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/messages/sync/start-scheduler
 * Start the automated cleanup scheduler
 */
export const startScheduler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    messageSyncService.startScheduler();

    res.status(200).json({
      status: 'success',
      message: 'Cleanup scheduler started',
      data: messageSyncService.getStatus()
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/messages/sync/stop-scheduler
 * Stop the automated cleanup scheduler
 */
export const stopScheduler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    messageSyncService.stopScheduler();

    res.status(200).json({
      status: 'success',
      message: 'Cleanup scheduler stopped',
      data: messageSyncService.getStatus()
    });
  } catch (err) {
    next(err);
  }
};
