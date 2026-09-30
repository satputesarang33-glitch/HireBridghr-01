import { AdminModel } from "../Model/Admin.js";
import { UserModel } from "../Model/User.js";
import { JobModel } from "../Model/Job.js";

/**
 * Controller for Super Admin & Governance Operations
 */
export const adminController = {
  // Get all organizations
  getOrganizations: async (req, res, next) => {
    try {
      const orgs = await AdminModel.getOrganizations();
      res.status(200).json({
        success: true,
        data: orgs,
        message: "Organizations retrieved successfully.",
      });
    } catch (error) {
      next(error);
    }
  },

  // Get all users
  getUsers: async (req, res, next) => {
    try {
      const users = await UserModel.getAll();
      res.status(200).json({
        success: true,
        data: users,
        message: "Users retrieved successfully.",
      });
    } catch (error) {
      next(error);
    }
  },

  // Get Job Publications Queue
  getJobPublications: async (req, res, next) => {
    try {
      const pubs = await AdminModel.getJobPublications();
      res.status(200).json({
        success: true,
        data: pubs,
        message: "Job publication queue retrieved.",
      });
    } catch (error) {
      next(error);
    }
  },

  // Review & Update Job Publication (Approve / Reject)
  updateJobPublication: async (req, res, next) => {
    try {
      const { id } = req.params;
      const updated = await AdminModel.updateJobPublication(id, req.body);

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: { code: "NOT_FOUND", message: "Publication request not found." },
        });
      }

      // If status changed to PUBLISHED, also update the target job status!
      if (req.body.status === "PUBLISHED" && updated.jobId) {
        await JobModel.update(updated.jobId, {
          status: "PUBLISHED",
          publishedAt: new Date().toISOString(),
        });
      }

      res.status(200).json({
        success: true,
        data: updated,
        message: "Publication request updated.",
      });
    } catch (error) {
      next(error);
    }
  },

  // Get audit logs
  getAuditLogs: async (req, res, next) => {
    try {
      const logs = await AdminModel.getAuditLogs();
      res.status(200).json({
        success: true,
        data: logs,
        message: "Audit logs retrieved.",
      });
    } catch (error) {
      next(error);
    }
  },
};
