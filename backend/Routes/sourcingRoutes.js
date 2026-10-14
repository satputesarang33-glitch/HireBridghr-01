import express from "express";
import { sourcingController } from "../Controller/sourcingController.js";

const router = express.Router();

router.post("/import", sourcingController.importCandidate);
router.post("/enrich", sourcingController.enrichCandidate);
router.get("/talent-pools", sourcingController.getTalentPools);
router.post("/talent-pools", sourcingController.createTalentPool);
router.post("/talent-pools/:id/add-candidate", sourcingController.addCandidateToPool);
router.get("/extension-config", sourcingController.getExtensionConfig);

export default router;
