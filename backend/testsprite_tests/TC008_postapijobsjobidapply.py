import requests
import uuid
import sys

BASE_URL = "http://localhost:5000"
TIMEOUT = 30.0

def _extract_id(obj):
    if not obj:
        return None
    # common patterns
    if isinstance(obj, dict):
        for key in ("id", "_id", "jobId", "job_id"):
            if key in obj:
                return obj[key]
        # nested common containers
        for container in ("data", "job", "result"):
            if container in obj and isinstance(obj[container], dict):
                for key in ("id", "_id", "jobId", "job_id"):
                    if key in obj[container]:
                        return obj[container][key]
        # try scanning values for an id-like value
        for v in obj.values():
            if isinstance(v, dict):
                found = _extract_id(v)
                if found:
                    return found
    return None

def test_postapijobsjobidapply():
    timeout = TIMEOUT

    # Create unique recruiter account credentials
    uniq = uuid.uuid4().hex[:8]
    recruiter = {
        "email": f"recruiter+{uniq}@example.com",
        "password": "TestPass123!",
        "fullName": "Test Recruiter " + uniq,
        "organizationName": "TestOrg " + uniq
    }

    # Register recruiter (if already exists, proceed to login)
    try:
        resp = requests.post(f"{BASE_URL}/api/auth/register", json=recruiter, timeout=timeout)
    except requests.RequestException as e:
        raise AssertionError(f"Register request failed: {e}")
    if resp.status_code not in (200, 201, 204, 409):
        raise AssertionError(f"Unexpected register status {resp.status_code}: {resp.text}")

    # Login to obtain access token
    login_payload = {"email": recruiter["email"], "password": recruiter["password"]}
    try:
        resp = requests.post(f"{BASE_URL}/api/auth/login", json=login_payload, timeout=timeout)
    except requests.RequestException as e:
        raise AssertionError(f"Login request failed: {e}")
    assert resp.status_code == 200, f"Login failed: {resp.status_code} - {resp.text}"
    login_json = {}
    try:
        login_json = resp.json()
    except ValueError:
        raise AssertionError("Login did not return JSON body")

    token = login_json.get("accessToken") or login_json.get("access_token") or login_json.get("token")
    assert token, f"No access token in login response: {login_json}"

    auth_headers = {"Authorization": f"Bearer {token}"}

    # Create a new job to apply to
    job_payload = {
        "title": f"Test Job {uniq}",
        "description": "Job created by automated test_postapijobsjobidapply",
        "location": "Remote",
        "employmentType": "FULL_TIME"
    }
    try:
        resp = requests.post(f"{BASE_URL}/api/v1/jobs", json=job_payload, headers=auth_headers, timeout=timeout)
    except requests.RequestException as e:
        raise AssertionError(f"Create job request failed: {e}")
    assert resp.status_code == 201, f"Job creation failed: {resp.status_code} - {resp.text}"
    try:
        job_json = resp.json()
    except ValueError:
        raise AssertionError("Job creation did not return JSON body")
    job_id = _extract_id(job_json)
    assert job_id, f"Could not determine job id from response: {job_json}"

    # Ensure job id is string for URL usage
    job_id = str(job_id)

    # Prepare candidate application payload (same candidate used twice to test duplicate prevention)
    candidate_email = f"candidate+{uuid.uuid4().hex[:8]}@example.com"
    apply_payload = {
        "fullName": "Automated Candidate",
        "email": candidate_email,
        "resume": "This is a test resume content.",
        "coverLetter": "I am applying for this role via automated test."
    }

    try:
        # First submission should succeed with 201
        try:
            resp1 = requests.post(f"{BASE_URL}/api/jobs/{job_id}/apply", json=apply_payload, timeout=timeout)
        except requests.RequestException as e:
            raise AssertionError(f"First apply request failed: {e}")
        assert resp1.status_code == 201, f"Expected 201 on first application, got {resp1.status_code}: {resp1.text}"

        # Second submission with same candidate data should be rejected with 409
        try:
            resp2 = requests.post(f"{BASE_URL}/api/jobs/{job_id}/apply", json=apply_payload, timeout=timeout)
        except requests.RequestException as e:
            raise AssertionError(f"Second apply request failed: {e}")
        assert resp2.status_code == 409, f"Expected 409 on duplicate application, got {resp2.status_code}: {resp2.text}"

    finally:
        # Cleanup: delete the job created for this test
        try:
            resp_del = requests.delete(f"{BASE_URL}/api/v1/jobs/{job_id}", headers=auth_headers, timeout=timeout)
            if resp_del.status_code not in (200, 202, 204):
                # not raising to ensure cleanup attempt doesn't mask test results, but warn
                print(f"Warning: job delete returned unexpected status {resp_del.status_code}: {resp_del.text}", file=sys.stderr)
        except requests.RequestException as e:
            print(f"Warning: job delete request failed: {e}", file=sys.stderr)

    print("TC008 passed: first application 201 and duplicate application 409")

if __name__ == "__main__":
    test_postapijobsjobidapply()