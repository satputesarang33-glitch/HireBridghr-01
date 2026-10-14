import { Router } from "express";
import { webhookController } from "../Controller/webhookController.js";

const router = Router();

router.get("/", webhookController.getWebhooks);
router.post("/", webhookController.createWebhook);
router.post("/test", webhookController.testWebhook);
router.get("/logs", webhookController.getLogs);

export default router;
