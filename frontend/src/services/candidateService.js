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
    const ratingVal = note.rating !== undefined && note.rating !== null ? Number(note.rating) : (candidate.rating || 5);
    const newNote = {
      id: `note-${Date.now()}`,
      author: note.author || 'Current Recruiter',
      content: note.content,
      rating: ratingVal,
      createdAt: new Date().toISOString(),
    };
    const notes = [newNote, ...(candidate.notes || [])];

    const timelineItem = {
      id: `time-${Date.now()}`,
      title: note.rating
        ? `Recruiter Note & Rating (${ratingVal}/5) added: "${note.content.slice(0, 35)}..."`
        : `Recruiter Note added: "${note.content.slice(0, 40)}..."`,
      date: new Date().toISOString(),
      type: 'note',
    };
    const timeline = [timelineItem, ...(candidate.timeline || [])];

    return apiClient.put(`/api/v1/candidates/${candidateId}`, {
      notes,
      timeline,
      rating: ratingVal,
    });
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

  updateRating: async (candidateId, rating) => {
    const res = await apiClient.get(`/api/v1/candidates/${candidateId}`);
    if (!res.success) return res;

    const candidate = res.data;
    const ratingVal = Number(rating);
    const timelineItem = {
      id: `time-${Date.now()}`,
      title: `Candidate evaluation rating updated to ${ratingVal}/5`,
      date: new Date().toISOString(),
      type: 'rating',
    };
    const timeline = [timelineItem, ...(candidate.timeline || [])];

    return apiClient.put(`/api/v1/candidates/${candidateId}`, {
      rating: ratingVal,
      timeline,
    });
  },

  /**
   * Unified "Do-It-All" candidate assessment method.
   * Atomically updates evaluation notes, rating, stage, recruiter assignment, and tags.
   */
  saveCandidateEvaluation: async (candidateId, { rating, note, stage, status, recruiter, tags } = {}) => {
    const res = await apiClient.get(`/api/v1/candidates/${candidateId}`);
    if (!res.success) return res;

    const candidate = res.data;
    const updates = {};
    const timelineEvents = [];

    // 1. Process Rating
    const ratingVal = rating !== undefined && rating !== null ? Number(rating) : candidate.rating;
    if (ratingVal !== undefined) {
      updates.rating = ratingVal;
    }

    // 2. Process Assessment Note
    if (note && note.trim()) {
      const newNote = {
        id: `note-${Date.now()}`,
        author: typeof recruiter === 'string' ? recruiter : (recruiter?.name || 'Recruiter Lead'),
        content: note.trim(),
        rating: ratingVal || 5,
        createdAt: new Date().toISOString(),
      };
      updates.notes = [newNote, ...(candidate.notes || [])];
      timelineEvents.push({
        id: `time-${Date.now()}-note`,
        title: ratingVal
          ? `Evaluation Note & Rating (${ratingVal}/5) logged: "${note.trim().slice(0, 35)}..."`
          : `Recruiter Note added: "${note.trim().slice(0, 40)}..."`,
        date: new Date().toISOString(),
        type: 'note',
      });
    }

    // 3. Process Stage / Status Progression
    const newStage = stage || status;
    if (newStage && newStage !== candidate.status) {
      updates.status = newStage;
      timelineEvents.push({
        id: `time-${Date.now()}-stage`,
        title: `Hiring stage advanced to ${newStage}`,
        date: new Date().toISOString(),
        type: 'stage_change',
      });
    }

    // 4. Process Recruiter Ownership
    if (recruiter) {
      const recId = typeof recruiter === 'object' ? recruiter.id : candidate.assignedRecruiterId;
      const recName = typeof recruiter === 'object' ? recruiter.name : recruiter;
      updates.assignedRecruiterId = recId;
      updates.assignedRecruiterName = recName;
      timelineEvents.push({
        id: `time-${Date.now()}-recruiter`,
        title: `Assigned ownership to ${recName}`,
        date: new Date().toISOString(),
        type: 'assignment',
      });
    }

    // 5. Process Tags
    if (tags && Array.isArray(tags)) {
      updates.tags = tags;
    }

    // Combine Timeline Events
    if (timelineEvents.length > 0) {
      updates.timeline = [...timelineEvents, ...(candidate.timeline || [])];
    }

    return apiClient.put(`/api/v1/candidates/${candidateId}`, updates);
  },

  updateStatus: async (candidateId, status) => {
    const res = await apiClient.get(`/api/v1/candidates/${candidateId}`);
    if (!res.success) return res;

    const candidate = res.data;
    const timelineItem = {
      id: `time-${Date.now()}`,
      title: `Status changed to ${status}`,
      date: new Date().toISOString(),
      type: 'status_change',
    };
    const timeline = [timelineItem, ...(candidate.timeline || [])];

    return apiClient.put(`/api/v1/candidates/${candidateId}`, {
      status,
      timeline,
    });
  },

  deleteCandidate: async (id) => {
    return apiClient.delete(`/api/v1/candidates/${id}`);
  },

  bulkUpdateCandidates: async (candidateIds = [], updates = {}) => {
    const results = [];
    for (const id of candidateIds) {
      const res = await apiClient.put(`/api/v1/candidates/${id}`, updates);
      results.push(res);
    }
    return { success: true, data: results, message: `Updated ${results.length} candidates` };
  },
};

