import { Router } from "express";
import { billingController } from "../Controller/billingController.js";

const router = Router();

router.get("/plans", billingController.getPlans);
router.get("/subscription", billingController.getSubscription);
router.post("/checkout", billingController.createCheckout);
router.post("/webhook", billingController.handleWebhook);
router.get("/invoices", billingController.getInvoices);

export default router;
