import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/rbac.middleware.js';

const router = Router();

// Platform Admin Routes - Restricted exclusively to SUPER_ADMIN
router.use(requireAuth, requireRole('SUPER_ADMIN'));

router.get('/metrics', adminController.getMetrics);
router.get('/analytics', adminController.getMetrics);
router.get('/organizations', adminController.getOrganizations);
router.get('/users', adminController.getUsers);
router.get('/audit-logs', adminController.getAuditLogs);

// Publication Queue Management
router.get('/publication-queue', adminController.getPublicationQueue);
router.get('/job-publications', adminController.getPublicationQueue);
router.patch('/publication-queue/:id', adminController.updatePublicationStatus);
router.put('/publication-queue/:id', adminController.updatePublicationStatus);
router.put('/job-publications/:id', adminController.updatePublicationStatus);

export default router;
