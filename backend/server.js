import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

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

// ==========================================
// 1. GLOBAL MIDDLEWARES
// ==========================================

// Enable CORS for frontend Vite & custom clients
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);
      // Allow any localhost or 127.0.0.1 port in development
      if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
  }),
);

// Body Parsing
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

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

// Serve static public assets & uploads
app.use(express.static(path.resolve(process.cwd(), "public")));

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
  🚀 HireBridgeHR Backend Server Running
  📡 Local URL:      http://localhost:${PORT}
  🔗 Health Check:   http://localhost:${PORT}/api/health
  📂 Database:       Firebase Firestore
  ⚡ Connected To:   Vite Frontend (http://localhost:3000)
  ======================================================
  `);

  // Run optional initial Firestore seed if collection is empty
  await seedInitialDatabase();
});
export default app;
