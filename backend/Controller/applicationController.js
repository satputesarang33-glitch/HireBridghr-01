import { ApplicationModel } from "../Model/Application.js";
import { NotificationModel } from "../Model/Notification.js";
import { emailService } from "../Services/emailService.js";
import { notificationStreamService } from "../Services/notificationStreamService.js";

/**
 * Controller for Job Applications management
 */
export const applicationController = {
  // Get all applications
  getAllApplications: async (req, res, next) => {
    try {
      const filters = {
        jobId: req.query.jobId,
        stage: req.query.stage,
        candidateId: req.query.candidateId,
      };

      const applications = await ApplicationModel.getAll(filters);

      res.status(200).json({
        success: true,
        data: applications,
        message: "Applications retrieved successfully.",
      });
    } catch (error) {
      next(error);
    }
  },

  // Get application by ID
  getApplicationById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const application = await ApplicationModel.getById(id);

      if (!application) {
        return res.status(404).json({
          success: false,
          error: { code: "NOT_FOUND", message: "Application not found." },
        });
      }

      res.status(200).json({
        success: true,
        data: application,
        message: "Application retrieved.",
      });
    } catch (error) {
      next(error);
    }
  },

  // Create application
  createApplication: async (req, res, next) => {
    try {
      const data = req.body;
      const newApp = await ApplicationModel.create(data);

      // Dispatch confirmation email
      if (newApp.candidateEmail) {
        try {
          await emailService.sendApplicationConfirmation({
            candidateEmail: newApp.candidateEmail,
            candidateName: newApp.candidateName || "Candidate",
            jobTitle: newApp.jobTitle || "Open Role",
            companyName: newApp.company || "Apex Global Tech",
          });
        } catch (emailErr) {
          console.warn("⚠️ Non-blocking email dispatch warning:", emailErr.message);
        }
      }

      // Broadcast live SSE event to recruiters
      notificationStreamService.broadcast("APPLICATION_RECEIVED", newApp);

      res.status(201).json({
        success: true,
        data: newApp,
        message: "Application created successfully.",
      });
    } catch (error) {
      next(error);
    }
  },

  // Update application (e.g. stage change)
  updateApplication: async (req, res, next) => {
    try {
      const { id } = req.params;
      const updated = await ApplicationModel.update(id, req.body);

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: { code: "NOT_FOUND", message: "Application not found." },
        });
      }

      // If stage changed, notify candidate
      if (req.body.stage) {
        await NotificationModel.createCandidateNotification({
          candidateId: updated.candidateId,
          title: "Application Status Updated",
          message: `Your application status for ${updated.jobTitle} has been updated to "${req.body.stage}".`,
          type: "STAGE_CHANGE",
        });

        // Broadcast live SSE
        notificationStreamService.broadcast("APPLICATION_STAGE_CHANGED", {
          id,
          stage: req.body.stage,
          candidateName: updated.candidateName,
          jobTitle: updated.jobTitle,
        });
      }

      res.status(200).json({
        success: true,
        data: updated,
        message: "Application updated successfully.",
      });
    } catch (error) {
      next(error);
    }
  },

  // Candidate withdraw application
  withdrawApplication: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Ownership / IDOR verification
      const existing = await ApplicationModel.getById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: { code: "NOT_FOUND", message: "Application not found." },
        });
      }

      if (req.user) {
        const isOwner =
          req.user.uid === existing.candidateId ||
          (existing.candidateEmail &&
            req.user.email?.toLowerCase() === existing.candidateEmail.toLowerCase());
        const isStaff = [
          "RECRUITER",
          "ADMIN",
          "SUPER_ADMIN",
          "OWNER",
        ].includes((req.user.role || "").toUpperCase());

        if (!isOwner && !isStaff) {
          return res.status(403).json({
            success: false,
            error: {
              code: "FORBIDDEN",
              message: "Access denied. You can only withdraw your own applications.",
            },
          });
        }
      }

      const withdrawn = await ApplicationModel.withdraw(id);

      if (!withdrawn) {
        return res.status(404).json({
          success: false,
          error: { code: "NOT_FOUND", message: "Application not found." },
        });
      }

      res.status(200).json({
        success: true,
        data: withdrawn,
        message: "Application withdrawn successfully.",
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete application
  deleteApplication: async (req, res, next) => {
    try {
      const { id } = req.params;
      const deleted = await ApplicationModel.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: { code: "NOT_FOUND", message: "Application not found." },
        });
      }

      res.status(200).json({
        success: true,
        data: { id },
        message: "Application deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  },
};
