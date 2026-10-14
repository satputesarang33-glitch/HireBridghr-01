import { Router } from "express";
import { jobController } from "../Controller/jobController.js";
import { verifyAuth, optionalAuth, requireRole } from "../Middleware/authMiddleware.js";

const router = Router();

// Public Requisitions Browsing (Candidates & Guests)
router.get("/", optionalAuth, jobController.getAllJobs);
router.get("/:id", optionalAuth, jobController.getJobById);

// Candidate Actions
router.post("/:id/apply", optionalAuth, jobController.applyToJob);
router.post("/:id/save", verifyAuth, jobController.saveJob);
router.delete("/:id/save", verifyAuth, jobController.unsaveJob);

// Recruiter Requisition Management (Protected)
router.post(
  "/",
  verifyAuth,
  requireRole("RECRUITER", "ADMIN", "SUPER_ADMIN", "OWNER"),
  jobController.createJob
);
router.put(
  "/:id",
  verifyAuth,
  requireRole("RECRUITER", "ADMIN", "SUPER_ADMIN", "OWNER"),
  jobController.updateJob
);
router.delete(
  "/:id",
  verifyAuth,
  requireRole("RECRUITER", "ADMIN", "SUPER_ADMIN", "OWNER"),
  jobController.deleteJob
);

export default router;
