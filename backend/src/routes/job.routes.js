import { Router } from 'express';
import { jobController } from '../controllers/job.controller.js';
import { applicationController } from '../controllers/application.controller.js';
import { requireAuth, optionalAuth } from '../middleware/auth.middleware.js';
import { requireOrganization } from '../middleware/tenant.middleware.js';
import { requireRole } from '../middleware/rbac.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { createJobSchema, updateJobSchema } from '../validators/job.validator.js';
import { createApplicationSchema } from '../validators/application.validator.js';

const router = Router();

// Public / Guest / Candidate accessible job views
router.get('/', optionalAuth, (req, res, next) => {
  // If user is authenticated and has an org, scope by org, otherwise fetch public/all jobs
  if (req.user && req.user.organizationId) {
    req.organizationId = req.user.organizationId;
  }
  jobController.getJobs(req, res, next);
});

router.get('/:id', optionalAuth, (req, res, next) => {
  if (req.user && req.user.organizationId) {
    req.organizationId = req.user.organizationId;
  }
  jobController.getJobById(req, res, next);
});

// Candidate Portal Save/Unsave & Apply endpoints
router.post('/:id/save', requireAuth, jobController.saveJob);
router.delete('/:id/save', requireAuth, jobController.unsaveJob);
router.post('/:jobId/apply', optionalAuth, validate({ body: createApplicationSchema }), applicationController.createApplication);

// Recruiter / Enterprise Protected Operations
router.post(
  '/',
  requireAuth,
  requireOrganization,
  requireRole('SUPER_ADMIN', 'OWNER', 'ADMIN', 'RECRUITER'),
  validate({ body: createJobSchema }),
  jobController.createJob
);

router.put(
  '/:id',
  requireAuth,
  requireOrganization,
  requireRole('SUPER_ADMIN', 'OWNER', 'ADMIN', 'RECRUITER'),
  validate({ body: updateJobSchema }),
  jobController.updateJob
);

router.patch(
  '/:id',
  requireAuth,
  requireOrganization,
  requireRole('SUPER_ADMIN', 'OWNER', 'ADMIN', 'RECRUITER'),
  validate({ body: updateJobSchema }),
  jobController.updateJob
);

router.delete(
  '/:id',
  requireAuth,
  requireOrganization,
  requireRole('SUPER_ADMIN', 'OWNER', 'ADMIN'),
  jobController.deleteJob
);

// Publication & Lifecycle Workflow
router.post(
  '/:id/submit-publication',
  requireAuth,
  requireOrganization,
  requireRole('SUPER_ADMIN', 'OWNER', 'ADMIN', 'RECRUITER'),
  jobController.submitPublication
);

router.post(
  '/:id/close',
  requireAuth,
  requireOrganization,
  requireRole('SUPER_ADMIN', 'OWNER', 'ADMIN', 'RECRUITER'),
  jobController.closeJob
);

router.post(
  '/:id/reopen',
  requireAuth,
  requireOrganization,
  requireRole('SUPER_ADMIN', 'OWNER', 'ADMIN', 'RECRUITER'),
  jobController.reopenJob
);

export default router;
