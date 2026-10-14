import { Router } from "express";
import { storageController } from "../Controller/storageController.js";
import { uploadMiddleware } from "../Services/storageService.js";

const router = Router();

router.post("/upload", uploadMiddleware.single("file"), storageController.uploadFile);
router.post("/parse-resume", uploadMiddleware.single("file"), storageController.uploadAndParseResume);

export default router;
