import { z } from 'zod';

export const scheduleInterviewSchema = z.object({
  applicationId: z.string().min(1, 'Application ID is required'),
  candidateId: z.string().optional(),
  jobId: z.string().optional(),
  interviewerId: z.string().optional(),
  interviewerName: z.string().optional(),
  interviewType: z.enum(['PHONE', 'VIDEO', 'TECHNICAL', 'HR', 'ONSITE']).default('VIDEO'),
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
  startTime: z.string().optional(),
  duration: z.coerce.number().optional().default(45),
  meetingUrl: z.string().url().optional().or(z.literal('')),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export const submitInterviewFeedbackSchema = z.object({
  rating: z.coerce.number().min(1).max(5),
  recommendation: z.enum(['STRONG_HIRE', 'HIRE', 'NEUTRAL', 'NO_HIRE', 'STRONG_NO_HIRE']),
  pros: z.string().optional(),
  cons: z.string().optional(),
  notes: z.string().optional(),
});
