import { CandidateModel } from "../Model/Candidate.js";
import { UserModel } from "../Model/User.js";
import { JobModel } from "../Model/Job.js";
import { ApplicationModel } from "../Model/Application.js";
import { NotificationModel } from "../Model/Notification.js";

/**
 * Controller for Candidate ATS management and Candidate Portal
 */
export const candidateController = {
  // ---- RECRUITER / ATS ENDPOINTS ----

  // Get all candidates
  getAllCandidates: async (req, res, next) => {
    try {
      const filters = {
        search: req.query.search,
        status: req.query.status,
        stage: req.query.stage,
      };
      const candidates = await CandidateModel.getAll(filters);
      res.status(200).json({
        success: true,
        data: candidates,
        message: "Candidates retrieved successfully.",
      });
    } catch (error) {
      next(error);
    }
  },

  // Get candidate by ID
  getCandidateById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const candidate = await CandidateModel.getById(id);

      if (!candidate) {
        return res.status(404).json({
          success: false,
          error: { code: "NOT_FOUND", message: "Candidate not found." },
        });
      }

      res.status(200).json({
        success: true,
        data: candidate,
        message: "Candidate retrieved.",
      });
    } catch (error) {
      next(error);
    }
  },

  // Create new candidate
  createCandidate: async (req, res, next) => {
    try {
      const data = req.body;
      const newCand = await CandidateModel.create(data);

      res.status(201).json({
        success: true,
        data: newCand,
        message: "Candidate created successfully.",
      });
    } catch (error) {
      next(error);
    }
  },

  // Update candidate
  updateCandidate: async (req, res, next) => {
    try {
      const { id } = req.params;
      const updated = await CandidateModel.update(id, req.body);

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: { code: "NOT_FOUND", message: "Candidate not found." },
        });
      }

      res.status(200).json({
        success: true,
        data: updated,
        message: "Candidate updated successfully.",
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete candidate
  deleteCandidate: async (req, res, next) => {
    try {
      const { id } = req.params;
      const deleted = await CandidateModel.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: { code: "NOT_FOUND", message: "Candidate not found." },
        });
      }

      res.status(200).json({
        success: true,
        data: { id },
        message: "Candidate deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  },

  // Add note to candidate
  addNote: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { text, note, author } = req.body;
      const noteContent = text || note;

      if (!noteContent) {
        return res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Note content is required." },
        });
      }

      const newNote = await CandidateModel.addNote(id, noteContent, author || "Recruiter");

      if (!newNote) {
        return res.status(404).json({
          success: false,
          error: { code: "NOT_FOUND", message: "Candidate not found." },
        });
      }

      res.status(201).json({
        success: true,
        data: newNote,
        message: "Note added successfully.",
      });
    } catch (error) {
      next(error);
    }
  },

  // ---- CANDIDATE SELF-PORTAL ENDPOINTS ----

  // Get current candidate profile
  getMyProfile: async (req, res, next) => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required to access candidate profile." },
        });
      }

      const profile = await UserModel.getCandidateProfile(userId);

      if (!profile) {
        return res.status(404).json({
          success: false,
          error: { code: "NOT_FOUND", message: "Candidate profile not found." },
        });
      }

      res.status(200).json({
        success: true,
        data: profile,
        message: "Profile retrieved.",
      });
    } catch (error) {
      next(error);
    }
  },

  // Update current candidate profile
  updateMyProfile: async (req, res, next) => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required to update profile." },
        });
      }

      const payload = req.body;

      // Calculate profile completion score
      let score = 30;
      if (payload.headline) score += 10;
      if (payload.location) score += 10;
      if (payload.skills?.length > 0) score += 15;
      if (payload.workExperience?.length > 0) score += 15;
      if (payload.education?.length > 0) score += 10;
      if (payload.resumeUrl) score += 10;

      const profileData = {
        ...payload,
        profileCompletion: Math.min(100, score),
      };

      const updated = await UserModel.saveCandidateProfile(userId, profileData);

      res.status(200).json({
        success: true,
        data: updated,
        message: "Profile updated successfully.",
      });
    } catch (error) {
      next(error);
    }
  },

  // Upload/Save Candidate Resume
  uploadResume: async (req, res, next) => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required to upload resume." },
        });
      }

      const payload = req.body;

      const resumeData = {
        resumeUrl: payload.resumeUrl || "/resumes/uploaded-resume.pdf",
        resumeFileName: payload.fileName || payload.resumeFileName || "Resume.pdf",
        resumeFileSize: payload.fileSize || "1.2 MB",
        resumeUploadedAt: new Date().toISOString(),
      };

      const updated = await UserModel.saveCandidateProfile(userId, resumeData);

      res.status(200).json({
        success: true,
        data: updated,
        message: "Resume uploaded successfully.",
      });
    } catch (error) {
      next(error);
    }
  },

  // Get candidate saved jobs
  getSavedJobs: async (req, res, next) => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required to view saved jobs." },
        });
      }

      const savedIds = await UserModel.getSavedJobs(userId);
      const allJobs = await JobModel.getAll();

      const savedJobs = allJobs.filter((j) => savedIds.includes(j.id) || savedIds.includes(j.slug));

      res.status(200).json({
        success: true,
        data: savedJobs,
        savedIds,
        message: "Saved jobs fetched.",
      });
    } catch (error) {
      next(error);
    }
  },

  // Get candidate applications
  getCandidateApplications: async (req, res, next) => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required to view applications." },
        });
      }

      const userEmail = req.user?.email || "";

      const apps = await ApplicationModel.getByCandidate(userId, userEmail);

      res.status(200).json({
        success: true,
        data: apps,
        message: "Candidate applications retrieved.",
      });
    } catch (error) {
      next(error);
    }
  },

  // Candidate notifications
  getCandidateNotifications: async (req, res, next) => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required to view notifications." },
        });
      }

      const notifs = await NotificationModel.getAllCandidate(userId);

      res.status(200).json({
        success: true,
        data: notifs,
        message: "Candidate notifications retrieved.",
      });
    } catch (error) {
      next(error);
    }
  },

  // Mark single candidate notification as read
  markNotificationRead: async (req, res, next) => {
    try {
      const { id } = req.params;
      const updated = await NotificationModel.markCandidateRead(id);

      res.status(200).json({
        success: true,
        data: updated,
        message: "Notification updated.",
      });
    } catch (error) {
      next(error);
    }
  },

  // Mark all candidate notifications as read
  markAllNotificationsRead: async (req, res, next) => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required." },
        });
      }

      await NotificationModel.markAllCandidateRead(userId);

      res.status(200).json({
        success: true,
        message: "All candidate notifications marked as read.",
      });
    } catch (error) {
      next(error);
    }
  },
};
