import { apiClient } from './api/apiClient.js';

export const notificationService = {
  getNotifications: async () => {
    return apiClient.get('/api/v1/notifications');
  },

  markAsRead: async (id) => {
    return apiClient.put(`/api/v1/notifications/${id}`, { isRead: true });
  },

  markAllAsRead: async () => {
    return apiClient.put('/api/v1/notifications/mark-all-read');
  },
};
