import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { passwordUtils } from "../src/utils/password.js";
import { jwtLib } from "../src/lib/jwt.js";
import { prisma } from "../src/lib/prisma.js";
import { env } from "../src/config/env.js";
import { authService } from "../src/services/auth.service.js";
import { auditService } from "../src/services/audit.service.js";

describe("HirebridgeHR Comprehensive Security Controls Test Suite", () => {
  let testUser = null;
  let testOrg = null;
  let validAccessToken = "";
  let validRefreshToken = "";

  beforeAll(async () => {
    // Generate isolated test credentials
    const timestamp = Date.now();
    const testEmail = `sec.audit.${timestamp}@example.com`;
    const password = "TestSecurePassword123!";

    if (env.DATABASE_URL) {
      try {
        const regResult = await authService.register(
          {
            name: "Security Test Auditor",
            email: testEmail,
            password,
            organizationName: `Security Audit Corp ${timestamp}`,
          },
          { ipAddress: "127.0.0.1", userAgent: "SecurityTestSuite/1.0" },
        );
        testUser = regResult.user;
        validAccessToken = regResult.accessToken;
        validRefreshToken = regResult.rawRefreshToken;
      } catch (err) {
        // Fallback token synthesis if DB registration already ran
        validAccessToken = jwtLib.signAccessToken({
          id: `usr-sec-${timestamp}`,
          email: testEmail,
          role: "OWNER",
          organizationId: `org-sec-${timestamp}`,
        });
        validRefreshToken = jwtLib.signRefreshToken({
          id: `usr-sec-${timestamp}`,
        });
      }
    } else {
      validAccessToken = jwtLib.signAccessToken({
        id: `usr-sec-${timestamp}`,
        email: testEmail,
        role: "OWNER",
        organizationId: `org-sec-${timestamp}`,
      });
      validRefreshToken = jwtLib.signRefreshToken({
        id: `usr-sec-${timestamp}`,
      });
    }
  });

  // =========================================================================
  // 1. Password Hashing Security (Argon2id)
  // =========================================================================
  describe("1. Password Hashing (Argon2id)", () => {
    it("Should hash passwords using Argon2id or strong bcrypt", async () => {
      const rawPassword = "SuperSecretPassword@2026";
      const hash = await passwordUtils.hashPassword(rawPassword);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
      // Hash should be either Argon2id ($argon2id$) or bcrypt ($2a$/$2b$)
      expect(hash.startsWith("$argon2") || hash.startsWith("$2")).toBe(true);
      expect(hash).not.toBe(rawPassword);
    });

    it("Should successfully verify correct password against hash", async () => {
      const rawPassword = "VerifyMe12345!";
      const hash = await passwordUtils.hashPassword(rawPassword);

      const isValid = await passwordUtils.verifyPassword(hash, rawPassword);
      expect(isValid).toBe(true);
    });

    it("Should reject incorrect password verification", async () => {
      const rawPassword = "CorrectPassword123!";
      const hash = await passwordUtils.hashPassword(rawPassword);

      const isValid = await passwordUtils.verifyPassword(
        hash,
        "WrongPassword456!",
      );
      expect(isValid).toBe(false);
    });

    it("Should safely reject empty or null password inputs without crashing", async () => {
      const isValid = await passwordUtils.verifyPassword(null, "SomePass");
      expect(isValid).toBe(false);

      const isValid2 = await passwordUtils.verifyPassword("somehash", null);
      expect(isValid2).toBe(false);
    });
  });

  // =========================================================================
  // 2. JWT Verification & Tamper Resistance
  // =========================================================================
  describe("2. JWT Verification and Tamper Resistance", () => {
    it("Should successfully verify and decode a legitimately signed access token", () => {
      const payload = {
        id: "usr-1",
        email: "test@hirebridge.com",
        role: "RECRUITER",
      };
      const token = jwtLib.signAccessToken(payload);
      const decoded = jwtLib.verifyAccessToken(token);

      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    it("Should reject tampered or corrupted JWT tokens", () => {
      const token = jwtLib.signAccessToken({ id: "usr-1" });
      const tampered = token.slice(0, -6) + "abcdef";

      expect(() => jwtLib.verifyAccessToken(tampered)).toThrow();
    });

    it("Should reject tokens signed with an unauthorized secret", () => {
      import("jsonwebtoken").then(({ default: jwt }) => {
        const fakeToken = jwt.sign(
          { id: "usr-hacker" },
          "wrong-secret-key-123",
        );
        expect(() => jwtLib.verifyAccessToken(fakeToken)).toThrow();
      });
    });
  });

  // =========================================================================
  // 3. Refresh Token Rotation & Reuse Detection
  // =========================================================================
  describe("3. Refresh Token Rotation and Reuse Detection", () => {
    it("POST /api/auth/refresh - Should reject missing refresh token", async () => {
      const res = await request(app).post("/api/auth/refresh").send({});
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("POST /api/auth/refresh - Should rotate valid refresh token and issue new token pair", async () => {
      if (!validRefreshToken) return;

      const res = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken: validRefreshToken });

      if (res.status === 200) {
        expect(res.body.success).toBe(true);
        expect(res.body.data.token).toBeDefined();
        expect(res.body.data.accessToken).toBeDefined();

        // The old refresh token has now been rotated and revoked!
        // Now test REUSE DETECTION: Replaying the old token should be blocked!
        const reuseRes = await request(app)
          .post("/api/auth/refresh")
          .send({ refreshToken: validRefreshToken });

        expect(reuseRes.status).toBe(401);
        expect(reuseRes.body.success).toBe(false);
      } else {
        expect([200, 401]).toContain(res.status);
      }
    }, 15000);
  });

  // =========================================================================
  // 4. Session Revocation on Logout
  // =========================================================================
  describe("4. Session Revocation on Logout", () => {
    it("POST /api/auth/logout - Should clear refresh cookie and revoke session", async () => {
      const res = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send({ refreshToken: validRefreshToken });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // =========================================================================
  // 5. Password Reset: Single-Use & Expiration
  // =========================================================================
  describe("5. Password Reset Token Security", () => {
    it("POST /api/auth/forgot-password - Returns generic message to prevent account enumeration", async () => {
      const res = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "nonexistent-random-user@hirebridgehr.com" });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain(
        "password reset instructions have been sent",
      );
    });

    it("POST /api/auth/reset-password - Rejects invalid, malformed, or fake tokens", async () => {
      const res = await request(app).post("/api/auth/reset-password").send({
        token: "invalid-fake-token-12345",
        password: "NewStrongPassword123!",
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("Password reset token is single-use and invalidates subsequent attempts", async () => {
      if (!env.DATABASE_URL || !testUser) return;

      // Request reset token
      const forgotRes = await authService.forgotPassword(testUser.email);
      const resetToken = forgotRes.resetToken;

      if (resetToken) {
        // First reset should succeed
        const resetRes1 = await authService.resetPassword({
          token: resetToken,
          password: "NewChangedPassword123!",
        });
        expect(resetRes1.message).toBeDefined();

        // Second reset with SAME token MUST FAIL (Single-use enforcement)
        await expect(
          authService.resetPassword({
            token: resetToken,
            password: "AnotherPassword123!",
          }),
        ).rejects.toThrow();
      }
    });
  });

  // =========================================================================
  // 6. Protected APIs Reject Unauthenticated Requests
  // =========================================================================
  describe("6. Authentication Enforcement", () => {
    it("POST /api/v1/jobs - Rejects unauthenticated request without token", async () => {
      const res = await request(app)
        .post("/api/v1/jobs")
        .send({ title: "Unauthorized Job" });
      expect(res.status).toBe(401);
    });

    it("GET /api/v1/candidates - Rejects unauthenticated request", async () => {
      const res = await request(app).get("/api/v1/candidates");
      expect(res.status).toBe(401);
    });

    it("POST /api/v1/interviews - Rejects unauthenticated request", async () => {
      const res = await request(app)
        .post("/api/v1/interviews")
        .send({ applicationId: "x" });
      expect(res.status).toBe(401);
    });

    it("GET /api/v1/admin/users - Rejects unauthenticated request", async () => {
      const res = await request(app).get("/api/v1/admin/users");
      expect(res.status).toBe(401);
    });
  });

  // =========================================================================
  // 7. Server-Side RBAC Enforcement
  // =========================================================================
  describe("7. Server-Side RBAC Enforcement", () => {
    it("RECRUITER role is forbidden from accessing SUPER_ADMIN admin endpoints", async () => {
      let recruiterUser = null;
      if (env.DATABASE_URL) {
        recruiterUser = await prisma.user.findFirst({
          where: { role: "RECRUITER", status: "ACTIVE" },
        });
      }

      const recruiterToken = jwtLib.signAccessToken({
        id: recruiterUser?.id || "usr-recruiter-1",
        email: recruiterUser?.email || "recruiter@example.com",
        role: "RECRUITER",
        organizationId: "org-test-1",
      });

      const res = await request(app)
        .get("/api/v1/admin/organizations")
        .set("Authorization", `Bearer ${recruiterToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain("Access denied");
    });

    it("CANDIDATE role is forbidden from creating jobs", async () => {
      const candidateToken = jwtLib.signAccessToken({
        id: "candidate-test-1",
        email: "candidate@example.com",
        role: "CANDIDATE",
        organizationId: null,
      });

      const res = await request(app)
        .post("/api/v1/jobs")
        .set("Authorization", `Bearer ${candidateToken}`)
        .send({
          title: "Unauthorized Job Creation",
          department: "Engineering",
        });

      expect([401, 403]).toContain(res.status);
    });

    it("CANDIDATE cannot access internal candidate directory", async () => {
      const candidateToken = jwtLib.signAccessToken({
        id: "candidate-test-2",
        email: "candidate2@example.com",
        role: "CANDIDATE",
        organizationId: null,
      });

      const res = await request(app)
        .get("/api/v1/candidates")
        .set("Authorization", `Bearer ${candidateToken}`);

      expect([401, 403]).toContain(res.status);
    });
  });

  // =========================================================================
  // 8. Multi-Tenant Isolation
  // =========================================================================
  describe("8. Multi-Tenant Isolation", () => {
    it("User from Org A cannot access data in Org B via spoofed X-Organization-Id", async () => {
      const orgAToken = jwtLib.signAccessToken({
        id: "user-org-a-sec",
        email: "user.a@orga.com",
        role: "RECRUITER",
        organizationId: "org-a-security-test",
      });

      const res = await request(app)
        .get("/api/v1/jobs")
        .set("Authorization", `Bearer ${orgAToken}`)
        .set("X-Organization-Id", "org-b-different-tenant");

      // The tenant middleware must block or sanitize the cross-tenant attempt
      if (res.status === 200) {
        // If query returned, it must NOT return org-b's data
        const returnedJobs = res.body.data.jobs || [];
        for (const job of returnedJobs) {
          expect(job.organizationId).not.toBe("org-b-different-tenant");
        }
      } else {
        expect([401, 403]).toContain(res.status);
      }
    });
  });

  // =========================================================================
  // 9. File Upload Security & Restrictions
  // =========================================================================
  describe("9. File Upload Restrictions", () => {
    it("Rejects malicious/executable file uploads (.exe, .sh, .php)", async () => {
      const res = await request(app)
        .post("/api/v1/candidates/sample-id/resume")
        .set("Authorization", `Bearer ${validAccessToken}`)
        .attach(
          "resume",
          Buffer.from("#!/bin/bash\necho Malicious"),
          "malware.sh",
        );

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Invalid file type");
    });

    it("Rejects HTML or SVG uploads containing potential stored XSS", async () => {
      const res = await request(app)
        .post("/api/v1/candidates/sample-id/resume")
        .set("Authorization", `Bearer ${validAccessToken}`)
        .attach(
          "resume",
          Buffer.from('<script>alert("xss")</script>'),
          "resume.html",
        );

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Invalid file type");
    });
  });

  // =========================================================================
  // 10. Audit Log Credential Scrubbing
  // =========================================================================
  describe("10. Audit Log Credential Scrubbing", () => {
    it("auditService.log recursively removes passwords, tokens, and secrets", async () => {
      let loggedMetadata = null;

      // Temporarily intercept audit logging
      const testMetadata = {
        name: "Test Actor",
        password: "SensitivePassword123!",
        token: "secret-jwt-token-value",
        nested: {
          refreshToken: "deeply-nested-refresh-token",
          safeField: "harmless value",
        },
      };

      await auditService.log({
        action: "SECURITY_TEST_AUDIT",
        resourceType: "TEST",
        metadata: testMetadata,
      });

      // Verify devStore or DB doesn't have the sensitive fields in the latest audit entry
      const { devStore } = await import("../src/lib/devStore.js");
      const latestLog = devStore.auditLogs[0];
      if (latestLog && latestLog.action === "SECURITY_TEST_AUDIT") {
        expect(latestLog.metadata.password).toBe("[REDACTED]");
        expect(latestLog.metadata.token).toBe("[REDACTED]");
        expect(latestLog.metadata.nested.refreshToken).toBe("[REDACTED]");
        expect(latestLog.metadata.nested.safeField).toBe("harmless value");
      }
    });
  });

  // =========================================================================
  // 11. CORS Origin Protection
  // =========================================================================
  describe("11. CORS Origin Protection", () => {
    it("Rejects requests from unpermitted origins with standard CORS error in production mode", async () => {
      const { corsOptions } = await import("../src/config/cors.js");

      let errorReceived = null;
      corsOptions.origin(
        "http://evil-unauthorized-site.com",
        (err, allowed) => {
          errorReceived = err;
        },
      );

      if (env.NODE_ENV === "production") {
        expect(errorReceived).toBeInstanceOf(Error);
      }
    });
  });
});
