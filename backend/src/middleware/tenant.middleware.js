import { ApiError } from '../utils/apiError.js';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';

/**
 * Tenant Isolation Middleware
 * Resolves the authenticated user's organization membership and verifies access
 */
export const requireOrganization = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      throw ApiError.unauthorized('Authentication required before organization check');
    }

    // Allow SUPER_ADMIN to optionally specify X-Organization-Id or proceed globally
    if (req.user.role === 'SUPER_ADMIN') {
      const targetOrgId = req.headers['x-organization-id'] || req.user.organizationId;
      req.organizationId = targetOrgId || null;
      req.membership = {
        role: 'SUPER_ADMIN',
        organizationId: targetOrgId,
      };
      return next();
    }

    // Determine target organization ID from trusted token
    const tokenOrgId = req.user.organizationId;
    const requestedOrgId = req.headers['x-organization-id'];

    // Client-supplied organization ID cannot override token unless DB confirms membership
    if (env.DATABASE_URL) {
      try {
        const membership = await prisma.organizationMembership.findFirst({
          where: {
            userId: req.user.id,
            ...(requestedOrgId ? { organizationId: requestedOrgId } : { organizationId: tokenOrgId }),
          },
          include: {
            organization: {
              select: { id: true, name: true, slug: true, status: true },
            },
          },
        });

        if (!membership) {
          if (req.user.role === 'CANDIDATE') {
            req.organizationId = null;
            req.membership = null;
            return next();
          }
          throw ApiError.forbidden('Access denied: You do not belong to the requested organization');
        }

        if (membership.organization.status !== 'ACTIVE') {
          throw ApiError.forbidden('Organization account is suspended or inactive');
        }

        req.organizationId = membership.organizationId;
        req.membership = membership;
        req.user.role = membership.role;
        req.organization = membership.organization;
        return next();
      } catch (err) {
        if (err.statusCode) throw err;
      }
    }

    // In dev / test offline mode:
    // If client sends a different X-Organization-Id than their verified token, reject!
    if (requestedOrgId && tokenOrgId && requestedOrgId !== tokenOrgId) {
      throw ApiError.forbidden('Cross-tenant violation: Client organization header does not match authorized credentials');
    }

    req.organizationId = tokenOrgId || 'org-1';
    req.membership = {
      role: req.user.role || 'RECRUITER',
      organizationId: req.organizationId,
    };

    next();
  } catch (error) {
    next(error);
  }
};
