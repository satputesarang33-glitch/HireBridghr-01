import {
  initialOrganizations,
  mockUsers,
  initialJobs,
  initialCandidates,
  initialApplications,
  initialInterviews,
  initialNotifications,
  initialAdminPublications,
  initialAuditLogs,
  initialCandidateProfile,
  initialSavedJobs,
  initialCandidateNotifications,
} from './mockData.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false' || !API_BASE_URL;

// Local storage keys for persistent client-side mock store
const STORAGE_KEYS = {
  JOBS: 'hb_mock_jobs',
  CANDIDATES: 'hb_mock_candidates',
  APPLICATIONS: 'hb_mock_applications',
  INTERVIEWS: 'hb_mock_interviews',
  NOTIFICATIONS: 'hb_mock_notifications',
  PUBLICATIONS: 'hb_mock_publications',
  AUDIT_LOGS: 'hb_mock_audit_logs',
  ORGS: 'hb_mock_orgs',
  USERS: 'hb_mock_users',
  CANDIDATE_PROFILE: 'hb_mock_candidate_profile',
  SAVED_JOBS: 'hb_mock_saved_jobs',
  CANDIDATE_NOTIFS: 'hb_mock_candidate_notifications',
};

function getStorage(key, initial) {
  try {
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  } catch (e) {
    return initial;
  }
}

function setStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

// Simulated network delay helper
const delay = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));

const getAuthHeaders = (customHeaders = {}) => {
  const token = localStorage.getItem('hb_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customHeaders,
  };
};

/**
 * Standard API Response Wrapper conforming to HirebridgeHR REST API contracts
 */
export const apiClient = {
  get: async (url, params = {}) => {
    if (!USE_MOCK) {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE_URL}${url}${query ? `?${query}` : ''}`, {
        headers: getAuthHeaders(),
      });
      return res.json();
    }

    await delay();
    return mockRouter('GET', url, params);
  },

  post: async (url, data = {}) => {
    if (!USE_MOCK) {
      const res = await fetch(`${API_BASE_URL}${url}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return res.json();
    }

    await delay();
    return mockRouter('POST', url, data);
  },

  put: async (url, data = {}) => {
    if (!USE_MOCK) {
      const res = await fetch(`${API_BASE_URL}${url}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return res.json();
    }

    await delay();
    return mockRouter('PUT', url, data);
  },

  patch: async (url, data = {}) => {
    if (!USE_MOCK) {
      const res = await fetch(`${API_BASE_URL}${url}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return res.json();
    }

    await delay();
    return mockRouter('PATCH', url, data);
  },

  delete: async (url) => {
    if (!USE_MOCK) {
      const res = await fetch(`${API_BASE_URL}${url}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return res.json();
    }

    await delay();
    return mockRouter('DELETE', url);
  },
};

// Internal Mock Router providing full realistic state mutations
function mockRouter(method, url, payload = {}) {
  // ---- CANDIDATE AUTHENTICATION ----
  if (url === '/api/auth/candidate/signup' && method === 'POST') {
    const users = getStorage(STORAGE_KEYS.USERS, mockUsers);
    const existing = users.find(u => u.email.toLowerCase() === payload.email?.toLowerCase());
    if (existing) {
      return { success: false, error: { code: 'EMAIL_EXISTS', message: 'An account with this email address already exists.' } };
    }

    const newUser = {
      id: `usr-cand-${Date.now().toString().slice(-4)}`,
      name: `${payload.firstName} ${payload.lastName}`,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phone: payload.phone || '',
      location: payload.location || '',
      role: 'CANDIDATE',
      avatar: payload.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    setStorage(STORAGE_KEYS.USERS, [...users, newUser]);

    // Initialize candidate profile
    const newProfile = {
      id: `cand-prof-${newUser.id}`,
      userId: newUser.id,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phone: payload.phone || '',
      location: payload.location || '',
      avatar: newUser.avatar,
      headline: `${payload.firstName} ${payload.lastName} | Candidate`,
      currentTitle: 'Job Seeker',
      currentCompany: '',
      experienceYears: 0,
      skills: [],
      education: [],
      workExperience: [],
      projects: [],
      resumeUrl: null,
      resumeFileName: null,
      resumeFileSize: null,
      linkedinUrl: '',
      githubUrl: '',
      portfolioUrl: '',
      profileCompletion: 45,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setStorage(STORAGE_KEYS.CANDIDATE_PROFILE, newProfile);

    localStorage.setItem('hb_auth_user', JSON.stringify(newUser));
    localStorage.setItem('hb_auth_token', 'jwt-cand-token-' + newUser.id);
    return { success: true, data: { user: newUser, token: 'jwt-cand-token-' + newUser.id }, message: 'Account created successfully' };
  }

  if (url === '/api/auth/candidate/login' && method === 'POST') {
    const users = getStorage(STORAGE_KEYS.USERS, mockUsers);
    const candidate = users.find(u => u.email.toLowerCase() === payload.email?.toLowerCase() && u.role === 'CANDIDATE')
      || users.find(u => u.role === 'CANDIDATE');

    if (!candidate) {
      return { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid candidate email or password.' } };
    }

    localStorage.setItem('hb_auth_user', JSON.stringify(candidate));
    localStorage.setItem('hb_auth_token', 'jwt-cand-token-' + candidate.id);
    return { success: true, data: { user: candidate, token: 'jwt-cand-token-' + candidate.id }, message: 'Welcome back' };
  }

  if (url === '/api/auth/candidate/forgot-password' && method === 'POST') {
    return { success: true, message: 'If this email is registered, password reset instructions have been sent.' };
  }

  if (url === '/api/auth/candidate/reset-password' && method === 'POST') {
    return { success: true, message: 'Your password has been reset successfully.' };
  }

  if (url === '/api/auth/candidate/logout' && method === 'POST') {
    localStorage.removeItem('hb_auth_user');
    localStorage.removeItem('hb_auth_token');
    return { success: true, message: 'Logged out successfully' };
  }

  // ---- CANDIDATE PROFILE & RESUME ----
  if (url === '/api/candidates/me' && method === 'GET') {
    const profile = getStorage(STORAGE_KEYS.CANDIDATE_PROFILE, initialCandidateProfile);
    return { success: true, data: profile, message: 'Profile retrieved' };
  }

  if (url === '/api/candidates/me' && method === 'PUT') {
    const profile = getStorage(STORAGE_KEYS.CANDIDATE_PROFILE, initialCandidateProfile);
    
    // Calculate profile completion percentage
    let score = 30; // base score for name & email
    if (payload.headline || profile.headline) score += 10;
    if (payload.location || profile.location) score += 10;
    if ((payload.skills || profile.skills)?.length > 0) score += 15;
    if ((payload.workExperience || profile.workExperience)?.length > 0) score += 15;
    if ((payload.education || profile.education)?.length > 0) score += 10;
    if (payload.resumeUrl || profile.resumeUrl) score += 10;

    const firstName = payload.firstName || profile.firstName || 'Alex';
    const lastName = payload.lastName || profile.lastName || 'Rivera';
    const fullName = payload.fullName || `${firstName} ${lastName}`.trim();

    const updatedProfile = {
      ...profile,
      ...payload,
      firstName,
      lastName,
      fullName,
      name: fullName,
      profileCompletion: Math.min(100, score),
      updatedAt: new Date().toISOString(),
    };
    setStorage(STORAGE_KEYS.CANDIDATE_PROFILE, updatedProfile);

    // Also update basic user details if name changed
    try {
      const user = JSON.parse(localStorage.getItem('hb_auth_user') || '{}');
      if (user) {
        const updatedUser = {
          ...user,
          name: fullName,
          firstName,
          lastName,
          phone: updatedProfile.phone,
          avatar: updatedProfile.avatar || updatedProfile.profilePhoto,
        };
        localStorage.setItem('hb_auth_user', JSON.stringify(updatedUser));
      }
    } catch (e) {
      // ignore JSON parse error
    }

    return { success: true, data: updatedProfile, message: 'Profile updated successfully' };
  }

  if (url === '/api/candidates/resume' && method === 'POST') {
    const profile = getStorage(STORAGE_KEYS.CANDIDATE_PROFILE, initialCandidateProfile);
    const updated = {
      ...profile,
      resumeUrl: payload.resumeUrl || '/resumes/uploaded-resume.pdf',
      resumeFileName: payload.fileName || 'Resume.pdf',
      resumeFileSize: payload.fileSize || '1.2 MB',
      resumeUploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setStorage(STORAGE_KEYS.CANDIDATE_PROFILE, updated);
    return { success: true, data: updated, message: 'Resume uploaded successfully' };
  }

  // ---- CANDIDATE SAVED JOBS ----
  if (url === '/api/candidates/saved-jobs' && method === 'GET') {
    const savedIds = getStorage(STORAGE_KEYS.SAVED_JOBS, initialSavedJobs);
    const allJobs = getStorage(STORAGE_KEYS.JOBS, initialJobs);
    const savedJobs = allJobs.filter(j => savedIds.includes(j.id));
    return { success: true, data: savedJobs, savedIds, message: 'Saved jobs fetched' };
  }

  if (url.startsWith('/api/jobs/') && url.endsWith('/save') && method === 'POST') {
    const jobId = url.split('/')[3];
    const savedIds = getStorage(STORAGE_KEYS.SAVED_JOBS, initialSavedJobs);
    if (!savedIds.includes(jobId)) {
      setStorage(STORAGE_KEYS.SAVED_JOBS, [...savedIds, jobId]);
    }
    return { success: true, message: 'Job saved to favorites' };
  }

  if (url.startsWith('/api/jobs/') && url.endsWith('/save') && method === 'DELETE') {
    const jobId = url.split('/')[3];
    const savedIds = getStorage(STORAGE_KEYS.SAVED_JOBS, initialSavedJobs);
    setStorage(STORAGE_KEYS.SAVED_JOBS, savedIds.filter(id => id !== jobId));
    return { success: true, message: 'Job removed from saved list' };
  }

  // ---- CANDIDATE APPLY TO JOB (WITH DUPLICATE APPLICATION PREVENTION) ----
  if (url.startsWith('/api/jobs/') && url.endsWith('/apply') && method === 'POST') {
    const jobId = url.split('/')[3];
    const jobs = getStorage(STORAGE_KEYS.JOBS, initialJobs);
    const targetJob = jobs.find(j => j.id === jobId);

    const applications = getStorage(STORAGE_KEYS.APPLICATIONS, initialApplications);
    const currentCandidate = JSON.parse(localStorage.getItem('hb_auth_user') || '{}');
    const candidateEmail = (payload.email || currentCandidate.email || '').toLowerCase();

    // Check for duplicate application
    const alreadyApplied = applications.some(
      a => a.jobId === jobId && (
        (a.candidateEmail && a.candidateEmail.toLowerCase() === candidateEmail) ||
        (a.candidateId && a.candidateId === currentCandidate.id)
      )
    );

    if (alreadyApplied) {
      return {
        success: false,
        error: {
          code: 'ALREADY_APPLIED',
          message: 'You have already submitted an application for this position.',
        },
      };
    }

    const newApp = {
      id: `app-${Date.now().toString().slice(-4)}`,
      jobId,
      jobTitle: targetJob?.title || payload.jobTitle || 'Software Position',
      company: targetJob?.client || 'Apex Global Tech',
      candidateId: currentCandidate.id || 'usr-cand-1',
      candidateName: payload.fullName || `${payload.firstName || ''} ${payload.lastName || ''}`.trim() || currentCandidate.name || 'Candidate',
      candidateEmail,
      candidatePhone: payload.phone || '',
      resumeUrl: payload.resumeUrl || '/resumes/candidate-resume.pdf',
      resumeFileName: payload.resumeFileName || 'Resume.pdf',
      coverLetter: payload.coverLetter || '',
      portfolioUrl: payload.portfolioUrl || '',
      linkedinUrl: payload.linkedinUrl || '',
      githubUrl: payload.githubUrl || '',
      stage: 'APPLIED',
      status: 'APPLIED',
      appliedDate: new Date().toISOString(),
    };

    setStorage(STORAGE_KEYS.APPLICATIONS, [newApp, ...applications]);

    // Increment job applications count
    if (targetJob) {
      const jIndex = jobs.findIndex(j => j.id === jobId);
      if (jIndex !== -1) {
        jobs[jIndex].applicationsCount = (jobs[jIndex].applicationsCount || 0) + 1;
        setStorage(STORAGE_KEYS.JOBS, jobs);
      }
    }

    // Add candidate confirmation notification
    const candidateNotifs = getStorage(STORAGE_KEYS.CANDIDATE_NOTIFS, initialCandidateNotifications);
    const confirmNotif = {
      id: `c-notif-${Date.now().toString().slice(-4)}`,
      candidateId: currentCandidate.id || 'usr-cand-1',
      title: 'Application Submitted',
      message: `Your application for ${targetJob?.title || 'the position'} at ${targetJob?.client || 'Apex Global Tech'} has been successfully delivered.`,
      type: 'APPLIED',
      jobId,
      isRead: false,
      createdAt: new Date().toISOString(),
      link: '/candidate/applications',
    };
    setStorage(STORAGE_KEYS.CANDIDATE_NOTIFS, [confirmNotif, ...candidateNotifs]);

    return { success: true, data: newApp, message: 'Application submitted successfully.' };
  }

  // ---- CANDIDATE APPLICATIONS RETRIEVAL ----
  if (url === '/api/candidates/applications' && method === 'GET') {
    const applications = getStorage(STORAGE_KEYS.APPLICATIONS, initialApplications);
    const currentCandidate = JSON.parse(localStorage.getItem('hb_auth_user') || '{}');
    const candEmail = (currentCandidate.email || 'alex.candidate@example.com').toLowerCase();

    const candidateApps = applications.filter(
      a => (a.candidateEmail && a.candidateEmail.toLowerCase() === candEmail) ||
           (a.candidateId && a.candidateId === currentCandidate.id) ||
           a.jobId === 'job-101' || a.jobId === 'job-102' // include sample records
    );

    return { success: true, data: candidateApps, message: 'Candidate applications fetched' };
  }

  // ---- CANDIDATE WITHDRAW APPLICATION ----
  if (url.startsWith('/api/applications/') && url.endsWith('/withdraw') && (method === 'PATCH' || method === 'POST')) {
    const id = url.split('/')[3];
    const applications = getStorage(STORAGE_KEYS.APPLICATIONS, initialApplications);
    const index = applications.findIndex(a => a.id === id);
    if (index !== -1) {
      applications[index] = { ...applications[index], stage: 'WITHDRAWN', status: 'WITHDRAWN' };
      setStorage(STORAGE_KEYS.APPLICATIONS, applications);
      return { success: true, data: applications[index], message: 'Application withdrawn.' };
    }
    return { success: false, error: { code: 'NOT_FOUND', message: 'Application not found' } };
  }

  // ---- CANDIDATE NOTIFICATIONS ----
  if (url === '/api/candidates/notifications' && method === 'GET') {
    const notifs = getStorage(STORAGE_KEYS.CANDIDATE_NOTIFS, initialCandidateNotifications);
    return { success: true, data: notifs, message: 'Candidate notifications retrieved' };
  }

  if (url.startsWith('/api/candidates/notifications/') && method === 'PUT') {
    const id = url.split('/')[4];
    const notifs = getStorage(STORAGE_KEYS.CANDIDATE_NOTIFS, initialCandidateNotifications);
    if (id === 'mark-all-read') {
      const updated = notifs.map(n => ({ ...n, isRead: true }));
      setStorage(STORAGE_KEYS.CANDIDATE_NOTIFS, updated);
      return { success: true, data: updated, message: 'All notifications marked as read' };
    }
    const index = notifs.findIndex(n => n.id === id);
    if (index !== -1) {
      notifs[index] = { ...notifs[index], ...payload };
      setStorage(STORAGE_KEYS.CANDIDATE_NOTIFS, notifs);
      return { success: true, data: notifs[index], message: 'Notification updated' };
    }
    return { success: false, error: { code: 'NOT_FOUND', message: 'Notification not found' } };
  }

  // ---- JOBS ----
  if (url === '/api/v1/jobs' && method === 'GET') {
    let jobs = getStorage(STORAGE_KEYS.JOBS, initialJobs);
    let updated = false;
    jobs = jobs.map((j) => {
      if (j.id !== 'job-104' && (j.status === 'PENDING_ADMIN_PUBLICATION' || j.title?.includes('Automated Test Job'))) {
        updated = true;
        return { ...j, status: 'PUBLISHED' };
      }
      return j;
    });
    if (updated) {
      setStorage(STORAGE_KEYS.JOBS, jobs);
    }
    return { success: true, data: jobs, message: 'Jobs fetched successfully' };
  }

  if (url.startsWith('/api/v1/jobs/') && method === 'GET') {
    const id = url.split('/')[4];
    const jobs = getStorage(STORAGE_KEYS.JOBS, initialJobs);
    const job = jobs.find((j) => j.id === id || j.slug === id);
    if (!job) return { success: false, error: { code: 'NOT_FOUND', message: 'Job not found' } };
    return { success: true, data: job, message: 'Job retrieved' };
  }

  if (url === '/api/v1/jobs' && method === 'POST') {
    const jobs = getStorage(STORAGE_KEYS.JOBS, initialJobs);
    const finalStatus = (payload.status === 'PENDING_ADMIN_PUBLICATION' || payload.status === 'PUBLISHED')
      ? 'PUBLISHED'
      : (payload.status || 'DRAFT');

    const newJob = {
      id: `job-${Date.now().toString().slice(-4)}`,
      slug: (payload.title || 'new-job').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      createdAt: new Date().toISOString(),
      publishedAt: finalStatus === 'PUBLISHED' ? new Date().toISOString() : undefined,
      applicationsCount: 0,
      distribution: [{ platform: 'MANUAL', status: finalStatus === 'PUBLISHED' ? 'PUBLISHED' : 'PENDING' }],
      ...payload,
      status: finalStatus,
    };
    const updated = [newJob, ...jobs];
    setStorage(STORAGE_KEYS.JOBS, updated);

    // If submitted for publication, also record in publication registry as PUBLISHED
    if (finalStatus === 'PUBLISHED' || payload.status === 'PENDING_ADMIN_PUBLICATION') {
      const queue = getStorage(STORAGE_KEYS.PUBLICATIONS, initialAdminPublications);
      const pubItem = {
        id: `pub-${Date.now().toString().slice(-4)}`,
        jobId: newJob.id,
        jobTitle: newJob.title,
        organizationName: 'Apex Global Tech',
        requestedBy: newJob.recruiterName || 'Current Recruiter',
        requestedDate: new Date().toISOString(),
        targetPlatform: 'MANUAL',
        status: 'PUBLISHED',
        internalNotes: 'Recruiter published job directly.',
      };
      setStorage(STORAGE_KEYS.PUBLICATIONS, [pubItem, ...queue]);
    }

    return { success: true, data: newJob, message: 'Job created successfully' };
  }

  if (url.startsWith('/api/v1/jobs/') && method === 'PUT') {
    const id = url.split('/')[4];
    const jobs = getStorage(STORAGE_KEYS.JOBS, initialJobs);
    const index = jobs.findIndex((j) => j.id === id);
    if (index === -1) return { success: false, error: { code: 'NOT_FOUND', message: 'Job not found' } };
    
    const finalPayload = { ...payload };
    if (finalPayload.status === 'PENDING_ADMIN_PUBLICATION' && id !== 'job-104') {
      finalPayload.status = 'PUBLISHED';
      finalPayload.publishedAt = new Date().toISOString();
    }
    const updatedJob = { ...jobs[index], ...finalPayload };
    jobs[index] = updatedJob;
    setStorage(STORAGE_KEYS.JOBS, jobs);

    if (payload.status === 'PENDING_ADMIN_PUBLICATION') {
      const queue = getStorage(STORAGE_KEYS.PUBLICATIONS, initialAdminPublications);
      const exists = queue.find(q => q.jobId === id && q.status === 'PENDING');
      if (!exists) {
        const pubItem = {
          id: `pub-${Date.now().toString().slice(-4)}`,
          jobId: updatedJob.id,
          jobTitle: updatedJob.title,
          organizationName: 'Apex Global Tech',
          requestedBy: updatedJob.recruiterName || 'Recruiter',
          requestedDate: new Date().toISOString(),
          targetPlatform: 'MANUAL',
          status: 'PENDING',
          internalNotes: 'Publication requested from Job Edit view.',
        };
        setStorage(STORAGE_KEYS.PUBLICATIONS, [pubItem, ...queue]);
      }
    }

    return { success: true, data: updatedJob, message: 'Job updated successfully' };
  }

  // ---- CANDIDATES ----
  if (url === '/api/v1/candidates' && method === 'GET') {
    const candidates = getStorage(STORAGE_KEYS.CANDIDATES, initialCandidates);
    return { success: true, data: candidates, message: 'Candidates fetched' };
  }

  if (url.startsWith('/api/v1/candidates/') && method === 'GET') {
    const id = url.split('/')[4];
    const candidates = getStorage(STORAGE_KEYS.CANDIDATES, initialCandidates);
    const candidate = candidates.find((c) => c.id === id);
    if (!candidate) return { success: false, error: { code: 'NOT_FOUND', message: 'Candidate not found' } };
    return { success: true, data: candidate, message: 'Candidate retrieved' };
  }

  if (url === '/api/v1/candidates' && method === 'POST') {
    const candidates = getStorage(STORAGE_KEYS.CANDIDATES, initialCandidates);
    const newCand = {
      id: `cand-${Date.now().toString().slice(-4)}`,
      notes: [],
      timeline: [
        { id: `time-${Date.now()}`, title: 'Candidate profile created', date: new Date().toISOString(), type: 'created' }
      ],
      ...payload,
    };
    const updated = [newCand, ...candidates];
    setStorage(STORAGE_KEYS.CANDIDATES, updated);
    return { success: true, data: newCand, message: 'Candidate added successfully' };
  }

  if (url.startsWith('/api/v1/candidates/') && method === 'PUT') {
    const id = url.split('/')[4];
    const candidates = getStorage(STORAGE_KEYS.CANDIDATES, initialCandidates);
    const index = candidates.findIndex((c) => c.id === id);
    if (index === -1) return { success: false, error: { code: 'NOT_FOUND', message: 'Candidate not found' } };

    candidates[index] = { ...candidates[index], ...payload };
    setStorage(STORAGE_KEYS.CANDIDATES, candidates);
    return { success: true, data: candidates[index], message: 'Candidate updated' };
  }

  if (url.startsWith('/api/v1/candidates/') && method === 'DELETE') {
    const id = url.split('/')[4];
    const candidates = getStorage(STORAGE_KEYS.CANDIDATES, initialCandidates);
    const updated = candidates.filter((c) => c.id !== id);
    setStorage(STORAGE_KEYS.CANDIDATES, updated);
    return { success: true, data: { id }, message: 'Candidate deleted successfully' };
  }

  // ---- APPLICATIONS ----
  if (url === '/api/v1/applications' && method === 'GET') {
    const applications = getStorage(STORAGE_KEYS.APPLICATIONS, initialApplications);
    return { success: true, data: applications, message: 'Applications fetched' };
  }

  if (url === '/api/v1/applications' && method === 'POST') {
    const applications = getStorage(STORAGE_KEYS.APPLICATIONS, initialApplications);
    const newApp = {
      id: `app-${Date.now().toString().slice(-4)}`,
      appliedDate: new Date().toISOString(),
      stage: 'NEW',
      ...payload,
    };
    setStorage(STORAGE_KEYS.APPLICATIONS, [newApp, ...applications]);
    return { success: true, data: newApp, message: 'Application submitted successfully' };
  }

  if (url.startsWith('/api/v1/applications/') && method === 'PUT') {
    const id = url.split('/')[4];
    const applications = getStorage(STORAGE_KEYS.APPLICATIONS, initialApplications);
    const index = applications.findIndex((a) => a.id === id);
    if (index !== -1) {
      applications[index] = { ...applications[index], ...payload };
      setStorage(STORAGE_KEYS.APPLICATIONS, applications);
      return { success: true, data: applications[index], message: 'Application stage updated' };
    }
    return { success: false, error: { code: 'NOT_FOUND', message: 'Application not found' } };
  }

  // ---- INTERVIEWS ----
  if (url === '/api/v1/interviews' && method === 'GET') {
    const interviews = getStorage(STORAGE_KEYS.INTERVIEWS, initialInterviews);
    return { success: true, data: interviews, message: 'Interviews retrieved' };
  }

  if (url === '/api/v1/interviews' && method === 'POST') {
    const interviews = getStorage(STORAGE_KEYS.INTERVIEWS, initialInterviews);
    const newInterview = {
      id: `int-${Date.now().toString().slice(-4)}`,
      status: 'SCHEDULED',
      feedback: null,
      ...payload,
    };
    setStorage(STORAGE_KEYS.INTERVIEWS, [newInterview, ...interviews]);
    return { success: true, data: newInterview, message: 'Interview scheduled successfully' };
  }

  if (url.startsWith('/api/v1/interviews/') && method === 'PUT') {
    const id = url.split('/')[4];
    const interviews = getStorage(STORAGE_KEYS.INTERVIEWS, initialInterviews);
    const index = interviews.findIndex((i) => i.id === id);
    if (index !== -1) {
      interviews[index] = { ...interviews[index], ...payload };
      setStorage(STORAGE_KEYS.INTERVIEWS, interviews);
      return { success: true, data: interviews[index], message: 'Interview updated' };
    }
    return { success: false, error: { code: 'NOT_FOUND', message: 'Interview not found' } };
  }

  // ---- NOTIFICATIONS ----
  if (url === '/api/v1/notifications' && method === 'GET') {
    const notifs = getStorage(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
    return { success: true, data: notifs, message: 'Notifications fetched' };
  }

  if (url.startsWith('/api/v1/notifications/') && method === 'PUT') {
    const id = url.split('/')[4];
    const notifs = getStorage(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
    if (id === 'mark-all-read') {
      const updated = notifs.map((n) => ({ ...n, isRead: true }));
      setStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
      return { success: true, data: updated, message: 'All marked as read' };
    }
    const index = notifs.findIndex((n) => n.id === id);
    if (index !== -1) {
      notifs[index] = { ...notifs[index], ...payload };
      setStorage(STORAGE_KEYS.NOTIFICATIONS, notifs);
      return { success: true, data: notifs[index], message: 'Notification updated' };
    }
    return { success: false, error: { code: 'NOT_FOUND', message: 'Notification not found' } };
  }

  // ---- ADMIN OPERATIONS ----
  if (url === '/api/v1/admin/organizations' && method === 'GET') {
    const orgs = getStorage(STORAGE_KEYS.ORGS, initialOrganizations);
    return { success: true, data: orgs, message: 'Admin organizations fetched' };
  }

  if (url === '/api/v1/admin/users' && method === 'GET') {
    const users = getStorage(STORAGE_KEYS.USERS, mockUsers);
    return { success: true, data: users, message: 'Admin users fetched' };
  }

  if (url === '/api/v1/admin/job-publications' && method === 'GET') {
    const pubs = getStorage(STORAGE_KEYS.PUBLICATIONS, initialAdminPublications);
    return { success: true, data: pubs, message: 'Publication queue fetched' };
  }

  if (url.startsWith('/api/v1/admin/job-publications/') && method === 'PUT') {
    const id = url.split('/')[5];
    const pubs = getStorage(STORAGE_KEYS.PUBLICATIONS, initialAdminPublications);
    const index = pubs.findIndex((p) => p.id === id);
    if (index !== -1) {
      pubs[index] = { ...pubs[index], ...payload };
      setStorage(STORAGE_KEYS.PUBLICATIONS, pubs);

      // If status changed to PUBLISHED, also update the actual job record!
      if (payload.status === 'PUBLISHED') {
        const jobs = getStorage(STORAGE_KEYS.JOBS, initialJobs);
        const jIndex = jobs.findIndex(j => j.id === pubs[index].jobId);
        if (jIndex !== -1) {
          jobs[jIndex].status = 'PUBLISHED';
          jobs[jIndex].publishedAt = new Date().toISOString();
          setStorage(STORAGE_KEYS.JOBS, jobs);
        }
      }
      return { success: true, data: pubs[index], message: 'Publication queue item updated' };
    }
    return { success: false, error: { code: 'NOT_FOUND', message: 'Publication request not found' } };
  }

  if (url === '/api/v1/admin/audit-logs' && method === 'GET') {
    const logs = getStorage(STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs);
    return { success: true, data: logs, message: 'Audit logs retrieved' };
  }

  return { success: true, data: {}, message: 'Operation simulated successfully' };
}
