import { Router } from "express";
import { candidateController } from "../Controller/candidateController.js";
import { verifyAuth, requireRole } from "../Middleware/authMiddleware.js";

const router = Router();

// Candidate Self-Portal Endpoints (Defined before /:id)
// Protected: Candidates and authorized users can access own profile data
router.get("/me", verifyAuth, candidateController.getMyProfile);
router.put("/me", verifyAuth, candidateController.updateMyProfile);
router.post("/resume", verifyAuth, candidateController.uploadResume);
router.get("/saved-jobs", verifyAuth, candidateController.getSavedJobs);
router.get("/applications", verifyAuth, candidateController.getCandidateApplications);

// Candidate Notification Endpoints
router.get("/notifications", verifyAuth, candidateController.getCandidateNotifications);
router.put("/notifications/read-all", verifyAuth, candidateController.markAllNotificationsRead);
router.put("/notifications/:id/read", verifyAuth, candidateController.markNotificationRead);

// Recruiter / ATS Candidate Management
// Protected: Only Recruiters, Hiring Managers, and Admins can view/manage candidates
router.get(
  "/",
  verifyAuth,
  requireRole("RECRUITER", "ADMIN", "SUPER_ADMIN", "OWNER", "HIRING_MANAGER"),
  candidateController.getAllCandidates
);
router.post(
  "/",
  verifyAuth,
  requireRole("RECRUITER", "ADMIN", "SUPER_ADMIN", "OWNER"),
  candidateController.createCandidate
);
router.get(
  "/:id",
  verifyAuth,
  requireRole("RECRUITER", "ADMIN", "SUPER_ADMIN", "OWNER", "HIRING_MANAGER"),
  candidateController.getCandidateById
);
router.put(
  "/:id",
  verifyAuth,
  requireRole("RECRUITER", "ADMIN", "SUPER_ADMIN", "OWNER"),
  candidateController.updateCandidate
);
router.delete(
  "/:id",
  verifyAuth,
  requireRole("RECRUITER", "ADMIN", "SUPER_ADMIN", "OWNER"),
  candidateController.deleteCandidate
);
router.post(
  "/:id/notes",
  verifyAuth,
  requireRole("RECRUITER", "ADMIN", "SUPER_ADMIN", "OWNER", "HIRING_MANAGER"),
  candidateController.addNote
);

export default router;
