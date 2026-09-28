import { applicationService } from '../services/application.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const applicationController = {
  /**
   * Get applications list
   */
  getApplications: async (req, res, next) => {
    try {
      const orgId = req.organizationId;
      const { applications, total, page, limit } = await applicationService.getApplications(orgId, req.query);

      return ApiResponse.paginated(res, applications, { page, limit, total }, 'Applications fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get application by ID
   */
  getApplicationById: async (req, res, next) => {
    try {
      const app = await applicationService.getApplicationById(req.params.id, req.organizationId);
      return ApiResponse.success(res, 200, 'Application retrieved successfully', app);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create application (or apply to job)
   */
  createApplication: async (req, res, next) => {
    try {
      const jobId = req.params.jobId || req.body.jobId;
      const payload = {
        ...req.body,
        jobId,
      };

      const application = await applicationService.createApplication(payload, req.user);
      return ApiResponse.created(res, 'Application submitted successfully.', application);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update application stage
   */
  updateStage: async (req, res, next) => {
    try {
      const updated = await applicationService.updateStage(
        req.params.id,
        req.organizationId,
        req.body,
        req.user
      );
      return ApiResponse.success(res, 200, 'Application stage updated', updated);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get application activities
   */
  getActivity: async (req, res, next) => {
    try {
      const activities = await applicationService.getActivity(req.params.id, req.organizationId);
      return ApiResponse.success(res, 200, 'Application activity fetched', activities);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete application
   */
  deleteApplication: async (req, res, next) => {
    try {
      const result = await applicationService.deleteApplication(req.params.id, req.organizationId, req.user);
      return ApiResponse.success(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Candidate Portal: GET /api/candidates/applications
   */
  getCandidateApplications: async (req, res, next) => {
    try {
      const applications = await applicationService.getCandidateApplications(req.user.email, req.user.id);
      return ApiResponse.success(res, 200, 'Candidate applications fetched', applications);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Candidate Portal: Withdraw application
   */
  withdrawApplication: async (req, res, next) => {
    try {
      const updated = await applicationService.withdrawApplication(req.params.id, req.user.email);
      return ApiResponse.success(res, 200, 'Application withdrawn.', updated);
    } catch (error) {
      next(error);
    }
  },
};
