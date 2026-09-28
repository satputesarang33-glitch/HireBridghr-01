import { reportService } from '../services/report.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const reportController = {
  /**
   * Get analytics overview
   */
  getOverview: async (req, res, next) => {
    try {
      const overview = await reportService.getAnalyticsOverview(req.organizationId);
      return ApiResponse.success(res, 200, 'Analytics overview retrieved', overview);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get funnel report
   */
  getFunnel: async (req, res, next) => {
    try {
      const funnel = await reportService.getFunnelReport(req.organizationId);
      return ApiResponse.success(res, 200, 'Funnel report retrieved', funnel);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get sources report
   */
  getSources: async (req, res, next) => {
    try {
      const sources = await reportService.getSourcesReport(req.organizationId);
      return ApiResponse.success(res, 200, 'Sources report retrieved', sources);
    } catch (error) {
      next(error);
    }
  },
};
