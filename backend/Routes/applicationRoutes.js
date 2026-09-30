import { Router } from "express";
import { applicationController } from "../Controller/applicationController.js";
import { optionalAuth } from "../Middleware/authMiddleware.js";

const router = Router();

// Candidate Withdraw
router.patch("/:id/withdraw", optionalAuth, applicationController.withdrawApplication);
router.post("/:id/withdraw", optionalAuth, applicationController.withdrawApplication);

// Application CRUD
router.get("/", applicationController.getAllApplications);
router.post("/", applicationController.createApplication);
router.get("/:id", applicationController.getApplicationById);
router.put("/:id", applicationController.updateApplication);
router.delete("/:id", applicationController.deleteApplication);

export default router;
