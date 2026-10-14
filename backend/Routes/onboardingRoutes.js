import express from "express";
import { onboardingController } from "../Controller/onboardingController.js";

const router = express.Router();

router.post("/background-check", onboardingController.initiateBackgroundCheck);
router.get("/background-check/:candidateId", onboardingController.getBackgroundCheck);
router.get("/checklist/:candidateId", onboardingController.getOnboardingChecklist);
router.post("/checklist/:candidateId/item/:itemId", onboardingController.updateChecklistItem);
router.post("/provision-hris", onboardingController.provisionHris);

export default router;
