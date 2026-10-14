/**
 * Centralized Defensive Error Handling Middleware for HireBridgeHR
 */

// 404 Not Found Handler
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Resource not found: ${req.method} ${req.originalUrl}`,
    },
  });
};

// Global Error Handler
export const errorHandler = (err, req, res, next) => {
  // Safe server-side console logging (avoid printing raw credentials)
  console.error("❌ [API Error]:", err.message || err);

  let statusCode = err.statusCode || err.status || 500;
  if (res.statusCode && res.statusCode >= 400 && statusCode === 500) {
    statusCode = res.statusCode;
  }

  // Handle CORS rejection
  if (err.message && err.message.includes("CORS")) {
    return res.status(403).json({
      success: false,
      error: {
        code: "CORS_FORBIDDEN",
        message: "Cross-Origin Request Blocked: Origin is not permitted.",
      },
    });
  }

  // Handle Multer upload limits
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      success: false,
      error: {
        code: "PAYLOAD_TOO_LARGE",
        message: "Uploaded file exceeds maximum permitted limit (15MB).",
      },
    });
  }

  const isProduction = process.env.NODE_ENV === "production";
  const errorCode = err.code || "INTERNAL_SERVER_ERROR";

  // In production, mask internal server error details
  let safeMessage = err.message || "An unexpected server error occurred.";
  if (isProduction && statusCode >= 500) {
    safeMessage = "An internal server error occurred. Please try again later.";
  }

  // Ensure no sensitive credentials, file paths, or keys leak in messages
  safeMessage = safeMessage
    .replace(/(?:key|secret|password|token)=[^\s&]+/gi, "$1=[REDACTED]")
    .replace(/AIza[0-9A-Za-z-_]{35}/g, "[REDACTED_API_KEY]");

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: safeMessage,
    },
    ...(!isProduction && { stack: err.stack }),
  });
};
