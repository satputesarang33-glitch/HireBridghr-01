import requests
import uuid
import time

BASE_URL = "http://localhost:5000"
TIMEOUT = 30


def _extract_access_token(resp_json):
    # Try common places for access token
    if not isinstance(resp_json, dict):
        return None
    for key in ("accessToken", "access_token", "token", "accessTokenToken"):
        if key in resp_json and isinstance(resp_json[key], str):
            return resp_json[key]
    # nested common patterns
    if "data" in resp_json and isinstance(resp_json["data"], dict):
        for key in ("accessToken", "access_token", "token"):
            if key in resp_json["data"] and isinstance(resp_json["data"][key], str):
                return resp_json["data"][key]
    if "tokens" in resp_json and isinstance(resp_json["tokens"], dict):
        for key in ("access", "accessToken", "access_token"):
            if key in resp_json["tokens"] and isinstance(resp_json["tokens"][key], str):
                return resp_json["tokens"][key]
    if "session" in resp_json and isinstance(resp_json["session"], dict):
        if "accessToken" in resp_json["session"] and isinstance(resp_json["session"]["accessToken"], str):
            return resp_json["session"]["accessToken"]
    return None


def test_post_api_job_apply_duplicate_application_prevention():
    session = requests.Session()
    created_job = False
    recruiter_token = None
    job_id = None

    # Step 1: Try to find an existing public job
    try:
        r = session.get(f"{BASE_URL}/api/v1/jobs", timeout=TIMEOUT)
        r.raise_for_status()
        jobs_list = r.json()
        # jobs_list might be a dict {"data": [...]} or a list
        if isinstance(jobs_list, dict) and "data" in jobs_list and isinstance(jobs_list["data"], list):
            jobs = jobs_list["data"]
        elif isinstance(jobs_list, list):
            jobs = jobs_list
        elif isinstance(jobs_list, dict) and "jobs" in jobs_list and isinstance(jobs_list["jobs"], list):
            jobs = jobs_list["jobs"]
        else:
            jobs = []

        if len(jobs) > 0:
            # take first job and try to extract id
            first = jobs[0]
            if isinstance(first, dict):
                job_id = first.get("id") or first.get("jobId") or first.get("_id")
            else:
                job_id = None

        # If no valid job id found, create a new job (requires recruiter auth)
        if not job_id:
            # Register a new recruiter / organization
            unique = uuid.uuid4().hex[:8]
            org_name = f"TestOrg-{unique}"
            owner_email = f"recruiter+{unique}@example.com"
            owner_password = f"P@ssw0rd-{unique}"

            register_payload = {
                "organization": {"name": org_name},
                "owner": {
                    "email": owner_email,
                    "password": owner_password,
                    "firstName": "Test",
                    "lastName": "Recruiter"
                }
            }

            rr = session.post(f"{BASE_URL}/api/auth/register", json=register_payload, timeout=TIMEOUT)
            # Accept either 200 or 201 as successful registration
            assert rr.status_code in (200, 201), f"Registration failed: {rr.status_code} {rr.text}"
            token = _extract_access_token(rr.json())
            assert token, "Could not extract access token from registration response"
            recruiter_token = token

            # Create a job using recruiter token
            job_payload = {
                "title": f"Test Job {unique}",
                "description": "Automated test job for duplicate application prevention",
                "location": "Remote",
                "isPublished": True
            }
            headers = {"Authorization": f"Bearer {recruiter_token}"}
            rj = session.post(f"{BASE_URL}/api/v1/jobs", json=job_payload, headers=headers, timeout=TIMEOUT)
            assert rj.status_code in (200, 201), f"Job creation failed: {rj.status_code} {rj.text}"
            job_json = rj.json()
            if isinstance(job_json, dict):
                job_id = job_json.get("id") or job_json.get("jobId") or job_json.get("data", {}).get("id")
            # fallback: sometimes response returns created resource inside "data"
            if not job_id and isinstance(job_json, dict) and "data" in job_json and isinstance(job_json["data"], dict):
                job_id = job_json["data"].get("id") or job_json["data"].get("jobId")
            assert job_id, "Could not determine created job id"
            created_job = True

        # Step 2: Create a candidate via candidate signup
        unique_cand = uuid.uuid4().hex[:8]
        cand_email = f"candidate+{unique_cand}@example.com"
        cand_password = f"P@ssCand-{unique_cand}"
        cand_payload = {
            "email": cand_email,
            "password": cand_password,
            "firstName": "Test",
            "lastName": "Candidate"
        }
        rc = session.post(f"{BASE_URL}/api/auth/candidate/signup", json=cand_payload, timeout=TIMEOUT)
        assert rc.status_code in (200, 201), f"Candidate signup failed: {rc.status_code} {rc.text}"
        cand_json = rc.json()
        candidate_id = None
        if isinstance(cand_json, dict):
            candidate_id = cand_json.get("id") or cand_json.get("userId") or cand_json.get("candidateId")
            if not candidate_id and "data" in cand_json and isinstance(cand_json["data"], dict):
                candidate_id = cand_json["data"].get("id") or cand_json["data"].get("candidateId")
        # candidate_id may be None; application endpoint may accept email/name instead

        # Step 3: Submit application once (expect 201)
        apply_payload = {
            "email": cand_email,
            "firstName": "Test",
            "lastName": "Candidate",
            "coverLetter": "Applying via automated test",
            "resume": "Test resume content"
        }
        if candidate_id:
            # include candidate id if available
            apply_payload["candidateId"] = candidate_id

        r_apply1 = session.post(f"{BASE_URL}/api/jobs/{job_id}/apply", json=apply_payload, timeout=TIMEOUT)
        # Accept either 200/201 for success depending on implementation
        assert r_apply1.status_code in (200, 201), f"First application submission failed: {r_apply1.status_code} {r_apply1.text}"

        # Small delay to ensure backend writes before second submission
        time.sleep(0.2)

        # Step 4: Submit application a second time (expect 409 conflict)
        r_apply2 = session.post(f"{BASE_URL}/api/jobs/{job_id}/apply", json=apply_payload, timeout=TIMEOUT)
        # The expected behavior is 409 Conflict
        assert r_apply2.status_code == 409, f"Duplicate application was not prevented. Expected 409, got {r_apply2.status_code}: {r_apply2.text}"

    except requests.RequestException as e:
        raise AssertionError(f"HTTP request failed: {str(e)}")
    finally:
        # Cleanup: delete job if we created it
        if created_job and recruiter_token and job_id:
            try:
                headers = {"Authorization": f"Bearer {recruiter_token}"}
                rd = session.delete(f"{BASE_URL}/api/v1/jobs/{job_id}", headers=headers, timeout=TIMEOUT)
                # Accept 200, 204 or 202 as valid delete responses
                if rd.status_code not in (200, 202, 204):
                    # Not raising here to avoid masking test result; just warn via assertion if delete fails
                    raise AssertionError(f"Failed to delete created job {job_id}: {rd.status_code} {rd.text}")
            except requests.RequestException as ex:
                raise AssertionError(f"Job cleanup request failed: {str(ex)}")


if __name__ == "__main__":
    test_post_api_job_apply_duplicate_application_prevention()
    print("TC001 passed.")