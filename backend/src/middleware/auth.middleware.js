import { jwtLib } from '../lib/jwt.js';
import { ApiError } from '../utils/apiError.js';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';
import { devStore } from '../lib/devStore.js';

/**
 * Authentication Middleware
 * Validates JWT access token from Authorization header or cookie
 */
export const requireAuth = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw ApiError.unauthorized('Authentication token is required');
    }

    let decoded;
    try {
      decoded = jwtLib.verifyAccessToken(token);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        throw ApiError.unauthorized('Access token has expired');
      }
      throw ApiError.unauthorized('Invalid or corrupted access token');
    }

    // Verify user account liveness and status
    if (env.DATABASE_URL) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: { id: true, email: true, status: true, role: true },
        });

        if (!user) {
          throw ApiError.unauthorized('User account no longer exists');
        }

        if (user.status !== 'ACTIVE') {
          throw ApiError.forbidden('Your account has been deactivated or suspended');
        }
      } catch (err) {
        if (err.statusCode) throw err;
      }
    } else {
      const devUser = devStore.users.find((u) => u.id === decoded.id);
      if (devUser && devUser.status !== 'ACTIVE') {
        throw ApiError.forbidden('Your account has been deactivated or suspended');
      }
    }

    // Attach verified user context to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      organizationId: decoded.organizationId,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional Authentication Middleware
 * If token is provided and valid, attaches user; otherwise proceeds as guest
 */
export const optionalAuth = (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      try {
        const decoded = jwtLib.verifyAccessToken(token);
        req.user = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
          organizationId: decoded.organizationId,
        };
      } catch {
        // Ignore invalid token in optional auth
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
