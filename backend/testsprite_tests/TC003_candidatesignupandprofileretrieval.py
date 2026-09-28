import requests
import uuid
import time
import traceback

BASE_URL = "http://localhost:5000"
TIMEOUT = 30


def test_candidatesignupandprofileretrieval():
    """
    TC003 - candidatesignupandprofileretrieval
    - POST /api/auth/candidate/signup to create a candidate
    - POST /api/auth/login to get access token
    - GET /api/candidates/me to retrieve candidate profile
    Cleanup: attempt to DELETE candidate via /api/v1/candidates/:id (if id available)
    """
    # Prepare unique candidate credentials
    unique_suffix = str(uuid.uuid4())
    email = f"test.candidate.{unique_suffix}@example.com"
    password = "TestPass123!"
    signup_payload = {
        "email": email,
        "password": password,
        "firstName": "Test",
        "lastName": "Candidate"
    }

    candidate_id = None
    access_token = None

    try:
        # 1) Candidate signup
        signup_url = f"{BASE_URL}/api/auth/candidate/signup"
        resp = requests.post(signup_url, json=signup_payload, timeout=TIMEOUT)
        try:
            resp_json = resp.json()
        except ValueError:
            resp_json = None

        # Expect 201 Created
        assert resp.status_code == 201, f"Expected 201 from signup, got {resp.status_code}, body: {resp.text}"

        # Try to extract candidate id if provided
        if isinstance(resp_json, dict):
            # common shapes: { "id": "..."} or { "user": { "id": "..." } } or { "data": {...} }
            if "id" in resp_json:
                candidate_id = resp_json.get("id")
            elif "user" in resp_json and isinstance(resp_json["user"], dict) and "id" in resp_json["user"]:
                candidate_id = resp_json["user"]["id"]
            elif "data" in resp_json and isinstance(resp_json["data"], dict):
                for key in ("id", "candidateId", "candidate_id"):
                    if key in resp_json["data"]:
                        candidate_id = resp_json["data"][key]
                        break
            else:
                # scan top-level for any uuid-like value
                for v in resp_json.values():
                    if isinstance(v, str) and len(v) >= 8 and "-" in v:
                        candidate_id = v
                        break

        # 2) Login to get access token
        login_url = f"{BASE_URL}/api/auth/login"
        login_payload = {"email": email, "password": password}
        resp_login = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
        try:
            login_json = resp_login.json()
        except ValueError:
            login_json = None

        assert resp_login.status_code == 200, f"Expected 200 from login, got {resp_login.status_code}, body: {resp_login.text}"

        # Extract access token
        access_token = None
        if isinstance(login_json, dict):
            for key in ("accessToken", "access_token", "token", "jwt", "access"):
                if key in login_json:
                    access_token = login_json.get(key)
                    break
            # nested shapes
            if access_token is None:
                # e.g., { "data": { "accessToken": "..." } }
                if "data" in login_json and isinstance(login_json["data"], dict):
                    for key in ("accessToken", "access_token", "token", "jwt", "access"):
                        if key in login_json["data"]:
                            access_token = login_json["data"].get(key)
                            break
            # refresh token may be present but we need access token
        assert access_token and isinstance(access_token, str), f"Access token not found in login response: {login_json}"

        # 3) GET /api/candidates/me with Authorization header
        me_url = f"{BASE_URL}/api/candidates/me"
        headers = {"Authorization": f"Bearer {access_token}"}
        resp_me = requests.get(me_url, headers=headers, timeout=TIMEOUT)
        try:
            me_json = resp_me.json()
        except ValueError:
            me_json = None

        assert resp_me.status_code == 200, f"Expected 200 from GET /api/candidates/me, got {resp_me.status_code}, body: {resp_me.text}"

        # Validate returned profile contains expected email and maybe id
        found_email = False
        if isinstance(me_json, dict):
            # email might be at top-level or nested under "data" or "candidate"
            possible_places = [me_json]
            if "data" in me_json and isinstance(me_json["data"], dict):
                possible_places.append(me_json["data"])
            if "candidate" in me_json and isinstance(me_json["candidate"], dict):
                possible_places.append(me_json["candidate"])
            for place in possible_places:
                if "email" in place and place["email"] == email:
                    found_email = True
                    if candidate_id is None and "id" in place:
                        candidate_id = place.get("id")
                    break

        assert found_email, f"Candidate profile email not matching expected {email}. Response body: {me_json}"

        # If candidate_id still None, attempt to extract from profile
        if candidate_id is None and isinstance(me_json, dict):
            if "id" in me_json:
                candidate_id = me_json.get("id")
            elif "data" in me_json and isinstance(me_json["data"], dict) and "id" in me_json["data"]:
                candidate_id = me_json["data"]["id"]

        print("TC003 passed: signup, login, and profile retrieval successful.")

    except AssertionError:
        traceback.print_exc()
        raise
    except Exception:
        traceback.print_exc()
        raise
    finally:
        # Attempt cleanup: try to delete candidate record if candidate_id is known.
        # Deletion endpoint is not guaranteed; attempt DELETE /api/v1/candidates/:id
        if candidate_id:
            delete_url = f"{BASE_URL}/api/v1/candidates/{candidate_id}"
            headers = {}
            if access_token:
                headers["Authorization"] = f"Bearer {access_token}"
            try:
                resp_del = requests.delete(delete_url, headers=headers, timeout=TIMEOUT)
                # Accept common successful responses or authorization failures; do not fail test on inability to delete
                if resp_del.status_code in (200, 204):
                    print(f"Cleanup: candidate {candidate_id} deleted (status {resp_del.status_code}).")
                elif resp_del.status_code in (401, 403, 404):
                    print(f"Cleanup: delete returned {resp_del.status_code}. Candidate may require admin deletion. Response: {resp_del.text}")
                else:
                    print(f"Cleanup: unexpected delete response {resp_del.status_code}: {resp_del.text}")
            except Exception:
                print("Cleanup: exception during delete attempt:")
                traceback.print_exc()
        else:
            print("Cleanup: no candidate_id available to delete.")


if __name__ == "__main__":
    test_candidatesignupandprofileretrieval()