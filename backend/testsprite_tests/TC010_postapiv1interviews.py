import requests
import uuid
import time
from datetime import datetime, timedelta

BASE_URL = "http://localhost:5000"
TIMEOUT = 30.0

def test_post_api_v1_interviews():
    # Helpers
    def safe_json(resp):
        try:
            return resp.json()
        except ValueError:
            return {}

    def extract_token(json_body):
        for key in ("accessToken", "access_token", "token", "accessToken"):
            if key in json_body and isinstance(json_body[key], str):
                return json_body[key]
        # sometimes nested under data or tokens
        if isinstance(json_body.get("data"), dict):
            for key in ("accessToken", "access_token", "token"):
                if key in json_body["data"]:
                    return json_body["data"][key]
        if "tokens" in json_body and isinstance(json_body["tokens"], dict):
            for key in ("accessToken", "access_token", "token"):
                if key in json_body["tokens"]:
                    return json_body["tokens"][key]
        return None

    recruiter_email = f"recruiter+{uuid.uuid4().hex[:8]}@example.com"
    recruiter_password = "TestPass123!"
    recruiter_name = "Test Recruiter"

    created_candidate_id = None
    created_interview_id = None
    created_recruiter_id = None

    # 1) Register recruiter (owner) account
    try:
        register_payload = {
            "name": recruiter_name,
            "email": recruiter_email,
            "password": recruiter_password,
            # include a sample organization field if accepted by API
            "organizationName": f"TestOrg-{uuid.uuid4().hex[:6]}"
        }
        r = requests.post(f"{BASE_URL}/api/auth/register", json=register_payload, timeout=TIMEOUT)
        assert r.status_code in (200, 201), f"Expected 200/201 on register, got {r.status_code}, body: {r.text}"
        reg_json = safe_json(r)
        # try to get recruiter id if returned
        if isinstance(reg_json, dict):
            for key in ("id", "userId", "user_id"):
                if key in reg_json:
                    created_recruiter_id = reg_json[key]
                    break
            # sometimes nested
            if created_recruiter_id is None and isinstance(reg_json.get("data"), dict):
                for key in ("id", "userId", "user_id"):
                    if key in reg_json["data"]:
                        created_recruiter_id = reg_json["data"][key]
                        break
    except requests.RequestException as e:
        raise AssertionError(f"Request to register recruiter failed: {e}")

    # 2) Login to obtain access token
    try:
        login_payload = {"email": recruiter_email, "password": recruiter_password}
        r = requests.post(f"{BASE_URL}/api/auth/login", json=login_payload, timeout=TIMEOUT)
        assert r.status_code == 200, f"Expected 200 on login, got {r.status_code}, body: {r.text}"
        login_json = safe_json(r)
        access_token = extract_token(login_json)
        assert access_token, f"Access token not found in login response: {login_json}"
        # try to extract authenticated user id if available
        if created_recruiter_id is None:
            if isinstance(login_json.get("user"), dict):
                created_recruiter_id = login_json["user"].get("id") or login_json["user"].get("userId")
            if created_recruiter_id is None and isinstance(login_json.get("data"), dict):
                u = login_json["data"].get("user") or login_json["data"]
                if isinstance(u, dict):
                    created_recruiter_id = u.get("id") or u.get("userId")
    except requests.RequestException as e:
        raise AssertionError(f"Request to login failed: {e}")

    headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}

    # 3) Create a candidate record (required for scheduling interview)
    try:
        candidate_email = f"candidate+{uuid.uuid4().hex[:8]}@example.com"
        candidate_payload = {
            "firstName": "Test",
            "lastName": "Candidate",
            "email": candidate_email,
            # include minimal required fields
        }
        r = requests.post(f"{BASE_URL}/api/v1/candidates", json=candidate_payload, headers=headers, timeout=TIMEOUT)
        assert r.status_code in (200, 201), f"Expected 200/201 creating candidate, got {r.status_code}, body: {r.text}"
        candidate_json = safe_json(r)
        # extract id
        for key in ("id", "candidateId", "candidate_id", "userId"):
            if key in candidate_json:
                created_candidate_id = candidate_json[key]
                break
        if created_candidate_id is None and isinstance(candidate_json.get("data"), dict):
            for key in ("id", "candidateId", "candidate_id", "userId"):
                if key in candidate_json["data"]:
                    created_candidate_id = candidate_json["data"][key]
                    break
        assert created_candidate_id is not None, f"Candidate ID not returned in response: {candidate_json}"
    except requests.RequestException as e:
        raise AssertionError(f"Request to create candidate failed: {e}")

    # 4) Schedule interview
    try:
        # Prepare interview datetime in ISO format a few minutes in the future
        scheduled_at = (datetime.utcnow() + timedelta(minutes=30)).isoformat() + "Z"
        interview_payload = {
            "candidateId": created_candidate_id,
            # Use recruiter as interviewer if we have id, else use recruiter email
            "interviewerId": created_recruiter_id if created_recruiter_id is not None else None,
            "interviewerEmail": None if created_recruiter_id is not None else recruiter_email,
            "datetime": scheduled_at,
            "type": "phone",
            "location": "Zoom",
            "durationMinutes": 30,
            "notes": "Automated test scheduling interview"
        }
        # remove None entries to avoid sending null fields if API dislikes them
        interview_payload = {k: v for k, v in interview_payload.items() if v is not None}

        r = requests.post(f"{BASE_URL}/api/v1/interviews", json=interview_payload, headers=headers, timeout=TIMEOUT)
        assert r.status_code == 201, f"Expected 201 creating interview, got {r.status_code}, body: {r.text}"
        interview_json = safe_json(r)
        # extract interview id
        for key in ("id", "interviewId", "interview_id"):
            if key in interview_json:
                created_interview_id = interview_json[key]
                break
        if created_interview_id is None and isinstance(interview_json.get("data"), dict):
            for key in ("id", "interviewId", "interview_id"):
                if key in interview_json["data"]:
                    created_interview_id = interview_json["data"][key]
                    break
        assert created_interview_id is not None, f"Interview ID not returned in response: {interview_json}"
        # validate returned interview references candidate
        # Accept multiple key names
        found_candidate_ref = False
        for key in ("candidateId", "candidate_id", "candidate"):
            if key in interview_json and str(interview_json[key]) == str(created_candidate_id):
                found_candidate_ref = True
                break
            if isinstance(interview_json.get("data"), dict) and key in interview_json["data"] and str(interview_json["data"][key]) == str(created_candidate_id):
                found_candidate_ref = True
                break
        assert found_candidate_ref, f"Interview response does not reference the candidate id. Response: {interview_json}"
    except requests.RequestException as e:
        raise AssertionError(f"Request to schedule interview failed: {e}")
    finally:
        # Cleanup: attempt to delete created interview and candidate if possible
        # Delete interview
        if created_interview_id is not None:
            try:
                # Try several possible delete endpoints
                del_paths = [
                    f"{BASE_URL}/api/v1/interviews/{created_interview_id}",
                    f"{BASE_URL}/api/v1/interviews/{created_interview_id}/delete"
                ]
                deleted = False
                for path in del_paths:
                    try:
                        r = requests.delete(path, headers=headers, timeout=TIMEOUT)
                    except requests.RequestException:
                        r = None
                    if r is not None and r.status_code in (200, 204):
                        deleted = True
                        break
                # If not deleted, attempt a PUT to cancel/soft-delete if supported
                if not deleted:
                    try:
                        r = requests.put(f"{BASE_URL}/api/v1/interviews/{created_interview_id}", json={"status": "cancelled"}, headers=headers, timeout=TIMEOUT)
                        # accept 200 or 204 or 400/404 if API doesn't support cancellation
                    except requests.RequestException:
                        pass
            except Exception:
                pass

        # Delete candidate
        if created_candidate_id is not None:
            try:
                r = requests.delete(f"{BASE_URL}/api/v1/candidates/{created_candidate_id}", headers=headers, timeout=TIMEOUT)
                # accept 200/204 or ignore if not allowed
            except requests.RequestException:
                pass

        # Optionally attempt to delete the recruiter user (may require super-admin; ignore failures)
        if created_recruiter_id is not None:
            try:
                r = requests.delete(f"{BASE_URL}/api/v1/users/{created_recruiter_id}", headers=headers, timeout=TIMEOUT)
            except requests.RequestException:
                pass

if __name__ == "__main__":
    test_post_api_v1_interviews()
    print("TC010 passed: postapiv1interviews")