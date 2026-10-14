import { Router } from "express";
import { messageController } from "../Controller/messageController.js";

const router = Router();

router.get("/:candidateId", messageController.getMessages);
router.post("/", messageController.sendMessage);
router.post("/sms-reminder", messageController.sendSmsReminder);

export default router;
