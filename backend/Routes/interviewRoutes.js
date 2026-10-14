import { Router } from "express";
import { interviewController } from "../Controller/interviewController.js";

const router = Router();

router.get("/", interviewController.getAllInterviews);
router.post("/", interviewController.scheduleInterview);
router.get("/:id/scorecard", interviewController.getScorecard);
router.post("/:id/scorecard", interviewController.submitScorecard);
router.get("/:id", interviewController.getInterviewById);
router.put("/:id", interviewController.updateInterview);
router.delete("/:id", interviewController.deleteInterview);

export default router;
