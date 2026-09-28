import { adminService } from '../services/admin.service.js';
import { auditService } from '../services/audit.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const adminController = {
  /**
   * Get Platform Overview Metrics
   */
  getMetrics: async (req, res, next) => {
    try {
      const metrics = await adminService.getAdminMetrics();
      return ApiResponse.success(res, 200, 'Admin metrics fetched', metrics);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all organizations
   */
  getOrganizations: async (req, res, next) => {
    try {
      const { organizations, total } = await adminService.getOrganizations(req.query);
      return ApiResponse.success(res, 200, 'Organizations fetched', organizations);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all users
   */
  getUsers: async (req, res, next) => {
    try {
      const { users, total } = await adminService.getUsers(req.query);
      return ApiResponse.success(res, 200, 'Users fetched', users);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get publication queue
   */
  getPublicationQueue: async (req, res, next) => {
    try {
      const queue = await adminService.getPublicationQueue(req.query);
      return ApiResponse.success(res, 200, 'Publication queue fetched', queue);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update publication status
   */
  updatePublicationStatus: async (req, res, next) => {
    try {
      const updated = await adminService.updatePublicationStatus(
        req.params.id,
        req.body,
        req.user
      );
      return ApiResponse.success(res, 200, 'Publication queue item updated', updated);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get audit logs
   */
  getAuditLogs: async (req, res, next) => {
    try {
      const { logs, total } = await auditService.getAllLogs(req.query);
      return ApiResponse.success(res, 200, 'Audit logs retrieved', logs);
    } catch (error) {
      next(error);
    }
  },
};
