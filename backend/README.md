# HirebridgeHR Backend — Multi-Tenant ATS REST API

An enterprise-grade, scalable, and secure backend for **HirebridgeHR**, a multi-tenant Applicant Tracking System (ATS). Built using Node.js, Express.js (ES Modules), Prisma ORM, and Supabase PostgreSQL.

---

## 🚀 Key Features

* **Multi-Tenant Architecture**: Strict organizational isolation across users, jobs, candidates, applications, interviews, notifications, and audit logs.
* **Authentication & Token Rotation**:
  * JWT short-lived access tokens (15 minutes).
  * HttpOnly refresh cookies with cryptographic token rotation and automatic reuse detection.
  * Argon2id password hashing with bcrypt fallback.
* **Role-Based Access Control (RBAC)**:
  * Centralized middleware supporting `OWNER`, `ADMIN`, `RECRUITER`, `HIRING_MANAGER`, `INTERVIEWER`, `VIEWER`, `SUPER_ADMIN`, and `CANDIDATE`.
* **Core ATS Pipelines**:
  * **Job Management**: Server-side filtering, search, pagination, lifecycle transitions, and manual admin publication workflow.
  * **Candidate Management**: Profile attributes, internal recruiter notes, tagging, rating, and full history.
  * **Secure Resume Storage**: Private Supabase Storage bucket integration with short-lived (15-minute) cryptographic signed download URLs.
  * **Application Workflows**: Full pipeline tracking (`APPLIED` → `SCREENING` → `SHORTLISTED` → `INTERVIEW` → `OFFER` → `HIRED`), duplicate application prevention, and activity auditing.
  * **Interview Lifecycle**: Scheduling, duration, meeting links, and candidate feedback rating/pros/cons evaluations.
  * **Real-time Analytics**: Real database aggregations for funnel metrics, candidate sources, job performance, and recruiter activity.
* **Security & Reliability**:
  * Helmet security headers & strict CORS allowlists.
  * Rate limiting on authentication and sensitive endpoints.
  * Zod validation for request bodies, parameters, and query strings.
  * Non-blocking centralized audit logging.
  * Interactive Swagger / OpenAPI documentation.
* **Frontend Compatibility**:
  * Dual-routing support for both `/api` and `/api/v1` prefixes.
  * Direct compatibility with the existing HirebridgeHR React frontend.
  * Zero-setup offline development store for testing and preview without mandatory live database setup.

---

## 🛠️ Technology Stack

| Component | Technology |
| :--- | :--- |
| **Runtime** | Node.js (v20+ LTS recommended) |
| **Language** | JavaScript (Native ES Modules `"type": "module"`) |
| **Web Framework** | Express.js |
| **Database ORM** | Prisma ORM 6.4.1 |
| **Database** | Supabase PostgreSQL |
| **File Storage** | Supabase Storage (Private Resume Bucket) |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`) & `cookie-parser` |
| **Password Hashing** | Argon2id (`argon2`) & `bcryptjs` |
| **Validation** | Zod 3.x |
| **Testing** | Vitest & Supertest |
| **API Documentation**| OpenAPI 3.0 & Swagger UI Express |

---

## 📁 Project Structure

```text
backend/
├── prisma/
│   ├── schema.prisma          # Comprehensive 18-model schema with constraints & indexes
│   └── seed.js                # Local database seeder with realistic test records
├── src/
│   ├── config/
│   │   ├── env.js             # Zod environment variable parser with safe defaults
│   │   └── cors.js            # CORS configuration with credentials support
│   ├── controllers/           # HTTP Request handlers
│   │   ├── auth.controller.js
│   │   ├── organization.controller.js
│   │   ├── job.controller.js
│   │   ├── candidate.controller.js
│   │   ├── application.controller.js
│   │   ├── interview.controller.js
│   │   ├── notification.controller.js
│   │   ├── report.controller.js
│   │   └── admin.controller.js
│   ├── services/              # Business logic & data transformations
│   │   ├── auth.service.js
│   │   ├── organization.service.js
│   │   ├── job.service.js
│   │   ├── candidate.service.js
│   │   ├── application.service.js
│   │   ├── interview.service.js
│   │   ├── notification.service.js
│   │   ├── report.service.js
│   │   ├── admin.service.js
│   │   └── audit.service.js
│   ├── routes/                # Modular Express routes
│   │   ├── index.js           # Master router mounted at /api and /api/v1
│   │   ├── auth.routes.js
│   │   ├── organization.routes.js
│   │   ├── job.routes.js
│   │   ├── candidate.routes.js
│   │   ├── application.routes.js
│   │   ├── interview.routes.js
│   │   ├── notification.routes.js
│   │   ├── report.routes.js
│   │   └── admin.routes.js
│   ├── middleware/            # Cross-cutting middleware
│   │   ├── auth.middleware.js
│   │   ├── tenant.middleware.js
│   │   ├── rbac.middleware.js
│   │   ├── validation.middleware.js
│   │   ├── rateLimiter.middleware.js
│   │   └── error.middleware.js
│   ├── validators/            # Zod validation schemas
│   ├── utils/                 # ApiResponse, ApiError, logger, password utilities
│   ├── lib/
│   │   ├── prisma.js          # PrismaClient singleton
│   │   ├── supabase.js        # Supabase Storage client & signed URL helpers
│   │   ├── jwt.js             # JWT signer & token hashers
│   │   └── devStore.js        # In-memory development store
│   ├── docs/
│   │   └── swagger.js         # OpenAPI 3.0 specification
│   ├── app.js                 # Express application configuration
│   └── server.js              # Server bootstrapper & graceful shutdown
├── tests/                     # Integration and security test suite
├── docs/
│   └── FRONTEND_API.md        # Complete frontend integration contract
├── .env.example
├── Dockerfile
├── docker-compose.yml
└── package.json
```

---

## ⚡ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your Supabase connection strings:
```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY]
```

### 3. Database Migration & Seeding
Generate the Prisma Client and migrate your database:
```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema migrations to Supabase PostgreSQL
npm run prisma:migrate

# Seed development data
npm run prisma:seed
```

### 4. Run the Development Server
```bash
npm run dev
```
The server will start at `http://localhost:5000`.
* **Swagger API Documentation**: `http://localhost:5000/api/docs`
* **Health Check**: `http://localhost:5000/api/health`

---

## 🧪 Running Automated Tests

Run the complete test suite with Vitest and Supertest:
```bash
npm test
```
The test suite covers:
* User registration and authentication workflows
* Malformed body rejection & rate limiting
* Multi-tenant isolation & header spoofing protection
* Unauthorized candidate access restrictions
* Public and organization-scoped job filtering
* Health check status validation

---

## 📦 Docker Deployment

### Run with Docker Compose
```bash
docker compose up -d --build
```
This spins up:
1. `hirebridgehr-api`: The Express backend application on port `5000`.
2. `hirebridgehr-db`: A local PostgreSQL 16 container on port `5432` with pre-configured health checks.

---

## 🔒 Security Practices

1. **HttpOnly Refresh Cookies**: Prevents client-side scripts from reading the refresh token, eliminating XSS token theft.
2. **Refresh Token Reuse Detection**: If a compromised token hash is presented, all sessions for that user are immediately invalidated.
3. **Multi-Tenant Enforcement**: Queries are strictly filtered by trusted server-verified `organizationId` from authenticated memberships.
4. **Private Documents**: Resumes are stored in a private Supabase bucket and served exclusively via short-lived signed URLs.
5. **No Password Leaks**: Password hashes and tokens are strictly excluded from JSON responses and audit logs.
