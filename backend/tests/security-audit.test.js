/**
 * HirebridgeHR Application Security Audit & Verification Suite
 * Runs non-destructive automated security tests against local server
 */

const BASE_URL = "http://localhost:5000";

async function runSecurityAuditTests() {
  console.log("========================================================");
  console.log("🛡️  RUNNING AUTOMATED APPLICATION SECURITY VERIFICATION");
  console.log("========================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = "") {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} ${details ? `(${details})` : ""}`);
      failed++;
    }
  }

  // ----------------------------------------------------
  // TEST GROUP 1: SECURITY HEADERS (HELMET)
  // ----------------------------------------------------
  console.log("\n--- 1. Security Headers Verification ---");
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  const headers = Object.fromEntries(healthRes.headers.entries());

  assert(
    headers["x-content-type-options"] === "nosniff",
    "MIME-sniffing protection (X-Content-Type-Options: nosniff) is active"
  );
  assert(
    headers["x-frame-options"] === "SAMEORIGIN",
    "Clickjacking protection (X-Frame-Options: SAMEORIGIN) is active"
  );
  assert(
    !!headers["content-security-policy"],
    "Content-Security-Policy (CSP) is active and enforced"
  );

  // ----------------------------------------------------
  // TEST GROUP 2: CORS STRICT ALLOWLIST
  // ----------------------------------------------------
  console.log("\n--- 2. CORS Allowlist Enforcement ---");
  const unauthorizedCorsRes = await fetch(`${BASE_URL}/api/health`, {
    headers: { Origin: "https://malicious-attacker-site.com" },
  });
  const corsAllowOrigin = unauthorizedCorsRes.headers.get("access-control-allow-origin");
  assert(
    corsAllowOrigin !== "https://malicious-attacker-site.com" &&
      corsAllowOrigin !== "*",
    "Strict CORS: Malicious origins are rejected and not reflected in allow-origin"
  );

  const authorizedCorsRes = await fetch(`${BASE_URL}/api/health`, {
    headers: { Origin: "http://localhost:3000" },
  });
  const validCors = authorizedCorsRes.headers.get("access-control-allow-origin");
  assert(
    validCors === "http://localhost:3000",
    "Strict CORS: Whitelisted frontend client (http://localhost:3000) is allowed"
  );

  // ----------------------------------------------------
  // TEST GROUP 3: AUTHENTICATION ENFORCEMENT & TOKEN FORGERY
  // ----------------------------------------------------
  console.log("\n--- 3. Authentication Enforcement & Token Forgery Defense ---");

  // 3a. Unauthenticated access to admin
  const unauthAdminRes = await fetch(`${BASE_URL}/api/v1/admin/users`);
  assert(
    unauthAdminRes.status === 401,
    "Unauthenticated request to /api/v1/admin/users is blocked with 401 Unauthorized",
    `Status: ${unauthAdminRes.status}`
  );

  // 3b. Forged arbitrary token
  const forgedTokenRes = await fetch(`${BASE_URL}/api/v1/admin/users`, {
    headers: { Authorization: "Bearer forged-attacker-token-xyz-123456" },
  });
  assert(
    forgedTokenRes.status === 401,
    "Forged arbitrary token is blocked with 401 Unauthorized",
    `Status: ${forgedTokenRes.status}`
  );

  // 3c. Legitimate Recruiter Login
  const recruiterLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "elena.rostova@apextech.com" }),
  }).then((r) => r.json());

  assert(
    recruiterLoginRes.success && !!recruiterLoginRes.data?.token,
    "Legitimate Recruiter Login successfully issues signed token"
  );
  const recruiterToken = recruiterLoginRes.data?.token;

  // 3d. Legitimate Candidate Login
  const candLoginRes = await fetch(`${BASE_URL}/api/auth/candidate/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "alex.rivera@example.com" }),
  }).then((r) => r.json());

  assert(
    candLoginRes.success && !!candLoginRes.data?.token,
    "Legitimate Candidate Login successfully issues signed token"
  );
  const candidateToken = candLoginRes.data?.token;

  // 3e. Password hash leakage prevention
  assert(
    !recruiterLoginRes.data?.user?.password && !recruiterLoginRes.data?.user?.passwordHash,
    "Recruiter user payload does not leak password or passwordHash"
  );
  assert(
    !candLoginRes.data?.user?.password && !candLoginRes.data?.user?.passwordHash,
    "Candidate user payload does not leak password or passwordHash"
  );

  // ----------------------------------------------------
  // TEST GROUP 4: ROLE-BASED ACCESS CONTROL (RBAC)
  // ----------------------------------------------------
  console.log("\n--- 4. Role-Based Access Control (RBAC) ---");

  // 4a. Candidate attempting to access Admin endpoints
  const candAdminRes = await fetch(`${BASE_URL}/api/v1/admin/users`, {
    headers: { Authorization: `Bearer ${candidateToken}` },
  });
  assert(
    candAdminRes.status === 403,
    "Candidate role cannot access Super Admin endpoint (403 Forbidden)",
    `Status: ${candAdminRes.status}`
  );

  // 4b. Candidate attempting to delete a candidate profile
  const candDeleteRes = await fetch(`${BASE_URL}/api/v1/candidates/cand-1`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${candidateToken}` },
  });
  assert(
    candDeleteRes.status === 403,
    "Candidate role cannot delete candidates from recruiter ATS (403 Forbidden)",
    `Status: ${candDeleteRes.status}`
  );

  // 4c. Recruiter accessing candidate list
  const recruiterCandRes = await fetch(`${BASE_URL}/api/v1/candidates`, {
    headers: { Authorization: `Bearer ${recruiterToken}` },
  });
  assert(
    recruiterCandRes.status === 200,
    "Authorized Recruiter can access candidates pipeline (200 OK)",
    `Status: ${recruiterCandRes.status}`
  );

  // ----------------------------------------------------
  // TEST GROUP 5: INSECURE DIRECT OBJECT REFERENCE (IDOR)
  // ----------------------------------------------------
  console.log("\n--- 5. Insecure Direct Object Reference (IDOR) ---");

  // 5a. Candidate withdrawing an application that belongs to another candidate
  const idorWithdrawRes = await fetch(`${BASE_URL}/api/v1/applications/app-101/withdraw`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${candidateToken}`,
      "Content-Type": "application/json",
    },
  });

  // app-101 belongs to Devon Vance (cand-1), while candidateToken is Alex Rivera (usr-cand-1)
  assert(
    idorWithdrawRes.status === 403 || idorWithdrawRes.status === 404,
    "IDOR Guard: Candidate blocked from tampering with/withdrawing another candidate's application",
    `Status: ${idorWithdrawRes.status}`
  );

  // ----------------------------------------------------
  // TEST GROUP 6: SECRETS LEAKAGE PREVENTION
  // ----------------------------------------------------
  console.log("\n--- 6. Secrets Masking & Sensitive Data Protection ---");

  // Webhooks secrets should be masked
  const webhooksRes = await fetch(`${BASE_URL}/api/v1/webhooks`, {
    headers: { Authorization: `Bearer ${recruiterToken}` },
  }).then((r) => r.json());

  const secretsMasked =
    webhooksRes.data &&
    webhooksRes.data.length > 0 &&
    webhooksRes.data.every(
      (w) => !w.secret || w.secret.includes("••••") || w.secret.includes("[REDACTED]")
    );

  assert(
    secretsMasked,
    "Webhook signing secrets are properly masked in API responses"
  );

  // ----------------------------------------------------
  // TEST GROUP 7: DEFENSIVE FILE UPLOAD VALIDATION
  // ----------------------------------------------------
  console.log("\n--- 7. Defensive File Upload Validation ---");

  // 7a. Reject dangerous executable extension (.exe)
  const formDataExe = new FormData();
  const fakeExeBlob = new Blob(["MZ_FAKE_EXECUTABLE_CONTENT"], {
    type: "application/octet-stream",
  });
  formDataExe.append("file", fakeExeBlob, "payload.exe");

  const exeUploadRes = await fetch(`${BASE_URL}/api/v1/storage/upload`, {
    method: "POST",
    body: formDataExe,
  });
  assert(
    exeUploadRes.status >= 400,
    "Malicious executable upload (.exe) is rejected by security file filter",
    `Status: ${exeUploadRes.status}`
  );

  // 7b. Reject disguised file (claimed .pdf but invalid signature)
  const formDataFakePdf = new FormData();
  const fakePdfBlob = new Blob(["<html><script>alert('xss')</script></html>"], {
    type: "application/pdf",
  });
  formDataFakePdf.append("file", fakePdfBlob, "attack.pdf");

  const fakePdfRes = await fetch(`${BASE_URL}/api/v1/storage/upload`, {
    method: "POST",
    body: formDataFakePdf,
  });
  assert(
    fakePdfRes.status >= 400,
    "Disguised file upload (fake PDF magic bytes) is detected and rejected",
    `Status: ${fakePdfRes.status}`
  );

  // 7c. Legitimate PDF upload with valid %PDF header
  const formDataValidPdf = new FormData();
  const validPdfBlob = new Blob(["%PDF-1.4\n%Valid Sample Candidate Resume Content\n%%EOF"], {
    type: "application/pdf",
  });
  formDataValidPdf.append("file", validPdfBlob, "candidate_resume.pdf");

  const validPdfRes = await fetch(`${BASE_URL}/api/v1/storage/upload`, {
    method: "POST",
    body: formDataValidPdf,
  });
  assert(
    validPdfRes.status === 200,
    "Legitimate PDF with genuine magic bytes is accepted and processed",
    `Status: ${validPdfRes.status}`
  );

  // ----------------------------------------------------
  // TEST GROUP 8: RATE LIMITING HEADERS
  // ----------------------------------------------------
  console.log("\n--- 8. Rate Limiting Protection ---");
  const authRateLimitRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "invalid-rate-test@example.com" }),
  });

  const rlLimit = authRateLimitRes.headers.get("ratelimit-limit");
  const rlRemaining = authRateLimitRes.headers.get("ratelimit-remaining");

  assert(
    !!rlLimit && rlRemaining !== null,
    `Brute-force rate limiting active on /api/auth (Limit: ${rlLimit}, Remaining: ${rlRemaining})`
  );

  // ----------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------
  console.log("\n========================================================");
  console.log(`📊 SECURITY AUDIT TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log("========================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityAuditTests().catch((err) => {
  console.error("❌ Fatal error in security audit tests:", err);
  process.exit(1);
});
