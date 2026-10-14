// Mock Candidates Data for ATS
const STORAGE_KEY = 'ats_candidates_data';

export const initialCandidates = [
  {
    id: 'cand-1',
    name: 'Alexander Wright',
    email: 'alex.wright@example.com',
    phone: '+1 (555) 234-8901',
    jobId: '142850',
    jobTitle: 'Product Manager',
    stage: 'APPLIED',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    matchScore: 94,
    rating: 4.8,
    experienceYears: 5,
    location: 'San Francisco, CA',
    appliedDate: 'Yesterday',
    currentCompany: 'Stripe Ecosystem Partner',
    skills: ['Product Strategy', 'SaaS Growth', 'User Journey', 'SQL'],
    tags: ['Top Match', 'Referral']
  },
  {
    id: 'cand-2',
    name: 'Sophia Martinez',
    email: 'sophia.m@example.com',
    phone: '+1 (555) 345-6789',
    jobId: '142850',
    jobTitle: 'Product Manager',
    stage: 'CONTACTED',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    matchScore: 91,
    rating: 4.6,
    experienceYears: 4,
    location: 'San Jose, CA',
    appliedDate: '3 days ago',
    currentCompany: 'Atlassian Marketplace',
    skills: ['Roadmapping', 'Agile', 'Jira', 'A/B Testing'],
    tags: ['Screened']
  },
  {
    id: 'cand-3',
    name: 'Liam Chen',
    email: 'liam.chen@example.com',
    phone: '+1 (555) 456-7890',
    jobId: '142850',
    jobTitle: 'Product Manager',
    stage: 'INTERVIEW',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    matchScore: 88,
    rating: 4.5,
    experienceYears: 6,
    location: 'Oakland, CA',
    appliedDate: '1 week ago',
    currentCompany: 'FinTech Cloud Inc.',
    skills: ['Product Roadmaps', 'Cross-functional Leadership', 'APIs'],
    tags: ['Round 2 Technical']
  },
  {
    id: 'cand-4',
    name: 'Olivia Vance',
    email: 'olivia.vance@example.com',
    phone: '+1 (555) 567-8901',
    jobId: '142850',
    jobTitle: 'Product Manager',
    stage: 'OFFERED',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    matchScore: 96,
    rating: 4.9,
    experienceYears: 7,
    location: 'San Francisco, CA',
    appliedDate: '2 weeks ago',
    currentCompany: 'Salesforce Partner',
    skills: ['Executive Presentation', 'Product Analytics', 'B2B SaaS'],
    tags: ['Offer Extended']
  },
  {
    id: 'cand-5',
    name: 'Ethan Ross',
    email: 'ethan.ross@example.com',
    phone: '+1 (555) 678-9012',
    jobId: '142850',
    jobTitle: 'Product Manager',
    stage: 'HIRED',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    matchScore: 98,
    rating: 5.0,
    experienceYears: 8,
    location: 'San Francisco, CA',
    appliedDate: '3 weeks ago',
    currentCompany: 'Apex Tech Alum',
    skills: ['Product Vision', 'Team Leadership', 'Growth'],
    tags: ['Joined Team']
  },
  {
    id: 'cand-6',
    name: 'Tariq Al-Mansoor',
    email: 'tariq.mansoor@example.com',
    phone: '+971 50 123 4567',
    jobId: '130134',
    jobTitle: 'Real estate sales manager',
    stage: 'APPLIED',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    matchScore: 92,
    rating: 4.7,
    experienceYears: 6,
    location: 'Dubai, UAE',
    appliedDate: '2 days ago',
    currentCompany: 'Emaar Properties Brokerage',
    skills: ['Luxury Real Estate', 'High-Net-Worth Portfolios', 'Contract Closures'],
    tags: ['VIP Network']
  },
  {
    id: 'cand-7',
    name: 'Fatima Zahra',
    email: 'fatima.zahra@example.com',
    phone: '+971 55 987 6543',
    jobId: '130134',
    jobTitle: 'Real estate sales manager',
    stage: 'CONTACTED',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    matchScore: 89,
    rating: 4.4,
    experienceYears: 5,
    location: 'Dubai Marina, UAE',
    appliedDate: '4 days ago',
    currentCompany: 'Damac Commercial',
    skills: ['Portfolio Management', 'Sales Negotiation', 'CRM'],
    tags: ['Available Immediately']
  },
  {
    id: 'cand-8',
    name: 'Pooja Sharma',
    email: 'pooja.sharma@example.com',
    phone: '+91 98765 43210',
    jobId: '127346',
    jobTitle: 'Client Acquisition Strategist',
    stage: 'INTERVIEW',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    matchScore: 93,
    rating: 4.8,
    experienceYears: 4,
    location: 'Bengaluru, India',
    appliedDate: '5 days ago',
    currentCompany: 'Inbound Growth Labs',
    skills: ['Inbound Funnels', 'HubSpot Marketing', 'B2B SaaS Lead Gen'],
    tags: ['Final Round']
  },
  {
    id: 'cand-9',
    name: 'Rahul Verma',
    email: 'rahul.verma@example.com',
    phone: '+91 98111 22334',
    jobId: '87771',
    jobTitle: 'Sales',
    stage: 'APPLIED',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
    matchScore: 85,
    rating: 4.2,
    experienceYears: 3,
    location: 'Noida, India',
    appliedDate: 'Yesterday',
    currentCompany: 'Software Direct India',
    skills: ['Outbound Calling', 'Demo Presentations', 'Account Closing'],
    tags: ['Urgent Review']
  },
  {
    id: 'cand-10',
    name: 'Jessica Taylor',
    email: 'jessica.t@example.com',
    phone: '+1 (212) 555-0143',
    jobId: '82299',
    jobTitle: 'Business Development executive',
    stage: 'CONTACTED',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    matchScore: 90,
    rating: 4.6,
    experienceYears: 4,
    location: 'New York, USA',
    appliedDate: '3 days ago',
    currentCompany: 'Midtown Media Partners',
    skills: ['B2B Sales', 'Prospecting', 'Enterprise Outreach'],
    tags: ['Fast Tracker']
  }
];

export function getStoredCandidates() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialCandidates));
      return initialCandidates;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialCandidates));
      return initialCandidates;
    }
    return parsed;
  } catch (err) {
    return initialCandidates;
  }
}

export function saveCandidates(candidates) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(candidates));
  } catch (err) {
    console.error('Failed to save candidates:', err);
  }
}

export function addCandidate(candidate) {
  const list = getStoredCandidates();
  const idNumber = Math.floor(1000 + Math.random() * 9000);
  const newCandidate = {
    id: `cand-${idNumber}`,
    appliedDate: 'Just now',
    matchScore: Math.floor(82 + Math.random() * 16),
    rating: (4.0 + Math.random() * 0.9).toFixed(1),
    avatar: '',
    tags: ['New Applicant'],
    stage: candidate.stage || 'APPLIED',
    ...candidate
  };
  const updated = [newCandidate, ...list];
  saveCandidates(updated);
  return newCandidate;
}

export function updateCandidateStage(id, newStage) {
  const list = getStoredCandidates();
  const index = list.findIndex(c => c.id === id);
  if (index !== -1) {
    list[index] = { ...list[index], stage: newStage };
    saveCandidates(list);
    return list[index];
  }
  return null;
}

export function deleteCandidate(id) {
  const list = getStoredCandidates();
  const filtered = list.filter(c => c.id !== id);
  saveCandidates(filtered);
  return filtered;
}
