import { z } from 'zod';

export const createJobSchema = z.object({
  title: z.string().min(2, 'Job title is required'),
  department: z.string().optional(),
  client: z.string().optional(),
  location: z.string().optional(),
  workplaceType: z.enum(['REMOTE', 'HYBRID', 'ON_SITE', 'Remote', 'Hybrid', 'On-site']).optional().default('REMOTE'),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY', 'Full-time', 'Part-time', 'Contract']).optional().default('FULL_TIME'),
  jobType: z.string().optional(),
  experienceMin: z.coerce.number().optional(),
  experienceMax: z.coerce.number().optional(),
  experienceLevel: z.string().optional(),
  salaryMin: z.coerce.number().optional(),
  salaryMax: z.coerce.number().optional(),
  currency: z.string().optional().default('USD'),
  skills: z.array(z.string()).optional().default([]),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  responsibilities: z.union([z.string(), z.array(z.string())]).optional(),
  requirements: z.union([z.string(), z.array(z.string())]).optional(),
  status: z.enum(['DRAFT', 'PENDING_ADMIN_PUBLICATION', 'PROCESSING', 'PUBLISHED', 'CLOSED', 'ARCHIVED']).optional().default('DRAFT'),
  recruiterId: z.string().optional(),
  recruiterName: z.string().optional(),
  contactPerson: z.string().optional(),
  candidateEmail: z.string().optional(),
  isPublic: z.boolean().optional().default(true),
  isResumeRequired: z.boolean().optional().default(true),
  deadline: z.string().optional(),
});

export const updateJobSchema = createJobSchema.partial();
