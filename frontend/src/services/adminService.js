import { apiClient } from './api/apiClient.js';

export const adminService = {
  getAdminMetrics: async () => {
    const [orgsRes, usersRes, jobsRes, pubsRes, appsRes] = await Promise.all([
      apiClient.get('/api/v1/admin/organizations'),
      apiClient.get('/api/v1/admin/users'),
      apiClient.get('/api/v1/jobs'),
      apiClient.get('/api/v1/admin/job-publications'),
      apiClient.get('/api/v1/applications'),
    ]);

    const orgs = orgsRes.data || [];
    const users = usersRes.data || [];
    const jobs = jobsRes.data || [];
    const pubs = pubsRes.data || [];
    const apps = appsRes.data || [];

    return {
      success: true,
      data: {
        totalOrganizations: orgs.length,
        activeOrganizations: orgs.filter(o => o.status === 'ACTIVE').length,
        totalUsers: users.length,
        totalJobs: jobs.length,
        pendingPublications: pubs.filter(p => p.status === 'PENDING').length,
        totalApplications: apps.length,
        totalHires: apps.filter(a => a.stage === 'HIRED').length,
      },
    };
  },

  getOrganizations: async () => {
    return apiClient.get('/api/v1/admin/organizations');
  },

  getUsers: async () => {
    return apiClient.get('/api/v1/admin/users');
  },

  getPublicationQueue: async () => {
    return apiClient.get('/api/v1/admin/job-publications');
  },

  updatePublicationStatus: async (pubId, { status, internalNotes }) => {
    return apiClient.put(`/api/v1/admin/job-publications/${pubId}`, {
      status,
      internalNotes,
      updatedAt: new Date().toISOString(),
    });
  },

  getAuditLogs: async () => {
    return apiClient.get('/api/v1/admin/audit-logs');
  },
};
