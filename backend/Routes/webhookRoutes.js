import { Router } from "express";
import { webhookController } from "../Controller/webhookController.js";
import { verifyAuth, optionalAuth, requireRole } from "../Middleware/authMiddleware.js";

const router = Router();

// Read registered webhooks with masked secrets (safe against secret leakage)
router.get("/", optionalAuth, webhookController.getWebhooks);

// Protected webhook management and event dispatch
router.post(
  "/",
  verifyAuth,
  requireRole("ADMIN", "SUPER_ADMIN", "OWNER", "RECRUITER"),
  webhookController.createWebhook
);
router.post(
  "/test",
  verifyAuth,
  requireRole("ADMIN", "SUPER_ADMIN", "OWNER", "RECRUITER"),
  webhookController.testWebhook
);
router.get(
  "/logs",
  verifyAuth,
  requireRole("ADMIN", "SUPER_ADMIN", "OWNER", "RECRUITER"),
  webhookController.getLogs
);

export default router;
