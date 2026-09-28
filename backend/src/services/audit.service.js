import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import { devStore } from "../lib/devStore.js";
import { logger } from "../utils/logger.js";

const SENSITIVE_KEYS = new Set([
  'password',
  'passwordhash',
  'token',
  'refreshtoken',
  'accesstoken',
  'rawtoken',
  'rawrefreshtoken',
  'secret',
  'authorization',
  'creditcard',
  'cvv',
  'tokenhash',
  'passwordresettoken',
  'apikey',
  'privatekey',
  'cookie',
]);

const sanitizeAuditMetadata = (obj, depth = 0) => {
  if (!obj || typeof obj !== 'object' || depth > 5) return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeAuditMetadata(item, depth + 1));
  }
  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase().replace(/[^a-z]/g, ''))) {
      clean[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      clean[key] = sanitizeAuditMetadata(value, depth + 1);
    } else {
      clean[key] = value;
    }
  }
  return clean;
};

export const auditService = {
  /**
   * Log a security or business event in the audit trail
   */
  log: async ({
    organizationId,
    actorId,
    actorEmail,
    actorRole,
    action,
    resourceType,
    resourceId,
    metadata = {},
    ipAddress,
    userAgent,
    requestId,
  }) => {
    try {
      const cleanMetadata = sanitizeAuditMetadata(metadata);

      if (!env.DATABASE_URL) {
        devStore.auditLogs.unshift({
          id: `audit-${Date.now()}`,
          organizationId: organizationId || null,
          actorId: actorId || null,
          actorEmail: actorEmail || null,
          actorRole: actorRole || null,
          action,
          resourceType,
          resourceId: resourceId || null,
          metadata: cleanMetadata,
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
          createdAt: new Date().toISOString(),
        });
        return;
      }

      await prisma.auditLog.create({
        data: {
          organizationId: organizationId || null,
          actorId: actorId || null,
          actorEmail: actorEmail || null,
          actorRole: actorRole || null,
          action,
          resourceType,
          resourceId: resourceId || null,
          metadata: cleanMetadata,
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
          requestId: requestId || null,
        },
      });
    } catch (err) {
      logger.error("Failed to create audit log entry", err);
    }
  },

  /**
   * Query organization audit logs with pagination
   */
  getOrganizationLogs: async (organizationId, { page = 1, limit = 20 } = {}) => {
    if (!env.DATABASE_URL) {
      const filtered = (devStore.auditLogs || []).filter(
        (l) => !organizationId || l.organizationId === organizationId
      );
      return { logs: filtered, total: filtered.length };
    }

    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: { organizationId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({
        where: { organizationId },
      }),
    ]);

    return { logs, total };
  },

  /**
   * Query all platform audit logs (SUPER_ADMIN)
   */
  getAllLogs: async ({ page = 1, limit = 50, action, resourceType } = {}) => {
    if (!env.DATABASE_URL) {
      const logs = devStore.auditLogs || [];
      return { logs, total: logs.length };
    }

    const skip = (page - 1) * limit;
    const where = {
      ...(action ? { action } : {}),
      ...(resourceType ? { resourceType } : {}),
    };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          organization: { select: { id: true, name: true } },
          actor: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { logs, total };
  },
};
