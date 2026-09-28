import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';
import { devStore } from '../lib/devStore.js';
import { ApiError } from '../utils/apiError.js';

export const notificationService = {
  /**
   * Get notifications for authenticated user
   */
  getUserNotifications: async (userId, { page = 1, limit = 20 } = {}) => {
    if (!env.DATABASE_URL) {
      const all = devStore.notifications || [];
      const userNotifs = all.filter((n) => !n.userId || n.userId === userId || userId === 'usr-1');
      return {
        notifications: userNotifs,
        total: userNotifs.length,
        unreadCount: userNotifs.filter((n) => !n.isRead).length,
        page: Number(page),
        limit: Number(limit),
      };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return { notifications, total, unreadCount, page: Number(page), limit: Number(limit) };
  },

  /**
   * Mark single notification as read
   */
  markAsRead: async (id, userId) => {
    const notif = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notif) {
      throw ApiError.notFound('Notification not found');
    }

    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  },

  /**
   * Mark all notifications as read for user
   */
  markAllAsRead: async (userId) => {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { message: 'All notifications marked as read' };
  },

  /**
   * Delete a notification
   */
  deleteNotification: async (id, userId) => {
    const notif = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notif) {
      throw ApiError.notFound('Notification not found');
    }

    await prisma.notification.delete({
      where: { id },
    });

    return { id, message: 'Notification deleted successfully' };
  },

  /**
   * Create a notification
   */
  createNotification: async ({ organizationId, userId, title, message, type, link, jobId }) => {
    return prisma.notification.create({
      data: {
        organizationId: organizationId || null,
        userId,
        title,
        message,
        type: type || 'SYSTEM',
        link,
        jobId,
        isRead: false,
      },
    });
  },
};
