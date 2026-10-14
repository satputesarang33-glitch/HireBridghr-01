import { Router } from "express";
import { messageController } from "../Controller/messageController.js";
import { verifyAuth } from "../Middleware/authMiddleware.js";

const router = Router();

// Candidate direct messaging & SMS alerts
router.use(verifyAuth);

router.get("/:candidateId", messageController.getMessages);
router.post("/", messageController.sendMessage);
router.post("/sms-reminder", messageController.sendSmsReminder);

export default router;
