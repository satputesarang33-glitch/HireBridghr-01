import { Router } from "express";
import { reportController } from "../Controller/reportController.js";

const router = Router();

router.get("/analytics", reportController.getAnalyticsOverview);

export default router;
