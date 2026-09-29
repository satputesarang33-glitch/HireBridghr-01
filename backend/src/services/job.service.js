import { prisma } from '../lib/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { auditService } from './audit.service.js';
import { devStore } from '../lib/devStore.js';
import { env } from '../config/env.js';

export const normalizeWorkplaceType = (val) => {
  if (!val) return 'REMOTE';
  const upper = String(val).toUpperCase().replace(/[\s-]/g, '_');
  if (upper === 'ON_SITE' || upper === 'ONSITE') return 'ON_SITE';
  if (upper === 'HYBRID') return 'HYBRID';
  return 'REMOTE';
};

export const normalizeEmploymentType = (val) => {
  if (!val) return 'FULL_TIME';
  const upper = String(val).toUpperCase().replace(/[\s-]/g, '_');
  if (upper === 'PART_TIME') return 'PART_TIME';
  if (upper === 'CONTRACT') return 'CONTRACT';
  if (upper === 'INTERNSHIP') return 'INTERNSHIP';
  if (upper === 'TEMPORARY') return 'TEMPORARY';
  return 'FULL_TIME';
};

export const normalizeJobStatus = (val) => {
  if (!val) return 'DRAFT';
  const upper = String(val).toUpperCase();
  if (['DRAFT', 'PENDING_ADMIN_PUBLICATION', 'PROCESSING', 'PUBLISHED', 'CLOSED', 'ARCHIVED', 'FAILED', 'REJECTED'].includes(upper)) {
    return upper;
  }
  return 'DRAFT';
};

export const jobService = {
  /**
   * List jobs with organization scoping, searching, filtering, and pagination
   */
  getJobs: async (organizationId, filters = {}) => {
    if (!env.DATABASE_URL) {
      let list = [...devStore.jobs];
      if (organizationId) {
        list = list.filter((j) => j.organizationId === organizationId);
      }
      if (filters.status && filters.status !== 'ALL') {
        list = list.filter((j) => j.status === filters.status);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        list = list.filter((j) => j.title.toLowerCase().includes(q) || j.department?.toLowerCase().includes(q));
      }
      return { jobs: list, total: list.length, page: 1, limit: 20 };
    }

    const {
      page = 1,
      limit = 20,
      search,
      status,
      department,
      location,
      workplaceType,
      employmentType,
      isPublic,
    } = filters;

    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      ...(organizationId ? { organizationId } : {}),
      ...(status && status !== 'ALL' ? { status } : {}),
      ...(department && department !== 'ALL' ? { department: { contains: department, mode: 'insensitive' } } : {}),
      ...(location && location !== 'ALL' ? { location: { contains: location, mode: 'insensitive' } } : {}),
      ...(workplaceType && workplaceType !== 'ALL' ? { workplaceType } : {}),
      ...(employmentType && employmentType !== 'ALL' ? { employmentType } : {}),
      ...(isPublic !== undefined ? { isPublic: isPublic === 'true' || isPublic === true } : {}),
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { client: { contains: search, mode: 'insensitive' } },
      ];
    }

    try {
      const [jobs, total] = await Promise.all([
        prisma.job.findMany({
          where,
          include: {
            distributions: true,
            _count: {
              select: { applications: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit),
        }),
        prisma.job.count({ where }),
      ]);

      const formattedJobs = jobs.map((j) => ({
        ...j,
        applicationsCount: j._count?.applications || j.applicationsCount || 0,
      }));

      return { jobs: formattedJobs, total, page: Number(page), limit: Number(limit) };
    } catch {
      return { jobs: devStore.jobs, total: devStore.jobs.length, page: 1, limit: 20 };
    }
  },

  /**
   * Get single job by ID or slug with organization scope
   */
  getJobById: async (id, organizationId) => {
    if (!env.DATABASE_URL) {
      const job = devStore.jobs.find((j) => j.id === id || j.slug === id);
      if (!job) {
        throw ApiError.notFound('Job not found');
      }
      return job;
    }

    try {
      const job = await prisma.job.findFirst({
        where: {
          OR: [{ id }, { slug: id }],
          ...(organizationId ? { organizationId } : {}),
        },
        include: {
          distributions: true,
          organization: {
            select: { id: true, name: true, slug: true, website: true, city: true, country: true },
          },
          _count: {
            select: { applications: true },
          },
        },
      });

      if (!job) {
        throw ApiError.notFound('Job not found');
      }

      return {
        ...job,
        applicationsCount: job._count?.applications || job.applicationsCount || 0,
      };
    } catch (err) {
      if (err.statusCode === 404) throw err;
      const job = devStore.jobs.find((j) => j.id === id || j.slug === id);
      if (!job) throw ApiError.notFound('Job not found');
      return job;
    }
  },

  /**
   * Create a new job
   */
  createJob: async (organizationId, jobData, actor) => {
    const slug = (jobData.title || 'job')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .concat(`-${Date.now().toString().slice(-4)}`);

    const initialStatus = normalizeJobStatus(jobData.status || 'DRAFT');
    const isDirectlyPublished = initialStatus === 'PUBLISHED';
    const workplaceType = normalizeWorkplaceType(jobData.workplaceType);
    const employmentType = normalizeEmploymentType(jobData.employmentType);

    if (!env.DATABASE_URL) {
      const newJob = {
        id: `job-${Date.now().toString().slice(-4)}`,
        organizationId: organizationId || 'org-1',
        slug,
        ...jobData,
        workplaceType,
        employmentType,
        status: initialStatus,
        applicationsCount: 0,
        createdAt: new Date().toISOString(),
        publishedAt: isDirectlyPublished ? new Date().toISOString() : null,
      };
      devStore.jobs.unshift(newJob);
      return newJob;
    }

    const job = await prisma.job.create({
      data: {
        organizationId,
        slug,
        title: jobData.title,
        client: jobData.client || 'Internal',
        department: jobData.department,
        location: jobData.location,
        workplaceType,
        employmentType,
        experienceMin: jobData.experienceMin ? Number(jobData.experienceMin) : 0,
        experienceMax: jobData.experienceMax ? Number(jobData.experienceMax) : null,
        experienceLevel: jobData.experienceLevel,
        salaryMin: jobData.salaryMin ? Number(jobData.salaryMin) : null,
        salaryMax: jobData.salaryMax ? Number(jobData.salaryMax) : null,
        currency: jobData.currency || 'USD',
        skills: jobData.skills || [],
        description: jobData.description,
        responsibilities: Array.isArray(jobData.responsibilities) ? jobData.responsibilities.join('\n') : jobData.responsibilities,
        requirements: Array.isArray(jobData.requirements) ? jobData.requirements.join('\n') : jobData.requirements,
        status: initialStatus,
        recruiterId: actor.id,
        recruiterName: actor.name || 'Recruiter',
        contactPerson: jobData.contactPerson || actor.name,
        candidateEmail: jobData.candidateEmail || actor.email,
        isPublic: jobData.isPublic !== undefined ? jobData.isPublic : true,
        isResumeRequired: jobData.isResumeRequired !== undefined ? jobData.isResumeRequired : true,
        publishedAt: isDirectlyPublished ? new Date() : null,
        distributions: {
          create: [
            {
              platform: 'MANUAL',
              status: isDirectlyPublished ? 'PUBLISHED' : 'PENDING',
              publishedAt: isDirectlyPublished ? new Date() : null,
              externalJobId: isDirectlyPublished ? `HB-${Date.now().toString().slice(-6)}` : null,
            },
          ],
        },
      },
      include: {
        distributions: true,
      },
    });

    await auditService.log({
      organizationId,
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: 'JOB_CREATED',
      resourceType: 'JOB',
      resourceId: job.id,
      metadata: { title: job.title, status: job.status },
    });

    return job;
  },

  /**
   * Update an existing job
   */
  updateJob: async (id, organizationId, updateData, actor) => {
    if (!env.DATABASE_URL) {
      const idx = devStore.jobs.findIndex((j) => j.id === id);
      if (idx === -1) throw ApiError.notFound('Job not found in this organization');
      devStore.jobs[idx] = { ...devStore.jobs[idx], ...updateData };
      return devStore.jobs[idx];
    }

    const existing = await prisma.job.findFirst({
      where: {
        id,
        ...(organizationId ? { organizationId } : {}),
      },
    });

    if (!existing) {
      throw ApiError.notFound('Job not found in this organization');
    }

    const isPublishing = updateData.status === 'PUBLISHED' && existing.status !== 'PUBLISHED';
    const cleanedUpdates = { ...updateData };
    if (cleanedUpdates.workplaceType) {
      cleanedUpdates.workplaceType = normalizeWorkplaceType(cleanedUpdates.workplaceType);
    }
    if (cleanedUpdates.employmentType) {
      cleanedUpdates.employmentType = normalizeEmploymentType(cleanedUpdates.employmentType);
    }
    if (cleanedUpdates.status) {
      cleanedUpdates.status = normalizeJobStatus(cleanedUpdates.status);
    }
    if (Array.isArray(cleanedUpdates.responsibilities)) {
      cleanedUpdates.responsibilities = cleanedUpdates.responsibilities.join('\n');
    }
    if (Array.isArray(cleanedUpdates.requirements)) {
      cleanedUpdates.requirements = cleanedUpdates.requirements.join('\n');
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        ...cleanedUpdates,
        ...(isPublishing && { publishedAt: new Date() }),
      },
      include: {
        distributions: true,
      },
    });

    if (updateData.status === 'PENDING_ADMIN_PUBLICATION') {
      await prisma.jobDistribution.create({
        data: {
          jobId: id,
          platform: 'MANUAL',
          status: 'PENDING',
          internalNotes: 'Publication requested from Job Edit',
        },
      });
    }

    await auditService.log({
      organizationId,
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: 'JOB_UPDATED',
      resourceType: 'JOB',
      resourceId: id,
      metadata: updateData,
    });

    return updatedJob;
  },

  /**
   * Delete a job
   */
  deleteJob: async (id, organizationId, actor) => {
    if (!env.DATABASE_URL) {
      const idx = devStore.jobs.findIndex((j) => j.id === id);
      if (idx === -1) throw ApiError.notFound('Job not found');
      devStore.jobs.splice(idx, 1);
      return { id, message: 'Job deleted successfully' };
    }

    const existing = await prisma.job.findFirst({
      where: {
        id,
        ...(organizationId ? { organizationId } : {}),
      },
    });

    if (!existing) {
      throw ApiError.notFound('Job not found');
    }

    await prisma.job.delete({
      where: { id },
    });

    await auditService.log({
      organizationId,
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: 'JOB_DELETED',
      resourceType: 'JOB',
      resourceId: id,
      metadata: { title: existing.title },
    });

    return { id, message: 'Job deleted successfully' };
  },

  /**
   * Submit Job for Admin Publication Review
   */
  submitForPublication: async (id, organizationId, actor) => {
    return jobService.updateJob(id, organizationId, { status: 'PENDING_ADMIN_PUBLICATION' }, actor);
  },

  /**
   * Close a job
   */
  closeJob: async (id, organizationId, actor) => {
    return jobService.updateJob(id, organizationId, { status: 'CLOSED' }, actor);
  },

  /**
   * Reopen a job
   */
  reopenJob: async (id, organizationId, actor) => {
    return jobService.updateJob(id, organizationId, { status: 'PUBLISHED' }, actor);
  },

  /**
   * Candidate Saved Jobs Support
   */
  saveJob: async (jobId, userId) => {
    // Keep devStore updated
    if (!devStore.savedJobs.find((s) => s.userId === userId && s.jobId === jobId)) {
      devStore.savedJobs.push({ userId, jobId });
    }

    if (env.DATABASE_URL) {
      try {
        // Resolve job ID if passed a slug
        const targetJob = await prisma.job.findFirst({
          where: { OR: [{ id: jobId }, { slug: jobId }] },
          select: { id: true },
        });
        const resolvedId = targetJob ? targetJob.id : jobId;
        await prisma.savedJob.upsert({
          where: { userId_jobId: { userId, jobId: resolvedId } },
          create: { userId, jobId: resolvedId },
          update: {},
        });
      } catch (e) {
        // Fallback to devStore already done
      }
    }
    return { message: 'Job saved to favorites' };
  },

  unsaveJob: async (jobId, userId) => {
    devStore.savedJobs = devStore.savedJobs.filter((s) => !(s.userId === userId && s.jobId === jobId));

    if (env.DATABASE_URL) {
      try {
        const targetJob = await prisma.job.findFirst({
          where: { OR: [{ id: jobId }, { slug: jobId }] },
          select: { id: true },
        });
        const resolvedId = targetJob ? targetJob.id : jobId;
        await prisma.savedJob.deleteMany({
          where: { userId, jobId: resolvedId },
        });
      } catch (e) {
        // Fallback to devStore already done
      }
    }
    return { message: 'Job removed from saved list' };
  },

  getSavedJobs: async (userId) => {
    let savedIds = devStore.savedJobs.filter((s) => s.userId === userId).map((s) => s.jobId);
    let jobs = [];

    if (env.DATABASE_URL) {
      try {
        const dbSaved = await prisma.savedJob.findMany({
          where: { userId },
          include: {
            job: {
              include: {
                organization: { select: { id: true, name: true, slug: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });

        const dbJobs = dbSaved.map((s) => s.job).filter(Boolean);
        const dbIds = dbSaved.map((s) => s.jobId);
        savedIds = Array.from(new Set([...savedIds, ...dbIds]));
        jobs = dbJobs;
      } catch (e) {
        // Ignore DB error, proceed to devStore
      }
    }

    // Merge devStore jobs if not already included
    const devJobs = devStore.jobs.filter(
      (j) => savedIds.includes(j.id) && !jobs.some((existing) => existing.id === j.id)
    );
    jobs = [...jobs, ...devJobs];

    // If there are still savedIds that don't have job records loaded, query prisma.job
    const missingIds = savedIds.filter((id) => !jobs.some((j) => j.id === id || j.slug === id));
    if (missingIds.length > 0 && env.DATABASE_URL) {
      try {
        const extraJobs = await prisma.job.findMany({
          where: { id: { in: missingIds } },
        });
        jobs = [...jobs, ...extraJobs];
      } catch (e) {}
    }

    return { jobs, savedIds };
  },
};
