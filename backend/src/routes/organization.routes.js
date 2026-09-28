import { Router } from 'express';
import { organizationController } from '../controllers/organization.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireOrganization } from '../middleware/tenant.middleware.js';
import { requireRole } from '../middleware/rbac.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
  updateOrganizationSchema,
  inviteMemberSchema,
} from '../validators/organization.validator.js';

const router = Router();

// All organization routes require authenticated user and organization context
router.use(requireAuth, requireOrganization);

router.get('/current', organizationController.getCurrent);
router.patch('/current', requireRole('SUPER_ADMIN', 'OWNER', 'ADMIN'), validate({ body: updateOrganizationSchema }), organizationController.updateCurrent);

// Members
router.get('/current/members', organizationController.getMembers);
router.post('/current/members', requireRole('SUPER_ADMIN', 'OWNER', 'ADMIN'), organizationController.addMember);
router.delete('/current/members/:memberId', requireRole('SUPER_ADMIN', 'OWNER'), organizationController.removeMember);

// Invitations
router.get('/current/invitations', requireRole('SUPER_ADMIN', 'OWNER', 'ADMIN'), organizationController.getInvitations);
router.post('/current/invitations', requireRole('SUPER_ADMIN', 'OWNER', 'ADMIN'), validate({ body: inviteMemberSchema }), organizationController.createInvitation);
router.post('/current/invitations/:id/resend', requireRole('SUPER_ADMIN', 'OWNER', 'ADMIN'), organizationController.resendInvitation);
router.delete('/current/invitations/:id', requireRole('SUPER_ADMIN', 'OWNER', 'ADMIN'), organizationController.deleteInvitation);

export default router;
