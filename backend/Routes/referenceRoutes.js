import { Router } from "express";
import { referenceController } from "../Controller/referenceController.js";

const router = Router();

router.post("/request", referenceController.requestReference);
router.post("/:id/submit", referenceController.submitReference);
router.get("/candidate/:candidateId", referenceController.getCandidateReferences);

export default router;
