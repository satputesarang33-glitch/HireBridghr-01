import { Router } from 'express';
import { applicationController } from '../controllers/application.controller.js';
import { requireAuth, optionalAuth } from '../middleware/auth.middleware.js';
import { requireOrganization } from '../middleware/tenant.middleware.js';
import { requireRole } from '../middleware/rbac.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
  createApplicationSchema,
  updateApplicationStageSchema,
} from '../validators/application.validator.js';

const router = Router();

// Candidate Withdraw Endpoint
router.patch('/:id/withdraw', requireAuth, applicationController.withdrawApplication);
router.post('/:id/withdraw', requireAuth, applicationController.withdrawApplication);

// Submit application (Can be submitted by candidates/public or recruiters)
router.post(
  '/',
  optionalAuth,
  validate({ body: createApplicationSchema }),
  applicationController.createApplication
);

// Recruiter / Enterprise Protected Application Routes
router.get(
  '/',
  requireAuth,
  requireOrganization,
  requireRole('SUPER_ADMIN', 'OWNER', 'ADMIN', 'RECRUITER', 'HIRING_MANAGER', 'INTERVIEWER'),
  applicationController.getApplications
);

router.get(
  '/:id',
  requireAuth,
  requireOrganization,
  requireRole('SUPER_ADMIN', 'OWNER', 'ADMIN', 'RECRUITER', 'HIRING_MANAGER', 'INTERVIEWER'),
  applicationController.getApplicationById
);

router.put(
  '/:id',
  requireAuth,
  requireOrganization,
  requireRole('SUPER_ADMIN', 'OWNER', 'ADMIN', 'RECRUITER', 'HIRING_MANAGER'),
  validate({ body: updateApplicationStageSchema }),
  applicationController.updateStage
);

router.patch(
  '/:id',
  requireAuth,
  requireOrganization,
  requireRole('SUPER_ADMIN', 'OWNER', 'ADMIN', 'RECRUITER', 'HIRING_MANAGER'),
  validate({ body: updateApplicationStageSchema }),
  applicationController.updateStage
);

router.patch(
  '/:id/status',
  requireAuth,
  requireOrganization,
  requireRole('SUPER_ADMIN', 'OWNER', 'ADMIN', 'RECRUITER', 'HIRING_MANAGER'),
  validate({ body: updateApplicationStageSchema }),
  applicationController.updateStage
);

router.get(
  '/:id/activity',
  requireAuth,
  requireOrganization,
  requireRole('SUPER_ADMIN', 'OWNER', 'ADMIN', 'RECRUITER', 'HIRING_MANAGER', 'INTERVIEWER'),
  applicationController.getActivity
);

router.delete(
  '/:id',
  requireAuth,
  requireOrganization,
  requireRole('SUPER_ADMIN', 'OWNER', 'ADMIN'),
  applicationController.deleteApplication
);

export default router;
