import { Router } from "express";
import { aiController } from "../Controller/aiController.js";
import { verifyAuth, requireRole, optionalAuth } from "../Middleware/authMiddleware.js";

const router = Router();

// AI Candidate matching (Recruiter only)
router.post(
  "/match-candidate",
  verifyAuth,
  requireRole("RECRUITER", "ADMIN", "SUPER_ADMIN", "OWNER"),
  aiController.matchCandidate
);

// AI Resume text parsing
router.post("/parse-resume-text", optionalAuth, aiController.parseResumeText);

export default router;
