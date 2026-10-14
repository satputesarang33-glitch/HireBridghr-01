import { Router } from "express";
import { storageController } from "../Controller/storageController.js";
import { uploadMiddleware } from "../Services/storageService.js";
import { optionalAuth } from "../Middleware/authMiddleware.js";

const router = Router();

// Secure file upload endpoints (with strict magic byte and file signature checks)
router.post("/upload", optionalAuth, uploadMiddleware.single("file"), storageController.uploadFile);
router.post(
  "/parse-resume",
  optionalAuth,
  uploadMiddleware.single("file"),
  storageController.uploadAndParseResume
);

export default router;
