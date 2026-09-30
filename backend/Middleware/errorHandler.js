/**
 * Centralized Error Handling Middleware for HireBridgeHR
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
  console.error("❌ [API Error]:", err);

  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;
  const errorCode = err.code || "INTERNAL_SERVER_ERROR";
  const errorMessage = err.message || "An unexpected server error occurred.";

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: errorMessage,
    },
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
