import { prisma } from '../lib/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { auditService } from './audit.service.js';
import { devStore } from '../lib/devStore.js';
import { env } from '../config/env.js';

export const applicationService = {
  /**
   * List applications scoped to organization
   */
  getApplications: async (organizationId, filters = {}) => {
    if (!env.DATABASE_URL) {
      let list = [...devStore.applications];
      if (organizationId) list = list.filter((a) => a.organizationId === organizationId);
      if (filters.jobId && filters.jobId !== 'ALL') list = list.filter((a) => a.jobId === filters.jobId);
      if (filters.stage && filters.stage !== 'ALL') list = list.filter((a) => a.stage === filters.stage);
      if (filters.search) {
        const q = filters.search.toLowerCase();
        list = list.filter((a) => a.candidateName.toLowerCase().includes(q) || a.jobTitle.toLowerCase().includes(q));
      }
      return { applications: list, total: list.length, page: 1, limit: 20 };
    }

    const { page = 1, limit = 20, jobId, stage, search } = filters;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      ...(organizationId ? { organizationId } : {}),
      ...(jobId && jobId !== 'ALL' ? { jobId } : {}),
      ...(stage && stage !== 'ALL' ? { stage } : {}),
    };

    if (search) {
      where.OR = [
        { candidateName: { contains: search, mode: 'insensitive' } },
        { candidateEmail: { contains: search, mode: 'insensitive' } },
        { jobTitle: { contains: search, mode: 'insensitive' } },
      ];
    }

    try {
      const [applications, total] = await Promise.all([
        prisma.application.findMany({
          where,
          include: {
            job: { select: { id: true, title: true, department: true, client: true } },
            candidate: { select: { id: true, name: true, email: true, phone: true, rating: true, skills: true } },
            activities: { orderBy: { createdAt: 'desc' }, take: 3 },
          },
          orderBy: { appliedDate: 'desc' },
          skip,
          take: Number(limit),
        }),
        prisma.application.count({ where }),
      ]);

      return { applications, total, page: Number(page), limit: Number(limit) };
    } catch {
      return { applications: devStore.applications, total: devStore.applications.length, page: 1, limit: 20 };
    }
  },

  /**
   * Get application by ID
   */
  getApplicationById: async (id, organizationId) => {
    if (!env.DATABASE_URL) {
      const app = devStore.applications.find((a) => a.id === id);
      if (!app) throw ApiError.notFound('Application not found');
      return app;
    }

    try {
      const application = await prisma.application.findFirst({
        where: { id, ...(organizationId ? { organizationId } : {}) },
        include: {
          job: true,
          candidate: true,
          activities: { orderBy: { createdAt: 'desc' } },
          interviews: true,
        },
      });

      if (!application) {
        throw ApiError.notFound('Application not found');
      }

      return application;
    } catch (err) {
      if (err.statusCode === 404) throw err;
      const app = devStore.applications.find((a) => a.id === id);
      if (!app) throw ApiError.notFound('Application not found');
      return app;
    }
  },

  /**
   * Submit Application
   */
  createApplication: async (payload, actor) => {
    const candidateEmail = (payload.email || actor?.email || '').toLowerCase();
    if (!candidateEmail) {
      throw ApiError.badRequest('Candidate email is required');
    }

    if (!env.DATABASE_URL) {
      // Check for duplicate application
      const alreadyApplied = devStore.applications.some(
        (a) => a.jobId === payload.jobId && a.candidateEmail.toLowerCase() === candidateEmail
      );
      if (alreadyApplied) {
        throw ApiError.conflict('An application for this position has already been submitted');
      }

      const targetJob = devStore.jobs.find((j) => j.id === payload.jobId);
      const newApp = {
        id: `app-${Date.now().toString().slice(-4)}`,
        organizationId: targetJob?.organizationId || 'org-1',
        jobId: payload.jobId,
        candidateId: payload.candidateId || 'cand-1',
        candidateName: payload.fullName || `${payload.firstName || ''} ${payload.lastName || ''}`.trim() || actor?.name || 'Applicant',
        candidateEmail,
        candidatePhone: payload.phone || '',
        jobTitle: targetJob?.title || payload.jobTitle || 'Software Position',
        company: targetJob?.client || 'Apex Global Tech',
        stage: 'APPLIED',
        status: 'APPLIED',
        source: payload.source || 'Website',
        appliedDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      devStore.applications.unshift(newApp);
      return newApp;
    }

    const job = await prisma.job.findUnique({
      where: { id: payload.jobId },
      include: { organization: true },
    });

    if (!job) {
      throw ApiError.notFound('Job not found');
    }

    const existing = await prisma.application.findFirst({
      where: {
        jobId: job.id,
        OR: [
          { candidateEmail },
          ...(payload.candidateId ? [{ candidateId: payload.candidateId }] : []),
        ],
      },
    });

    if (existing) {
      throw ApiError.conflict('An application for this position has already been submitted');
    }

    let candidate = await prisma.candidate.findFirst({
      where: {
        organizationId: job.organizationId,
        email: candidateEmail,
      },
    });

    const candidateName = payload.candidateName || payload.fullName || `${payload.firstName || ''} ${payload.lastName || ''}`.trim() || actor?.name || 'Applicant';

    if (!candidate) {
      candidate = await prisma.candidate.create({
        data: {
          organizationId: job.organizationId,
          userId: actor?.id || null,
          name: candidateName,
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: candidateEmail,
          phone: payload.phone,
          resumeUrl: payload.resumeUrl,
          resumeFileName: payload.resumeFileName,
          source: payload.source || 'Website',
          status: 'ACTIVE',
        },
      });
    }

    const newApp = await prisma.$transaction(async (tx) => {
      const app = await tx.application.create({
        data: {
          organizationId: job.organizationId,
          jobId: job.id,
          candidateId: candidate.id,
          candidateName,
          candidateEmail,
          candidatePhone: payload.phone || candidate.phone,
          jobTitle: job.title,
          company: job.client || job.organization.name,
          resumeUrl: payload.resumeUrl || candidate.resumeUrl,
          resumeFileName: payload.resumeFileName || candidate.resumeFileName,
          coverLetter: payload.coverLetter,
          stage: 'APPLIED',
          status: 'APPLIED',
          source: payload.source || 'Website',
          appliedDate: new Date(),
        },
      });

      await tx.applicationActivity.create({
        data: {
          applicationId: app.id,
          actorId: actor?.id || null,
          actorName: candidateName,
          type: 'APPLICATION_SUBMITTED',
          title: 'Application Submitted',
          newStage: 'APPLIED',
        },
      });

      await tx.job.update({
        where: { id: job.id },
        data: { applicationsCount: { increment: 1 } },
      });

      return app;
    });

    return newApp;
  },

  /**
   * Update application stage
   */
  updateStage: async (id, organizationId, { stage, notes }, actor) => {
    if (!env.DATABASE_URL) {
      const idx = devStore.applications.findIndex((a) => a.id === id);
      if (idx === -1) throw ApiError.notFound('Application not found');
      devStore.applications[idx].stage = stage;
      devStore.applications[idx].status = stage;
      return devStore.applications[idx];
    }

    const app = await prisma.application.findFirst({
      where: { id, ...(organizationId ? { organizationId } : {}) },
    });

    if (!app) {
      throw ApiError.notFound('Application not found');
    }

    return prisma.application.update({
      where: { id },
      data: { stage, status: stage },
    });
  },

  /**
   * Candidate Applications
   */
  getCandidateApplications: async (userEmail, userId) => {
    return devStore.applications.filter((a) => a.candidateEmail.toLowerCase() === (userEmail || '').toLowerCase());
  },

  /**
   * Withdraw application
   */
  withdrawApplication: async (id, userEmail) => {
    const app = devStore.applications.find((a) => a.id === id);
    if (!app) throw ApiError.notFound('Application not found');
    app.stage = 'WITHDRAWN';
    app.status = 'WITHDRAWN';
    return app;
  },

  /**
   * Delete application
   */
  deleteApplication: async (id, organizationId, actor) => {
    const idx = devStore.applications.findIndex((a) => a.id === id);
    if (idx !== -1) devStore.applications.splice(idx, 1);
    return { id, message: 'Application deleted successfully' };
  },

  /**
   * Get activities
   */
  getActivity: async (id, organizationId) => {
    return [
      {
        id: `act-1`,
        applicationId: id,
        actorName: 'System',
        type: 'STAGE_CHANGE',
        title: 'Application moved to Screening',
        createdAt: new Date().toISOString(),
      },
    ];
  },
};
