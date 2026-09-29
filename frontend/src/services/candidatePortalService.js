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
    let serverJobs = [];
    try {
      const res = await apiClient.get('/api/candidates/saved-jobs');
      serverJobs = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
    } catch (e) {
      serverJobs = [];
    }

    // Merge with localStorage backup
    try {
      const localSaved = JSON.parse(localStorage.getItem('hb_candidate_saved_jobs') || '[]');
      if (Array.isArray(localSaved) && localSaved.length > 0) {
        const merged = [...serverJobs];
        for (const item of localSaved) {
          const id = typeof item === 'string' ? item : item?.id;
          if (id && !merged.some((j) => (typeof j === 'string' ? j === id : j?.id === id))) {
            merged.push(item);
          }
        }
        return merged;
      }
    } catch (e) {}

    return serverJobs;
  },

  saveJob: async (jobId) => {
    try {
      const localSaved = JSON.parse(localStorage.getItem('hb_candidate_saved_jobs') || '[]');
      const id = typeof jobId === 'string' ? jobId : jobId?.id;
      if (id && !localSaved.some((item) => (typeof item === 'string' ? item === id : item?.id === id))) {
        localSaved.push(jobId);
        localStorage.setItem('hb_candidate_saved_jobs', JSON.stringify(localSaved));
      }
    } catch (e) {}

    const targetId = typeof jobId === 'string' ? jobId : jobId?.id;
    const res = await apiClient.post(`/api/jobs/${targetId}/save`);
    return res.data;
  },

  removeSavedJob: async (jobId) => {
    try {
      const localSaved = JSON.parse(localStorage.getItem('hb_candidate_saved_jobs') || '[]');
      const id = typeof jobId === 'string' ? jobId : jobId?.id;
      const updated = localSaved.filter((item) => (typeof item === 'string' ? item !== id : item?.id !== id));
      localStorage.setItem('hb_candidate_saved_jobs', JSON.stringify(updated));
    } catch (e) {}

    const targetId = typeof jobId === 'string' ? jobId : jobId?.id;
    const res = await apiClient.delete(`/api/jobs/${targetId}/save`);
    return res.data;
  },

  // Applications
  getApplications: async () => {
    let serverApps = [];
    try {
      const res = await apiClient.get('/api/candidates/applications');
      serverApps = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
    } catch (e) {
      serverApps = [];
    }

    try {
      const localApps = JSON.parse(localStorage.getItem('hb_candidate_applications') || '[]');
      if (Array.isArray(localApps) && localApps.length > 0) {
        const merged = [...serverApps];
        for (const item of localApps) {
          if (item && !merged.some((a) => a.id === item.id || (a.jobId && item.jobId && a.jobId === item.jobId))) {
            merged.unshift(item);
          }
        }
        return merged;
      }
    } catch (e) {}

    return serverApps;
  },

  getApplicationById: async (id) => {
    const res = await apiClient.get(`/api/applications/${id}`);
    return res.data;
  },

  applyToJob: async (jobId, applicationData) => {
    const res = await apiClient.post(`/api/jobs/${jobId}/apply`, applicationData);
    const createdApp = res.data;

    try {
      const localApps = JSON.parse(localStorage.getItem('hb_candidate_applications') || '[]');
      const itemToSave = createdApp?.id ? createdApp : {
        id: `app-local-${Date.now()}`,
        jobId,
        jobTitle: applicationData?.jobTitle || 'Application',
        status: 'APPLIED',
        stage: 'APPLIED',
        appliedDate: new Date().toISOString(),
      };
      if (!localApps.some((a) => a.id === itemToSave.id || (a.jobId && a.jobId === jobId))) {
        localApps.unshift(itemToSave);
        localStorage.setItem('hb_candidate_applications', JSON.stringify(localApps));
      }
    } catch (e) {}

    return createdApp;
  },

  withdrawApplication: async (id) => {
    try {
      const localApps = JSON.parse(localStorage.getItem('hb_candidate_applications') || '[]');
      const updated = localApps.map((a) => (a.id === id ? { ...a, status: 'WITHDRAWN', stage: 'WITHDRAWN' } : a));
      localStorage.setItem('hb_candidate_applications', JSON.stringify(updated));
    } catch (e) {}

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
    const res = await apiClient.get('/api/v1/jobs', params);
    return res.data;
  },

  getJobById: async (id) => {
    const res = await apiClient.get(`/api/v1/jobs/${id}`);
    return res.data;
  },
};
