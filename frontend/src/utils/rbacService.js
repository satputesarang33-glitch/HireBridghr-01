/**
 * Enterprise Multi-Tenancy, Role-Based Access Control (RBAC) & Compliance Service
 * Coordinates multi-tenant organization switching, RBAC permissions, and GDPR data portability.
 */

const ORG_STORAGE_KEY = 'hb_active_organization';
const ROLE_STORAGE_KEY = 'hb_active_role';

export const ENTERPRISE_ORGS = [
  { id: 'org-1', name: 'Apex Global Tech', domain: 'apextech.com', industry: 'Enterprise SaaS', plan: 'Enterprise Unlimited' },
  { id: 'org-2', name: 'Apex Realty Global', domain: 'apexrealty.com', industry: 'Real Estate & Brokerage', plan: 'Growth' },
  { id: 'org-3', name: 'FinTech Cloud Corp', domain: 'fintechcloud.com', industry: 'Banking & Payments', plan: 'Enterprise Unlimited' },
  { id: 'org-4', name: 'CyberSec Systems', domain: 'cybersec.io', industry: 'Information Security', plan: 'Enterprise Pro' }
];

export const RBAC_ROLES = [
  {
    id: 'ADMIN',
    name: 'Administrator / Owner',
    badge: 'Admin',
    description: 'Unrestricted access to all requisitions, salary bands, offer letters, and team assignments.'
  },
  {
    id: 'RECRUITER',
    name: 'Senior Talent Recruiter',
    badge: 'Recruiter',
    description: 'Manage talent pipelines, schedule interviews, evaluate candidate screening, and dispatch offers.'
  },
  {
    id: 'HIRING_MANAGER',
    name: 'Hiring Manager',
    badge: 'Hiring Mgr',
    description: 'Review shortlisted applicants, collaborate on notes, and conduct technical rounds.'
  },
  {
    id: 'INTERVIEWER',
    name: 'Technical Interviewer',
    badge: 'Interviewer',
    description: 'Access candidate CVs and submit standardized scorecard rubrics.'
  }
];

export function getActiveOrganization() {
  try {
    const raw = localStorage.getItem(ORG_STORAGE_KEY);
    return raw ? JSON.parse(raw) : ENTERPRISE_ORGS[0];
  } catch (e) {
    return ENTERPRISE_ORGS[0];
  }
}

export function setActiveOrganization(org) {
  try {
    localStorage.setItem(ORG_STORAGE_KEY, JSON.stringify(org));
    // Also sync to auth user
    const userRaw = localStorage.getItem('hb_auth_user');
    if (userRaw) {
      const u = JSON.parse(userRaw);
      u.organizationId = org.id;
      u.organizationName = org.name;
      localStorage.setItem('hb_auth_user', JSON.stringify(u));
    }
  } catch (e) {}
}

export function getActiveRole() {
  try {
    return localStorage.getItem(ROLE_STORAGE_KEY) || 'ADMIN';
  } catch (e) {
    return 'ADMIN';
  }
}

export function setActiveRole(roleId) {
  try {
    localStorage.setItem(ROLE_STORAGE_KEY, roleId);
    const userRaw = localStorage.getItem('hb_auth_user');
    if (userRaw) {
      const u = JSON.parse(userRaw);
      u.role = roleId;
      localStorage.setItem('hb_auth_user', JSON.stringify(u));
    }
  } catch (e) {}
}

// GDPR Anonymization & Data Export
export function anonymizeCandidateData(candidateId) {
  try {
    const raw = localStorage.getItem('ats_candidates_data');
    if (raw) {
      const list = JSON.parse(raw);
      const idx = list.findIndex(c => c.id === candidateId);
      if (idx !== -1) {
        list[idx] = {
          ...list[idx],
          name: 'GDPR Anonymized Applicant',
          email: 'anonymized@gdpr-purged.local',
          phone: '+0 (000) 000-0000',
          resume: null,
          tags: ['GDPR Forgotten', 'Anonymized'],
          screeningAnswers: []
        };
        localStorage.setItem('ats_candidates_data', JSON.stringify(list));
        return list[idx];
      }
    }
  } catch (e) {}
}

export function exportAllComplianceData() {
  const exportPayload = {
    generatedAt: new Date().toISOString(),
    organization: getActiveOrganization(),
    activeRole: getActiveRole(),
    records: {
      jobs: JSON.parse(localStorage.getItem('ats_jobs_data') || '[]'),
      candidates: JSON.parse(localStorage.getItem('ats_candidates_data') || '[]'),
      sentEmails: JSON.parse(localStorage.getItem('ats_sent_emails') || '[]'),
      activities: JSON.parse(localStorage.getItem('ats_candidate_activities') || '{}')
    }
  };

  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hirebridge-gdpr-export-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export const rbacService = {
  ENTERPRISE_ORGS,
  RBAC_ROLES,
  getActiveOrganization,
  setActiveOrganization,
  getActiveRole,
  setActiveRole,
  anonymizeCandidateData,
  exportAllComplianceData
};

export default rbacService;
