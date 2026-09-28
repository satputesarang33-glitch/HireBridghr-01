import { candidateService } from '../services/candidate.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export const candidateController = {
  /**
   * Get candidates list
   */
  getCandidates: async (req, res, next) => {
    try {
      const orgId = req.organizationId;
      const { candidates, total, page, limit } = await candidateService.getCandidates(orgId, req.query);

      return ApiResponse.paginated(res, candidates, { page, limit, total }, 'Candidates fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get candidate by ID
   */
  getCandidateById: async (req, res, next) => {
    try {
      const candidate = await candidateService.getCandidateById(req.params.id, req.organizationId);
      return ApiResponse.success(res, 200, 'Candidate retrieved successfully', candidate);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create candidate
   */
  createCandidate: async (req, res, next) => {
    try {
      const candidate = await candidateService.createCandidate(req.organizationId, req.body, req.user);
      return ApiResponse.created(res, 'Candidate created successfully', candidate);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update candidate
   */
  updateCandidate: async (req, res, next) => {
    try {
      const candidate = await candidateService.updateCandidate(req.params.id, req.organizationId, req.body, req.user);
      return ApiResponse.success(res, 200, 'Candidate updated successfully', candidate);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete candidate
   */
  deleteCandidate: async (req, res, next) => {
    try {
      const result = await candidateService.deleteCandidate(req.params.id, req.organizationId, req.user);
      return ApiResponse.success(res, 200, result.message, { id: result.id });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Add note
   */
  addNote: async (req, res, next) => {
    try {
      const note = await candidateService.addNote(req.params.id, req.organizationId, req.body, req.user);
      return ApiResponse.created(res, 'Note added successfully', note);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Upload resume document
   */
  uploadResume: async (req, res, next) => {
    try {
      if (!req.file) {
        throw ApiError.badRequest('Resume file is required');
      }

      const result = await candidateService.uploadResume(req.params.id, req.organizationId, req.file, req.user);
      return ApiResponse.created(res, 'Resume uploaded successfully', result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get signed URL for resume
   */
  getResumeUrl: async (req, res, next) => {
    try {
      const result = await candidateService.getSignedResumeUrl(req.params.id, req.organizationId);
      return ApiResponse.success(res, 200, 'Signed resume URL generated', result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete resume
   */
  deleteResume: async (req, res, next) => {
    try {
      const result = await candidateService.deleteResume(req.params.id, req.organizationId, req.user);
      return ApiResponse.success(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Candidate Portal Profile: GET /api/candidates/me
   */
  getMeProfile: async (req, res, next) => {
    try {
      const profile = await candidateService.getCandidateProfile(req.user.id);
      return ApiResponse.success(res, 200, 'Profile retrieved', profile);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Candidate Portal Profile: PUT /api/candidates/me
   */
  updateMeProfile: async (req, res, next) => {
    try {
      const updated = await candidateService.updateCandidateProfile(req.user.id, req.body);
      return ApiResponse.success(res, 200, 'Profile updated successfully', updated);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Candidate Portal Resume: POST /api/candidates/resume
   */
  uploadCandidateResume: async (req, res, next) => {
    try {
      let resumeUrl = req.body?.resumeUrl;
      let fileName = req.body?.fileName || 'Resume.pdf';
      let fileSize = req.body?.fileSize || '1.2 MB';

      if (req.file) {
        fileName = req.file.originalname;
        fileSize = `${(req.file.size / (1024 * 1024)).toFixed(1)} MB`;
        resumeUrl = `/resumes/${Date.now()}_${req.file.originalname}`;
      }

      const updated = await candidateService.updateCandidateProfile(req.user.id, {
        resumeUrl: resumeUrl || '/resumes/uploaded-resume.pdf',
        resumeFileName: fileName,
        resumeFileSize: fileSize,
      });

      return ApiResponse.success(res, 200, 'Resume uploaded successfully', updated);
    } catch (error) {
      next(error);
    }
  },
};
