import { Router } from "express";
import { aiController } from "../Controller/aiController.js";

const router = Router();

router.post("/match-candidate", aiController.matchCandidate);
router.post("/parse-resume-text", aiController.parseResumeText);

export default router;
