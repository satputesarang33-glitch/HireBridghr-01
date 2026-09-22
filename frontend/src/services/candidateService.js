import { apiClient } from './api/apiClient.js';

export const candidateService = {
  getCandidates: async (filters = {}) => {
    const res = await apiClient.get('/api/v1/candidates', filters);
    let candidates = res.data || [];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      candidates = candidates.filter(c => 
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.currentTitle?.toLowerCase().includes(q) ||
        c.skills?.some(s => s.toLowerCase().includes(q))
      );
    }

    if (filters.status && filters.status !== 'ALL') {
      candidates = candidates.filter(c => c.status === filters.status);
    }

    if (filters.recruiterId && filters.recruiterId !== 'ALL') {
      candidates = candidates.filter(c => c.assignedRecruiterId === filters.recruiterId);
    }

    if (filters.tag && filters.tag !== 'ALL') {
      candidates = candidates.filter(c => c.tags?.includes(filters.tag));
    }

    return { ...res, data: candidates };
  },

  getCandidateById: async (id) => {
    return apiClient.get(`/api/v1/candidates/${id}`);
  },

  createCandidate: async (candidateData) => {
    return apiClient.post('/api/v1/candidates', candidateData);
  },

  updateCandidate: async (id, candidateData) => {
    return apiClient.put(`/api/v1/candidates/${id}`, candidateData);
  },

  addNote: async (candidateId, note) => {
    const res = await apiClient.get(`/api/v1/candidates/${candidateId}`);
    if (!res.success) return res;

    const candidate = res.data;
    const newNote = {
      id: `note-${Date.now()}`,
      author: note.author || 'Current Recruiter',
      content: note.content,
      createdAt: new Date().toISOString(),
    };
    const notes = [newNote, ...(candidate.notes || [])];

    const timelineItem = {
      id: `time-${Date.now()}`,
      title: `Recruiter Note added: "${note.content.slice(0, 40)}..."`,
      date: new Date().toISOString(),
      type: 'note',
    };
    const timeline = [timelineItem, ...(candidate.timeline || [])];

    return apiClient.put(`/api/v1/candidates/${candidateId}`, { notes, timeline });
  },

  assignRecruiter: async (candidateId, recruiter) => {
    const res = await apiClient.get(`/api/v1/candidates/${candidateId}`);
    if (!res.success) return res;

    const candidate = res.data;
    const timelineItem = {
      id: `time-${Date.now()}`,
      title: `Assigned to recruiter ${recruiter.name}`,
      date: new Date().toISOString(),
      type: 'assignment',
    };
    const timeline = [timelineItem, ...(candidate.timeline || [])];

    return apiClient.put(`/api/v1/candidates/${candidateId}`, {
      assignedRecruiterId: recruiter.id,
      assignedRecruiterName: recruiter.name,
      timeline,
    });
  },

  updateTags: async (candidateId, tags) => {
    return apiClient.put(`/api/v1/candidates/${candidateId}`, { tags });
  },
};
