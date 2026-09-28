import requests
import uuid
import sys
import time

BASE_URL = "http://localhost:5000"
TIMEOUT = 30

def test_post_api_v1_candidates():
    session = requests.Session()
    headers = {"Content-Type": "application/json"}
    # Generate unique credentials to avoid collisions
    unique_suffix = uuid.uuid4().hex[:8]
    recruiter_email = f"test.recruiter.{unique_suffix}@example.com"
    recruiter_password = "TestPassw0rd!"
    recruiter_payload = {
        # Best-effort fields based on PRD user flows
        "firstName": "Test",
        "lastName": "Recruiter",
        "email": recruiter_email,
        "password": recruiter_password,
        "organizationName": f"TestOrg-{unique_suffix}"
    }

    # Candidate payload
    candidate_email = f"candidate.{unique_suffix}@example.com"
    candidate_payload = {
        "firstName": "Jane",
        "lastName": "Doe",
        "email": candidate_email,
        "phone": "+15555550123",
        "title": "Software Engineer",
        "location": "Remote",
        "skills": ["python", "apis", "testing"]
    }

    created_candidate_id = None
    access_token = None

    try:
        # 1) Register recruiter (allow 201 or 200)
        try:
            resp = session.post(f"{BASE_URL}/api/auth/register", json=recruiter_payload, headers=headers, timeout=TIMEOUT)
        except requests.RequestException as e:
            raise AssertionError(f"Failed to reach register endpoint: {e}")

        if resp.status_code not in (200, 201):
            # If registration failed because user exists, try to login directly.
            # Continue only if login later succeeds.
            print(f"Register returned {resp.status_code}, response: {resp.text}", file=sys.stderr)

        # 2) Login recruiter to obtain access token
        login_payload = {"email": recruiter_email, "password": recruiter_password}
        try:
            resp = session.post(f"{BASE_URL}/api/auth/login", json=login_payload, headers=headers, timeout=TIMEOUT)
        except requests.RequestException as e:
            raise AssertionError(f"Failed to reach login endpoint: {e}")

        assert resp.status_code == 200, f"Expected 200 from login, got {resp.status_code}, body: {resp.text}"
        try:
            login_json = resp.json()
        except ValueError:
            raise AssertionError(f"Login response is not JSON: {resp.text}")

        # Extract access token from common fields
        access_token = (
            login_json.get("accessToken")
            or login_json.get("access_token")
            or login_json.get("token")
            or (login_json.get("data") and login_json["data"].get("accessToken"))
            or (login_json.get("data") and login_json["data"].get("access_token"))
        )
        assert access_token, f"Access token not found in login response: {login_json}"

        auth_headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}

        # 3) Create candidate
        try:
            resp = session.post(f"{BASE_URL}/api/v1/candidates", json=candidate_payload, headers=auth_headers, timeout=TIMEOUT)
        except requests.RequestException as e:
            raise AssertionError(f"Failed to reach create candidate endpoint: {e}")

        assert resp.status_code == 201, f"Expected 201 on candidate creation, got {resp.status_code}, body: {resp.text}"
        try:
            candidate_json = resp.json()
        except ValueError:
            raise AssertionError(f"Candidate creation response is not JSON: {resp.text}")

        # Candidate record should include id and the submitted details
        # Accept common keys: id, uuid, candidateId
        created_candidate_id = (
            candidate_json.get("id")
            or candidate_json.get("candidateId")
            or candidate_json.get("uuid")
            or (candidate_json.get("data") and (candidate_json["data"].get("id") or candidate_json["data"].get("uuid")))
        )
        assert created_candidate_id, f"Created candidate ID not found in response: {candidate_json}"

        # Validate returned email/name fields match payload (best-effort: check presence and equality if available)
        returned_email = (
            candidate_json.get("email")
            or (candidate_json.get("data") and candidate_json["data"].get("email"))
        )
        if returned_email:
            assert returned_email.lower() == candidate_payload["email"].lower(), f"Returned email {returned_email} does not match submitted {candidate_payload['email']}"

        returned_first = (
            candidate_json.get("firstName")
            or candidate_json.get("first_name")
            or (candidate_json.get("data") and candidate_json["data"].get("firstName"))
        )
        if returned_first:
            assert returned_first == candidate_payload["firstName"], f"Returned firstName {returned_first} does not match submitted {candidate_payload['firstName']}"

        returned_last = (
            candidate_json.get("lastName")
            or candidate_json.get("last_name")
            or (candidate_json.get("data") and candidate_json["data"].get("lastName"))
        )
        if returned_last:
            assert returned_last == candidate_payload["lastName"], f"Returned lastName {returned_last} does not match submitted {candidate_payload['lastName']}"

        print("TC009 passed: Candidate created and validated successfully.")

    finally:
        # Cleanup: attempt to delete the created candidate if we have its id
        if created_candidate_id and access_token:
            delete_headers = {"Authorization": f"Bearer {access_token}"}
            delete_url = f"{BASE_URL}/api/v1/candidates/{created_candidate_id}"
            try:
                del_resp = session.delete(delete_url, headers=delete_headers, timeout=TIMEOUT)
                # Accept 200/204 as successful deletion; 404 means already gone; other codes print warning
                if del_resp.status_code in (200, 204):
                    print(f"Cleanup: candidate {created_candidate_id} deleted (status {del_resp.status_code}).")
                elif del_resp.status_code == 404:
                    print(f"Cleanup: candidate {created_candidate_id} not found (404).")
                else:
                    print(f"Cleanup: unexpected status deleting candidate {created_candidate_id}: {del_resp.status_code}, body: {del_resp.text}", file=sys.stderr)
            except requests.RequestException as e:
                print(f"Cleanup: failed to delete candidate {created_candidate_id}: {e}", file=sys.stderr)


if __name__ == "__main__":
    test_post_api_v1_candidates()