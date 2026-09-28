import os
import sys
import uuid
import time
import requests

BASE_URL = "http://localhost:5000"
TIMEOUT = 30


def test_schedule_technical_interview_tc007():
    """
    TC007: Verify that an authorized recruiter can schedule a technical interview via POST /api/v1/interviews.
    Prerequisites:
      - RECRUITER_EMAIL and RECRUITER_PASSWORD must be set as environment variables for authentication.
    The test will:
      1. Authenticate recruiter to obtain access token.
      2. Create a candidate record to reference in the interview.
      3. POST /api/v1/interviews to schedule a technical interview for the candidate.
      4. Assert successful creation (HTTP 201) and expected fields in response.
      5. Cleanup created resources where possible (attempt to cancel interview and delete candidate).
    """
    recruiter_email = os.getenv("RECRUITER_EMAIL")
    recruiter_password = os.getenv("RECRUITER_PASSWORD")

    if not recruiter_email or not recruiter_password:
        raise RuntimeError(
            "Missing recruiter credentials. Set RECRUITER_EMAIL and RECRUITER_PASSWORD environment variables."
        )

    session = requests.Session()
    headers = {"Accept": "application/json", "Content-Type": "application/json"}

    access_token = None
    candidate_id = None
    interview_id = None

    try:
        # 1) Authenticate recruiter
        login_url = f"{BASE_URL}/api/auth/login"
        login_payload = {"email": recruiter_email, "password": recruiter_password}
        r = session.post(login_url, json=login_payload, headers=headers, timeout=TIMEOUT)
        assert r.status_code == 200, f"Login failed: status={r.status_code}, body={r.text}"
        login_json = r.json()
        # Support multiple common token fields
        access_token = (
            login_json.get("accessToken")
            or login_json.get("access_token")
            or login_json.get("token")
            or (login_json.get("data") or {}).get("accessToken")
            or (login_json.get("data") or {}).get("access_token")
        )
        assert access_token, f"Access token not found in login response: {login_json}"

        auth_headers = {"Authorization": f"Bearer {access_token}", "Accept": "application/json", "Content-Type": "application/json"}

        # 2) Create a candidate (so we can reference a real candidate in the interview)
        candidate_email = f"test.candidate.{uuid.uuid4().hex[:8]}@example.com"
        candidate_payload = {
            "firstName": "TC007",
            "lastName": "InterviewCandidate",
            "email": candidate_email,
            "phone": "555-010-0007",
            # extra fields in case API expects them
            "resumeUrl": f"https://example.com/resumes/{uuid.uuid4().hex}.pdf",
        }
        create_candidate_url = f"{BASE_URL}/api/v1/candidates"
        r = session.post(create_candidate_url, json=candidate_payload, headers=auth_headers, timeout=TIMEOUT)
        assert r.status_code in (200, 201), f"Create candidate failed: status={r.status_code}, body={r.text}"
        cand_json = r.json()
        # candidate id may be in id, candidateId, or data.id
        candidate_id = cand_json.get("id") or cand_json.get("candidateId") or (cand_json.get("data") or {}).get("id")
        assert candidate_id, f"Candidate ID not found in response: {cand_json}"

        # 3) Schedule interview
        schedule_url = f"{BASE_URL}/api/v1/interviews"
        # schedule in the near future (ISO8601)
        scheduled_time = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(time.time() + 3600))
        interview_payload = {
            # Common possible fields based on PRD and typical schemas
            "candidateId": candidate_id,
            "scheduledAt": scheduled_time,
            "durationMinutes": 60,
            "type": "technical",
            "location": "Zoom",
            "interviewers": [
                {"name": "Tech Lead", "email": recruiter_email}
            ],
            "notes": "Automated test scheduling for TC007"
        }

        r = session.post(schedule_url, json=interview_payload, headers=auth_headers, timeout=TIMEOUT)
        # Expect HTTP 201 Created as per PRD
        assert r.status_code == 201, f"Interview scheduling failed: status={r.status_code}, body={r.text}"
        interview_json = r.json()
        # interview id may be in id or interviewId or data.id
        interview_id = interview_json.get("id") or interview_json.get("interviewId") or (interview_json.get("data") or {}).get("id")
        assert interview_id, f"Interview ID not found in response: {interview_json}"

        # Validate that the candidateId in the response matches the created candidate (if present)
        resp_candidate_id = interview_json.get("candidateId") or (interview_json.get("data") or {}).get("candidateId")
        if resp_candidate_id:
            assert str(resp_candidate_id) == str(candidate_id), f"Interview candidateId mismatch: expected {candidate_id}, got {resp_candidate_id}"

        # Additional sanity checks on returned fields
        returned_scheduled = interview_json.get("scheduledAt") or (interview_json.get("data") or {}).get("scheduledAt")
        assert returned_scheduled, "scheduledAt field missing from interview response"
        # Ensure returned scheduled time is the same day (basic validation)
        assert scheduled_time[:10] == returned_scheduled[:10] or scheduled_time[:10] in returned_scheduled, "Returned scheduledAt does not match requested date"

        print("TC007 passed: Interview scheduled successfully. Interview ID:", interview_id)

    finally:
        # Cleanup: attempt to cancel interview and delete candidate where supported
        if access_token:
            cleanup_headers = {"Authorization": f"Bearer {access_token}", "Accept": "application/json", "Content-Type": "application/json"}
        else:
            cleanup_headers = headers

        # Attempt to cancel or update interview to mark it cancelled (best-effort)
        if interview_id:
            try:
                cancel_url = f"{BASE_URL}/api/v1/interviews/{interview_id}"
                cancel_payload = {"status": "cancelled", "notes": "Cleanup: cancelling interview created by automated test"}
                # Use PUT since PRD provides PUT /api/v1/interviews/:id
                r = session.put(cancel_url, json=cancel_payload, headers=cleanup_headers, timeout=TIMEOUT)
                # Accept 200/204 as success; if 401/403/404, just continue
                if r.status_code not in (200, 204):
                    # Not fatal; just print for diagnostics
                    print(f"Warning: Interview cancel attempt returned status={r.status_code}, body={r.text}")
            except Exception as e:
                print("Warning: Exception while attempting to cancel interview:", e)

        # Attempt to delete candidate (best-effort). DELETE endpoint not guaranteed by PRD, but try if available.
        if candidate_id:
            try:
                delete_candidate_url = f"{BASE_URL}/api/v1/candidates/{candidate_id}"
                r = session.delete(delete_candidate_url, headers=cleanup_headers, timeout=TIMEOUT)
                if r.status_code not in (200, 204):
                    # If delete is not supported, try a soft-delete via PUT to set status if API accepts
                    try:
                        put_payload = {"status": "deleted"}
                        r2 = session.put(delete_candidate_url, json=put_payload, headers=cleanup_headers, timeout=TIMEOUT)
                        if r2.status_code not in (200, 204):
                            print(f"Warning: Candidate delete/soft-delete attempts returned statuses {r.status_code} and {r2.status_code}")
                    except Exception:
                        print(f"Warning: Candidate delete returned status {r.status_code}; no soft-delete attempted")
            except Exception as e:
                print("Warning: Exception while attempting to delete candidate:", e)


if __name__ == "__main__":
    test_schedule_technical_interview_tc007()