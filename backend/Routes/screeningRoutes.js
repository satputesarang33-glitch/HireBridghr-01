import { Router } from "express";
import { screeningController } from "../Controller/screeningController.js";

const router = Router();

router.get("/prompts", screeningController.getPrompts);
router.post("/transcribe", screeningController.transcribeAudio);
router.post("/submit", screeningController.submitScreening);
router.get("/:candidateId", screeningController.getCandidateScreenings);

export default router;
