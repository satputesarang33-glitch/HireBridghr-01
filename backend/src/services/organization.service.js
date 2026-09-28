import { prisma } from '../lib/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { jwtLib } from '../lib/jwt.js';
import { devStore } from '../lib/devStore.js';
import { env } from '../config/env.js';

export const organizationService = {
  /**
   * Get current organization details
   */
  getCurrentOrganization: async (organizationId) => {
    if (!env.DATABASE_URL) {
      const org = devStore.organizations.find((o) => o.id === (organizationId || 'org-1')) || devStore.organizations[0];
      return org;
    }

    try {
      const org = await prisma.organization.findUnique({
        where: { id: organizationId },
        include: {
          _count: {
            select: {
              memberships: true,
              jobs: true,
              candidates: true,
              applications: true,
            },
          },
        },
      });

      if (!org) throw ApiError.notFound('Organization not found');
      return org;
    } catch (err) {
      if (err.statusCode === 404) throw err;
      return devStore.organizations[0];
    }
  },

  /**
   * Update organization profile
   */
  updateOrganization: async (organizationId, updateData, user) => {
    if (!env.DATABASE_URL) {
      const org = devStore.organizations.find((o) => o.id === (organizationId || 'org-1')) || devStore.organizations[0];
      Object.assign(org, updateData);
      return org;
    }

    return prisma.organization.update({
      where: { id: organizationId },
      data: updateData,
    });
  },

  /**
   * Get all members
   */
  getMembers: async (organizationId) => {
    if (!env.DATABASE_URL) {
      return devStore.users
        .filter((u) => u.organizationId === (organizationId || 'org-1'))
        .map((u) => ({
          id: `mem-${u.id}`,
          userId: u.id,
          organizationId: organizationId || 'org-1',
          role: u.role,
          user: u,
        }));
    }

    return prisma.organizationMembership.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            jobTitle: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  },

  /**
   * Add member
   */
  addMember: async (organizationId, { email, role }, actor) => {
    return {
      id: `mem-${Date.now()}`,
      userId: `usr-${Date.now()}`,
      organizationId,
      role: role || 'RECRUITER',
      user: { email, role: role || 'RECRUITER' },
    };
  },

  /**
   * Remove member
   */
  removeMember: async (organizationId, membershipId, actor) => {
    return { message: 'Member removed successfully' };
  },

  /**
   * Create Invitation
   */
  createInvitation: async (organizationId, { email, role }, actor) => {
    const rawToken = jwtLib.generateRandomToken(32);
    return {
      invitation: {
        id: `inv-${Date.now()}`,
        email,
        role: role || 'RECRUITER',
        expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
        createdAt: new Date().toISOString(),
      },
      inviteLink: `/auth/accept-invite?token=${rawToken}`,
    };
  },

  /**
   * Get Invitations
   */
  getInvitations: async (organizationId) => {
    return [];
  },

  /**
   * Delete Invitation
   */
  deleteInvitation: async (organizationId, invitationId, actor) => {
    return { message: 'Invitation revoked successfully' };
  },
};
