import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { authLimiter } from '../middleware/rateLimiter.middleware.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  candidateSignupSchema,
} from '../validators/auth.validator.js';

const router = Router();

// Recruiter / Enterprise Auth Routes
router.post('/register', authLimiter, validate({ body: registerSchema }), authController.register);
router.post('/login', authLimiter, validate({ body: loginSchema }), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.getMe);
router.post('/forgot-password', authLimiter, validate({ body: forgotPasswordSchema }), authController.forgotPassword);
router.post('/reset-password', authLimiter, validate({ body: resetPasswordSchema }), authController.resetPassword);
router.post('/verify-email', authController.verifyEmail);

// Candidate Portal Auth Routes (Used by Candidate Portal Frontend)
router.post('/candidate/signup', authLimiter, validate({ body: candidateSignupSchema }), authController.candidateSignup);
router.post('/candidate/login', authLimiter, validate({ body: loginSchema }), authController.login);
router.post('/candidate/logout', authController.logout);
router.post('/candidate/forgot-password', authLimiter, validate({ body: forgotPasswordSchema }), authController.forgotPassword);
router.post('/candidate/reset-password', authLimiter, validate({ body: resetPasswordSchema }), authController.resetPassword);

export default router;
