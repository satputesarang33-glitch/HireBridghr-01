import express from "express";
import { ssoController } from "../Controller/ssoController.js";

const router = express.Router();

router.get("/config", ssoController.getConfig);
router.post("/config", ssoController.updateConfig);
router.post("/test-connection", ssoController.testConnection);
router.get("/rbac-matrix", ssoController.getRbacMatrix);
router.post("/rbac-matrix", ssoController.updateRbacMatrix);

export default router;
