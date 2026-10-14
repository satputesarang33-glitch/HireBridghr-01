import { Router } from "express";
import { adminController } from "../Controller/adminController.js";
import { verifyAuth, requireRole } from "../Middleware/authMiddleware.js";

const router = Router();

// Protect administrative & platform governance endpoints
// Enforces that only authorized workspace staff (Admins, Owners, Recruiters) can manage platform governance
router.use(
  verifyAuth,
  requireRole("ADMIN", "SUPER_ADMIN", "OWNER", "RECRUITER")
);

router.get("/organizations", adminController.getOrganizations);
router.get("/users", adminController.getUsers);
router.get("/job-publications", adminController.getJobPublications);
router.put("/job-publications/:id", adminController.updateJobPublication);
router.get("/audit-logs", adminController.getAuditLogs);

export default router;
