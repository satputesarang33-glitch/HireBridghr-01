import { JobModel } from "../Model/Job.js";
import { ApplicationModel } from "../Model/Application.js";
import { NotificationModel } from "../Model/Notification.js";
import { UserModel } from "../Model/User.js";
import { AdminModel } from "../Model/Admin.js";

/**
 * Controller for managing Job Openings
 */
export const jobController = {
  // Get all jobs (with search, department, status filters)
  getAllJobs: async (req, res, next) => {
    try {
      const filters = {
        search: req.query.search,
        status: req.query.status,
        department: req.query.department,
        workplaceType: req.query.workplaceType,
      };

      const jobs = await JobModel.getAll(filters);
      res.status(200).json({
        success: true,
        data: jobs,
        message: "Jobs retrieved successfully.",
      });
    } catch (error) {
      next(error);
    }
  },

  // Get job by ID or slug
  getJobById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const job = await JobModel.getByIdOrSlug(id);

      if (!job) {
        return res.status(404).json({
          success: false,
          error: { code: "NOT_FOUND", message: "Job not found." },
        });
      }

      res.status(200).json({
        success: true,
        data: job,
        message: "Job details retrieved.",
      });
    } catch (error) {
      next(error);
    }
  },

  // Create a new job
  createJob: async (req, res, next) => {
    try {
      const jobData = req.body;
      if (!jobData.title) {
        return res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Job title is required." },
        });
      }

      const newJob = await JobModel.create(jobData);

      // If published or pending publication, add to Admin Publications queue
      if (newJob.status === "PUBLISHED" || jobData.status === "PENDING_ADMIN_PUBLICATION") {
        await AdminModel.addPublicationRequest({
          jobId: newJob.id,
          jobTitle: newJob.title,
          organizationName: newJob.client || "Apex Global Tech",
          requestedBy: newJob.recruiterName || "Recruiter",
          status: newJob.status === "PUBLISHED" ? "PUBLISHED" : "PENDING",
        });
      }

      res.status(201).json({
        success: true,
        data: newJob,
        message: "Job created successfully.",
      });
    } catch (error) {
      next(error);
    }
  },

  // Update existing job
  updateJob: async (req, res, next) => {
    try {
      const { id } = req.params;
      const updatedJob = await JobModel.update(id, req.body);

      if (!updatedJob) {
        return res.status(404).json({
          success: false,
          error: { code: "NOT_FOUND", message: "Job not found." },
        });
      }

      // If status changed to PENDING_ADMIN_PUBLICATION, record in publication queue
      if (req.body.status === "PENDING_ADMIN_PUBLICATION") {
        await AdminModel.addPublicationRequest({
          jobId: updatedJob.id,
          jobTitle: updatedJob.title,
          organizationName: updatedJob.client || "Apex Global Tech",
          requestedBy: updatedJob.recruiterName || "Recruiter",
          status: "PENDING",
        });
      }

      res.status(200).json({
        success: true,
        data: updatedJob,
        message: "Job updated successfully.",
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete a job
  deleteJob: async (req, res, next) => {
    try {
      const { id } = req.params;
      const deleted = await JobModel.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: { code: "NOT_FOUND", message: "Job not found." },
        });
      }

      res.status(200).json({
        success: true,
        data: { id },
        message: "Job deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  },

  // Save job for logged-in candidate
  saveJob: async (req, res, next) => {
    try {
      const { id: jobId } = req.params;
      const userId = req.user?.uid || "usr-cand-1";

      await UserModel.addSavedJob(userId, jobId);

      res.status(200).json({
        success: true,
        data: { jobId },
        message: "Job saved to favorites.",
      });
    } catch (error) {
      next(error);
    }
  },

  // Remove saved job
  unsaveJob: async (req, res, next) => {
    try {
      const { id: jobId } = req.params;
      const userId = req.user?.uid || "usr-cand-1";

      await UserModel.removeSavedJob(userId, jobId);

      res.status(200).json({
        success: true,
        data: { jobId },
        message: "Job removed from saved list.",
      });
    } catch (error) {
      next(error);
    }
  },

  // Candidate apply to job (with duplicate check)
  applyToJob: async (req, res, next) => {
    try {
      const { id: jobId } = req.params;
      const payload = req.body;
      const candidateId = req.user?.uid || payload.candidateId || "usr-cand-1";
      const candidateEmail = (payload.email || payload.candidateEmail || "").toLowerCase();

      // Check if job exists
      const targetJob = await JobModel.getByIdOrSlug(jobId);

      // Check for duplicate application
      const isDuplicate = await ApplicationModel.checkDuplicate(jobId, candidateId, candidateEmail);
      if (isDuplicate) {
        return res.status(409).json({
          success: false,
          error: {
            code: "ALREADY_APPLIED",
            message: "You have already submitted an application for this position.",
          },
        });
      }

      // Create application
      const newApp = await ApplicationModel.create({
        jobId,
        jobTitle: targetJob?.title || payload.jobTitle || "Role Application",
        company: targetJob?.client || "Apex Global Tech",
        candidateId,
        candidateName:
          payload.fullName ||
          `${payload.firstName || ""} ${payload.lastName || ""}`.trim() ||
          "Candidate",
        candidateEmail,
        candidatePhone: payload.phone || "",
        resumeUrl: payload.resumeUrl || null,
        resumeFileName: payload.resumeFileName || "Resume.pdf",
        coverLetter: payload.coverLetter || "",
        portfolioUrl: payload.portfolioUrl || "",
        linkedinUrl: payload.linkedinUrl || "",
        githubUrl: payload.githubUrl || "",
        stage: "APPLIED",
        status: "APPLIED",
      });

      // Increment job application counter
      if (targetJob) {
        await JobModel.incrementApplicationsCount(targetJob.id);
      }

      // Create notification for candidate
      await NotificationModel.createCandidateNotification({
        candidateId,
        jobId,
        title: "Application Submitted",
        message: `Your application for ${targetJob?.title || "the position"} at ${targetJob?.client || "Apex Global Tech"} has been successfully delivered.`,
        type: "APPLIED",
      });

      res.status(201).json({
        success: true,
        data: newApp,
        message: "Application submitted successfully.",
      });
    } catch (error) {
      next(error);
    }
  },
};
