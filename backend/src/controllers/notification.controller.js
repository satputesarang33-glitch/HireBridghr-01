import { notificationService } from '../services/notification.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const notificationController = {
  /**
   * Get user notifications
   */
  getNotifications: async (req, res, next) => {
    try {
      const { notifications, total, unreadCount, page, limit } = await notificationService.getUserNotifications(
        req.user.id,
        req.query
      );

      return res.status(200).json({
        success: true,
        message: 'Notifications fetched',
        data: notifications,
        unreadCount,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Mark single notification as read
   */
  markAsRead: async (req, res, next) => {
    try {
      const updated = await notificationService.markAsRead(req.params.id, req.user.id);
      return ApiResponse.success(res, 200, 'Notification marked as read', updated);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Mark all as read
   */
  markAllAsRead: async (req, res, next) => {
    try {
      const result = await notificationService.markAllAsRead(req.user.id);
      return ApiResponse.success(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete notification
   */
  deleteNotification: async (req, res, next) => {
    try {
      const result = await notificationService.deleteNotification(req.params.id, req.user.id);
      return ApiResponse.success(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Candidate Portal: Update or Mark read
   */
  updateCandidateNotification: async (req, res, next) => {
    try {
      const { id } = req.params;
      if (id === 'mark-all-read') {
        const result = await notificationService.markAllAsRead(req.user.id);
        return ApiResponse.success(res, 200, result.message);
      }

      const updated = await notificationService.markAsRead(id, req.user.id);
      return ApiResponse.success(res, 200, 'Notification updated', updated);
    } catch (error) {
      next(error);
    }
  },
};
