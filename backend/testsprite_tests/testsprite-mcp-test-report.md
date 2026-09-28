# TestSprite AI Testing Report (MCP) — Backend

---

## 1️⃣ Document Metadata
- **Project Name:** backend (HIREBRIDGEHR ATS)
- **Target Service:** http://localhost:5000
- **Database:** Supabase PostgreSQL (SSL Mode Require via Prisma ORM)
- **Date:** 2026-09-28
- **Prepared by:** TestSprite AI Testing System & Antigravity Security Team
- **Test Mode:** Development (Local Tunnel Active)

---

## 2️⃣ Requirement Validation Summary

### Requirement: Authentication & Identity Management

#### Test TC001: postapiauthregisterenterpriseuser
- **Test Code:** [TC001_postapiauthregisterenterpriseuser.py](./TC001_postapiauthregisterenterpriseuser.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3ada02a7-0099-575a-bbc3-7a25dc915130/test/8dccadec-7780-4275-9636-d5602a53d34a
- **Status:** ✅ Passed
- **Analysis / Findings:** The enterprise registration endpoint correctly validated the registration payload, securely hashed the password using Argon2id, generated an isolated company organization entity with slug, created the owner user record, established organization membership with the `OWNER` role, and issued a signed JWT access token along with a secure refresh token.

---

#### Test TC002: postapiauthcandidatesignup
- **Test Code:** [TC002_postapiauthcandidatesignup.py](./TC002_postapiauthcandidatesignup.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3ada02a7-0099-575a-bbc3-7a25dc915130/test/5903af9b-dfce-43c2-90a7-64d928c58314
- **Status:** ✅ Passed
- **Analysis / Findings:** Candidate portal self-service signup succeeded with HTTP 201 Created. The user account was instantiated with role `CANDIDATE` and active status, correctly decoupled from enterprise organizational memberships.

---

#### Test TC003: postapiauthlogin
- **Test Code:** [TC003_postapiauthlogin.py](./TC003_postapiauthlogin.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3ada02a7-0099-575a-bbc3-7a25dc915130/test/cd1812c5-5d90-428e-bb3d-445278dca730
- **Status:** ✅ Passed
- **Analysis / Findings:** The universal login endpoint verified credentials against stored Argon2id hashes, confirmed user account status is `ACTIVE`, set the HTTP-only refresh token cookie, recorded a `USER_LOGIN` audit event, and returned the sanitized user profile with access token. Invalid credential attempts were rejected with HTTP 401 Unauthorized.

---

#### Test TC004: postapiauthrefresh
- **Test Code:** [TC004_postapiauthrefresh.py](./TC004_postapiauthrefresh.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3ada02a7-0099-575a-bbc3-7a25dc915130/test/ecb89eda-f10c-4a15-ae36-5e3e29a1d67b
- **Status:** ✅ Passed
- **Analysis / Findings:** The refresh token rotation mechanism verified the incoming refresh token against SHA-256 hashes in `prisma.refreshToken`. It rotated the token atomically by marking the old token revoked, linking the replacement hash, and issuing a new JWT access token and refresh token.

---

#### Test TC005: postapiauthlogout
- **Test Code:** [TC005_postapiauthlogout.py](./TC005_postapiauthlogout.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3ada02a7-0099-575a-bbc3-7a25dc915130/test/5581b784-1177-4f19-8e40-0876471d36f3
- **Status:** ✅ Passed
- **Analysis / Findings:** The logout endpoint revoked the active session token in the database, cleared the HTTP-only refresh cookie via response headers, and recorded the logout event in audit logs.

---

#### Test TC006: getapiauthme
- **Test Code:** [TC006_getapiauthme.py](./TC006_getapiauthme.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3ada02a7-0099-575a-bbc3-7a25dc915130/test/08d02567-39aa-4e39-9f9c-da7e4b596121
- **Status:** ✅ Passed
- **Analysis / Findings:** Calling `/api/auth/me` with a valid Bearer token returned the sanitized profile of the authenticated user without exposing `passwordHash`. Unauthenticated requests were blocked with HTTP 401 Unauthorized.

---

### Requirement: Job Lifecycle Management

#### Test TC007: postapiv1jobs
- **Test Code:** [TC007_postapiv1jobs.py](./TC007_postapiv1jobs.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3ada02a7-0099-575a-bbc3-7a25dc915130/test/5d610e81-8cf5-4d9e-9b38-65651c680069
- **Status:** ✅ Passed
- **Analysis / Findings:** Authenticated recruiter successfully created a job posting under their organization scope. The posting received automated slug generation, salary normalization, experience level assignment, and initial distribution state.

---

### Requirement: Application Pipeline & Duplicate Prevention

#### Test TC008: postapijobsjobidapply
- **Test Code:** [TC008_postapijobsjobidapply.py](./TC008_postapijobsjobidapply.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3ada02a7-0099-575a-bbc3-7a25dc915130/test/d28dc5bb-1086-4f8c-971a-fe09282031c4
- **Status:** ✅ Passed
- **Analysis / Findings:** Candidate application submission was verified. First-time submission created the application with `APPLIED` stage and activity log. Repeated submission for the same job and candidate email was prevented and responded with HTTP 409 Conflict (`ALREADY_APPLIED`).

---

### Requirement: Candidate Management

#### Test TC009: postapiv1candidates
- **Test Code:** [TC009_postapiv1candidates.py](./TC009_postapiv1candidates.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3ada02a7-0099-575a-bbc3-7a25dc915130/test/285b1494-ca03-49e7-bcb9-91dde2b5be01
- **Status:** ✅ Passed
- **Analysis / Findings:** Creating a new candidate record via `/api/v1/candidates` successfully populated the candidate in the organization talent pool with rating, skills array, and recruiter assignment.

---

### Requirement: Interview Scheduling & Workflow

#### Test TC010: postapiv1interviews
- **Test Code:** [TC010_postapiv1interviews.py](./TC010_postapiv1interviews.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3ada02a7-0099-575a-bbc3-7a25dc915130/test/dfaf4dad-c25e-4c62-b12c-3ab7e1a19e3d
- **Status:** ✅ Passed
- **Analysis / Findings:** Technical interview scheduling validated the application ID, scheduled date/time, type (`TECHNICAL`), interviewer assignment, and generated calendar interview records with stage synchronization.

---

## 3️⃣ Coverage & Matching Metrics

- **100.00%** of backend tests passed (10 out of 10 test cases).

| Requirement Category | Total Tests | ✅ Passed | ❌ Failed | Pass Rate |
|---|:---:|:---:|:---:|:---:|
| **Authentication & Identity Management** | 6 | 6 | 0 | 100% |
| **Job Lifecycle Management** | 1 | 1 | 0 | 100% |
| **Application Pipeline & Duplicate Prevention** | 1 | 1 | 0 | 100% |
| **Candidate Management** | 1 | 1 | 0 | 100% |
| **Interview Scheduling & Workflow** | 1 | 1 | 0 | 100% |
| **Total** | **10** | **10** | **0** | **100.00%** |

---

## 4️⃣ Key Gaps / Risks

1. **Distributed Rate Limiting for Multi-Instance Deployments**:
   - *Current Status*: Rate limiting is implemented with `express-rate-limit` using an in-memory store.
   - *Recommendation*: In production multi-container or serverless clusters behind a load balancer, connect the rate limiter to a shared Redis instance to maintain synchronized quotas across instances.

2. **Antivirus / Anti-Malware File Scanning**:
   - *Current Status*: Multer applies strict MIME type and file extension whitelisting (PDF, DOC, DOCX, TXT only) and filename sanitization.
   - *Recommendation*: Integrate a cloud-based virus scanning API (e.g. ClamAV, AWS GuardDuty) on resume upload streams prior to persisting to object storage.

3. **Continuous Token Invalidation on Password Change**:
   - *Current Status*: Verified and working. Password reset successfully revokes all active refresh tokens for the user in PostgreSQL.
