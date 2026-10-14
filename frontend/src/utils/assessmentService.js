/**
 * Skill Assessments & Automated Reference Check Engine
 * Manages in-platform technical quizzes and manager reference verifications.
 */

const ASSESS_STORAGE_KEY = 'ats_candidate_assessments';
const REF_STORAGE_KEY = 'ats_candidate_references';

export const SKILL_TESTS = [
  {
    id: 'test-react',
    title: 'Frontend Architecture & Modern React',
    duration: '15 Mins',
    skill: 'React / Architecture',
    questions: [
      {
        q: 'What is the primary architectural purpose of React Server Components (RSC)?',
        options: [
          'Render components on client side without DOM',
          'Reduce client bundle size and execute data fetching directly on server',
          'Replace all CSS stylesheets with inline JSON',
          'Enforce strict class-based component inheritance'
        ],
        answer: 1
      },
      {
        q: 'How does React 18 Concurrent Mode handle high-priority UI updates?',
        options: [
          'Pauses and interrupts background re-renders via useTransition',
          'Blocks the entire browser main thread',
          'Executes web workers with local storage caches',
          'Converts JSX into WebAssembly binaries'
        ],
        answer: 0
      }
    ]
  },
  {
    id: 'test-product',
    title: 'Product Strategy & Metrics Modeling',
    duration: '20 Mins',
    skill: 'Product Management',
    questions: [
      {
        q: 'Which metric best quantifies sustainable SaaS product-market fit retention?',
        options: [
          'Total registered accounts',
          'Net Revenue Retention (NRR) and cohort retention curves flattening',
          'Daily pageview impressions',
          'Gross social media follow count'
        ],
        answer: 1
      },
      {
        q: 'When prioritizing conflicting roadmap requests using RICE framework, what does E represent?',
        options: ['Efficiency', 'Engagement', 'Effort (Person-Months)', 'Execution Rate'],
        answer: 2
      }
    ]
  }
];

export function getCandidateAssessment(candidateId) {
  try {
    const raw = localStorage.getItem(ASSESS_STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    return all[candidateId] || null;
  } catch (e) {
    return null;
  }
}

export function saveCandidateAssessment(candidateId, assessmentData) {
  try {
    const raw = localStorage.getItem(ASSESS_STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    all[candidateId] = {
      completedAt: new Date().toISOString(),
      ...assessmentData
    };
    localStorage.setItem(ASSESS_STORAGE_KEY, JSON.stringify(all));
    return all[candidateId];
  } catch (e) {}
}

export function getCandidateReferences(candidateId) {
  try {
    const raw = localStorage.getItem(REF_STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    return all[candidateId] || [
      {
        id: 'ref-1',
        referrerName: 'Marcus Vance',
        relationship: 'Former VP of Engineering',
        company: 'Stripe Ecosystem',
        rating: 9.6,
        endorsement: 'One of the strongest technical leaders I have worked with. Exceptional execution speed and high team trust.',
        verifiedAt: '2 days ago'
      }
    ];
  } catch (e) {
    return [];
  }
}

export function addCandidateReference(candidateId, reference) {
  try {
    const raw = localStorage.getItem(REF_STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    const list = all[candidateId] || [];
    const entry = {
      id: `ref-${Date.now()}`,
      verifiedAt: 'Just now',
      ...reference
    };
    all[candidateId] = [entry, ...list];
    localStorage.setItem(REF_STORAGE_KEY, JSON.stringify(all));
    return entry;
  } catch (e) {}
}

export const assessmentService = {
  SKILL_TESTS,
  getCandidateAssessment,
  saveCandidateAssessment,
  getCandidateReferences,
  addCandidateReference
};

export default assessmentService;
