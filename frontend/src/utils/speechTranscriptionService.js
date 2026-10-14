/**
 * AI Speech-to-Text Transcription & Candidate Video Screening Engine
 * Simulates WebRTC video recording, converts audio to text, and evaluates communication competencies.
 */

const SCREENING_STORAGE_KEY = 'ats_candidate_screenings';

export const SCREENING_PROMPTS = [
  {
    id: 'pr-1',
    question: 'Please introduce yourself and explain what makes you a strong fit for this requisition.',
    idealDuration: '60 seconds'
  },
  {
    id: 'pr-2',
    question: 'Describe a complex technical or operational failure you encountered and how you led its resolution.',
    idealDuration: '60 seconds'
  },
  {
    id: 'pr-3',
    question: 'How do you foster alignment between engineering, product, and business stakeholders?',
    idealDuration: '60 seconds'
  }
];

export function getCandidateVideoScreening(candidateId) {
  try {
    const raw = localStorage.getItem(SCREENING_STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    return all[candidateId] || null;
  } catch (e) {
    return null;
  }
}

export function saveCandidateVideoScreening(candidateId, screeningResult) {
  try {
    const raw = localStorage.getItem(SCREENING_STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    all[candidateId] = {
      submittedAt: new Date().toISOString(),
      ...screeningResult
    };
    localStorage.setItem(SCREENING_STORAGE_KEY, JSON.stringify(all));
    return all[candidateId];
  } catch (e) {
    console.error('Failed to save video screening:', e);
  }
}

export function generateTranscriptAndScores(questionId) {
  const prompt = SCREENING_PROMPTS.find(p => p.id === questionId) || SCREENING_PROMPTS[0];

  return {
    prompt: prompt.question,
    durationSeconds: 48,
    transcript: "In my previous role leading product architecture, we faced a major concurrency bottleneck where API responses degraded under peak load. I coordinated the root-cause analysis with the infrastructure squad, introduced Redis caching, and established clear SLO metrics. Within three weeks, p99 latency dropped by 42% while team morale remained high.",
    scores: {
      overallClarity: 92,
      confidenceRating: 'High',
      starMethodAdherence: 'Strong (Situation, Task, Action, Result clearly defined)',
      sentiment: 'Confident & Analytical',
      keyKeywordsDetected: ['Architecture', 'SLO Metrics', 'Root-Cause Analysis', 'Redis Caching', 'Cross-Functional Squad']
    }
  };
}

export const speechTranscriptionService = {
  SCREENING_PROMPTS,
  getCandidateVideoScreening,
  saveCandidateVideoScreening,
  generateTranscriptAndScores
};

export default speechTranscriptionService;
