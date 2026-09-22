import { apiClient } from './api/apiClient.js';

export const interviewService = {
  getInterviews: async (filters = {}) => {
    const res = await apiClient.get('/api/v1/interviews', filters);
    let interviews = res.data || [];

    if (filters.status && filters.status !== 'ALL') {
      interviews = interviews.filter(i => i.status === filters.status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      interviews = interviews.filter(i =>
        i.candidateName?.toLowerCase().includes(q) ||
        i.jobTitle?.toLowerCase().includes(q) ||
        i.interviewerName?.toLowerCase().includes(q)
      );
    }

    return { ...res, data: interviews };
  },

  getInterviewById: async (id) => {
    const res = await apiClient.get('/api/v1/interviews');
    const interview = (res.data || []).find(i => i.id === id);
    if (!interview) return { success: false, error: { message: 'Interview not found' } };
    return { success: true, data: interview };
  },

  scheduleInterview: async (interviewData) => {
    return apiClient.post('/api/v1/interviews', interviewData);
  },

  submitFeedback: async (id, feedbackData) => {
    return apiClient.put(`/api/v1/interviews/${id}`, {
      status: 'COMPLETED',
      feedback: {
        ...feedbackData,
        submittedAt: new Date().toISOString(),
      },
    });
  },

  cancelInterview: async (id) => {
    return apiClient.put(`/api/v1/interviews/${id}`, {
      status: 'CANCELLED',
    });
  },
};
