import requests
import time
import traceback

BASE_URL = "http://localhost:5000"
TIMEOUT = 30


def test_post_api_auth_candidate_signup():
    session = requests.Session()
    headers = {"Content-Type": "application/json"}
    unique_ts = int(time.time())
    candidate_email = f"test_candidate_{unique_ts}@example.com"
    candidate_password = "TestPassw0rd!"
    payload = {
        "email": candidate_email,
        "password": candidate_password,
        "firstName": "Test",
        "lastName": "Candidate",
        "phone": "555-0100",
        "location": "Remote"
    }

    signup_url = f"{BASE_URL}/api/auth/candidate/signup"
    created_candidate_id = None
    access_token = None

    try:
        # Create candidate account
        resp = session.post(signup_url, json=payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        raise AssertionError(f"HTTP request to {signup_url} failed: {e}")

    # Assert success status code 201
    assert resp is not None, "No response received from signup endpoint"
    try:
        status = resp.status_code
    except Exception:
        raise AssertionError("Failed to read response status code")
    assert status == 201, f"Expected 201 Created, got {status}, response body: {resp.text}"

    # Parse JSON response
    try:
        body = resp.json()
    except ValueError:
        raise AssertionError(f"Response from signup is not valid JSON: {resp.text}")

    # Validate response contains the created candidate email and an id
    # Accept different possible response shapes: { "id": "...", "email": "..." } or { "data": {...} } or { "user": {...} }
    def find_in_body(b, key):
        if isinstance(b, dict):
            if key in b:
                return b[key]
            # search nested dicts one level deep
            for v in b.values():
                if isinstance(v, dict) and key in v:
                    return v[key]
        return None

    returned_email = find_in_body(body, "email")
    returned_id = find_in_body(body, "id") or find_in_body(body, "userId") or find_in_body(body, "user_id")

    assert returned_email is not None, f"Response JSON does not contain an email field: {body}"
    assert returned_email == candidate_email, f"Returned email mismatch. Expected {candidate_email}, got {returned_email}"

    assert returned_id is not None, f"Response JSON does not contain an id for the created candidate: {body}"
    created_candidate_id = returned_id

    # Optionally try to login to verify credentials work and to obtain a token for cleanup
    login_url = f"{BASE_URL}/api/auth/login"
    login_payload = {"email": candidate_email, "password": candidate_password}
    try:
        login_resp = session.post(login_url, json=login_payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException:
        login_resp = None

    if login_resp is not None and login_resp.status_code == 200:
        try:
            login_body = login_resp.json()
            # extract common token fields
            token = None
            for k in ("accessToken", "access_token", "token", "access"):
                if k in login_body:
                    token = login_body[k]
                    break
            # some APIs nest tokens under data or tokens
            if token is None:
                if isinstance(login_body, dict):
                    for v in login_body.values():
                        if isinstance(v, dict):
                            for k in ("accessToken", "access_token", "token", "access"):
                                if k in v:
                                    token = v[k]
                                    break
                        if token:
                            break
            access_token = token
        except ValueError:
            access_token = None

    # Primary test assertions passed. Cleanup in finally block below.
    # If we reach here, test succeeded.
    return


if __name__ == "__main__":
    # Run the test with cleanup attempt in finally block
    created_candidate_id = None
    access_token = None
    session = requests.Session()
    try:
        test_post_api_auth_candidate_signup()
    except AssertionError as e:
        # Re-raise after printing stack for visibility
        traceback.print_exc()
        raise
    finally:
        # Attempt best-effort cleanup: log in using the candidate credentials pattern and delete or archive the candidate.
        # Because the test function returned without exposing variables, attempt to discover recently created test candidate by search.
        # This is a best-effort cleanup and will not fail the run if the API does not support deletion endpoints.
        try:
            # Try to find the most recent test candidate by email pattern
            # This requires an admin or search endpoint which may not exist; try a public endpoint fallback: none available.
            # Therefore this cleanup is minimal: attempt to login and then delete based on returned tokens if possible.
            # Reconstruct email used just a moment ago
            # Note: This best-effort cleanup relies on consistent system time; might not find the exact account if multiple runs.
            unique_ts = int(time.time())
            candidate_email_prefix = "test_candidate_"
            # iterate a few timestamps backwards to find created account
            found = False
            for dt in range(0, 6):
                candidate_email = f"{candidate_email_prefix}{unique_ts - dt}@example.com"
                # Try login
                try:
                    login_resp = session.post(f"{BASE_URL}/api/auth/login",
                                              json={"email": candidate_email, "password": "TestPassw0rd!"},
                                              headers={"Content-Type": "application/json"},
                                              timeout=TIMEOUT)
                except requests.RequestException:
                    continue
                if login_resp is None or login_resp.status_code != 200:
                    continue
                try:
                    lb = login_resp.json()
                except ValueError:
                    continue
                token = None
                for k in ("accessToken", "access_token", "token", "access"):
                    if k in lb:
                        token = lb[k]
                        break
                if token is None:
                    # nested
                    if isinstance(lb, dict):
                        for v in lb.values():
                            if isinstance(v, dict):
                                for k in ("accessToken", "access_token", "token", "access"):
                                    if k in v:
                                        token = v[k]
                                        break
                            if token:
                                break
                if not token:
                    continue
                # attempt delete via candidate endpoint if exists
                # First, try DELETE /api/v1/candidates/:id by retrieving own profile at /api/candidates/me
                headers = {"Authorization": f"Bearer {token}"}
                try:
                    me_resp = session.get(f"{BASE_URL}/api/candidates/me", headers=headers, timeout=TIMEOUT)
                except requests.RequestException:
                    me_resp = None
                candidate_id = None
                if me_resp is not None and me_resp.status_code == 200:
                    try:
                        me_body = me_resp.json()
                        # find id in response
                        if isinstance(me_body, dict):
                            candidate_id = me_body.get("id") or me_body.get("userId") or me_body.get("candidateId")
                            if not candidate_id:
                                # search nested
                                for v in me_body.values():
                                    if isinstance(v, dict):
                                        candidate_id = v.get("id") or v.get("userId") or v.get("candidateId")
                                        if candidate_id:
                                            break
                    except ValueError:
                        candidate_id = None
                # If we have candidate_id, try delete endpoints
                if candidate_id:
                    # Try DELETE /api/v1/candidates/:id
                    try:
                        del_resp = session.delete(f"{BASE_URL}/api/v1/candidates/{candidate_id}",
                                                  headers={**headers, "Content-Type": "application/json"},
                                                  timeout=TIMEOUT)
                        # if deletion returns 200/204/202/201 consider success
                        if del_resp is not None and del_resp.status_code in (200, 202, 204, 201):
                            found = True
                            break
                    except requests.RequestException:
                        pass
                    # Try PUT to mark archived if delete not supported
                    try:
                        put_resp = session.put(f"{BASE_URL}/api/v1/candidates/{candidate_id}",
                                               headers={**headers, "Content-Type": "application/json"},
                                               json={"archived": True},
                                               timeout=TIMEOUT)
                        if put_resp is not None and put_resp.status_code in (200, 204):
                            found = True
                            break
                    except requests.RequestException:
                        pass
                else:
                    # If no candidate id, try to call a hypothetical delete user endpoint using tokens
                    try:
                        del_user_resp = session.delete(f"{BASE_URL}/api/auth/me",
                                                       headers={**headers, "Content-Type": "application/json"},
                                                       timeout=TIMEOUT)
                        if del_user_resp is not None and del_user_resp.status_code in (200, 204, 202):
                            found = True
                            break
                    except requests.RequestException:
                        pass
            # End for loop
        except Exception:
            # Swallow cleanup exceptions to avoid masking test results
            pass

    session.close()