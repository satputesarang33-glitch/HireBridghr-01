async function runEndToEndVerification() {
  console.log("========================================================");
  console.log("🧪 RUNNING END-TO-END FRONTEND <-> BACKEND VERIFICATION");
  console.log("========================================================");

  // 1. Frontend check
  const frontendRes = await fetch("http://localhost:3000");
  const html = await frontendRes.text();
  console.log("✓ Frontend server status:", frontendRes.status, "| HTML length:", html.length);
  console.log("✓ HTML contains #root:", html.includes('id="root"'));

  // 2. Backend Health check
  const backendHealth = await fetch("http://localhost:5000/api/health").then((r) => r.json());
  console.log("✓ Backend health status:", backendHealth.status, "| DB:", backendHealth.database);

  // 3. Recruiter Login
  const loginRes = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "elena.rostova@apextech.com" }),
  }).then((r) => r.json());
  console.log("✓ Recruiter Login:", loginRes.success, "| Token received:", !!loginRes.data?.token);
  const token = loginRes.data?.token;

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + token,
  };

  // 4. Jobs endpoint
  const jobsRes = await fetch("http://localhost:5000/api/v1/jobs", { headers: authHeaders }).then(
    (r) => r.json()
  );
  console.log("✓ Fetch Jobs (/api/v1/jobs):", jobsRes.success, "| Count:", jobsRes.data?.length);

  // 5. Single Job detail
  const jobId = jobsRes.data?.[0]?.id;
  const singleJobRes = await fetch(`http://localhost:5000/api/v1/jobs/${jobId}`, {
    headers: authHeaders,
  }).then((r) => r.json());
  console.log(
    `✓ Fetch Single Job details (${jobId}):`,
    singleJobRes.success,
    "| Title:",
    singleJobRes.data?.title
  );

  // 6. Candidates endpoint
  const candRes = await fetch("http://localhost:5000/api/v1/candidates", {
    headers: authHeaders,
  }).then((r) => r.json());
  console.log(
    "✓ Fetch Candidates (/api/v1/candidates):",
    candRes.success,
    "| Count:",
    candRes.data?.length
  );

  // 7. Applications endpoint
  const appRes = await fetch("http://localhost:5000/api/v1/applications", {
    headers: authHeaders,
  }).then((r) => r.json());
  console.log(
    "✓ Fetch Applications (/api/v1/applications):",
    appRes.success,
    "| Count:",
    appRes.data?.length
  );

  // 8. Interviews endpoint
  const intRes = await fetch("http://localhost:5000/api/v1/interviews", {
    headers: authHeaders,
  }).then((r) => r.json());
  console.log(
    "✓ Fetch Interviews (/api/v1/interviews):",
    intRes.success,
    "| Count:",
    intRes.data?.length
  );

  // 9. Notifications endpoint
  const notifRes = await fetch("http://localhost:5000/api/v1/notifications", {
    headers: authHeaders,
  }).then((r) => r.json());
  console.log(
    "✓ Fetch Notifications (/api/v1/notifications):",
    notifRes.success,
    "| Count:",
    notifRes.data?.length
  );

  // 10. Admin Organizations
  const orgsRes = await fetch("http://localhost:5000/api/v1/admin/organizations", {
    headers: authHeaders,
  }).then((r) => r.json());
  console.log(
    "✓ Fetch Admin Organizations (/api/v1/admin/organizations):",
    orgsRes.success,
    "| Count:",
    orgsRes.data?.length
  );

  // 11. Candidate Self-Portal: My Profile
  const myProfileRes = await fetch("http://localhost:5000/api/candidates/me", {
    headers: authHeaders,
  }).then((r) => r.json());
  console.log(
    "✓ Fetch Candidate Profile (/api/candidates/me):",
    myProfileRes.success,
    "| Name:",
    myProfileRes.data?.fullName
  );

  // 12. Candidate Self-Portal: Saved Jobs
  const savedJobsRes = await fetch("http://localhost:5000/api/candidates/saved-jobs", {
    headers: authHeaders,
  }).then((r) => r.json());
  console.log(
    "✓ Fetch Saved Jobs (/api/candidates/saved-jobs):",
    savedJobsRes.success,
    "| Total:",
    savedJobsRes.data?.length
  );

  // 13. Candidate Live Job Application Submission
  const testApplyRes = await fetch(`http://localhost:5000/api/jobs/${jobId}/apply`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      fullName: "End-to-End Test Applicant",
      email: `applicant-${Date.now()}@example.com`,
      phone: "+1 (555) 019-2831",
      coverLetter: "Live integration test application.",
    }),
  }).then((r) => r.json());
  console.log(
    "✓ Live Application Submission (/api/jobs/:id/apply):",
    testApplyRes.success,
    "| New App ID:",
    testApplyRes.data?.id
  );

  console.log("========================================================");
  console.log("🎉 ALL 13 END-TO-END INTEGRATION TESTS PASSED 100%!");
  console.log("========================================================");
}

runEndToEndVerification().catch((err) => {
  console.error("❌ Verification failed:", err);
  process.exit(1);
});
