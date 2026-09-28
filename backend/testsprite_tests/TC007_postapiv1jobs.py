import requests
import uuid
import sys
import traceback

BASE_URL = "http://localhost:5000"
TIMEOUT = 30


def test_TC007_postapiv1jobs():
    """
    TC007: Test creation of new job posting by authenticated recruiter with valid payload returns 201 and job details.
    Flow:
      - Register a unique recruiter account
      - Login to obtain access token
      - POST /api/v1/jobs with valid job payload and Authorization header
      - Assert 201 and returned job contains expected fields
      - Cleanup: DELETE the created job
    """
    unique_suffix = str(uuid.uuid4())[:8]
    recruiter_email = f"test.recruiter.{unique_suffix}@example.com"
    recruiter_password = "P@ssw0rd-Test123!"
    org_name = f"TestOrg-{unique_suffix}"

    headers = {"Content-Type": "application/json"}
    created_job_id = None

    try:
        # 1) Register recruiter (enterprise owner)
        register_url = f"{BASE_URL}/api/auth/register"
        register_payload = {
            "email": recruiter_email,
            "password": recruiter_password,
            "name": "Automated Recruiter",
            "organizationName": org_name,
            "role": "OWNER"
        }
        resp = requests.post(register_url, json=register_payload, headers=headers, timeout=TIMEOUT)
        # Accept 201 Created; in some environments registration might also return 200 but PRD expects 201
        assert resp.status_code == 201, f"Expected 201 from register, got {resp.status_code}, body: {resp.text}"

        # 2) Login to obtain access token
        login_url = f"{BASE_URL}/api/auth/login"
        login_payload = {"email": recruiter_email, "password": recruiter_password}
        resp = requests.post(login_url, json=login_payload, headers=headers, timeout=TIMEOUT)
        assert resp.status_code == 200, f"Expected 200 from login, got {resp.status_code}, body: {resp.text}"
        login_json = resp.json()

        # Extract access token from common keys
        access_token = None
        possible_token_keys = ["accessToken", "access_token", "token", "data"]
        for k in possible_token_keys:
            if k in login_json and isinstance(login_json[k], str):
                access_token = login_json[k]
                break
            if k in login_json and isinstance(login_json[k], dict):
                # e.g., { "data": { "accessToken": "..." } } or { "data": { "access_token": "..." } }
                for subk in ["accessToken", "access_token", "token"]:
                    if subk in login_json[k]:
                        access_token = login_json[k][subk]
                        break
            if access_token:
                break
        # Also check top-level nested structure { "data": { "tokens": { ... } } }
        if not access_token:
            data = login_json.get("data") or {}
            if isinstance(data, dict):
                # search recursively for typical keys
                def find_token(obj):
                    if not isinstance(obj, dict):
                        return None
                    for key, val in obj.items():
                        if key in ("accessToken", "access_token", "token") and isinstance(val, str):
                            return val
                        if isinstance(val, dict):
                            found = find_token(val)
                            if found:
                                return found
                    return None
                access_token = find_token(data)

        assert access_token, f"Access token not found in login response: {login_json}"

        auth_headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}

        # 3) Create a new job posting
        jobs_url = f"{BASE_URL}/api/v1/jobs"
        job_title = f"Senior Test Engineer - {unique_suffix}"
        job_payload = {
            "title": job_title,
            "description": "Automated test job created by TC007.",
            "location": "Remote",
            "employmentType": "FULL_TIME",
            "salaryRange": {"min": 90000, "max": 120000, "currency": "USD"},
            "remote": True,
            "published": False
        }
        resp = requests.post(jobs_url, json=job_payload, headers=auth_headers, timeout=TIMEOUT)
        assert resp.status_code == 201, f"Expected 201 from job creation, got {resp.status_code}, body: {resp.text}"
        job_json = resp.json()
        # job id may be in various keys: id, jobId, _id
        job_id = job_json.get("id") or job_json.get("jobId") or job_json.get("_id") or None
        assert job_id, f"Created job ID not found in response: {job_json}"
        created_job_id = job_id  # store for cleanup

        # Validate returned job details contain expected fields and match payload
        returned_title = job_json.get("title") or (job_json.get("data") or {}).get("title")
        assert returned_title == job_title, f"Job title mismatch: expected '{job_title}', got '{returned_title}'"
        returned_description = job_json.get("description") or (job_json.get("data") or {}).get("description")
        assert returned_description is not None and "Automated test job" in returned_description, \
            f"Job description not present or unexpected: {returned_description}"

        # Optionally check salaryRange presence
        salary = job_json.get("salaryRange") or (job_json.get("data") or {}).get("salaryRange")
        assert salary and isinstance(salary, dict) and salary.get("min") == 90000, f"SalaryRange missing or incorrect: {salary}"

        print(f"TC007 passed: created job id {created_job_id}")

    except AssertionError:
        traceback.print_exc()
        raise
    except Exception:
        traceback.print_exc()
        raise
    finally:
        # Cleanup: delete created job if present
        if created_job_id:
            try:
                delete_url = f"{BASE_URL}/api/v1/jobs/{created_job_id}"
                # Use auth_headers if available, otherwise attempt without auth
                try:
                    resp = requests.delete(delete_url, headers=auth_headers, timeout=TIMEOUT)
                except NameError:
                    resp = requests.delete(delete_url, headers=headers, timeout=TIMEOUT)
                # Accept 200 or 204 as successful deletion/archive
                if resp.status_code not in (200, 204):
                    print(f"Warning: Deleting job returned status {resp.status_code}, body: {resp.text}", file=sys.stderr)
                else:
                    print(f"Cleanup: deleted job {created_job_id}")
            except Exception:
                print(f"Cleanup: failed to delete job {created_job_id}", file=sys.stderr)
                traceback.print_exc()


if __name__ == "__main__":
    test_TC007_postapiv1jobs()