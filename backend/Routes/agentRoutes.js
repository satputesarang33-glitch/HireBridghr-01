import express from "express";
import { agentController } from "../Controller/agentController.js";

const router = express.Router();

router.post("/screen", agentController.screenCandidate);
router.get("/availability", agentController.getAvailability);
router.post("/auto-schedule", agentController.autoScheduleInterview);
router.get("/sequences/:candidateId", agentController.getDripSequence);
router.post("/trigger-nudge", agentController.triggerNudge);

export default router;
