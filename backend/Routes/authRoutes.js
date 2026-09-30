import { Router } from "express";
import { authController } from "../Controller/authController.js";

const router = Router();

// Recruiter & Workspace Auth
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// Candidate Portal Auth
router.post("/candidate/signup", authController.candidateSignup);
router.post("/candidate/login", authController.candidateLogin);
router.post("/candidate/logout", authController.logout);
router.post("/candidate/forgot-password", authController.forgotPassword);
router.post("/candidate/reset-password", authController.resetPassword);

export default router;
