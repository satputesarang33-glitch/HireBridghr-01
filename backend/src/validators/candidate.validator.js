import { z } from 'zod';

export const createCandidateSchema = z.object({
  name: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  location: z.string().optional(),
  currentTitle: z.string().optional(),
  company: z.string().optional(),
  skills: z.array(z.string()).optional().default([]),
  experienceYears: z.coerce.number().optional().default(0),
  rating: z.coerce.number().optional().default(5.0),
  status: z.string().optional().default('ACTIVE'),
  source: z.string().optional().default('Direct Sourcing'),
  tags: z.array(z.string()).optional().default([]),
  portfolioUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  resumeUrl: z.string().optional(),
  resumeFileName: z.string().optional(),
  resumeFileSize: z.string().optional(),
  assignedRecruiterId: z.string().optional(),
  assignedRecruiterName: z.string().optional(),
});

export const updateCandidateSchema = createCandidateSchema.partial();

export const addCandidateNoteSchema = z.object({
  content: z.string().min(1, 'Note content cannot be empty'),
  rating: z.coerce.number().min(1).max(5).optional(),
  author: z.string().optional(),
});
