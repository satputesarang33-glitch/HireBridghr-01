import { Router } from "express";
import { reportController } from "../Controller/reportController.js";
import { verifyAuth, requireRole } from "../Middleware/authMiddleware.js";

const router = Router();

// Protect executive analytics and ATS business intelligence
router.use(
  verifyAuth,
  requireRole("RECRUITER", "ADMIN", "SUPER_ADMIN", "OWNER", "HIRING_MANAGER")
);

router.get("/analytics", reportController.getAnalyticsOverview);

export default router;
