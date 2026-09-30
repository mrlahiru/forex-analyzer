import { Router } from 'express';
import {
  getNotificationStatus,
  sendTestNotification,
  updateNotificationSettings,
} from '../controllers/notificationController.js';

const router = Router();

// GET /api/notifications/status
router.get('/status', getNotificationStatus);

// POST /api/notifications/test
router.post('/test', sendTestNotification);

// POST /api/notifications/settings
router.post('/settings', updateNotificationSettings);

export default router;
