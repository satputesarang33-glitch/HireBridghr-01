import { interviewService } from '../services/interview.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const interviewController = {
  /**
   * Get interviews list
   */
  getInterviews: async (req, res, next) => {
    try {
      const orgId = req.organizationId;
      const { interviews, total, page, limit } = await interviewService.getInterviews(orgId, req.query);

      return ApiResponse.paginated(res, interviews, { page, limit, total }, 'Interviews retrieved');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get single interview by ID
   */
  getInterviewById: async (req, res, next) => {
    try {
      const interview = await interviewService.getInterviewById(req.params.id, req.organizationId);
      return ApiResponse.success(res, 200, 'Interview retrieved successfully', interview);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Schedule interview
   */
  scheduleInterview: async (req, res, next) => {
    try {
      const interview = await interviewService.scheduleInterview(req.organizationId, req.body, req.user);
      return ApiResponse.created(res, 'Interview scheduled successfully', interview);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update interview
   */
  updateInterview: async (req, res, next) => {
    try {
      const interview = await interviewService.updateInterview(req.params.id, req.organizationId, req.body, req.user);
      return ApiResponse.success(res, 200, 'Interview updated', interview);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Submit interview feedback
   */
  submitFeedback: async (req, res, next) => {
    try {
      const interview = await interviewService.submitFeedback(req.params.id, req.organizationId, req.body, req.user);
      return ApiResponse.success(res, 200, 'Feedback submitted successfully', interview);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Cancel interview
   */
  cancelInterview: async (req, res, next) => {
    try {
      const interview = await interviewService.cancelInterview(req.params.id, req.organizationId, req.user);
      return ApiResponse.success(res, 200, 'Interview cancelled', interview);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete interview
   */
  deleteInterview: async (req, res, next) => {
    try {
      const result = await interviewService.deleteInterview(req.params.id, req.organizationId, req.user);
      return ApiResponse.success(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  },
};
