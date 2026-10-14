import { InterviewModel } from "../Model/Interview.js";
import { NotificationModel } from "../Model/Notification.js";
import { calendarService } from "../Services/calendarService.js";
import { emailService } from "../Services/emailService.js";
import { notificationStreamService } from "../Services/notificationStreamService.js";

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

  // Schedule an interview (Auto-generates meeting link & sends .ics calendar email)
  scheduleInterview: async (req, res, next) => {
    try {
      const data = { ...req.body };

      // Generate meeting URL if none provided
      if (!data.meetingLink && !data.meetingUrl) {
        data.meetingLink = calendarService.generateMeetingUrl("google_meet");
      }

      const newInterview = await InterviewModel.create(data);

      // Notify candidate in-app
      if (newInterview.candidateId) {
        await NotificationModel.createCandidateNotification({
          candidateId: newInterview.candidateId,
          title: "Interview Scheduled",
          message: `An interview for ${newInterview.jobTitle} has been scheduled for ${new Date(newInterview.scheduledDate).toLocaleString()}.`,
          type: "INTERVIEW",
        });
      }

      // Send transactional invitation email with .ics attachment
      if (data.candidateEmail) {
        try {
          await emailService.sendInterviewInvitation({
            candidateEmail: data.candidateEmail,
            candidateName: data.candidateName || "Candidate",
            jobTitle: data.jobTitle || "Open Role",
            scheduledDate: data.scheduledDate,
            interviewType: data.type || "Technical Interview",
            interviewerName: data.interviewerName || "Hiring Manager",
            meetingUrl: data.meetingLink,
          });
        } catch (emailErr) {
          console.warn(
            "⚠️ Non-blocking email dispatch error:",
            emailErr.message,
          );
        }
      }

      // Broadcast real-time SSE event
      notificationStreamService.broadcast("INTERVIEW_SCHEDULED", newInterview);

      res.status(201).json({
        success: true,
        data: newInterview,
        message:
          "Interview scheduled successfully and calendar invitation generated.",
      });
    } catch (error) {
      next(error);
    }
  },

  // Submit structured scorecard
  submitScorecard: async (req, res, next) => {
    try {
      const { id } = req.params;
      const {
        technicalRating = 4,
        problemSolvingRating = 4,
        cultureFitRating = 5,
        communicationRating = 4,
        recommendation = "YES", // STRONG_YES, YES, NEUTRAL, NO, STRONG_NO
        notes = "",
        interviewerName = "Elena Rostova",
      } = req.body;

      const overallRating = Number(
        (
          (technicalRating +
            problemSolvingRating +
            cultureFitRating +
            communicationRating) /
          4
        ).toFixed(1),
      );

      const scorecard = {
        technicalRating,
        problemSolvingRating,
        cultureFitRating,
        communicationRating,
        overallRating,
        recommendation,
        notes,
        interviewerName,
        submittedAt: new Date().toISOString(),
      };

      const updated = await InterviewModel.update(id, {
        scorecard,
        status: "COMPLETED",
        feedback: notes,
      });

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: { code: "NOT_FOUND", message: "Interview not found." },
        });
      }

      notificationStreamService.broadcast("SCORECARD_SUBMITTED", {
        interviewId: id,
        scorecard,
      });

      res.status(200).json({
        success: true,
        data: {
          interviewId: id,
          scorecard,
        },
        message: "Interview scorecard submitted successfully.",
      });
    } catch (error) {
      next(error);
    }
  },

  // Get scorecard for an interview
  getScorecard: async (req, res, next) => {
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
        data: interview.scorecard || null,
        message: interview.scorecard
          ? "Scorecard retrieved."
          : "No scorecard submitted yet.",
      });
    } catch (error) {
      next(error);
    }
  },

  // Update interview (e.g. reschedule, cancel)
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
