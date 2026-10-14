import { Router } from "express";
import { applicationController } from "../Controller/applicationController.js";
import { verifyAuth, requireRole } from "../Middleware/authMiddleware.js";

const router = Router();

// Candidate Withdraw (Requires verified authentication and ownership)
router.patch("/:id/withdraw", verifyAuth, applicationController.withdrawApplication);
router.post("/:id/withdraw", verifyAuth, applicationController.withdrawApplication);

// Recruiter & Hiring Pipeline Management (Protected)
router.get(
  "/",
  verifyAuth,
  requireRole("RECRUITER", "ADMIN", "SUPER_ADMIN", "OWNER", "HIRING_MANAGER"),
  applicationController.getAllApplications
);
router.post(
  "/",
  verifyAuth,
  requireRole("RECRUITER", "ADMIN", "SUPER_ADMIN", "OWNER"),
  applicationController.createApplication
);
router.get(
  "/:id",
  verifyAuth,
  requireRole("RECRUITER", "ADMIN", "SUPER_ADMIN", "OWNER", "HIRING_MANAGER"),
  applicationController.getApplicationById
);
router.put(
  "/:id",
  verifyAuth,
  requireRole("RECRUITER", "ADMIN", "SUPER_ADMIN", "OWNER"),
  applicationController.updateApplication
);
router.delete(
  "/:id",
  verifyAuth,
  requireRole("RECRUITER", "ADMIN", "SUPER_ADMIN", "OWNER"),
  applicationController.deleteApplication
);

export default router;
