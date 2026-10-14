import { Router } from "express";
import { assessmentController } from "../Controller/assessmentController.js";

const router = Router();

router.get("/tests", assessmentController.getTests);
router.post("/submit", assessmentController.submitAssessment);
router.get("/candidate/:candidateId", assessmentController.getCandidateAssessments);

export default router;
