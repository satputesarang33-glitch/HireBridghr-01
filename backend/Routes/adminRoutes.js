import { Router } from "express";
import { adminController } from "../Controller/adminController.js";

const router = Router();

router.get("/organizations", adminController.getOrganizations);
router.get("/users", adminController.getUsers);
router.get("/job-publications", adminController.getJobPublications);
router.put("/job-publications/:id", adminController.updateJobPublication);
router.get("/audit-logs", adminController.getAuditLogs);

export default router;
