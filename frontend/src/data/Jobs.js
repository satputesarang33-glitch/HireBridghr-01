// Mock Data for Jobs
const STORAGE_KEY = 'ats_jobs_data';

export const initialJobs = [
  {
    id: 'job-142850',
    jobId: '142850',
    title: 'Product Manager',
    company: 'Apex Global Tech',
    client: 'Apex Global Tech',
    department: 'Product',
    location: 'San Francisco, CA',
    jobType: 'Full Time',
    employmentType: 'FULLTIME',
    createdDate: '05/09/24',
    createdAt: '2024-09-05T09:00:00Z',
    totalCandidates: 42,
    activeCandidates: 8,
    status: 'OPEN',
    isStarred: true,
    isBoosted: true,
    salary: '120,000 - 150,000',
    currency: 'USD',
    salaryPeriod: 'Annual',
    experienceLevel: 'Mid Level',
    workExperience: '3 - 6 Years',
    skills: ['Product Roadmap', 'Analytics', 'Agile', 'User Research', 'SQL'],
    description: 'We are seeking an experienced Product Manager to lead product vision, strategy, and execution across our core SaaS platform. You will collaborate closely with engineering, design, and executive teams to build industry-leading recruitment solutions.',
    teamMembers: [
      { id: 'tm-1', name: 'Elena Rostova', role: 'Lead Recruiter', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', color: '#10B981' },
      { id: 'tm-2', name: 'Marcus Vance', role: 'Hiring Manager', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', color: '#4F46E5' }
    ]
  },
  {
    id: 'job-130134',
    jobId: '130134',
    title: 'Real estate sales manager',
    company: 'Apex Realty Global',
    client: 'Apex Realty Global',
    department: 'Sales',
    location: 'Dubai, United Arab Emirates',
    jobType: 'Full Time',
    employmentType: 'FULLTIME',
    createdDate: '02/09/24',
    createdAt: '2024-09-02T10:00:00Z',
    totalCandidates: 17,
    activeCandidates: 0,
    status: 'OPEN',
    isStarred: false,
    isBoosted: false,
    salary: '25,000 - 35,000',
    currency: 'AED',
    salaryPeriod: 'Monthly',
    experienceLevel: 'Senior Level',
    workExperience: '5+ Years',
    skills: ['Real Estate Sales', 'Client Negotiations', 'Portfolio Management', 'CRM'],
    description: 'Lead premier property sales initiatives across luxury residential portfolios in Dubai. Responsible for managing high-net-worth accounts, driving brokerage teams, and optimizing closure ratios.',
    teamMembers: [
      { id: 'tm-3', name: 'Naveen Kumar', role: 'Talent Scout', avatar: '', initial: 'N', color: '#10B981' },
      { id: 'tm-1', name: 'Elena Rostova', role: 'Lead Recruiter', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', color: '#4F46E5' }
    ]
  },
  {
    id: 'job-127346',
    jobId: '127346',
    title: 'Client Acquisition Strategist',
    company: 'ABC',
    client: 'ABC',
    department: 'Marketing',
    location: 'Bengaluru, India',
    jobType: 'Full Time',
    employmentType: 'FULLTIME',
    createdDate: '27/08/24',
    createdAt: '2024-08-27T10:00:00Z',
    totalCandidates: 6,
    activeCandidates: 1,
    status: 'OPEN',
    isStarred: false,
    isBoosted: false,
    salary: '1,400,000 - 2,200,000',
    currency: 'INR',
    salaryPeriod: 'Annual',
    experienceLevel: 'Mid Level',
    workExperience: '3 - 6 Years',
    skills: ['Marketing', 'B2B Acquisition', 'Growth Funnels', 'HubSpot', 'Outbound Campaigns'],
    description: 'Drive high-velocity customer acquisition campaigns across enterprise SaaS verticals. Manage outbound pipelines, multi-channel funnels, and conversion tracking.',
    teamMembers: [
      { id: 'tm-4', name: 'Sarah Connor', role: 'VP Talent', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', color: '#6366F1' }
    ]
  },
  {
    id: 'job-87771',
    jobId: '87771',
    title: 'Sales',
    company: 'Enterprise Tech Partners',
    client: 'Enterprise Tech Partners',
    department: 'Sales',
    location: 'Noida, India + 1',
    jobType: 'Full Time',
    employmentType: 'FULLTIME',
    createdDate: '02/04/24',
    createdAt: '2024-04-02T10:00:00Z',
    reopenedDate: '02/04/24',
    totalCandidates: 34,
    activeCandidates: 6,
    status: 'OPEN',
    isStarred: false,
    isBoosted: false,
    salary: '900,000 - 1,600,000',
    currency: 'INR',
    salaryPeriod: 'Annual',
    experienceLevel: 'Entry Level',
    workExperience: '1 - 3 Years',
    skills: ['Sales', 'Direct Sales', 'Lead Generation', 'Client Pitching', 'Account Management'],
    description: 'Expand regional software licenses and onboard mid-market accounts across tech parks. Conduct product demos, handle objections, and secure new business opportunities.',
    teamMembers: [
      { id: 'tm-3', name: 'Naveen Kumar', role: 'Talent Scout', avatar: '', initial: 'N', color: '#10B981' },
      { id: 'tm-2', name: 'Marcus Vance', role: 'Hiring Manager', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', color: '#4F46E5' }
    ]
  },
  {
    id: 'job-82299',
    jobId: '82299',
    title: 'Business Development executive',
    company: 'Marketing Division',
    client: 'Marketing Division',
    department: 'Marketing',
    location: 'New York, USA',
    jobType: 'Full Time',
    employmentType: 'FULLTIME',
    createdDate: '15/02/24',
    createdAt: '2024-02-15T10:00:00Z',
    totalCandidates: 17,
    activeCandidates: 5,
    status: 'OPEN',
    isStarred: false,
    isBoosted: false,
    salary: '75,000 - 95,000',
    currency: 'USD',
    salaryPeriod: 'Annual',
    experienceLevel: 'Mid Level',
    workExperience: '3 - 5 Years',
    skills: ['Marketing', 'Market Penetration', 'Outbound Prospecting', 'Contract Negotiation'],
    description: 'Prospect, negotiate, and execute strategic alliances with Fortune 500 brand marketing leads. Own lead qualification, discovery calls, and contract handoffs.',
    teamMembers: [
      { id: 'tm-3', name: 'Naveen Kumar', role: 'Talent Scout', avatar: '', initial: 'N', color: '#10B981' },
      { id: 'tm-1', name: 'Elena Rostova', role: 'Lead Recruiter', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', color: '#4F46E5' }
    ]
  },
  {
    id: 'job-95412',
    jobId: '95412',
    title: 'Customer Support',
    company: 'Apex Cloud Services',
    client: 'Apex Cloud Services',
    department: 'Customer Support',
    location: 'Remote',
    jobType: 'Remote',
    employmentType: 'FULLTIME',
    createdDate: '10/06/24',
    createdAt: '2024-06-10T08:30:00Z',
    totalCandidates: 23,
    activeCandidates: 4,
    status: 'OPEN',
    isStarred: true,
    isBoosted: false,
    salary: '45,000 - 60,000',
    currency: 'USD',
    salaryPeriod: 'Annual',
    experienceLevel: 'Entry Level',
    workExperience: '1 - 3 Years',
    skills: ['Customer Support', 'Zendesk', 'Intercom', 'Technical Troubleshooting', 'Communication'],
    description: 'Provide empathetic, high-resolution customer support across chat, ticketing, and live video sessions for global enterprise customers.',
    teamMembers: [
      { id: 'tm-1', name: 'Elena Rostova', role: 'Lead Recruiter', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', color: '#10B981' }
    ]
  },
  {
    id: 'job-110482',
    jobId: '110482',
    title: 'Customer Success',
    company: 'Enterprise Global',
    client: 'Enterprise Global',
    department: 'Customer Success',
    location: 'London, UK',
    jobType: 'Full Time',
    employmentType: 'FULLTIME',
    createdDate: '18/07/24',
    createdAt: '2024-07-18T11:20:00Z',
    totalCandidates: 19,
    activeCandidates: 3,
    status: 'OPEN',
    isStarred: false,
    isBoosted: false,
    salary: '55,000 - 75,000',
    currency: 'GBP',
    salaryPeriod: 'Annual',
    experienceLevel: 'Senior Level',
    workExperience: '4 - 7 Years',
    skills: ['Customer Success', 'Client Retention', 'Onboarding', 'Renewals', 'Gainsight'],
    description: 'Guide enterprise customers through onboarding, strategic value adoption, quarterly business reviews, and proactive contract renewals.',
    teamMembers: [
      { id: 'tm-4', name: 'Sarah Connor', role: 'VP Talent', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', color: '#6366F1' },
      { id: 'tm-2', name: 'Marcus Vance', role: 'Hiring Manager', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', color: '#4F46E5' }
    ]
  },
  {
    id: 'job-70231',
    jobId: '70231',
    title: 'Senior DevOps Architect',
    company: 'Apex Global Tech',
    client: 'Apex Global Tech',
    department: 'Engineering',
    location: 'Remote',
    jobType: 'Remote',
    employmentType: 'FULLTIME',
    createdDate: '12/01/24',
    createdAt: '2024-01-12T08:00:00Z',
    totalCandidates: 58,
    activeCandidates: 0,
    status: 'CLOSED',
    isStarred: false,
    isBoosted: false,
    salary: '140,000 - 180,000',
    currency: 'USD',
    salaryPeriod: 'Annual',
    experienceLevel: 'Senior Level',
    workExperience: '6+ Years',
    skills: ['AWS', 'Kubernetes', 'Terraform', 'CI/CD'],
    description: 'Architect multi-region cloud infrastructures and robust deployment pipelines.',
    teamMembers: [
      { id: 'tm-2', name: 'Marcus Vance', role: 'Hiring Manager', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', color: '#4F46E5' }
    ]
  }
];

export function getStoredJobs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialJobs));
      return initialJobs;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialJobs));
      return initialJobs;
    }
    return parsed;
  } catch (err) {
    return initialJobs;
  }
}

import { jobService } from '../services/jobService.js';
import { apiClient } from '../services/api/apiClient.js';

export function saveJobs(jobs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  } catch (err) {
    console.error('Failed to save jobs:', err);
  }
}

export async function syncJobsWithBackend(onSynced) {
  try {
    const res = await jobService.getJobs();
    if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
      const local = getStoredJobs();
      const merged = [...local];
      res.data.forEach((backendJob) => {
        const exists = merged.some(
          (l) => l.id === backendJob.id || l.jobId === backendJob.id || l.jobId === backendJob.jobId
        );
        if (!exists) {
          merged.push({
            ...backendJob,
            jobId: backendJob.jobId || backendJob.id?.replace('job-', ''),
            totalCandidates: backendJob.applicationsCount || 0,
            activeCandidates: backendJob.activeCandidates || 0,
            status: backendJob.status === 'PUBLISHED' ? 'OPEN' : (backendJob.status || 'OPEN'),
          });
        }
      });
      saveJobs(merged);
      if (onSynced) onSynced(merged);
      return merged;
    }
  } catch (err) {
    console.warn('Backend sync note:', err);
  }
  return getStoredJobs();
}

export function addJob(newJob) {
  const jobs = getStoredJobs();
  const idNumber = Math.floor(100000 + Math.random() * 900000);
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).slice(-2);
  const formattedDate = `${day}/${month}/${year}`;

  const created = {
    id: `job-${idNumber}`,
    jobId: String(idNumber),
    createdDate: formattedDate,
    createdAt: now.toISOString(),
    totalCandidates: 0,
    activeCandidates: 0,
    status: 'OPEN',
    isStarred: false,
    isBoosted: false,
    teamMembers: [
      { id: 'tm-1', name: 'Elena Rostova', role: 'Lead Recruiter', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', color: '#10B981' }
    ],
    ...newJob
  };

  const updated = [created, ...jobs];
  saveJobs(updated);

  // Sync to backend asynchronously
  try {
    jobService.createJob(created).catch(() => {});
  } catch (e) {}

  return created;
}

export function updateJob(id, updates) {
  const jobs = getStoredJobs();
  const index = jobs.findIndex(j => j.id === id || j.jobId === id);
  if (index !== -1) {
    jobs[index] = { ...jobs[index], ...updates };
    saveJobs(jobs);

    // Sync to backend asynchronously
    try {
      jobService.updateJob(id, updates).catch(() => {});
    } catch (e) {}

    return jobs[index];
  }
  return null;
}

export function deleteJob(id) {
  const jobs = getStoredJobs();
  const filtered = jobs.filter(j => j.id !== id && j.jobId !== id);
  saveJobs(filtered);

  // Sync to backend asynchronously
  try {
    apiClient.delete(`/api/v1/jobs/${id}`).catch(() => {});
  } catch (e) {}

  return filtered;
}

export function toggleStarJob(id) {
  const jobs = getStoredJobs();
  const index = jobs.findIndex(j => j.id === id || j.jobId === id);
  if (index !== -1) {
    jobs[index].isStarred = !jobs[index].isStarred;
    saveJobs(jobs);
    return jobs[index];
  }
  return null;
}
