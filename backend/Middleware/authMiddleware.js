import { auth } from "../Config/connetdb.js";

/**
 * Authentication Middleware
 * Validates Bearer token from headers.
 * Supports Firebase ID tokens and provides backward-compatible fallback for dev tokens.
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

    // Development / demo token fallback (e.g. 'jwt-token-usr-1')
    if (token.startsWith("jwt-") || token.includes("test")) {
      req.user = {
        uid: token.replace("jwt-cand-token-", "").replace("jwt-token-", ""),
        email: "demo@hirebridgehr.com",
        role: token.includes("cand") ? "CANDIDATE" : "RECRUITER",
      };
      return next();
    }

    // Live Firebase ID Token Verification
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Auth verification failed:", error.message);
    return res.status(401).json({
      success: false,
      error: {
        code: "INVALID_TOKEN",
        message: "Invalid or expired authorization token.",
      },
    });
  }
};

/**
 * Optional Auth Middleware
 * Populates req.user if a valid token is present, but doesn't block unauthenticated requests.
 */
export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split("Bearer ")[1].trim();
  try {
    if (token.startsWith("jwt-") || token.includes("test")) {
      req.user = {
        uid: token.replace("jwt-cand-token-", "").replace("jwt-token-", ""),
        email: "demo@hirebridgehr.com",
        role: token.includes("cand") ? "CANDIDATE" : "RECRUITER",
      };
    } else {
      req.user = await auth.verifyIdToken(token);
    }
  } catch (err) {
    // Continue as guest
    req.user = null;
  }
  next();
};
