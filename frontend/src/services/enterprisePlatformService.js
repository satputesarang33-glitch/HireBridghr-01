import { apiClient } from './api/apiClient.js';

export const sourcingService = {
  async importCandidate(payload) {
    const res = await apiClient.post('/api/v1/sourcing/import', payload);
    return res;
  },

  async enrichCandidate(payload) {
    const res = await apiClient.post('/api/v1/sourcing/enrich', payload);
    return res;
  },

  async getTalentPools() {
    const res = await apiClient.get('/api/v1/sourcing/talent-pools');
    return res;
  },

  async createTalentPool(payload) {
    const res = await apiClient.post('/api/v1/sourcing/talent-pools', payload);
    return res;
  },

  async getExtensionConfig() {
    const res = await apiClient.get('/api/v1/sourcing/extension-config');
    return res;
  },
};

export const agentService = {
  async screenCandidate(payload) {
    const res = await apiClient.post('/api/v1/agent/screen', payload);
    return res;
  },

  async getAvailability() {
    const res = await apiClient.get('/api/v1/agent/availability');
    return res;
  },

  async autoScheduleInterview(payload) {
    const res = await apiClient.post('/api/v1/agent/auto-schedule', payload);
    return res;
  },

  async getDripSequence(candidateId) {
    const res = await apiClient.get(`/api/v1/agent/sequences/${candidateId}`);
    return res;
  },

  async triggerNudge(payload) {
    const res = await apiClient.post('/api/v1/agent/trigger-nudge', payload);
    return res;
  },
};

export const predictiveAnalyticsService = {
  async getPredictiveMetrics() {
    const res = await apiClient.get('/api/v1/analytics/predictive');
    return res;
  },

  async getDiversityEEOC() {
    const res = await apiClient.get('/api/v1/analytics/diversity-eeoc');
    return res;
  },

  async getSourcesROI() {
    const res = await apiClient.get('/api/v1/analytics/sources-roi');
    return res;
  },

  async getRecruiterLeaderboard() {
    const res = await apiClient.get('/api/v1/analytics/recruiter-leaderboard');
    return res;
  },
};

export const ssoService = {
  async getConfig() {
    const res = await apiClient.get('/api/v1/sso/config');
    return res;
  },

  async updateConfig(payload) {
    const res = await apiClient.post('/api/v1/sso/config', payload);
    return res;
  },

  async testConnection(payload) {
    const res = await apiClient.post('/api/v1/sso/test-connection', payload);
    return res;
  },

  async getRbacMatrix() {
    const res = await apiClient.get('/api/v1/sso/rbac-matrix');
    return res;
  },

  async updateRbacMatrix(payload) {
    const res = await apiClient.post('/api/v1/sso/rbac-matrix', payload);
    return res;
  },
};

export const onboardingService = {
  async initiateBackgroundCheck(payload) {
    const res = await apiClient.post('/api/v1/onboarding/background-check', payload);
    return res;
  },

  async getBackgroundCheck(candidateId) {
    const res = await apiClient.get(`/api/v1/onboarding/background-check/${candidateId}`);
    return res;
  },

  async getOnboardingChecklist(candidateId) {
    const res = await apiClient.get(`/api/v1/onboarding/checklist/${candidateId}`);
    return res;
  },

  async updateChecklistItem(candidateId, itemId, payload) {
    const res = await apiClient.post(`/api/v1/onboarding/checklist/${candidateId}/item/${itemId}`, payload);
    return res;
  },

  async provisionHris(payload) {
    const res = await apiClient.post('/api/v1/onboarding/provision-hris', payload);
    return res;
  },
};
