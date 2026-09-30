import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Database & Seed
import "./Config/connetDB.js";
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
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
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
  ⚡ Connected To:   Vite Frontend (http://localhost:5173)
  ======================================================
  `);

  // Run optional initial Firestore seed if collection is empty
  await seedInitialDatabase();
});
export default app;
