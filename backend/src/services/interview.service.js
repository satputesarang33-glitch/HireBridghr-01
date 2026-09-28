import { prisma } from '../lib/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { auditService } from './audit.service.js';
import { devStore } from '../lib/devStore.js';
import { env } from '../config/env.js';

export const interviewService = {
  /**
   * List interviews scoped to organization
   */
  getInterviews: async (organizationId, filters = {}) => {
    if (!env.DATABASE_URL) {
      let list = [...devStore.interviews];
      if (organizationId) list = list.filter((i) => i.organizationId === organizationId);
      if (filters.status && filters.status !== 'ALL') list = list.filter((i) => i.status === filters.status);
      return { interviews: list, total: list.length, page: 1, limit: 20 };
    }

    const { page = 1, limit = 20, status, search } = filters;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      ...(organizationId ? { organizationId } : {}),
      ...(status && status !== 'ALL' ? { status } : {}),
    };

    if (search) {
      where.OR = [
        { candidateName: { contains: search, mode: 'insensitive' } },
        { jobTitle: { contains: search, mode: 'insensitive' } },
        { interviewerName: { contains: search, mode: 'insensitive' } },
      ];
    }

    try {
      const [interviews, total] = await Promise.all([
        prisma.interview.findMany({
          where,
          include: {
            feedback: true,
            application: { select: { id: true, stage: true } },
            interviewer: { select: { id: true, name: true, email: true } },
          },
          orderBy: { scheduledDate: 'desc' },
          skip,
          take: Number(limit),
        }),
        prisma.interview.count({ where }),
      ]);

      return { interviews, total, page: Number(page), limit: Number(limit) };
    } catch {
      return { interviews: devStore.interviews, total: devStore.interviews.length, page: 1, limit: 20 };
    }
  },

  /**
   * Get single interview by ID
   */
  getInterviewById: async (id, organizationId) => {
    if (!env.DATABASE_URL) {
      const interview = devStore.interviews.find((i) => i.id === id);
      if (!interview) throw ApiError.notFound('Interview not found');
      return interview;
    }

    try {
      const interview = await prisma.interview.findFirst({
        where: { id, ...(organizationId ? { organizationId } : {}) },
        include: {
          feedback: true,
          application: true,
          candidate: true,
        },
      });

      if (!interview) {
        throw ApiError.notFound('Interview not found');
      }

      return interview;
    } catch (err) {
      if (err.statusCode === 404) throw err;
      const interview = devStore.interviews.find((i) => i.id === id);
      if (!interview) throw ApiError.notFound('Interview not found');
      return interview;
    }
  },

  /**
   * Schedule interview
   */
  scheduleInterview: async (organizationId, data, actor) => {
    if (!env.DATABASE_URL) {
      const newInterview = {
        id: `int-${Date.now().toString().slice(-4)}`,
        organizationId: organizationId || 'org-1',
        applicationId: data.applicationId,
        candidateName: data.candidateName || 'Candidate',
        jobTitle: data.jobTitle || 'Position',
        interviewerName: data.interviewerName || actor?.name || 'Recruiter',
        interviewType: data.interviewType || 'VIDEO',
        scheduledDate: data.scheduledDate,
        startTime: data.startTime || '10:00 AM',
        duration: data.duration || 45,
        meetingUrl: data.meetingUrl || 'https://meet.google.com/sample',
        status: 'SCHEDULED',
        createdAt: new Date().toISOString(),
      };
      devStore.interviews.unshift(newInterview);
      return newInterview;
    }

    const application = await prisma.application.findFirst({
      where: { id: data.applicationId, ...(organizationId ? { organizationId } : {}) },
      include: { candidate: true, job: true },
    });

    if (!application) {
      throw ApiError.notFound('Application not found');
    }

    const scheduledDate = new Date(data.scheduledDate);

    const interview = await prisma.$transaction(async (tx) => {
      const created = await tx.interview.create({
        data: {
          organizationId: application.organizationId,
          applicationId: application.id,
          candidateId: application.candidateId,
          candidateName: application.candidateName,
          jobId: application.jobId,
          jobTitle: application.jobTitle,
          interviewerId: data.interviewerId || actor.id,
          interviewerName: data.interviewerName || actor.name,
          interviewType: data.interviewType || 'VIDEO',
          scheduledDate,
          startTime: data.startTime || '10:00 AM',
          duration: data.duration ? Number(data.duration) : 45,
          meetingUrl: data.meetingUrl,
          location: data.location,
          status: 'SCHEDULED',
          notes: data.notes,
        },
      });

      return created;
    });

    return interview;
  },

  /**
   * Update interview
   */
  updateInterview: async (id, organizationId, updateData, actor) => {
    if (!env.DATABASE_URL) {
      const idx = devStore.interviews.findIndex((i) => i.id === id);
      if (idx === -1) throw ApiError.notFound('Interview not found');
      devStore.interviews[idx] = { ...devStore.interviews[idx], ...updateData };
      return devStore.interviews[idx];
    }

    return prisma.interview.update({
      where: { id },
      data: updateData,
    });
  },

  /**
   * Submit interview feedback
   */
  submitFeedback: async (id, organizationId, feedbackData, actor) => {
    if (!env.DATABASE_URL) {
      const interview = devStore.interviews.find((i) => i.id === id);
      if (!interview) throw ApiError.notFound('Interview not found');
      interview.status = 'COMPLETED';
      interview.feedback = {
        rating: feedbackData.rating,
        recommendation: feedbackData.recommendation,
        pros: feedbackData.pros,
        cons: feedbackData.cons,
        notes: feedbackData.notes,
        submittedAt: new Date().toISOString(),
      };
      return interview;
    }

    await prisma.interviewFeedback.upsert({
      where: { interviewId: id },
      update: {
        authorId: actor.id,
        authorName: actor.name || 'Interviewer',
        rating: Number(feedbackData.rating),
        recommendation: feedbackData.recommendation,
        pros: feedbackData.pros,
        cons: feedbackData.cons,
        notes: feedbackData.notes,
        submittedAt: new Date(),
      },
      create: {
        interviewId: id,
        authorId: actor.id,
        authorName: actor.name || 'Interviewer',
        rating: Number(feedbackData.rating),
        recommendation: feedbackData.recommendation,
        pros: feedbackData.pros,
        cons: feedbackData.cons,
        notes: feedbackData.notes,
      },
    });

    return prisma.interview.update({
      where: { id },
      data: { status: 'COMPLETED' },
      include: { feedback: true },
    });
  },

  /**
   * Cancel interview
   */
  cancelInterview: async (id, organizationId, actor) => {
    return interviewService.updateInterview(id, organizationId, { status: 'CANCELLED' }, actor);
  },

  /**
   * Delete interview
   */
  deleteInterview: async (id, organizationId, actor) => {
    const idx = devStore.interviews.findIndex((i) => i.id === id);
    if (idx !== -1) devStore.interviews.splice(idx, 1);
    return { id, message: 'Interview deleted successfully' };
  },
};
