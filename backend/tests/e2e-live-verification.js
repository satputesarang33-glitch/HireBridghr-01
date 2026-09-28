// Node 22 native fetch is available globally

const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:5000';

async function verify() {
  console.log('====================================================');
  console.log('   HIREBRIDGEHR LIVE END-TO-END INTEGRATION TEST    ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}: ${details}`);
      failed++;
    }
  }

  // 1. Verify Frontend HTTP Server is Serving Vite SPA
  console.log('1. Checking Frontend Development Server...');
  try {
    const frontendRes = await fetch(FRONTEND_URL);
    const html = await frontendRes.text();
    assert(frontendRes.status === 200, 'Frontend server responds with HTTP 200');
    assert(html.includes('<div id="root">') || html.includes('id="root"'), 'Frontend serves valid SPA entry point (#root)');
    assert(html.includes('/src/main.'), 'Frontend serves main module script reference');
  } catch (err) {
    assert(false, 'Frontend server accessibility', err.message);
  }

  // 2. Verify CORS Preflight Options Request from Frontend Origin
  console.log('\n2. Checking CORS Preflight & Credentials Support...');
  try {
    const optionsRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'OPTIONS',
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Authorization,X-Organization-Id',
      },
    });
    const allowOrigin = optionsRes.headers.get('access-control-allow-origin');
    const allowCreds = optionsRes.headers.get('access-control-allow-credentials');
    assert(optionsRes.status === 200 || optionsRes.status === 204, 'CORS Preflight responds with 200/204 status');
    assert(allowOrigin === FRONTEND_URL, `CORS Allow-Origin matches frontend origin (${allowOrigin})`);
    assert(allowCreds === 'true', 'CORS allows credentials for secure cookies & auth');
  } catch (err) {
    assert(false, 'CORS Preflight check', err.message);
  }

  // 3. Authenticate as Enterprise Recruiter / Owner
  console.log('\n3. Testing Enterprise Recruiter Authentication Flow...');
  let recruiterToken = '';
  let orgId = '';
  try {
    const loginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_URL,
      },
      body: JSON.stringify({
        email: 'sarah.connor@apextech.com',
        password: 'Password123!',
      }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200 && loginData.success, 'Enterprise login returns HTTP 200 and success=true');
    recruiterToken = loginData.data?.accessToken || loginData.data?.token;
    assert(!!recruiterToken, 'Enterprise login provides valid JWT access token');
    assert(loginData.data?.user?.role === 'OWNER', 'User role resolved as OWNER');
    orgId = loginData.data?.user?.organizationId;
  } catch (err) {
    assert(false, 'Enterprise Recruiter Login', err.message);
  }

  // 4. Test Jobs API via /api/v1/jobs (Dual Route compatibility with frontend)
  console.log('\n4. Testing Jobs API Integration...');
  let createdJobId = '';
  try {
    // List jobs
    const jobsRes = await fetch(`${BACKEND_URL}/api/v1/jobs`, {
      headers: {
        'Authorization': `Bearer ${recruiterToken}`,
        'X-Organization-Id': orgId,
        'Origin': FRONTEND_URL,
      },
    });
    const jobsData = await jobsRes.json();
    assert(jobsRes.status === 200 && Array.isArray(jobsData.data), `GET /api/v1/jobs returned ${jobsData.data?.length} jobs`);

    // Create a new job from frontend
    const newJobRes = await fetch(`${BACKEND_URL}/api/v1/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${recruiterToken}`,
        'X-Organization-Id': orgId,
        'Origin': FRONTEND_URL,
      },
      body: JSON.stringify({
        title: 'Full Stack Node.js Engineer',
        department: 'Engineering',
        location: 'Remote, US',
        workplaceType: 'REMOTE',
        jobType: 'FULL_TIME',
        status: 'PUBLISHED',
        description: 'Building next-generation enterprise ATS platforms.',
        requirements: ['Node.js', 'React', 'PostgreSQL', 'Prisma'],
      }),
    });
    const newJobData = await newJobRes.json();
    assert(newJobRes.status === 201 && newJobData.success, 'POST /api/v1/jobs successfully creates published job');
    createdJobId = newJobData.data?.id;
  } catch (err) {
    assert(false, 'Jobs API workflow', err.message);
  }

  // 5. Test Candidates API Integration
  console.log('\n5. Testing Candidates API Integration...');
  let candidateId = '';
  try {
    const candRes = await fetch(`${BACKEND_URL}/api/v1/candidates`, {
      headers: {
        'Authorization': `Bearer ${recruiterToken}`,
        'X-Organization-Id': orgId,
        'Origin': FRONTEND_URL,
      },
    });
    const candData = await candRes.json();
    assert(candRes.status === 200 && Array.isArray(candData.data), `GET /api/v1/candidates returned ${candData.data?.length} candidates`);

    // Create candidate
    const newCandRes = await fetch(`${BACKEND_URL}/api/v1/candidates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${recruiterToken}`,
        'X-Organization-Id': orgId,
        'Origin': FRONTEND_URL,
      },
      body: JSON.stringify({
        firstName: 'Devon',
        lastName: 'Miles',
        email: `devon.miles.${Date.now()}@example.com`,
        phone: '+1-555-0199',
        headline: 'Senior Backend Architect',
        experienceYears: 7,
        skills: ['Node.js', 'Express', 'Prisma', 'PostgreSQL'],
        source: 'LINKEDIN',
      }),
    });
    const newCandData = await newCandRes.json();
    assert(newCandRes.status === 201 && newCandData.success, 'POST /api/v1/candidates creates candidate');
    candidateId = newCandData.data?.id;
  } catch (err) {
    assert(false, 'Candidates API workflow', err.message);
  }

  // 6. Test Candidate Portal Authentication & Self-Service
  console.log('\n6. Testing Candidate Portal Integration...');
  let candidateToken = '';
  const candEmail = `alex.test.${Date.now()}@candidate.com`;
  try {
    // Signup candidate
    const candSignupRes = await fetch(`${BACKEND_URL}/api/auth/candidate/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_URL,
      },
      body: JSON.stringify({
        firstName: 'Alex',
        lastName: 'Candidate',
        email: candEmail,
        password: 'Password123!',
      }),
    });
    const candSignupData = await candSignupRes.json();
    assert(candSignupRes.status === 201 && candSignupData.success, 'POST /api/auth/candidate/signup creates candidate account');
    candidateToken = candSignupData.data?.accessToken;

    // Get candidate profile
    const profileRes = await fetch(`${BACKEND_URL}/api/candidates/me`, {
      headers: {
        'Authorization': `Bearer ${candidateToken}`,
        'Origin': FRONTEND_URL,
      },
    });
    const profileData = await profileRes.json();
    assert(profileRes.status === 200 && profileData.success, 'GET /api/candidates/me returns candidate profile');

    // Save job
    if (createdJobId) {
      const saveRes = await fetch(`${BACKEND_URL}/api/jobs/${createdJobId}/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${candidateToken}`,
          'Origin': FRONTEND_URL,
        },
      });
      const saveData = await saveRes.json();
      assert(saveRes.status === 200 && saveData.success, 'POST /api/jobs/:id/save saves job to candidate favorites');

      // Candidate submits application to the job
      const applyRes = await fetch(`${BACKEND_URL}/api/jobs/${createdJobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${candidateToken}`,
          'Origin': FRONTEND_URL,
        },
        body: JSON.stringify({
          fullName: 'Alex Candidate',
          email: candEmail,
          phone: '+1-555-0144',
          coverLetter: 'I am excited to apply for this Full Stack role.',
        }),
      });
      const applyData = await applyRes.json();
      assert(applyRes.status === 201 && applyData.success, 'POST /api/jobs/:id/apply successfully submits application');

      // Duplicate application prevention test
      const dupRes = await fetch(`${BACKEND_URL}/api/jobs/${createdJobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${candidateToken}`,
          'Origin': FRONTEND_URL,
        },
        body: JSON.stringify({
          fullName: 'Alex Candidate',
          email: candEmail,
        }),
      });
      const dupData = await dupRes.json();
      assert(dupRes.status === 409 || dupData.error?.code === 'ALREADY_APPLIED', 'Duplicate application is prevented with HTTP 409 / ALREADY_APPLIED');
    }
  } catch (err) {
    assert(false, 'Candidate Portal workflow', err.message);
  }

  // 7. Test Application Pipeline & Stage Progression
  console.log('\n7. Testing Enterprise Application Pipeline...');
  let applicationId = '';
  try {
    const appsRes = await fetch(`${BACKEND_URL}/api/v1/applications`, {
      headers: {
        'Authorization': `Bearer ${recruiterToken}`,
        'X-Organization-Id': orgId,
        'Origin': FRONTEND_URL,
      },
    });
    const appsData = await appsRes.json();
    assert(appsRes.status === 200 && Array.isArray(appsData.data), `GET /api/v1/applications returned ${appsData.data?.length} applications`);
    applicationId = appsData.data?.[0]?.id;

    if (applicationId) {
      // Advance stage to INTERVIEW
      const stageRes = await fetch(`${BACKEND_URL}/api/v1/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${recruiterToken}`,
          'X-Organization-Id': orgId,
          'Origin': FRONTEND_URL,
        },
        body: JSON.stringify({
          stage: 'INTERVIEW',
          note: 'Passed initial screening; advancing to technical interview.',
        }),
      });
      const stageData = await stageRes.json();
      assert(stageRes.status === 200 && stageData.success, 'PUT /api/v1/applications/:id advances candidate stage');
    }
  } catch (err) {
    assert(false, 'Applications pipeline workflow', err.message);
  }

  // 8. Test Interview Scheduling Flow
  console.log('\n8. Testing Interview Scheduling Flow...');
  try {
    const interviewRes = await fetch(`${BACKEND_URL}/api/v1/interviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${recruiterToken}`,
        'X-Organization-Id': orgId,
        'Origin': FRONTEND_URL,
      },
      body: JSON.stringify({
        applicationId: applicationId || 'app-1',
        candidateId: candidateId || 'cand-1',
        candidateName: 'Devon Miles',
        jobTitle: 'Full Stack Node.js Engineer',
        interviewerName: 'Sarah Connor',
        type: 'TECHNICAL',
        scheduledDate: new Date(Date.now() + 86400000).toISOString(),
        durationMinutes: 60,
        meetingLink: 'https://meet.google.com/abc-defg-hij',
      }),
    });
    const interviewData = await interviewRes.json();
    assert(interviewRes.status === 201 && interviewData.success, 'POST /api/v1/interviews schedules technical interview');

    // List interviews
    const listIntRes = await fetch(`${BACKEND_URL}/api/v1/interviews`, {
      headers: {
        'Authorization': `Bearer ${recruiterToken}`,
        'X-Organization-Id': orgId,
        'Origin': FRONTEND_URL,
      },
    });
    const listIntData = await listIntRes.json();
    assert(listIntRes.status === 200 && Array.isArray(listIntData.data), `GET /api/v1/interviews returned ${listIntData.data?.length} interviews`);
  } catch (err) {
    assert(false, 'Interviews API workflow', err.message);
  }

  // 9. Test Analytics & Reports Overview
  console.log('\n9. Testing Reports & Analytics API...');
  try {
    const reportRes = await fetch(`${BACKEND_URL}/api/v1/reports/overview`, {
      headers: {
        'Authorization': `Bearer ${recruiterToken}`,
        'X-Organization-Id': orgId,
        'Origin': FRONTEND_URL,
      },
    });
    const reportData = await reportRes.json();
    assert(reportRes.status === 200 && reportData.success, 'GET /api/v1/reports/overview returns full metrics');
    assert(Array.isArray(reportData.data?.funnel), 'Analytics report includes candidate recruitment funnel');
    assert(Array.isArray(reportData.data?.recruiterActivity), 'Analytics report includes recruiter team activity');
  } catch (err) {
    assert(false, 'Analytics & Reports workflow', err.message);
  }

  // 10. Test Notifications API
  console.log('\n10. Testing Notifications API...');
  try {
    const notifsRes = await fetch(`${BACKEND_URL}/api/v1/notifications`, {
      headers: {
        'Authorization': `Bearer ${recruiterToken}`,
        'X-Organization-Id': orgId,
        'Origin': FRONTEND_URL,
      },
    });
    const notifsData = await notifsRes.json();
    assert(notifsRes.status === 200 && Array.isArray(notifsData.data), `GET /api/v1/notifications returned ${notifsData.data?.length} notifications`);
  } catch (err) {
    assert(false, 'Notifications workflow', err.message);
  }

  // 11. Test Platform Administration (SUPER_ADMIN)
  console.log('\n11. Testing Platform Administration API (SUPER_ADMIN)...');
  try {
    const adminLoginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_URL,
      },
      body: JSON.stringify({
        email: 'alex.mercer@hirebridge.internal',
        password: 'Password123!',
      }),
    });
    const adminLoginData = await adminLoginRes.json();
    const adminToken = adminLoginData.data?.accessToken || adminLoginData.data?.token;
    assert(adminLoginRes.status === 200 && adminLoginData.data?.user?.role === 'SUPER_ADMIN', 'Platform Master Admin login successful');

    const [orgsRes, usersRes, pubsRes, auditRes] = await Promise.all([
      fetch(`${BACKEND_URL}/api/v1/admin/organizations`, {
        headers: { 'Authorization': `Bearer ${adminToken}`, 'Origin': FRONTEND_URL },
      }),
      fetch(`${BACKEND_URL}/api/v1/admin/users`, {
        headers: { 'Authorization': `Bearer ${adminToken}`, 'Origin': FRONTEND_URL },
      }),
      fetch(`${BACKEND_URL}/api/v1/admin/job-publications`, {
        headers: { 'Authorization': `Bearer ${adminToken}`, 'Origin': FRONTEND_URL },
      }),
      fetch(`${BACKEND_URL}/api/v1/admin/audit-logs`, {
        headers: { 'Authorization': `Bearer ${adminToken}`, 'Origin': FRONTEND_URL },
      }),
    ]);

    const orgsData = await orgsRes.json();
    const usersData = await usersRes.json();
    const pubsData = await pubsRes.json();
    const auditData = await auditRes.json();

    assert(orgsRes.status === 200 && Array.isArray(orgsData.data), `GET /api/v1/admin/organizations returned ${orgsData.data?.length} organizations`);
    assert(usersRes.status === 200 && Array.isArray(usersData.data), `GET /api/v1/admin/users returned ${usersData.data?.length} platform users`);
    assert(pubsRes.status === 200 && Array.isArray(pubsData.data), `GET /api/v1/admin/job-publications returned ${pubsData.data?.length} publication items`);
    assert(auditRes.status === 200 && Array.isArray(auditData.data), `GET /api/v1/admin/audit-logs returned ${auditData.data?.length} audit records`);
  } catch (err) {
    assert(false, 'Platform Administration workflow', err.message);
  }

  // 10. Summary
  console.log('\n====================================================');
  console.log(`RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

verify().catch((err) => {
  console.error('Unexpected error in verification script:', err);
  process.exit(1);
});
