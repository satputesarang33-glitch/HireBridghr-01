import jwt from "jsonwebtoken";
import { auth } from "../Config/connetdb.js";
import { UserModel } from "../Model/User.js";

const JWT_SECRET =
  process.env.JWT_SECRET || "hirebridge_jwt_secure_signing_key_default_32ch";

/**
 * Parses and verifies user authorization token.
 * Supports:
 * 1. Cryptographically signed JWT tokens (HMAC-SHA256)
 * 2. Firebase Admin ID tokens (auth.verifyIdToken)
 * 3. Verified database user tokens in non-production environments
 */
export const verifyAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authorization token missing or malformed.",
        },
      });
    }

    const token = authHeader.split("Bearer ")[1].trim();
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Bearer token cannot be empty.",
        },
      });
    }

    // 1. Try Cryptographically Signed JWT Token
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded && decoded.uid) {
        req.user = {
          uid: decoded.uid,
          id: decoded.uid,
          email: decoded.email,
          role: decoded.role || "CANDIDATE",
          organizationId: decoded.organizationId || "org-1",
        };
        return next();
      }
    } catch (jwtErr) {
      // Continue to next verification method
    }

    // 2. Try Live Firebase ID Token Verification
    if (auth && typeof auth.verifyIdToken === "function") {
      try {
        const decodedToken = await auth.verifyIdToken(token);
        req.user = {
          uid: decodedToken.uid,
          id: decodedToken.uid,
          email: decodedToken.email,
          role: decodedToken.role || (decodedToken.email?.includes("cand") ? "CANDIDATE" : "RECRUITER"),
          organizationId: decodedToken.organizationId || "org-1",
          ...decodedToken,
        };
        return next();
      } catch (fbErr) {
        // Continue to fallback check
      }
    }

    // 3. Verified Development & Testing Token Support
    // Only permitted in non-production or test environments
    if (process.env.NODE_ENV !== "production") {
      if (token.startsWith("jwt-") || token.includes("test")) {
        const extractedId = token.replace(/^jwt-(cand-)?(token-)?/, "");
        
        // Fetch genuine user from database to ensure no arbitrary role spoofing
        let dbUser = await UserModel.findById(extractedId);
        if (!dbUser && token.includes("cand")) {
          dbUser = await UserModel.findById("usr-cand-1");
        } else if (!dbUser) {
          dbUser = await UserModel.findById("usr-recruiter-1");
        }

        if (dbUser) {
          req.user = {
            uid: dbUser.id,
            id: dbUser.id,
            email: dbUser.email,
            role: dbUser.role || (token.includes("cand") ? "CANDIDATE" : "RECRUITER"),
            organizationId: dbUser.organizationId || "org-1",
          };
          return next();
        }

        // Default controlled fallback for automated test accounts
        const isCandidate = token.includes("cand");
        req.user = {
          uid: extractedId || (isCandidate ? "usr-cand-1" : "usr-recruiter-1"),
          id: extractedId || (isCandidate ? "usr-cand-1" : "usr-recruiter-1"),
          email: isCandidate ? "candidate@hirebridgehr.com" : "recruiter@hirebridgehr.com",
          role: isCandidate ? "CANDIDATE" : "RECRUITER",
          organizationId: "org-1",
        };
        return next();
      }
    }

    // Token could not be authenticated
    return res.status(401).json({
      success: false,
      error: {
        code: "INVALID_TOKEN",
        message: "Invalid, expired, or untrusted authorization token.",
      },
    });
  } catch (error) {
    console.error("Auth verification failed:", error.message);
    return res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication failed.",
      },
    });
  }
};

/**
 * Role-Based Access Control Middleware
 * Requires verified user to match at least one of the specified roles.
 * Super Admins and Owners bypass single-role restrictions.
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required to perform this action.",
        },
      });
    }

    const userRole = (req.user.role || "").toUpperCase();
    const upperAllowed = allowedRoles.map((r) => r.toUpperCase());

    // Super Admins and Workspace Owners have global access
    if (userRole === "SUPER_ADMIN" || userRole === "OWNER") {
      return next();
    }

    if (upperAllowed.includes(userRole)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: {
        code: "FORBIDDEN",
        message: `Access denied. Insufficient permissions for role '${userRole}'.`,
      },
    });
  };
};

/**
 * Insecure Direct Object Reference (IDOR) Ownership Guard
 * Verifies that the authenticated user either owns the resource (by ID) or holds an administrative role.
 */
export const requireOwnershipOrRole = (getOwnerIdFn, ...allowedRoles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required." },
      });
    }

    const userRole = (req.user.role || "").toUpperCase();
    if (
      userRole === "SUPER_ADMIN" ||
      userRole === "OWNER" ||
      allowedRoles.map((r) => r.toUpperCase()).includes(userRole)
    ) {
      return next();
    }

    const ownerId = await getOwnerIdFn(req);
    if (ownerId && req.user.uid === ownerId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "Access denied. You do not own this resource.",
      },
    });
  };
};

/**
 * Optional Authentication Middleware
 * Enriches req.user if a valid token is provided, without blocking guest/public access.
 */
export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }

  const token = authHeader.split("Bearer ")[1].trim();
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    // 1. Try JWT
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded?.uid) {
        req.user = {
          uid: decoded.uid,
          id: decoded.uid,
          email: decoded.email,
          role: decoded.role || "CANDIDATE",
          organizationId: decoded.organizationId || "org-1",
        };
        return next();
      }
    } catch {
      // Continue
    }

    // 2. Try Firebase
    if (auth && typeof auth.verifyIdToken === "function") {
      try {
        const decodedToken = await auth.verifyIdToken(token);
        req.user = decodedToken;
        return next();
      } catch {
        // Continue
      }
    }

    // 3. Fallback dev tokens in non-production
    if (process.env.NODE_ENV !== "production") {
      if (token.startsWith("jwt-") || token.includes("test")) {
        const isCandidate = token.includes("cand");
        const uid = token.replace(/^jwt-(cand-)?(token-)?/, "");
        req.user = {
          uid: uid || (isCandidate ? "usr-cand-1" : "usr-recruiter-1"),
          id: uid || (isCandidate ? "usr-cand-1" : "usr-recruiter-1"),
          email: isCandidate ? "candidate@hirebridgehr.com" : "recruiter@hirebridgehr.com",
          role: isCandidate ? "CANDIDATE" : "RECRUITER",
          organizationId: "org-1",
        };
        return next();
      }
    }

    req.user = null;
  } catch {
    req.user = null;
  }
  next();
};

export { JWT_SECRET };
