import { apiClient } from './api/apiClient.js';

export const applicationService = {
  getApplications: async (filters = {}) => {
    const res = await apiClient.get('/api/v1/applications', filters);
    let applications = res.data || [];

    if (filters.jobId && filters.jobId !== 'ALL') {
      applications = applications.filter(a => a.jobId === filters.jobId);
    }
    if (filters.stage && filters.stage !== 'ALL') {
      applications = applications.filter(a => a.stage === filters.stage);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      applications = applications.filter(a =>
        a.candidateName?.toLowerCase().includes(q) ||
        a.jobTitle?.toLowerCase().includes(q)
      );
    }

    return { ...res, data: applications };
  },

  getApplicationById: async (id) => {
    const res = await apiClient.get('/api/v1/applications');
    const app = (res.data || []).find(a => a.id === id);
    if (!app) return { success: false, error: { message: 'Application not found' } };
    return { success: true, data: app };
  },

  createApplication: async (applicationData) => {
    return apiClient.post('/api/v1/applications', applicationData);
  },

  updateStage: async (id, stage) => {
    return apiClient.put(`/api/v1/applications/${id}`, { stage });
  },
};
