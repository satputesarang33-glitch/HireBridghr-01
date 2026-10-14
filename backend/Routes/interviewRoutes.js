import { Router } from "express";
import { interviewController } from "../Controller/interviewController.js";
import { verifyAuth, requireRole } from "../Middleware/authMiddleware.js";

const router = Router();

// Protect all interview coordination and scorecard submission endpoints
router.use(
  verifyAuth,
  requireRole(
    "RECRUITER",
    "ADMIN",
    "SUPER_ADMIN",
    "OWNER",
    "HIRING_MANAGER",
    "INTERVIEWER"
  )
);

router.get("/", interviewController.getAllInterviews);
router.post("/", interviewController.scheduleInterview);
router.get("/:id/scorecard", interviewController.getScorecard);
router.post("/:id/scorecard", interviewController.submitScorecard);
router.get("/:id", interviewController.getInterviewById);
router.put("/:id", interviewController.updateInterview);
router.delete("/:id", interviewController.deleteInterview);

export default router;
