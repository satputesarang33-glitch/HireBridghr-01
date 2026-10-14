import express from "express";
import { predictiveAnalyticsController } from "../Controller/predictiveAnalyticsController.js";

const router = express.Router();

router.get("/predictive", predictiveAnalyticsController.getPredictiveMetrics);
router.get("/diversity-eeoc", predictiveAnalyticsController.getDiversityEEOC);
router.get("/sources-roi", predictiveAnalyticsController.getSourcesROI);
router.get("/recruiter-leaderboard", predictiveAnalyticsController.getRecruiterLeaderboard);

export default router;
