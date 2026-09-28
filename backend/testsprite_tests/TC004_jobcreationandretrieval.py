import requests
import uuid
import time
import sys

BASE_URL = "http://localhost:5000"
TIMEOUT = 30


def _extract_access_token(json_data):
    if not isinstance(json_data, dict):
        return None
    # common keys
    for k in ("accessToken", "access_token", "token", "accessTokenJwt", "authToken"):
        if k in json_data and isinstance(json_data[k], str):
            return json_data[k]
    # nested locations
    for parent in ("session", "data", "result", "user", "auth"):
        if parent in json_data and isinstance(json_data[parent], dict):
            for k in ("accessToken", "access_token", "token"):
                if k in json_data[parent] and isinstance(json_data[parent][k], str):
                    return json_data[parent][k]
    return None


def _extract_id(json_data):
    if not isinstance(json_data, dict):
        return None
    for k in ("id", "_id", "jobId", "job_id", "uuid"):
        if k in json_data:
            return json_data[k]
    # nested common wrappers
    for parent in ("data", "result", "job", "item"):
        if parent in json_data and isinstance(json_data[parent], dict):
            for k in ("id", "_id", "jobId", "job_id"):
                if k in json_data[parent]:
                    return json_data[parent][k]
    return None


def _extract_jobs_list(json_data):
    # return a list of job dicts if possible
    if isinstance(json_data, list):
        return json_data
    if isinstance(json_data, dict):
        # common wrappers
        for key in ("data", "results", "jobs", "items"):
            if key in json_data and isinstance(json_data[key], list):
                return json_data[key]
        # maybe single object
        if "id" in json_data:
            return [json_data]
    return []


def test_job_creation_and_retrieval():
    session = requests.Session()
    recruiter_token = None
    created_job_id = None

    # Generate unique test credentials
    unique = uuid.uuid4().hex[:8]
    org_name = f"TestOrg-{unique}"
    owner_name = f"Recruiter {unique}"
    owner_email = f"recruiter+{unique}@example.com"
    owner_password = "TestPass!23"

    # 1) Try registering a new recruiter (try multiple possible payload shapes)
    register_url = f"{BASE_URL}/api/auth/register"
    register_payload_options = [
        {
            "organization": {"name": org_name},
            "owner": {"name": owner_name, "email": owner_email, "password": owner_password},
        },
        {
            "organizationName": org_name,
            "ownerName": owner_name,
            "ownerEmail": owner_email,
            "ownerPassword": owner_password,
        },
        {
            "companyName": org_name,
            "name": owner_name,
            "email": owner_email,
            "password": owner_password,
        },
        {
            "name": owner_name,
            "email": owner_email,
            "password": owner_password,
            "organization": org_name,
        },
    ]

    registration_success = False
    for payload in register_payload_options:
        try:
            r = session.post(register_url, json=payload, timeout=TIMEOUT)
        except requests.RequestException as e:
            # try next payload shape
            continue
        if r.status_code in (200, 201):
            try:
                j = r.json()
            except ValueError:
                j = {}
            token = _extract_access_token(j)
            if token:
                recruiter_token = token
                registration_success = True
                break
            # sometimes register returns user but not token; continue to login step
            registration_success = True
            break

    # 2) If we don't have a token yet, try login with credentials (multiple shapes)
    if not recruiter_token:
        login_url = f"{BASE_URL}/api/auth/login"
        login_payload_options = [
            {"email": owner_email, "password": owner_password},
            {"username": owner_email, "password": owner_password},
        ]
        login_success = False
        for payload in login_payload_options:
            try:
                r = session.post(login_url, json=payload, timeout=TIMEOUT)
            except requests.RequestException:
                continue
            if r.status_code in (200, 201):
                try:
                    j = r.json()
                except ValueError:
                    j = {}
                token = _extract_access_token(j)
                if token:
                    recruiter_token = token
                    login_success = True
                    break
                # maybe cookies based session - try to get cookies and use them (less likely)
                login_success = True
                break
        if not login_success and not recruiter_token:
            raise AssertionError(
                "Could not register or login recruiter; no token obtained. Last login status: "
                f"{r.status_code if 'r' in locals() else 'no-response'}"
            )

    # Build auth header if token available
    headers = {}
    if recruiter_token:
        headers["Authorization"] = f"Bearer {recruiter_token}"

    # 3) Create a published job (try several payload shapes until success)
    create_job_url = f"{BASE_URL}/api/v1/jobs"
    title = f"Test Job {unique}"
    description = "Automated test job created by TC004"
    create_payload_options = [
        {"title": title, "description": description, "isPublished": True, "location": "Remote"},
        {"title": title, "description": description, "published": True, "status": "active", "location": "Remote"},
        {"title": title, "description": description, "visibility": "public", "is_published": True},
        {"title": title, "description": description},
    ]

    created_job = None
    last_create_response = None
    for payload in create_payload_options:
        try:
            r = session.post(create_job_url, json=payload, headers=headers, timeout=TIMEOUT)
        except requests.RequestException as e:
            last_create_response = None
            continue
        last_create_response = r
        if r.status_code in (200, 201):
            try:
                j = r.json()
            except ValueError:
                j = {}
            job_id = _extract_id(j)
            if job_id:
                created_job_id = job_id
                created_job = j
                break
            # If no explicit id but response is single job with title, accept it and try to find id later
            if isinstance(j, dict) and j.get("title") == title:
                created_job = j
                created_job_id = _extract_id(j)  # maybe None
                break
        # else try next payload
    if last_create_response is None:
        raise AssertionError("Job creation requests all failed due to connection errors.")
    if last_create_response.status_code == 401:
        raise AssertionError("Unauthorized when creating job. Token may be invalid.")
    if created_job is None:
        raise AssertionError(
            f"Failed to create job. Last response status: {last_create_response.status_code}, body: {last_create_response.text}"
        )

    # If created_job_id still None, attempt to look up by GET jobs to find matching title to obtain id
    try:
        # 4) Retrieve active/public jobs via GET /api/v1/jobs
        jobs_url = f"{BASE_URL}/api/v1/jobs"
        r = session.get(jobs_url, timeout=TIMEOUT)
    except requests.RequestException as e:
        # Attempt cleanup before failing
        if created_job_id:
            try:
                session.delete(f"{create_job_url}/{created_job_id}", headers=headers, timeout=TIMEOUT)
            except Exception:
                pass
        raise AssertionError(f"Failed to GET jobs list: {e}")

    if r.status_code != 200:
        # try authenticated GET as fallback
        try:
            r_auth = session.get(jobs_url, headers=headers, timeout=TIMEOUT)
            if r_auth.status_code == 200:
                r = r_auth
            else:
                raise AssertionError(f"GET /api/v1/jobs returned status {r.status_code}; auth fallback returned {r_auth.status_code}")
        except requests.RequestException as e:
            # cleanup then fail
            if created_job_id:
                try:
                    session.delete(f"{create_job_url}/{created_job_id}", headers=headers, timeout=TIMEOUT)
                except Exception:
                    pass
            raise AssertionError(f"GET /api/v1/jobs failed and auth fallback failed: {e}")

    try:
        jobs_json = r.json()
    except ValueError:
        jobs_json = {}

    jobs_list = _extract_jobs_list(jobs_json)

    # If we don't have an id for the created job, try find it by title
    if created_job_id is None:
        for job in jobs_list:
            try:
                if job.get("title") == title:
                    created_job_id = _extract_id(job)
                    created_job = job
                    break
            except Exception:
                continue

    # Assert that our created job appears in the public jobs list (by id or title)
    found = False
    for job in jobs_list:
        try:
            if created_job_id and (str(_extract_id(job)) == str(created_job_id)):
                found = True
                break
            if job.get("title") == title:
                found = True
                break
        except Exception:
            continue

    # Cleanup: delete the created job in finally-like manner below
    deletion_error = None
    try:
        assert found, f"Created job (id={created_job_id}, title={title}) was not found in GET /api/v1/jobs response."
    finally:
        # Attempt to delete the created job if we have an id (best-effort cleanup)
        if created_job_id:
            try:
                delete_url = f"{create_job_url}/{created_job_id}"
                resp = session.delete(delete_url, headers=headers, timeout=TIMEOUT)
                if resp.status_code not in (200, 204, 202):
                    # If delete returned 404, maybe already gone. Otherwise record error.
                    if resp.status_code != 404:
                        deletion_error = f"Unexpected status when deleting job: {resp.status_code}, body: {resp.text}"
            except requests.RequestException as e:
                deletion_error = f"Exception when deleting job: {e}"

    if deletion_error:
        raise AssertionError(deletion_error)

    print("TC004: jobcreationandretrieval passed.")


if __name__ == "__main__":
    try:
        test_job_creation_and_retrieval()
    except AssertionError as e:
        print(f"Test failed: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error during test: {e}", file=sys.stderr)
        sys.exit(2)
    sys.exit(0)