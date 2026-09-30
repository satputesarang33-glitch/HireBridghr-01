import { Router } from "express";
import { jobController } from "../Controller/jobController.js";
import { optionalAuth } from "../Middleware/authMiddleware.js";

const router = Router();

// Candidate Job Actions (Apply & Save)
router.post("/:id/apply", optionalAuth, jobController.applyToJob);
router.post("/:id/save", optionalAuth, jobController.saveJob);
router.delete("/:id/save", optionalAuth, jobController.unsaveJob);

// Standard Job CRUD
router.get("/", jobController.getAllJobs);
router.get("/:id", jobController.getJobById);
router.post("/", jobController.createJob);
router.put("/:id", jobController.updateJob);
router.delete("/:id", jobController.deleteJob);

export default router;
