import { apiClient } from './api/apiClient.js';

export const jobService = {
  getJobs: async (filters = {}) => {
    const res = await apiClient.get('/api/v1/jobs', filters);
    let jobs = res.data || [];
    
    // Client-side filtering when in mock mode
    if (filters.search) {
      const q = filters.search.toLowerCase();
      jobs = jobs.filter(j => 
        j.title.toLowerCase().includes(q) || 
        j.department?.toLowerCase().includes(q) ||
        j.location?.toLowerCase().includes(q)
      );
    }
    if (filters.status && filters.status !== 'ALL') {
      jobs = jobs.filter(j => j.status === filters.status);
    }
    if (filters.department && filters.department !== 'ALL') {
      jobs = jobs.filter(j => j.department === filters.department);
    }
    if (filters.workplaceType && filters.workplaceType !== 'ALL') {
      jobs = jobs.filter(j => j.workplaceType === filters.workplaceType);
    }

    return { ...res, data: jobs };
  },

  getJobById: async (id) => {
    return apiClient.get(`/api/v1/jobs/${id}`);
  },

  createJob: async (jobData) => {
    return apiClient.post('/api/v1/jobs', jobData);
  },

  updateJob: async (id, jobData) => {
    return apiClient.put(`/api/v1/jobs/${id}`, jobData);
  },

  requestPublication: async (id) => {
    return apiClient.put(`/api/v1/jobs/${id}`, {
      status: 'PENDING_ADMIN_PUBLICATION',
      publicationRequestedAt: new Date().toISOString(),
    });
  },

  closeJob: async (id) => {
    return apiClient.put(`/api/v1/jobs/${id}`, {
      status: 'CLOSED',
      closedAt: new Date().toISOString(),
    });
  },
};
