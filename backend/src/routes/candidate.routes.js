import { Router } from 'express';
import multer from 'multer';
import { candidateController } from '../controllers/candidate.controller.js';
import { jobController } from '../controllers/job.controller.js';
import { applicationController } from '../controllers/application.controller.js';
import { notificationController } from '../controllers/notification.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireOrganization } from '../middleware/tenant.middleware.js';
import { requireRole } from '../middleware/rbac.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { ApiError } from '../utils/apiError.js';
import {
  createCandidateSchema,
  updateCandidateSchema,
  addCandidateNoteSchema,
} from '../validators/candidate.validator.js';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'txt'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const ext = (file.originalname.split('.').pop() || '').toLowerCase();
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype) || !ALLOWED_EXTENSIONS.includes(ext)) {
      return cb(
        ApiError.badRequest(
          'Invalid file type. Only PDF, DOC, DOCX, and TXT files under 10MB are permitted for resume uploads.'
        ),
        false
      );
    }
    cb(null, true);
  },
});

const router = Router();

// -------------------------------------------------------------
// Candidate Portal Routes (Self-Service Profile & Portal Actions)
// -------------------------------------------------------------
router.get('/me', requireAuth, candidateController.getMeProfile);
router.put('/me', requireAuth, candidateController.updateMeProfile);
router.post('/resume', requireAuth, upload.single('resume'), candidateController.uploadCandidateResume);
router.get('/saved-jobs', requireAuth, jobController.getSavedJobs);
router.get('/applications', requireAuth, applicationController.getCandidateApplications);
router.get('/notifications', requireAuth, notificationController.getNotifications);
router.put('/notifications/:id', requireAuth, notificationController.updateCandidateNotification);

// -------------------------------------------------------------
// Recruiter / Enterprise Candidate Management Routes
// -------------------------------------------------------------
router.get(
  '/',
  requireAuth,
  requireOrganization,
  requireRole('SUPER_ADMIN', 'OWNER', 'ADMIN', 'RECRUITER', 'HIRING_MANAGER', 'INTERVIEWER'),
  candidateController.getCandidates
);

router.get(
  '/:id',
  requireAuth,
  requireOrganization,
  requireRole('SUPER_ADMIN', 'OWNER', 'ADMIN', 'RECRUITER', 'HIRING_MANAGER', 'INTERVIEWER'),
  candidateController.getCandidateById
);

router.post(
  '/',
  requireAuth,
  requireOrganization,
  requireRole('SUPER_ADMIN', 'OWNER', 'ADMIN', 'RECRUITER'),
  validate({ body: createCandidateSchema }),
  candidateController.createCandidate
);

router.put(
  '/:id',
  requireAuth,
  requireOrganization,
  requireRole('SUPER_ADMIN', 'OWNER', 'ADMIN', 'RECRUITER'),
  validate({ body: updateCandidateSchema }),
  candidateController.updateCandidate
);

router.patch(
  '/:id',
  requireAuth,
  requireOrganization,
  requireRole('SUPER_ADMIN', 'OWNER', 'ADMIN', 'RECRUITER'),
  validate({ body: updateCandidateSchema }),
  candidateController.updateCandidate
);

router.delete(
  '/:id',
  requireAuth,
  requireOrganization,
  requireRole('SUPER_ADMIN', 'OWNER', 'ADMIN'),
  candidateController.deleteCandidate
);

// Candidate Notes
router.post(
  '/:id/notes',
  requireAuth,
  requireOrganization,
  requireRole('SUPER_ADMIN', 'OWNER', 'ADMIN', 'RECRUITER', 'HIRING_MANAGER', 'INTERVIEWER'),
  validate({ body: addCandidateNoteSchema }),
  candidateController.addNote
);

// Secure Resume Storage Endpoints
router.post(
  '/:id/resume',
  requireAuth,
  requireOrganization,
  requireRole('SUPER_ADMIN', 'OWNER', 'ADMIN', 'RECRUITER'),
  upload.single('resume'),
  candidateController.uploadResume
);

router.get(
  '/:id/resume-url',
  requireAuth,
  requireOrganization,
  requireRole('SUPER_ADMIN', 'OWNER', 'ADMIN', 'RECRUITER', 'HIRING_MANAGER', 'INTERVIEWER'),
  candidateController.getResumeUrl
);

router.delete(
  '/:id/resume',
  requireAuth,
  requireOrganization,
  requireRole('SUPER_ADMIN', 'OWNER', 'ADMIN'),
  candidateController.deleteResume
);

export default router;
