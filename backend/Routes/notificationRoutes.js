import { Router } from "express";
import { notificationController } from "../Controller/notificationController.js";

const router = Router();

router.get("/stream", notificationController.streamNotifications);
router.get("/", notificationController.getAllNotifications);
router.post("/", notificationController.createNotification);
router.put("/mark-all-read", notificationController.markAllAsRead);
router.put("/:id", notificationController.updateNotification);

export default router;
