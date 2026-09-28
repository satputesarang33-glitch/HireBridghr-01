import os
import requests
import uuid
import time
import sys

BASE_URL = "http://localhost:5000"
TIMEOUT = 30

def _extract_access_token(resp_json):
    # Common patterns for access token in responses
    if not isinstance(resp_json, dict):
        return None
    candidates = [
        resp_json.get("accessToken"),
        resp_json.get("access_token"),
        resp_json.get("token"),
        resp_json.get("accessToken") or resp_json.get("access_token"),
    ]
    for c in candidates:
        if c:
            return c
    # nested patterns
    if "data" in resp_json and isinstance(resp_json["data"], dict):
        for k in ("accessToken", "access_token", "token"):
            if resp_json["data"].get(k):
                return resp_json["data"].get(k)
    if "session" in resp_json and isinstance(resp_json["session"], dict):
        if resp_json["session"].get("access_token"):
            return resp_json["session"].get("access_token")
    if "tokens" in resp_json and isinstance(resp_json["tokens"], dict):
        if resp_json["tokens"].get("access"):
            return resp_json["tokens"].get("access")
    return None

def test_application_pipeline_and_stage_advancement():
    """
    TC006: Verify a recruiter can view applications and advance a candidate to INTERVIEW via PUT /api/v1/applications/:id
    """
    session = requests.Session()
    created_job_id = None
    created_candidate_id = None
    created_application_id = None
    created_recruiter_registered = False
    recruiter_email = os.environ.get("RECRUITER_EMAIL")
    recruiter_password = os.environ.get("RECRUITER_PASSWORD")
    access_token = None

    try:
        # 1) Obtain recruiter auth (prefer env creds, otherwise register a new recruiter)
        if recruiter_email and recruiter_password:
            login_payload = {"email": recruiter_email, "password": recruiter_password}
            r = session.post(f"{BASE_URL}/api/auth/login", json=login_payload, timeout=TIMEOUT)
            assert r.status_code == 200, f"Login failed: {r.status_code} - {r.text}"
            j = r.json()
            access_token = _extract_access_token(j)
            assert access_token, f"Access token not found in login response: {j}"
        else:
            # Register a new recruiter/organization
            unique = str(uuid.uuid4())[:8]
            recruiter_email = f"test.recruiter.{unique}@example.com"
            recruiter_password = f"P@ssw0rd-{unique}"
            register_payload = {
                "organization": {"name": f"TestOrg-{unique}"},
                "owner": {"email": recruiter_email, "password": recruiter_password, "name": "Test Recruiter"}
            }
            r = session.post(f"{BASE_URL}/api/auth/register", json=register_payload, timeout=TIMEOUT)
            # Accept either 201 Created or 200 OK depending on implementation
            assert r.status_code in (200, 201), f"Register failed: {r.status_code} - {r.text}"
            created_recruiter_registered = True
            j = r.json()
            access_token = _extract_access_token(j)
            # Some implementations return session tokens only on immediate login; if not present, attempt login
            if not access_token:
                r2 = session.post(f"{BASE_URL}/api/auth/login", json={"email": recruiter_email, "password": recruiter_password}, timeout=TIMEOUT)
                assert r2.status_code == 200, f"Login after register failed: {r2.status_code} - {r2.text}"
                j2 = r2.json()
                access_token = _extract_access_token(j2)
            assert access_token, f"Access token not obtained after register/login: {j} / {j2 if 'j2' in locals() else ''}"

        headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}

        # 2) Create a job posting as recruiter
        job_payload = {
            "title": f"Test Job {uuid.uuid4().hex[:6]}",
            "description": "Automated test job for pipeline advancement",
            "location": "Remote",
            "employmentType": "Full-time",
            "status": "published"
        }
        r = session.post(f"{BASE_URL}/api/v1/jobs", json=job_payload, headers=headers, timeout=TIMEOUT)
        assert r.status_code in (200, 201), f"Job creation failed: {r.status_code} - {r.text}"
        job_json = r.json()
        # try common id locations
        created_job_id = job_json.get("id") or job_json.get("job", {}).get("id") or job_json.get("data", {}).get("id")
        assert created_job_id, f"Created job id not found in response: {job_json}"

        # 3) Create a candidate as recruiter
        unique_cand = str(uuid.uuid4())[:8]
        candidate_payload = {
            "firstName": "Test",
            "lastName": f"Candidate-{unique_cand}",
            "email": f"test.candidate.{unique_cand}@example.com",
            "phone": "555-0100"
        }
        r = session.post(f"{BASE_URL}/api/v1/candidates", json=candidate_payload, headers=headers, timeout=TIMEOUT)
        assert r.status_code in (200, 201), f"Candidate creation failed: {r.status_code} - {r.text}"
        cand_json = r.json()
        created_candidate_id = cand_json.get("id") or cand_json.get("candidate", {}).get("id") or cand_json.get("data", {}).get("id")
        assert created_candidate_id, f"Created candidate id not found in response: {cand_json}"

        # 4) Submit an application to the job for the candidate
        # The public apply endpoint is /api/jobs/:jobId/apply (per PRD). We'll include candidateId in payload.
        apply_payload = {
            "candidateId": created_candidate_id,
            "coverLetter": "Applying via automated test",
            "resume": {"text": "Test resume content"}
        }
        r = session.post(f"{BASE_URL}/api/jobs/{created_job_id}/apply", json=apply_payload, timeout=TIMEOUT)
        assert r.status_code in (200, 201, 202), f"Application submission failed: {r.status_code} - {r.text}"
        app_json = r.json()
        created_application_id = app_json.get("id") or app_json.get("application", {}).get("id") or app_json.get("data", {}).get("id")
        assert created_application_id, f"Application id not found in apply response: {app_json}"

        # 5) As recruiter, list applications and ensure the created application is visible
        r = session.get(f"{BASE_URL}/api/v1/applications", headers=headers, timeout=TIMEOUT)
        assert r.status_code == 200, f"Listing applications failed: {r.status_code} - {r.text}"
        apps_list = r.json()
        # apps_list could be a list or enveloped in data
        apps = apps_list if isinstance(apps_list, list) else apps_list.get("data") or apps_list.get("applications") or []
        # Try to find app by id
        found = False
        for a in apps:
            if not isinstance(a, dict):
                continue
            if a.get("id") == created_application_id or a.get("_id") == created_application_id:
                found = True
                break
        assert found, f"Created application {created_application_id} not found in applications list: {apps_list}"

        # 6) Advance the application stage to INTERVIEW via PUT /api/v1/applications/:id
        put_payload = {"stage": "INTERVIEW"}
        r = session.put(f"{BASE_URL}/api/v1/applications/{created_application_id}", json=put_payload, headers=headers, timeout=TIMEOUT)
        assert r.status_code in (200, 201), f"Advancing application stage failed: {r.status_code} - {r.text}"
        resp_json = r.json()
        # Validate the returned application shows the new stage
        new_stage = None
        if isinstance(resp_json, dict):
            new_stage = resp_json.get("stage") or resp_json.get("status") or resp_json.get("hiringStage") or resp_json.get("application", {}).get("stage")
        assert new_stage == "INTERVIEW", f"Application stage not updated to INTERVIEW; got: {new_stage} - full response: {resp_json}"

        # 7) GET application details to confirm stage persisted
        r = session.get(f"{BASE_URL}/api/v1/applications/{created_application_id}", headers=headers, timeout=TIMEOUT)
        assert r.status_code == 200, f"Fetching application details failed: {r.status_code} - {r.text}"
        app_detail = r.json()
        detail_stage = None
        if isinstance(app_detail, dict):
            detail_stage = app_detail.get("stage") or app_detail.get("status") or app_detail.get("hiringStage") or app_detail.get("application", {}).get("stage")
        assert detail_stage == "INTERVIEW", f"Application detail stage mismatch; expected INTERVIEW got: {detail_stage} - {app_detail}"

        print("TC006 passed: Application advanced to INTERVIEW and verified.")
    finally:
        # Best-effort cleanup of resources created during test
        # Use try/except blocks to ignore cleanup failures but log them.
        def _safe_request(method, url, **kwargs):
            try:
                return session.request(method, url, timeout=TIMEOUT, **kwargs)
            except Exception as e:
                print(f"Cleanup request to {url} failed: {e}", file=sys.stderr)
                return None

        # Attempt to withdraw application if withdraw endpoint exists and candidate token not available; try recruiter token withdraw as fallback
        if created_application_id:
            try:
                # Try PATCH withdrawal endpoint as candidate path per PRD: /api/applications/:id/withdraw
                r = _safe_request("PATCH", f"{BASE_URL}/api/applications/{created_application_id}/withdraw", headers=headers, json={})
                if r is not None and r.status_code not in (200, 204):
                    # ignore if not allowed
                    print(f"Application withdraw returned {r.status_code}: {r.text}", file=sys.stderr)
            except Exception as e:
                print(f"Error withdrawing application {created_application_id}: {e}", file=sys.stderr)

        # Delete candidate if endpoint exists
        if created_candidate_id:
            try:
                r = _safe_request("DELETE", f"{BASE_URL}/api/v1/candidates/{created_candidate_id}", headers=headers)
                if r is not None and r.status_code not in (200, 204, 202, 404):
                    print(f"Candidate delete returned {r.status_code}: {r.text}", file=sys.stderr)
            except Exception as e:
                print(f"Error deleting candidate {created_candidate_id}: {e}", file=sys.stderr)

        # Delete job (known DELETE endpoint)
        if created_job_id:
            try:
                r = _safe_request("DELETE", f"{BASE_URL}/api/v1/jobs/{created_job_id}", headers=headers)
                if r is not None and r.status_code not in (200, 204, 202, 404):
                    print(f"Job delete returned {r.status_code}: {r.text}", file=sys.stderr)
            except Exception as e:
                print(f"Error deleting job {created_job_id}: {e}", file=sys.stderr)

        # Optionally, attempt to delete the registered recruiter account if we registered one and an admin endpoint exists
        if created_recruiter_registered:
            # No guaranteed admin delete endpoint; attempt to logout
            try:
                _safe_request("POST", f"{BASE_URL}/api/auth/logout", headers=headers)
            except Exception:
                pass

if __name__ == "__main__":
    test_application_pipeline_and_stage_advancement()