import { z } from 'zod';

export const createApplicationSchema = z.object({
  jobId: z.string().optional(),
  candidateId: z.string().optional(),
  fullName: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email('Valid email is required').optional(),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  company: z.string().optional(),
  resumeUrl: z.string().optional(),
  resumeFileName: z.string().optional(),
  coverLetter: z.string().optional(),
  portfolioUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  source: z.string().optional().default('Website'),
});

export const updateApplicationStageSchema = z.object({
  stage: z.enum([
    'APPLIED',
    'SCREENING',
    'SHORTLISTED',
    'INTERVIEW',
    'OFFER',
    'HIRED',
    'REJECTED',
    'WITHDRAWN',
    'NEW',
  ]),
  notes: z.string().optional(),
});
