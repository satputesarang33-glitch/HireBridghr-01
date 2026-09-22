import { apiClient } from './api/apiClient.js';

/**
 * Candidate Portal Service
 * Handles candidate-specific API interactions including applications,
 * saved jobs, notifications, and profile management.
 */
export const candidatePortalService = {
  // Profile
  getProfile: async () => {
    const res = await apiClient.get('/api/candidates/me');
    return res.data;
  },

  updateProfile: async (profileData) => {
    const res = await apiClient.put('/api/candidates/me', profileData);
    return res.data;
  },

  uploadResume: async (resumeData) => {
    const res = await apiClient.post('/api/candidates/resume', resumeData);
    return res.data;
  },

  // Saved Jobs
  getSavedJobs: async () => {
    const res = await apiClient.get('/api/candidates/saved-jobs');
    return res.data;
  },

  saveJob: async (jobId) => {
    const res = await apiClient.post(`/api/jobs/${jobId}/save`);
    return res.data;
  },

  removeSavedJob: async (jobId) => {
    const res = await apiClient.delete(`/api/jobs/${jobId}/save`);
    return res.data;
  },

  // Applications
  getApplications: async () => {
    const res = await apiClient.get('/api/candidates/applications');
    return res.data;
  },

  getApplicationById: async (id) => {
    const res = await apiClient.get(`/api/applications/${id}`);
    return res.data;
  },

  applyToJob: async (jobId, applicationData) => {
    const res = await apiClient.post(`/api/jobs/${jobId}/apply`, applicationData);
    return res.data;
  },

  withdrawApplication: async (id) => {
    const res = await apiClient.patch(`/api/applications/${id}/withdraw`);
    return res.data;
  },

  // Notifications
  getNotifications: async () => {
    const res = await apiClient.get('/api/candidates/notifications');
    return res.data;
  },

  markNotificationAsRead: async (id) => {
    const res = await apiClient.put(`/api/candidates/notifications/${id}/read`);
    return res.data;
  },

  markAllNotificationsAsRead: async () => {
    const res = await apiClient.put('/api/candidates/notifications/read-all');
    return res.data;
  },

  // Jobs
  getJobs: async (params = {}) => {
    const res = await apiClient.get('/api/v1/jobs', { params });
    return res.data;
  },

  getJobById: async (id) => {
    const res = await apiClient.get(`/api/v1/jobs/${id}`);
    return res.data;
  },
};
