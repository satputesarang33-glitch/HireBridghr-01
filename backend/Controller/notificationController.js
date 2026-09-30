import { NotificationModel } from "../Model/Notification.js";

/**
 * Controller for Recruiter / System Notifications
 */
export const notificationController = {
  // Get all recruiter notifications
  getAllNotifications: async (req, res, next) => {
    try {
      const notifs = await NotificationModel.getAllRecruiter();
      res.status(200).json({
        success: true,
        data: notifs,
        message: "Notifications retrieved successfully.",
      });
    } catch (error) {
      next(error);
    }
  },

  // Update notification / mark read
  updateNotification: async (req, res, next) => {
    try {
      const { id } = req.params;

      if (id === "mark-all-read") {
        await NotificationModel.markAllRecruiterRead();
        return res.status(200).json({
          success: true,
          message: "All notifications marked as read.",
        });
      }

      const updated = await NotificationModel.markRecruiterRead(id);
      if (!updated) {
        return res.status(404).json({
          success: false,
          error: { code: "NOT_FOUND", message: "Notification not found." },
        });
      }

      res.status(200).json({
        success: true,
        data: updated,
        message: "Notification updated.",
      });
    } catch (error) {
      next(error);
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (req, res, next) => {
    try {
      await NotificationModel.markAllRecruiterRead();
      res.status(200).json({
        success: true,
        message: "All notifications marked as read.",
      });
    } catch (error) {
      next(error);
    }
  },

  // Create notification
  createNotification: async (req, res, next) => {
    try {
      const notif = await NotificationModel.createRecruiterNotification(req.body);
      res.status(201).json({
        success: true,
        data: notif,
        message: "Notification created successfully.",
      });
    } catch (error) {
      next(error);
    }
  },
};
