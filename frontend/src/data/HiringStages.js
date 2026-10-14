// Mock Hiring Pipeline Stages
export const initialHiringStages = [
  {
    id: 'APPLIED',
    key: 'APPLIED',
    title: 'Applied',
    color: '#6366F1', // Indigo
    bgColor: '#EEF2FF',
    description: 'Fresh applicants received through job portals and direct applications.'
  },
  {
    id: 'CONTACTED',
    key: 'CONTACTED',
    title: 'Contacted',
    color: '#0EA5E9', // Sky
    bgColor: '#F0F9FF',
    description: 'Initial recruiter outreach and candidate screening underway.'
  },
  {
    id: 'INTERVIEW',
    key: 'INTERVIEW',
    title: 'Interview',
    color: '#F59E0B', // Amber
    bgColor: '#FFFBEB',
    description: 'Active technical, architectural, and culture fit rounds in progress.'
  },
  {
    id: 'OFFERED',
    key: 'OFFERED',
    title: 'Offered',
    color: '#8B5CF6', // Purple
    bgColor: '#F5F3FF',
    description: 'Formal employment offer letter extended and under compensation review.'
  },
  {
    id: 'HIRED',
    key: 'HIRED',
    title: 'Hired',
    color: '#10B981', // Emerald
    bgColor: '#ECFDF5',
    description: 'Offer formally accepted and candidate scheduled for onboarding.'
  }
];

export default initialHiringStages;
