import { Router } from "express";
import { billingController } from "../Controller/billingController.js";
import { verifyAuth, optionalAuth, requireRole } from "../Middleware/authMiddleware.js";

const router = Router();

// Public plan catalog & subscription read
router.get("/plans", billingController.getPlans);
router.get("/subscription", optionalAuth, billingController.getSubscription);

// Webhook listener for payment gateway
router.post("/webhook", billingController.handleWebhook);

// Protected billing operations
router.post(
  "/checkout",
  verifyAuth,
  requireRole("ADMIN", "SUPER_ADMIN", "OWNER", "RECRUITER"),
  billingController.createCheckout
);
router.get(
  "/invoices",
  verifyAuth,
  requireRole("ADMIN", "SUPER_ADMIN", "OWNER", "RECRUITER"),
  billingController.getInvoices
);

export default router;
