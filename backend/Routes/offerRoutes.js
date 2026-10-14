import { Router } from "express";
import { offerController } from "../Controller/offerController.js";

const router = Router();

router.post("/", offerController.createOffer);
router.get("/candidate/:candidateId", offerController.getCandidateOffer);
router.get("/:id", offerController.getOfferById);
router.post("/:id/sign", offerController.signOffer);

export default router;
