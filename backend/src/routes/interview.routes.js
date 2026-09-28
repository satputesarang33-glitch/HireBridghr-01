import { Router } from 'express';
import { interviewController } from '../controllers/interview.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireOrganization } from '../middleware/tenant.middleware.js';
import { requireRole } from '../middleware/rbac.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
  scheduleInterviewSchema,
  submitInterviewFeedbackSchema,
} from '../validators/interview.validator.js';

const router = Router();

router.use(requireAuth, requireOrganization);

router.get(
  '/',
  requireRole('SUPER_ADMIN', 'OWNER', 'ADMIN', 'RECRUITER', 'HIRING_MANAGER', 'INTERVIEWER'),
  interviewController.getInterviews
);

router.get(
  '/:id',
  requireRole('SUPER_ADMIN', 'OWNER', 'ADMIN', 'RECRUITER', 'HIRING_MANAGER', 'INTERVIEWER'),
  interviewController.getInterviewById
);

router.post(
  '/',
  requireRole('SUPER_ADMIN', 'OWNER', 'ADMIN', 'RECRUITER'),
  validate({ body: scheduleInterviewSchema }),
  interviewController.scheduleInterview
);

router.put(
  '/:id',
  requireRole('SUPER_ADMIN', 'OWNER', 'ADMIN', 'RECRUITER', 'HIRING_MANAGER', 'INTERVIEWER'),
  interviewController.updateInterview
);

router.patch(
  '/:id',
  requireRole('SUPER_ADMIN', 'OWNER', 'ADMIN', 'RECRUITER', 'HIRING_MANAGER', 'INTERVIEWER'),
  interviewController.updateInterview
);

router.delete(
  '/:id',
  requireRole('SUPER_ADMIN', 'OWNER', 'ADMIN'),
  interviewController.deleteInterview
);

// Feedback
router.post(
  '/:id/feedback',
  requireRole('SUPER_ADMIN', 'OWNER', 'ADMIN', 'RECRUITER', 'HIRING_MANAGER', 'INTERVIEWER'),
  validate({ body: submitInterviewFeedbackSchema }),
  interviewController.submitFeedback
);

router.get(
  '/:id/feedback',
  requireRole('SUPER_ADMIN', 'OWNER', 'ADMIN', 'RECRUITER', 'HIRING_MANAGER', 'INTERVIEWER'),
  interviewController.getInterviewById
);

export default router;
