import { Router } from "express";
import { distributionController } from "../Controller/distributionController.js";
import { verifyAuth, requireRole } from "../Middleware/authMiddleware.js";

const router = Router();

// Public Job Distribution Feeds (Indeed & RSS Aggregators)
router.get("/feeds/indeed.xml", distributionController.getIndeedXml);
router.get("/feeds/rss.xml", distributionController.getRssFeed);

// Protected Job Syndication Trigger
router.post(
  "/jobs/:id/distribute",
  verifyAuth,
  requireRole("RECRUITER", "ADMIN", "SUPER_ADMIN", "OWNER"),
  distributionController.distributeJob
);

export default router;
