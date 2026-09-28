# HirebridgeHR — Frontend API Integration Contract

This document provides frontend engineers with the exact API contracts, authentication flows, response formats, and error structures for integrating with the HirebridgeHR backend.

---

## 1. Base URL & Protocol

| Environment | Base URL |
| :--- | :--- |
| **Development** | `http://localhost:5000` |
| **API Version Prefix** | Both `/api` and `/api/v1` are fully supported |
| **Swagger UI** | `http://localhost:5000/api/docs` |
| **Health Check** | `http://localhost:5000/api/health` |

---

## 2. Authentication Architecture

The backend implements **dual-token authentication** with **automatic refresh token rotation**:

1. **Access Token**: Short-lived JWT (15 minutes). Send in the `Authorization` header:
   ```http
   Authorization: Bearer <accessToken>
   ```
2. **Refresh Token**: Long-lived token (7 days). Stored in a secure, `HttpOnly`, `SameSite` cookie named `refreshToken`.
3. **Cookie Credentials**: Frontend requests should include `{ credentials: 'include' }` (or `withCredentials: true` in Axios) so refresh token cookies are automatically sent and received.

### Token Rotation Flow (`POST /api/auth/refresh`)
When the frontend receives a `401 Unauthorized` with `"Access token has expired"`, call `POST /api/auth/refresh`. The server will issue a new access token and rotate the HttpOnly refresh cookie.

---

## 3. Standard Response Formats

### Successful Response
```json
{
  "success": true,
  "message": "Request completed successfully",
  "data": { ... }
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Data fetched successfully",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please enter a valid email address"
    }
  ]
}
```

---

## 4. Authentication & User Endpoints

### 4.1. Recruiter / Company Registration
* **Endpoint**: `POST /api/auth/register`
* **Auth**: None (Public)
* **Request Body**:
  ```json
  {
    "name": "Sarah Connor",
    "email": "sarah.connor@apextech.com",
    "password": "Password123!",
    "organizationName": "Apex Global Tech",
    "phone": "+1 (415) 890-1234"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Account created successfully",
    "data": {
      "user": {
        "id": "usr-1",
        "name": "Sarah Connor",
        "email": "sarah.connor@apextech.com",
        "role": "OWNER",
        "organizationId": "org-1",
        "organizationName": "Apex Global Tech"
      },
      "token": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
  ```

### 4.2. Candidate Portal Registration
* **Endpoint**: `POST /api/auth/candidate/signup`
* **Auth**: None (Public)
* **Request Body**:
  ```json
  {
    "firstName": "Alex",
    "lastName": "Rivera",
    "email": "alex.candidate@example.com",
    "password": "Password123!",
    "phone": "+1 (555) 234-5678",
    "location": "San Francisco, CA"
  }
  ```

### 4.3. Login (Recruiter or Candidate)
* **Endpoint**: `POST /api/auth/login` (or `/api/auth/candidate/login`)
* **Auth**: None
* **Request Body**:
  ```json
  {
    "email": "sarah.connor@apextech.com",
    "password": "Password123!"
  }
  ```
* **Response (200 OK)**:
  Returns user profile and JWT access token; sets HttpOnly refresh cookie.

### 4.4. Refresh Token
* **Endpoint**: `POST /api/auth/refresh`
* **Auth**: Refresh token HttpOnly cookie
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Token refreshed successfully",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIs...",
      "user": { ... }
    }
  }
  ```

### 4.5. Logout
* **Endpoint**: `POST /api/auth/logout` (or `/api/auth/candidate/logout`)
* **Auth**: Optional / Authenticated
* **Response (200 OK)**: Revokes session in database and clears cookie.

### 4.6. Current User Profile
* **Endpoint**: `GET /api/auth/me`
* **Auth**: `Bearer <token>`
* **Response (200 OK)**: Returns authenticated user details and organization role.

---

## 5. Job Management Endpoints

### 5.1. List Jobs
* **Endpoint**: `GET /api/jobs` or `GET /api/v1/jobs`
* **Auth**: Optional (Unauthenticated requests receive public jobs; authenticated requests receive organization-scoped jobs)
* **Query Parameters**:
  * `page` (integer, default: 1)
  * `limit` (integer, default: 20)
  * `search` (string: searches title, department, location)
  * `status` (enum: `ALL`, `DRAFT`, `PENDING_ADMIN_PUBLICATION`, `PUBLISHED`, `CLOSED`)
  * `department` (string)
  * `workplaceType` (enum: `REMOTE`, `HYBRID`, `ON_SITE`)
  * `employmentType` (enum: `FULL_TIME`, `PART_TIME`, `CONTRACT`)
* **Response (200 OK)**: Returns paginated job array.

### 5.2. Get Job Details
* **Endpoint**: `GET /api/jobs/:id` or `GET /api/v1/jobs/:id`
* **Auth**: Optional

### 5.3. Create Job
* **Endpoint**: `POST /api/jobs` or `POST /api/v1/jobs`
* **Auth**: Required (`OWNER`, `ADMIN`, `RECRUITER`)
* **Request Body**:
  ```json
  {
    "title": "Senior Full Stack Engineer",
    "department": "Engineering",
    "location": "San Francisco, CA",
    "workplaceType": "HYBRID",
    "employmentType": "FULL_TIME",
    "salaryMin": 140000,
    "salaryMax": 185000,
    "currency": "USD",
    "description": "Apex Global Tech is seeking...",
    "skills": ["React.js", "Node.js", "PostgreSQL"],
    "status": "DRAFT"
  }
  ```

### 5.4. Update Job
* **Endpoint**: `PUT /api/jobs/:id` or `PATCH /api/jobs/:id`
* **Auth**: Required (`OWNER`, `ADMIN`, `RECRUITER`)

### 5.5. Delete Job
* **Endpoint**: `DELETE /api/jobs/:id`
* **Auth**: Required (`OWNER`, `ADMIN`)

### 5.6. Submit Job for Publication
* **Endpoint**: `POST /api/jobs/:id/submit-publication`
* **Auth**: Required (`OWNER`, `ADMIN`, `RECRUITER`)
* **Behavior**: Transitions job status to `PENDING_ADMIN_PUBLICATION` and enqueues in administrator review queue.

### 5.7. Candidate Job Actions
* **Save Job**: `POST /api/jobs/:id/save` (Candidate Auth)
* **Unsave Job**: `DELETE /api/jobs/:id/save` (Candidate Auth)
* **Get Saved Jobs**: `GET /api/candidates/saved-jobs` (Candidate Auth)
* **Apply to Job**: `POST /api/jobs/:id/apply` (Public or Candidate Auth)

---

## 6. Candidate & Resume Endpoints

### 6.1. Candidate Portal Self-Service
* **Get My Profile**: `GET /api/candidates/me`
* **Update My Profile**: `PUT /api/candidates/me`
* **Upload Resume**: `POST /api/candidates/resume` (Accepts multipart `resume` file or JSON `{ resumeUrl, fileName, fileSize }`)
* **My Applications**: `GET /api/candidates/applications`

### 6.2. Recruiter Candidate Management
* **List Candidates**: `GET /api/candidates` (or `/api/v1/candidates`)
* **Get Candidate**: `GET /api/candidates/:id`
* **Create Candidate**: `POST /api/candidates`
* **Update Candidate**: `PUT /api/candidates/:id`
* **Delete Candidate**: `DELETE /api/candidates/:id`
* **Add Recruiter Note**: `POST /api/candidates/:id/notes`
  ```json
  {
    "content": "Outstanding system architecture interview performance.",
    "rating": 5
  }
  ```

### 6.3. Secure Resume Storage
* **Upload Resume Document**: `POST /api/candidates/:id/resume`
  * Format: `multipart/form-data` with field `resume` (PDF, DOC, DOCX up to 10MB)
  * Stored in private Supabase bucket: `${organizationId}/${candidateId}/${timestamp}_resume.pdf`
* **Get Signed Download URL**: `GET /api/candidates/:id/resume-url`
  * Returns short-lived signed URL (15 minutes expiry) ensuring confidential documents are never public.
* **Delete Resume Document**: `DELETE /api/candidates/:id/resume`

---

## 7. Application Management Endpoints

### 7.1. List Applications
* **Endpoint**: `GET /api/applications` or `GET /api/v1/applications`
* **Auth**: Recruiter / Admin / Owner
* **Query Parameters**: `jobId`, `stage`, `search`, `page`, `limit`

### 7.2. Submit Application
* **Endpoint**: `POST /api/applications` or `POST /api/jobs/:jobId/apply`
* **Duplicate Prevention**: Rejects duplicate submissions if email or candidate ID has already applied for the specified job.

### 7.3. Update Application Stage
* **Endpoint**: `PUT /api/applications/:id` or `PATCH /api/applications/:id/status`
* **Stages**: `APPLIED`, `SCREENING`, `SHORTLISTED`, `INTERVIEW`, `OFFER`, `HIRED`, `REJECTED`, `WITHDRAWN`
* **Behavior**: Atomically updates stage and logs transition in `ApplicationActivity`.

### 7.4. Withdraw Application
* **Endpoint**: `PATCH /api/applications/:id/withdraw` (Candidate Auth)

---

## 8. Interview Management Endpoints

* **List Interviews**: `GET /api/interviews`
* **Get Interview**: `GET /api/interviews/:id`
* **Schedule Interview**: `POST /api/interviews`
  ```json
  {
    "applicationId": "app-1",
    "scheduledDate": "2026-10-15T10:00:00Z",
    "interviewType": "VIDEO",
    "duration": 45,
    "meetingUrl": "https://meet.google.com/xyz-abcd-efg"
  }
  ```
* **Submit Interview Feedback**: `POST /api/interviews/:id/feedback`
  ```json
  {
    "rating": 5,
    "recommendation": "STRONG_HIRE",
    "pros": "Strong algorithmic and system design skills.",
    "cons": "None observed."
  }
  ```
* **Cancel Interview**: `PUT /api/interviews/:id` with `{ "status": "CANCELLED" }`

---

## 9. Reports & Analytics Endpoints

* **Overview Analytics**: `GET /api/reports/overview`
  * Returns active jobs count, total candidates, applications, scheduled interviews, hires, offers, recruitment funnel metrics, sources breakdown, and recruiter activity.
* **Funnel Report**: `GET /api/reports/funnel`
* **Sources Report**: `GET /api/reports/sources`

---

## 10. Platform Administration Endpoints (`SUPER_ADMIN`)

* **Platform Metrics**: `GET /api/admin/metrics` (or `/api/v1/admin/analytics`)
* **Organizations List**: `GET /api/admin/organizations`
* **Users List**: `GET /api/admin/users`
* **Publication Queue**: `GET /api/admin/publication-queue`
* **Approve / Reject Publication**: `PUT /api/admin/job-publications/:id` (or `PATCH /api/admin/publication-queue/:id`)
  ```json
  {
    "status": "PUBLISHED",
    "internalNotes": "Verified job requirements and approved for public portal."
  }
  ```
* **Platform Audit Logs**: `GET /api/admin/audit-logs`

---

## 11. Error Code Reference

| Status Code | Meaning | Common Scenario |
| :--- | :--- | :--- |
| **400 Bad Request** | Request validation failed | Missing required field, password too short, invalid format |
| **401 Unauthorized** | Missing or expired token | Token not supplied or expired JWT |
| **403 Forbidden** | Role / Tenant access denied | Accessing resource from another organization or missing role permission |
| **404 Not Found** | Resource not found | Requested Job / Candidate ID does not exist |
| **409 Conflict** | Resource conflict | Email already registered or candidate already applied to job |
| **429 Too Many Requests** | Rate limit exceeded | More than 20 login attempts in 15 minutes |
| **500 Server Error** | Internal error | Unhandled system exception |
