import { InterviewModel } from "../Model/Interview.js";
import { NotificationModel } from "../Model/Notification.js";

/**
 * Controller for Scheduling and Managing Candidate Interviews
 */
export const interviewController = {
  // Get all interviews
  getAllInterviews: async (req, res, next) => {
    try {
      const filters = {
        status: req.query.status,
        search: req.query.search,
      };

      const interviews = await InterviewModel.getAll(filters);

      res.status(200).json({
        success: true,
        data: interviews,
        message: "Interviews retrieved successfully.",
      });
    } catch (error) {
      next(error);
    }
  },

  // Get interview by ID
  getInterviewById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const interview = await InterviewModel.getById(id);

      if (!interview) {
        return res.status(404).json({
          success: false,
          error: { code: "NOT_FOUND", message: "Interview not found." },
        });
      }

      res.status(200).json({
        success: true,
        data: interview,
        message: "Interview retrieved.",
      });
    } catch (error) {
      next(error);
    }
  },

  // Schedule an interview
  scheduleInterview: async (req, res, next) => {
    try {
      const data = req.body;
      const newInterview = await InterviewModel.create(data);

      // Notify candidate about interview
      if (newInterview.candidateId) {
        await NotificationModel.createCandidateNotification({
          candidateId: newInterview.candidateId,
          title: "Interview Scheduled",
          message: `An interview for ${newInterview.jobTitle} has been scheduled for ${new Date(newInterview.scheduledDate).toLocaleString()}.`,
          type: "INTERVIEW",
        });
      }

      res.status(201).json({
        success: true,
        data: newInterview,
        message: "Interview scheduled successfully.",
      });
    } catch (error) {
      next(error);
    }
  },

  // Update interview (e.g. submit feedback, reschedule, cancel)
  updateInterview: async (req, res, next) => {
    try {
      const { id } = req.params;
      const updated = await InterviewModel.update(id, req.body);

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: { code: "NOT_FOUND", message: "Interview not found." },
        });
      }

      res.status(200).json({
        success: true,
        data: updated,
        message: "Interview updated successfully.",
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete interview
  deleteInterview: async (req, res, next) => {
    try {
      const { id } = req.params;
      const deleted = await InterviewModel.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: { code: "NOT_FOUND", message: "Interview not found." },
        });
      }

      res.status(200).json({
        success: true,
        data: { id },
        message: "Interview deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  },
};
