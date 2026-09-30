import { telegramService } from '../services/notifications/index.js';

/**
 * Telegram Notification Controller (Phase 9)
 */

export const getNotificationStatus = (req, res, next) => {
  try {
    const status = telegramService.getStatus();
    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
};

export const sendTestNotification = async (req, res, next) => {
  try {
    const result = await telegramService.sendTestAlert();
    res.status(200).json({
      success: true,
      message: 'Test notification processed',
      data: result,
      status: telegramService.getStatus(),
    });
  } catch (error) {
    next(error);
  }
};

export const updateNotificationSettings = (req, res, next) => {
  try {
    const updated = telegramService.updatePreferences(req.body);
    res.status(200).json({
      success: true,
      message: 'Notification preferences updated',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
