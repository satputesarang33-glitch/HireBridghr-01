import { Router } from "express";
import { complianceController } from "../Controller/complianceController.js";

const router = Router();

router.post("/blind-profile", complianceController.getBlindProfile);
router.post("/eeoc", complianceController.submitEeoc);
router.get("/eeoc/report", complianceController.getEeocReport);
router.post("/anonymize/:candidateId", complianceController.anonymizeCandidate);

export default router;
