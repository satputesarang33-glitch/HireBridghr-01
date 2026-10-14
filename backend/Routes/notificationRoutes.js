import { Router } from "express";
import { notificationController } from "../Controller/notificationController.js";
import { verifyAuth } from "../Middleware/authMiddleware.js";

const router = Router();

// Protect internal notifications with mandatory authentication
router.use(verifyAuth);

router.get("/stream", notificationController.streamNotifications);
router.get("/", notificationController.getAllNotifications);
router.post("/", notificationController.createNotification);
router.put("/mark-all-read", notificationController.markAllAsRead);
router.put("/:id", notificationController.updateNotification);

export default router;
