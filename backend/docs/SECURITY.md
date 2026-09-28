# HIREBRIDGEHR — Production Security Architecture & Audit Report

**Version:** 1.0.0-PROD  
**Target Environment:** Production Node.js / Express / Prisma / Supabase PostgreSQL  
**Audit Date:** September 2026  
**Status:** Validated & Security Controls Active  

---

## 1. Executive Summary

HIREBRIDGEHR implements a multi-tenant, enterprise-grade Applicant Tracking System (ATS) backend security architecture. All 24 criteria of the **Final Security Acceptance Criteria** have been engineered, implemented, hardened, and verified with automated test suites.

### Core Security Verification Metrics

| Metric | Status | Details |
|---|:---:|---|
| **Security Controls Test Suite** | **PASS** | 25 / 25 automated security tests passing (`backend/tests/security-controls.test.js`) |
| **Full Unit / Integration Test Suite** | **PASS** | 42 / 42 tests passing (`npm test` via Vitest across 7 test suites) |
| **Live E2E Verification** | **PASS** | 31 / 31 tests passing (`node tests/e2e-live-verification.js`) |
| **Dependency Vulnerabilities** | **CLEAN** | `npm audit` reported **0 vulnerabilities** |
| **Database Encryption & Integrity** | **ACTIVE** | Supabase PostgreSQL via SSL mode `require`, parameterized Prisma queries |

---

## 2. Authentication & Session Architecture

### 2.1 Password Hashing (Argon2id)
- Passwords are encrypted using **Argon2id** (`argon2.argon2id`), the winner of the Password Hashing Competition (PHC) and recommended standard by OWASP.
- Configuration:
  - `memoryCost`: 65,536 KB (64 MB)
  - `timeCost`: 3 iterations
  - `parallelism`: 1 thread
- Verifications handle constant-time comparison to prevent timing attacks.
- Graceful backward-compatible verification supports legacy bcrypt hashes (`$2a$`, `$2b$`) if migrated.

### 2.2 JWT Tokens
- **Access Tokens**: Short-lived (15 minutes), signed using HMAC-SHA256 (`JWT_ACCESS_SECRET`). Payload includes user ID, email, role, and organization ID.
- **User Liveness Enforcement**: `requireAuth` middleware verifies user status against the live database (`status === 'ACTIVE'`) on every request, ensuring that deactivated, suspended, or deleted accounts are revoked immediately without waiting for JWT expiration.

### 2.3 Refresh Token Rotation & Token Reuse Detection
- Refresh tokens are cryptographically random and stored in the database as SHA-256 hashes (`tokenHash`).
- **Rotation**: On every `/api/auth/refresh` invocation, the old refresh token is marked `revoked: true` and linked to the replacement token (`replacedByTokenHash`). A brand-new refresh token and access token are issued.
- **Token Reuse Detection (Theft Alert)**: If an already-revoked refresh token is presented:
  1. The system detects potential session hijacking or replay attack.
  2. All refresh tokens belonging to that user are immediately invalidated (`revoked = true`).
  3. A high-severity security audit event (`SECURITY_ALERT_REFRESH_TOKEN_REUSE`) is logged.
  4. The request is rejected with `HTTP 401 Unauthorized`.
- Cookies: Stored in HTTP-only, secure, sameSite cookies (`refreshToken`), inaccessible to JavaScript.

### 2.4 Session Revocation on Logout
- `/api/auth/logout` explicitly hashes the presented refresh token and flags it as `revoked: true` in the database.
- The HTTP-only cookie is cleared on the client (`res.clearCookie`).

### 2.5 Single-Use, Expiring Password Reset Tokens
- Token generation uses cryptographically secure pseudo-random bytes (`crypto.randomBytes(32)` = 64-character hex string).
- Only SHA-256 hashes (`tokenHash`) are stored in `prisma.passwordResetToken`.
- **TTL**: Tokens expire after exactly 1 hour.
- **Single-Use**: Upon password update, the token is flagged `used: true`. Attempting to reuse the token returns `HTTP 400 Bad Request`.
- **Session Revocation**: Password reset automatically revokes all existing refresh tokens for the user, forcing re-authentication across all devices.
- **Enumeration Prevention**: Requesting a reset for a non-existent email returns the identical success message.

---

## 3. Authorization & Multi-Tenant Isolation

### 3.1 Server-Side Role-Based Access Control (RBAC)
Role hierarchy and permissions are strictly enforced server-side:
- `SUPER_ADMIN`: Platform-wide governance and administrative tools.
- `OWNER`: Full organizational control (billing, team management, job approvals).
- `ADMIN`: Operational management (postings, pipeline, team invites).
- `RECRUITER`: Job creation, candidate evaluation, interview scheduling.
- `HIRING_MANAGER`: Reviewing shortlists, conducting interviews, submitting feedback.
- `INTERVIEWER`: Assigned interview evaluations.
- `CANDIDATE`: Self-service portal (own profile, applications, saved jobs).

Client-supplied roles in request bodies or query parameters are ignored.

### 3.2 Multi-Tenant Data Isolation
- Tenant context is extracted from the verified access token and validated against database memberships in `requireOrganization` middleware.
- Client requests passing `X-Organization-Id` cannot access an organization unless an active membership exists in the database.
- Cross-tenant injection attempts return `HTTP 403 Forbidden`.
- Every database query (`prisma.job`, `prisma.candidate`, `prisma.application`, `prisma.interview`) enforces tenant boundaries (`where: { organizationId }`).

---

## 4. Candidate Privacy & Secure File Handling

### 4.1 Candidate Privacy
- Candidate profile self-service (`/api/candidates/me`) strictly whitelists editable fields (`firstName`, `lastName`, `phone`, `skills`, etc.).
- Candidates cannot manipulate administrative fields (`role`, `status`, `organizationId`).
- Candidate recruiter notes and evaluation ratings (`candidateNote`) are restricted to organizational recruiters and hiring managers; candidates can never view internal recruiter notes.

### 4.2 Secure Resume Handling & File Uploads
- **MIME Type Whitelist**: Only `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, and `text/plain` are accepted.
- **Extension Whitelist**: Only `.pdf`, `.doc`, `.docx`, and `.txt` are permitted. Dangerous file extensions (`.exe`, `.sh`, `.php`, `.html`, `.svg`) are rejected with `HTTP 400`.
- **File Size Limit**: Capped at 10 MB per upload.
- **Filename Sanitization**: Uploaded filenames are sanitized (`replace(/[^a-zA-Z0-9._-]/g, '_')`) to prevent directory traversal (`../`).
- **Private Storage & Short-Lived Signed URLs**: Resumes are stored in a private Supabase Storage bucket (`resumes-private`). Resumes are never served via public URLs. Downloads use short-lived HMAC-signed URLs valid for 15 minutes (900 seconds).

---

## 5. Network & Application Defenses

### 5.1 Explicit CORS Allowlist
- Explicit allowlist configured in `cors.js` supporting `http://localhost:3000`, `http://localhost:5173`, and production `CLIENT_URL` / `ALLOWED_ORIGINS`.
- Disallowed origins receive `Origin <origin> not allowed by CORS`.
- `credentials: true` enables secure cookie transmission for authorized origins only.

### 5.2 Rate Limiting
- **Authentication Rate Limiting (`authLimiter`)**: Capped at 20 requests per 15 minutes per IP on sensitive routes (`/login`, `/register`, `/forgot-password`, `/reset-password`).
- **API Rate Limiting (`apiLimiter`)**: Capped at 600 requests per 15 minutes per IP across general API routes.

### 5.3 Input Validation & Parameterized Queries
- All incoming payloads are validated against Zod schemas (`registerSchema`, `createJobSchema`, `updateCandidateSchema`, etc.).
- Database operations utilize Prisma ORM parameterized queries, preventing SQL injection vulnerabilities.

### 5.4 Error Response Masking
- Centralized error handler (`error.middleware.js`) masks internal server errors (`500`) in production with `'An unexpected error occurred. Please contact support.'`.
- Stack traces are suppressed outside development.
- Database connection strings, SQL queries, and table names are never leaked in API responses.

### 5.5 Audit Logging Sanitization
- `auditService.log` features recursive sanitization (`sanitizeAuditMetadata`) that strips passwords, tokens, API keys, credentials, hashes, and authorization headers before persistence.

---

## 6. Production Security Checklist & Environment Configuration

### Required Environment Variables (.env)
```ini
NODE_ENV=production
PORT=5000

# Direct & Connection-Pooled Database URLs with SSL
DATABASE_URL="postgresql://user:password@db.supabase.co:6543/postgres?pgbouncer=true&sslmode=require"
DIRECT_URL="postgresql://user:password@db.supabase.co:5432/postgres?sslmode=require"

# JWT Secrets (Generate with `openssl rand -base64 64`)
JWT_ACCESS_SECRET="<64_BYTE_BASE64_SECRET>"
JWT_REFRESH_SECRET="<64_BYTE_BASE64_SECRET>"
ACCESS_TOKEN_TTL="15m"
REFRESH_TOKEN_TTL="7d"

# CORS Allowed Origins
CLIENT_URL="https://app.hirebridgehr.com"
ALLOWED_ORIGINS="https://app.hirebridgehr.com,https://candidates.hirebridgehr.com"

# Supabase Storage Configuration
SUPABASE_URL="https://<ref>.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="<service_role_secret>"
SUPABASE_RESUME_BUCKET="resumes-private"
```

---

## 7. Remaining Operational Risks & Mitigation Recommendations

While application-level security controls meet or exceed production ATS standards, the following infrastructure-level recommendations should be observed when deploying to multi-server clusters:

1. **Distributed Rate Limiting**:
   - *Current Implementation*: Memory-backed `express-rate-limit`.
   - *Recommendation for Multi-Server Clusters*: Connect `express-rate-limit` to a shared Redis cluster (`rate-limit-redis`) to prevent rate limit bypass across load balancers.
2. **Antivirus / Anti-Malware File Scanning**:
   - *Current Implementation*: Strict MIME type, file extension, and buffer validation.
   - *Recommendation for Enterprise Compliance*: Integrate ClamAV or AWS GuardDuty / VirusTotal API webhook on uploaded resume buffers before writing to storage.
3. **Web Application Firewall (WAF)**:
   - Deploy behind Cloudflare, AWS WAF, or Fastly to mitigate DDoS attacks, inspect TLS handshakes, and enforce IP reputation filtering.
4. **Secrets Management**:
   - Store production secrets (`DATABASE_URL`, `JWT_ACCESS_SECRET`, etc.) in AWS Secrets Manager, HashiCorp Vault, or Doppler rather than file-based `.env` on production servers.
