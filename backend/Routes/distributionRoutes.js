import { Router } from "express";
import { distributionController } from "../Controller/distributionController.js";

const router = Router();

// Feed endpoints
router.get("/feeds/indeed.xml", distributionController.getIndeedXml);
router.get("/feeds/rss.xml", distributionController.getRssFeed);

// Syndication endpoint
router.post("/jobs/:id/distribute", distributionController.distributeJob);

export default router;
