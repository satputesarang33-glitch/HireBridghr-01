import { z } from 'zod';

export const updateOrganizationSchema = z.object({
  name: z.string().min(2).optional(),
  industry: z.string().optional(),
  size: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  country: z.string().optional(),
  city: z.string().optional(),
  timeZone: z.string().optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['ADMIN', 'RECRUITER', 'HIRING_MANAGER', 'INTERVIEWER', 'VIEWER']),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(['ADMIN', 'RECRUITER', 'HIRING_MANAGER', 'INTERVIEWER', 'VIEWER']),
});
