import { ApiError } from '../utils/apiError.js';

// Standard role hierarchy ranks
const ROLE_HIERARCHY = {
  SUPER_ADMIN: 100,
  OWNER: 90,
  ADMIN: 80,
  RECRUITER: 60,
  HIRING_MANAGER: 50,
  INTERVIEWER: 40,
  VIEWER: 20,
  CANDIDATE: 10,
};

// Permission matrix
const PERMISSIONS = {
  // Organization settings
  MANAGE_ORGANIZATION: ['SUPER_ADMIN', 'OWNER', 'ADMIN'],
  INVITE_MEMBERS: ['SUPER_ADMIN', 'OWNER', 'ADMIN'],
  DELETE_MEMBERS: ['SUPER_ADMIN', 'OWNER'],
  
  // Jobs
  CREATE_JOB: ['SUPER_ADMIN', 'OWNER', 'ADMIN', 'RECRUITER'],
  EDIT_JOB: ['SUPER_ADMIN', 'OWNER', 'ADMIN', 'RECRUITER'],
  DELETE_JOB: ['SUPER_ADMIN', 'OWNER', 'ADMIN'],
  PUBLISH_JOB: ['SUPER_ADMIN', 'OWNER', 'ADMIN'],
  SUBMIT_JOB_PUBLICATION: ['SUPER_ADMIN', 'OWNER', 'ADMIN', 'RECRUITER'],

  // Candidates
  CREATE_CANDIDATE: ['SUPER_ADMIN', 'OWNER', 'ADMIN', 'RECRUITER'],
  EDIT_CANDIDATE: ['SUPER_ADMIN', 'OWNER', 'ADMIN', 'RECRUITER'],
  DELETE_CANDIDATE: ['SUPER_ADMIN', 'OWNER', 'ADMIN'],
  VIEW_RESUME: ['SUPER_ADMIN', 'OWNER', 'ADMIN', 'RECRUITER', 'HIRING_MANAGER', 'INTERVIEWER'],

  // Applications
  CREATE_APPLICATION: ['SUPER_ADMIN', 'OWNER', 'ADMIN', 'RECRUITER', 'CANDIDATE'],
  UPDATE_APPLICATION_STAGE: ['SUPER_ADMIN', 'OWNER', 'ADMIN', 'RECRUITER', 'HIRING_MANAGER'],
  DELETE_APPLICATION: ['SUPER_ADMIN', 'OWNER', 'ADMIN'],

  // Interviews
  SCHEDULE_INTERVIEW: ['SUPER_ADMIN', 'OWNER', 'ADMIN', 'RECRUITER'],
  SUBMIT_FEEDBACK: ['SUPER_ADMIN', 'OWNER', 'ADMIN', 'RECRUITER', 'HIRING_MANAGER', 'INTERVIEWER'],

  // Reports & Audits
  VIEW_REPORTS: ['SUPER_ADMIN', 'OWNER', 'ADMIN', 'RECRUITER', 'HIRING_MANAGER'],
  VIEW_AUDIT_LOGS: ['SUPER_ADMIN', 'OWNER', 'ADMIN'],

  // Platform admin
  PLATFORM_ADMIN: ['SUPER_ADMIN'],
};

/**
 * Middleware to require specific roles
 * @param {...string} allowedRoles
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      const userRole = req.membership?.role || req.user?.role;

      if (!userRole) {
        throw ApiError.unauthorized('User role could not be identified');
      }

      // SUPER_ADMIN always has full access
      if (userRole === 'SUPER_ADMIN') {
        return next();
      }

      if (allowedRoles.includes(userRole)) {
        return next();
      }

      throw ApiError.forbidden(`Access denied: Requires role ${allowedRoles.join(' or ')}`);
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to require a specific business permission
 * @param {keyof typeof PERMISSIONS} permission
 */
export const requirePermission = (permission) => {
  return (req, res, next) => {
    try {
      const userRole = req.membership?.role || req.user?.role;
      const allowedRoles = PERMISSIONS[permission] || [];

      if (userRole === 'SUPER_ADMIN') {
        return next();
      }

      if (allowedRoles.includes(userRole)) {
        return next();
      }

      throw ApiError.forbidden(`Access denied: Missing permission '${permission}'`);
    } catch (error) {
      next(error);
    }
  };
};
