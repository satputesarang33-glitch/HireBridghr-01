import { z } from 'zod';

export const scheduleInterviewSchema = z
  .object({
    applicationId: z.string().optional(),
    candidateId: z.string().optional(),
    jobId: z.string().optional(),
    interviewerId: z.string().optional(),
    interviewerName: z.string().optional(),
    interviewType: z.enum(['PHONE', 'VIDEO', 'TECHNICAL', 'HR', 'ONSITE']).optional(),
    type: z.enum(['PHONE', 'VIDEO', 'TECHNICAL', 'HR', 'ONSITE']).optional(),
    scheduledDate: z.string().optional(),
    datetime: z.string().optional(),
    date: z.string().optional(),
    startTime: z.string().optional(),
    duration: z.coerce.number().optional().default(45),
    meetingUrl: z.string().url().optional().or(z.literal('')),
    location: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine((data) => data.applicationId || data.candidateId, {
    message: 'Either applicationId or candidateId is required',
    path: ['applicationId'],
  })
  .refine((data) => data.scheduledDate || data.datetime || data.date, {
    message: 'Scheduled date is required',
    path: ['scheduledDate'],
  })
  .transform((data) => {
    return {
      ...data,
      interviewType: data.interviewType || data.type || 'VIDEO',
      scheduledDate: data.scheduledDate || data.datetime || data.date || new Date().toISOString(),
    };
  });

export const submitInterviewFeedbackSchema = z.object({
  rating: z.coerce.number().min(1).max(5),
  recommendation: z.enum(['STRONG_HIRE', 'HIRE', 'NEUTRAL', 'NO_HIRE', 'STRONG_NO_HIRE']),
  pros: z.string().optional(),
  cons: z.string().optional(),
  notes: z.string().optional(),
});
