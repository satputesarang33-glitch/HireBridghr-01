import { prisma } from '../lib/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { devStore } from '../lib/devStore.js';
import { env } from '../config/env.js';

export const adminService = {
  /**
   * Get Platform Administrative Metrics
   */
  getAdminMetrics: async () => {
    if (!env.DATABASE_URL) {
      return {
        totalOrganizations: devStore.organizations.length,
        activeOrganizations: devStore.organizations.filter((o) => o.status === 'ACTIVE').length,
        totalUsers: devStore.users.length,
        totalJobs: devStore.jobs.length,
        pendingPublications: devStore.jobs.filter((j) => j.status === 'PENDING_ADMIN_PUBLICATION').length,
        totalApplications: devStore.applications.length,
        totalHires: devStore.applications.filter((a) => a.stage === 'HIRED').length,
      };
    }

    try {
      const [
        totalOrganizations,
        activeOrganizations,
        totalUsers,
        totalJobs,
        pendingPublications,
        totalApplications,
        totalHires,
      ] = await Promise.all([
        prisma.organization.count(),
        prisma.organization.count({ where: { status: 'ACTIVE' } }),
        prisma.user.count(),
        prisma.job.count(),
        prisma.jobDistribution.count({ where: { status: 'PENDING' } }),
        prisma.application.count(),
        prisma.application.count({ where: { stage: 'HIRED' } }),
      ]);

      return {
        totalOrganizations,
        activeOrganizations,
        totalUsers,
        totalJobs,
        pendingPublications,
        totalApplications,
        totalHires,
      };
    } catch {
      return {
        totalOrganizations: devStore.organizations.length,
        activeOrganizations: devStore.organizations.filter((o) => o.status === 'ACTIVE').length,
        totalUsers: devStore.users.length,
        totalJobs: devStore.jobs.length,
        pendingPublications: devStore.jobs.filter((j) => j.status === 'PENDING_ADMIN_PUBLICATION').length,
        totalApplications: devStore.applications.length,
        totalHires: devStore.applications.filter((a) => a.stage === 'HIRED').length,
      };
    }
  },

  /**
   * Get all organizations
   */
  getOrganizations: async ({ page = 1, limit = 50 }) => {
    if (!env.DATABASE_URL) {
      return { organizations: devStore.organizations, total: devStore.organizations.length };
    }

    try {
      const skip = (Number(page) - 1) * Number(limit);
      const [organizations, total] = await Promise.all([
        prisma.organization.findMany({
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit),
        }),
        prisma.organization.count(),
      ]);
      return { organizations, total };
    } catch {
      return { organizations: devStore.organizations, total: devStore.organizations.length };
    }
  },

  /**
   * Get all users
   */
  getUsers: async ({ page = 1, limit = 50 }) => {
    if (!env.DATABASE_URL) {
      return { users: devStore.users, total: devStore.users.length };
    }

    try {
      const skip = (Number(page) - 1) * Number(limit);
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            jobTitle: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit),
        }),
        prisma.user.count(),
      ]);
      return { users, total };
    } catch {
      return { users: devStore.users, total: devStore.users.length };
    }
  },

  /**
   * Get Publication Review Queue
   */
  getPublicationQueue: async ({ status }) => {
    const queue = devStore.jobs
      .filter((j) => j.status === 'PENDING_ADMIN_PUBLICATION' || (status && j.status === status))
      .map((j) => ({
        id: `pub-${j.id}`,
        jobId: j.id,
        jobTitle: j.title,
        organizationName: 'Apex Global Tech',
        requestedBy: j.recruiterName || 'Recruiter',
        requestedDate: j.createdAt,
        targetPlatform: 'MANUAL',
        status: j.status === 'PUBLISHED' ? 'PUBLISHED' : 'PENDING',
        internalNotes: 'Awaiting admin review',
      }));

    return queue;
  },

  /**
   * Update publication status
   */
  updatePublicationStatus: async (pubId, { status, internalNotes }, actor) => {
    const jobId = pubId.replace('pub-', '');
    const job = devStore.jobs.find((j) => j.id === jobId);
    if (job) {
      job.status = status;
      if (status === 'PUBLISHED') job.publishedAt = new Date().toISOString();
    }
    return { id: pubId, status, internalNotes };
  },
};
