import express from 'express';
import { getConversations, getThread, sendMessage, markThreadRead, cleanupInactiveMessages, getUserInfo } from '../controllers/message.controller';
import {
  triggerCleanup,
  getSyncStatus,
  getSyncStats,
  notifyUserUpdated,
  handleUserDeactivation,
  startScheduler,
  stopScheduler
} from '../controllers/message-sync.controller';

const router = express.Router();

// Message operations
router.get('/conversations/:userId', getConversations);
router.get('/thread', getThread);
router.post('/send', sendMessage);
router.patch('/mark-read', markThreadRead);
router.delete('/cleanup-inactive/:userId', cleanupInactiveMessages);
router.get('/user-info/:userId', getUserInfo);

// Sync and cleanup operations
router.post('/sync/trigger-cleanup', triggerCleanup);
router.get('/sync/status', getSyncStatus);
router.get('/sync/stats', getSyncStats);
router.post('/sync/user-updated', notifyUserUpdated);
router.post('/sync/user-deactivated', handleUserDeactivation);
router.post('/sync/start-scheduler', startScheduler);
router.post('/sync/stop-scheduler', stopScheduler);

export default router;
