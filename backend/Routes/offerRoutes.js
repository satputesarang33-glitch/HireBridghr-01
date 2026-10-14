import { Router } from "express";
import { offerController } from "../Controller/offerController.js";
import { verifyAuth, requireRole } from "../Middleware/authMiddleware.js";

const router = Router();

// Digital Offers & In-Portal e-Signatures
router.use(verifyAuth);

router.post(
  "/",
  requireRole("RECRUITER", "ADMIN", "SUPER_ADMIN", "OWNER"),
  offerController.createOffer
);
router.get("/candidate/:candidateId", offerController.getCandidateOffer);
router.get("/:id", offerController.getOfferById);
router.post("/:id/sign", offerController.signOffer);

export default router;
