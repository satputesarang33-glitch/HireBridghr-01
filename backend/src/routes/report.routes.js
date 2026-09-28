import { Router } from 'express';
import { reportController } from '../controllers/report.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireOrganization } from '../middleware/tenant.middleware.js';
import { requireRole } from '../middleware/rbac.middleware.js';

const router = Router();

router.use(requireAuth, requireOrganization);

router.get(
  '/overview',
  requireRole('SUPER_ADMIN', 'OWNER', 'ADMIN', 'RECRUITER', 'HIRING_MANAGER'),
  reportController.getOverview
);

router.get(
  '/funnel',
  requireRole('SUPER_ADMIN', 'OWNER', 'ADMIN', 'RECRUITER', 'HIRING_MANAGER'),
  reportController.getFunnel
);

router.get(
  '/sources',
  requireRole('SUPER_ADMIN', 'OWNER', 'ADMIN', 'RECRUITER', 'HIRING_MANAGER'),
  reportController.getSources
);

export default router;
