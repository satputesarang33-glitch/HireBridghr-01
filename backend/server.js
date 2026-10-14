import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// Database & Seed
import "./Config/connetdb.js";
import { seedInitialDatabase } from "./Config/seedData.js";

// Routes
import authRoutes from "./Routes/authRoutes.js";
import jobRoutes from "./Routes/jobRoutes.js";
import candidateRoutes from "./Routes/candidateRoutes.js";
import applicationRoutes from "./Routes/applicationRoutes.js";
import interviewRoutes from "./Routes/interviewRoutes.js";
import notificationRoutes from "./Routes/notificationRoutes.js";
import adminRoutes from "./Routes/adminRoutes.js";
import reportRoutes from "./Routes/reportRoutes.js";
import storageRoutes from "./Routes/storageRoutes.js";
import aiRoutes from "./Routes/aiRoutes.js";
import distributionRoutes from "./Routes/distributionRoutes.js";
import offerRoutes from "./Routes/offerRoutes.js";
import messageRoutes from "./Routes/messageRoutes.js";
import billingRoutes from "./Routes/billingRoutes.js";
import webhookRoutes from "./Routes/webhookRoutes.js";
import screeningRoutes from "./Routes/screeningRoutes.js";
import assessmentRoutes from "./Routes/assessmentRoutes.js";
import complianceRoutes from "./Routes/complianceRoutes.js";
import referenceRoutes from "./Routes/referenceRoutes.js";
import sourcingRoutes from "./Routes/sourcingRoutes.js";
import agentRoutes from "./Routes/agentRoutes.js";
import predictiveAnalyticsRoutes from "./Routes/predictiveAnalyticsRoutes.js";
import ssoRoutes from "./Routes/ssoRoutes.js";
import onboardingRoutes from "./Routes/onboardingRoutes.js";

// Middlewares
import { notFoundHandler, errorHandler } from "./Middleware/errorHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust first proxy in containerized/cloud environments (Heroku, AWS, Vercel, Nginx)
app.set("trust proxy", 1);

// ==========================================
// 1. GLOBAL SECURITY MIDDLEWARES
// ==========================================

// Helmet Security Headers (CSP, HSTS, Sniffing, Frameguard)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://apis.google.com"],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
        connectSrc: ["'self'", "https:", "http:", "ws:", "wss:"],
        frameSrc: ["'self'", "https:"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: process.env.NODE_ENV === "production" ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: "sameorigin" },
    noSniff: true,
  })
);

// Strict CORS Allowlist
const rawAllowed = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:5173",
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",") : []),
];

const allowedOrigins = [
  ...new Set(rawAllowed.map((o) => o.trim()).filter(Boolean)),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (Postman, curl, backend microservices)
      if (!origin) return callback(null, true);

      // In development / test mode, allow local development ports
      if (
        process.env.NODE_ENV !== "production" &&
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }

      // Check strictly against configured allowlist
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Explicitly reject unauthorized cross-origin requests
      return callback(
        new Error("CORS policy violation: Access from origin is not allowed."),
        false
      );
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "X-CSRF-Token",
    ],
    maxAge: 86400, // Cache preflight response for 24 hours
  })
);

// Rate Limiting Middlewares
// Strict limiter for authentication routes (brute-force defense)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 25 : 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many authentication attempts. Please try again after 15 minutes.",
    },
  },
});

// General API Rate Limiter
const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 500 : 2000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests from this IP. Please try again later.",
    },
  },
});

// Apply Rate Limiters
app.use("/api/auth", authLimiter);
app.use("/api", generalApiLimiter);

// Body Parsing with defensive size limits (1MB for JSON/URL-encoded)
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Request Logger (Development)
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`📡 [${req.method}] ${req.originalUrl}`);
    next();
  });
}

// ==========================================
// 2. HEALTH CHECK & ROOT
// ==========================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message:
      "HireBridgeHR REST API is active and connected to Firebase Firestore.",
    version: "1.0.0",
    healthCheck: "/api/health",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: "Firebase Firestore Connected",
  });
});

// Serve static public assets with defensive security headers and dotfile ignoring
app.use(
  express.static(path.resolve(process.cwd(), "public"), {
    dotfiles: "ignore",
    index: false,
    setHeaders: (res, filePath) => {
      res.setHeader("X-Content-Type-Options", "nosniff");
      if (filePath.includes("uploads")) {
        // Prevent inline script execution for uploaded assets
        res.setHeader("Content-Security-Policy", "default-src 'none'");
      }
    },
  })
);

// ==========================================
// 3. MOUNT API ROUTES
// ==========================================

// Authentication Routes
app.use("/api/auth", authRoutes);

// Job Routes (Supports both /api/v1/jobs and /api/jobs for frontend compatibility)
app.use("/api/v1/jobs", jobRoutes);
app.use("/api/jobs", jobRoutes);

// Candidate Routes (Supports both /api/v1/candidates and /api/candidates)
app.use("/api/v1/candidates", candidateRoutes);
app.use("/api/candidates", candidateRoutes);

// Application Routes (Supports both /api/v1/applications and /api/applications)
app.use("/api/v1/applications", applicationRoutes);
app.use("/api/applications", applicationRoutes);

// Interview Routes
app.use("/api/v1/interviews", interviewRoutes);

// Notification Routes
app.use("/api/v1/notifications", notificationRoutes);

// Admin & Governance Routes
app.use("/api/v1/admin", adminRoutes);

// Analytics & Reports Routes
app.use("/api/v1/reports", reportRoutes);

// File & Cloud Storage Routes
app.use("/api/v1/storage", storageRoutes);
app.use("/api/storage", storageRoutes);

// AI Candidate Matching & Resume Parsing
app.use("/api/v1/ai", aiRoutes);
app.use("/api/ai", aiRoutes);

// Job Distribution Feeds & Syndication
app.use("/api/v1/distribution", distributionRoutes);
app.use("/api/distribution", distributionRoutes);

// Digital Offer Letters & In-Portal e-Signatures
app.use("/api/v1/offers", offerRoutes);
app.use("/api/offers", offerRoutes);

// Candidate Direct Messaging & SMS Alerts
app.use("/api/v1/messages", messageRoutes);
app.use("/api/messages", messageRoutes);

// Multi-Tenant Billing, Plans & Stripe Subscriptions
app.use("/api/v1/billing", billingRoutes);
app.use("/api/billing", billingRoutes);

// Outbound Webhooks & HRIS Integrations (Slack, BambooHR, Workday)
app.use("/api/v1/webhooks", webhookRoutes);
app.use("/api/webhooks", webhookRoutes);

// Async Video/Voice Screening & Audio Transcription
app.use("/api/v1/screenings", screeningRoutes);
app.use("/api/screenings", screeningRoutes);

// Automated Skill Assessments & Coding Quizzes
app.use("/api/v1/assessments", assessmentRoutes);
app.use("/api/assessments", assessmentRoutes);

// Blind Hiring Mode & EEOC Compliance Suite
app.use("/api/v1/compliance", complianceRoutes);
app.use("/api/compliance", complianceRoutes);

// Automated Candidate Reference Checks
app.use("/api/v1/references", referenceRoutes);
app.use("/api/references", referenceRoutes);

// Chrome Sourcing Extension & Talent Pool CRM
app.use("/api/v1/sourcing", sourcingRoutes);
app.use("/api/sourcing", sourcingRoutes);

// Autonomous AI Recruiter Agent & 2-Way Calendar Booking
app.use("/api/v1/agent", agentRoutes);
app.use("/api/agent", agentRoutes);

// Predictive Hiring Analytics & Diversity Intelligence
app.use("/api/v1/analytics", predictiveAnalyticsRoutes);
app.use("/api/analytics", predictiveAnalyticsRoutes);

// Enterprise SAML 2.0 / SSO & Granular RBAC
app.use("/api/v1/sso", ssoRoutes);
app.use("/api/sso", ssoRoutes);

// Automated Background Checks & Employee Onboarding Workflow
app.use("/api/v1/onboarding", onboardingRoutes);
app.use("/api/onboarding", onboardingRoutes);

// ==========================================
// 4. ERROR HANDLING MIDDLEWARE
// ==========================================

app.use(notFoundHandler);
app.use(errorHandler);

// ==========================================
// 5. SERVER BOOT & SEEDING
// ==========================================

app.listen(PORT, async () => {
  console.log(`
  ======================================================
  🚀 HireBridgeHR Backend Server Running (Secured)
  📡 Local URL:      http://localhost:${PORT}
  🔗 Health Check:   http://localhost:${PORT}/api/health
  📂 Database:       Firebase Firestore
  ⚡ Connected To:   Vite Frontend (http://localhost:3000)
  🛡️ Security:       Helmet, Strict CORS, Rate Limiting Active
  ======================================================
  `);

  // Run optional initial Firestore seed if collection is empty
  await seedInitialDatabase();
});

export default app;
