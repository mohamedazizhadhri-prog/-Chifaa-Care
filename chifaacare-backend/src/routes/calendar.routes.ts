import express from 'express';
import { protect, restrictTo } from '../controllers/auth.controller';
import {
  initiateAuth,
  handleOAuthCallback,
  getStatus,
  disconnect,
  listEvents,
  syncAppointment,
} from '../controllers/calendar.controller';

const router = express.Router();

// OAuth callback (no auth required, handles Google redirect)
router.get('/oauth/callback', handleOAuthCallback);

// All other routes require authentication
router.use(protect);
router.use(restrictTo('DOCTOR', 'ADMIN'));

// Initiate OAuth flow
router.get('/auth', initiateAuth);

// Get connection status
router.get('/status', getStatus);

// Disconnect calendar
router.post('/disconnect', disconnect);

// List upcoming events
router.get('/events', listEvents);

// Manually sync appointment to calendar
router.post('/sync/:appointmentId', syncAppointment);

export default router;
