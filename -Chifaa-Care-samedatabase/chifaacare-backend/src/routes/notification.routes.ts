import express from 'express';
import { protect } from '../controllers/auth.controller';
import {
  subscribe,
  unsubscribe,
  sendNotification,
  sendBulkNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../controllers/notification.controller';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Subscription management
router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);

// Send notifications
router.post('/send', sendNotification);
router.post('/send-bulk', sendBulkNotification);

// Notification history
router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);

export default router;
