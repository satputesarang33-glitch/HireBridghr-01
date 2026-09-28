import { jobService } from '../services/job.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const jobController = {
  /**
   * List jobs
   */
  getJobs: async (req, res, next) => {
    try {
      const orgId = req.organizationId;
      const { jobs, total, page, limit } = await jobService.getJobs(orgId, req.query);

      return ApiResponse.paginated(res, jobs, { page, limit, total }, 'Jobs fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get single job
   */
  getJobById: async (req, res, next) => {
    try {
      const job = await jobService.getJobById(req.params.id, req.organizationId);
      return ApiResponse.success(res, 200, 'Job retrieved successfully', job);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create job
   */
  createJob: async (req, res, next) => {
    try {
      const job = await jobService.createJob(req.organizationId, req.body, req.user);
      return ApiResponse.created(res, 'Job created successfully', job);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update job
   */
  updateJob: async (req, res, next) => {
    try {
      const job = await jobService.updateJob(req.params.id, req.organizationId, req.body, req.user);
      return ApiResponse.success(res, 200, 'Job updated successfully', job);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete job
   */
  deleteJob: async (req, res, next) => {
    try {
      const result = await jobService.deleteJob(req.params.id, req.organizationId, req.user);
      return ApiResponse.success(res, 200, result.message, { id: result.id });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Submit job for publication review
   */
  submitPublication: async (req, res, next) => {
    try {
      const job = await jobService.submitForPublication(req.params.id, req.organizationId, req.user);
      return ApiResponse.success(res, 200, 'Job submitted for publication review', job);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Close job
   */
  closeJob: async (req, res, next) => {
    try {
      const result = await jobService.closeJob(req.params.id, req.organizationId, req.user);
      return ApiResponse.success(res, 200, result.message, result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Reopen job
   */
  reopenJob: async (req, res, next) => {
    try {
      const result = await jobService.reopenJob(req.params.id, req.organizationId, req.user);
      return ApiResponse.success(res, 200, result.message, result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Save job for candidate
   */
  saveJob: async (req, res, next) => {
    try {
      const result = await jobService.saveJob(req.params.id, req.user.id);
      return ApiResponse.success(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Remove job from saved list
   */
  unsaveJob: async (req, res, next) => {
    try {
      const result = await jobService.unsaveJob(req.params.id, req.user.id);
      return ApiResponse.success(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get saved jobs for candidate
   */
  getSavedJobs: async (req, res, next) => {
    try {
      const { jobs, savedIds } = await jobService.getSavedJobs(req.user.id);
      return res.status(200).json({
        success: true,
        message: 'Saved jobs fetched',
        data: jobs,
        savedIds,
      });
    } catch (error) {
      next(error);
    }
  },
};
