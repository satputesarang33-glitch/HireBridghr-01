import { organizationService } from '../services/organization.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const organizationController = {
  /**
   * Get current organization
   */
  getCurrent: async (req, res, next) => {
    try {
      const org = await organizationService.getCurrentOrganization(req.organizationId);
      return ApiResponse.success(res, 200, 'Organization details retrieved', org);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update organization
   */
  updateCurrent: async (req, res, next) => {
    try {
      const updated = await organizationService.updateOrganization(req.organizationId, req.body, req.user);
      return ApiResponse.success(res, 200, 'Organization updated successfully', updated);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get organization members
   */
  getMembers: async (req, res, next) => {
    try {
      const members = await organizationService.getMembers(req.organizationId);
      return ApiResponse.success(res, 200, 'Organization members retrieved', members);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Add member
   */
  addMember: async (req, res, next) => {
    try {
      const member = await organizationService.addMember(req.organizationId, req.body, req.user);
      return ApiResponse.created(res, 'Member added successfully', member);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Remove member
   */
  removeMember: async (req, res, next) => {
    try {
      const result = await organizationService.removeMember(req.organizationId, req.params.memberId, req.user);
      return ApiResponse.success(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create invitation
   */
  createInvitation: async (req, res, next) => {
    try {
      const result = await organizationService.createInvitation(req.organizationId, req.body, req.user);
      return ApiResponse.created(res, 'Invitation sent successfully', result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get invitations
   */
  getInvitations: async (req, res, next) => {
    try {
      const invitations = await organizationService.getInvitations(req.organizationId);
      return ApiResponse.success(res, 200, 'Invitations retrieved', invitations);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Resend invitation
   */
  resendInvitation: async (req, res, next) => {
    try {
      return ApiResponse.success(res, 200, 'Invitation resent successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete invitation
   */
  deleteInvitation: async (req, res, next) => {
    try {
      const result = await organizationService.deleteInvitation(req.organizationId, req.params.id, req.user);
      return ApiResponse.success(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  },
};
