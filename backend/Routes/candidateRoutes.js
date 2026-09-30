import { Router } from "express";
import { candidateController } from "../Controller/candidateController.js";
import { optionalAuth } from "../Middleware/authMiddleware.js";

const router = Router();

// Candidate Self-Portal Endpoints (Defined before /:id)
router.get("/me", optionalAuth, candidateController.getMyProfile);
router.put("/me", optionalAuth, candidateController.updateMyProfile);
router.post("/resume", optionalAuth, candidateController.uploadResume);
router.get("/saved-jobs", optionalAuth, candidateController.getSavedJobs);
router.get("/applications", optionalAuth, candidateController.getCandidateApplications);

// Candidate Notification Endpoints
router.get("/notifications", optionalAuth, candidateController.getCandidateNotifications);
router.put("/notifications/read-all", optionalAuth, candidateController.markAllNotificationsRead);
router.put("/notifications/:id/read", optionalAuth, candidateController.markNotificationRead);

// Recruiter / ATS Candidate Management
router.get("/", candidateController.getAllCandidates);
router.post("/", candidateController.createCandidate);
router.get("/:id", candidateController.getCandidateById);
router.put("/:id", candidateController.updateCandidate);
router.delete("/:id", candidateController.deleteCandidate);
router.post("/:id/notes", candidateController.addNote);

export default router;
