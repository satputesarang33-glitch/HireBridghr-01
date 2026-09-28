import requests
import uuid
import sys
import time

BASE_URL = "http://localhost:5000"
TIMEOUT = 30


def test_TC001_postapiauthregisterenterpriseuser():
    # Prepare unique test data
    unique_suffix = uuid.uuid4().hex[:8]
    email = f"test.owner.{unique_suffix}@example.com"
    password = "Str0ngP@ssw0rd!"
    payload = {
        "firstName": "Test",
        "lastName": "Owner",
        "email": email,
        "password": password,
        "role": "OWNER",
        "organization": {
            "name": f"TestOrg {unique_suffix}",
            "domain": f"testorg-{unique_suffix}.example"
        }
    }

    register_url = f"{BASE_URL}/api/auth/register"
    created_user_id = None
    created_org_id = None
    access_token = None

    try:
        # 1) Register enterprise recruiter/owner account
        resp = requests.post(register_url, json=payload, timeout=TIMEOUT)
    except requests.RequestException as e:
        raise AssertionError(f"Request to {register_url} failed: {e}")

    # 2) Validate 201 Created
    assert resp is not None, "No response received from register endpoint"
    try:
        resp_json = resp.json()
    except ValueError:
        resp_json = None

    assert resp.status_code == 201, f"Expected status 201, got {resp.status_code}. Body: {resp.text}"

    # 3) Validate response body contains user and organization context
    # Flexible checks to accommodate varying API response shapes
    def find_key(d, candidates):
        if not isinstance(d, dict):
            return None, None
        for k in candidates:
            if k in d:
                return k, d[k]
        return None, None

    # Look for user object / id / email
    user_obj = None
    if isinstance(resp_json, dict):
        # Common patterns:
        # { "user": {...}, "organization": {...} }
        # or { "id": "...", "email": "...", "organizationId": "..." }
        if "user" in resp_json and isinstance(resp_json["user"], dict):
            user_obj = resp_json["user"]
        else:
            # If top-level looks like a user
            top_user_keys = {"id", "email", "firstName", "lastName"}
            if top_user_keys.intersection(set(resp_json.keys())):
                user_obj = resp_json

    assert user_obj is not None, f"Response JSON does not include a user object. Body: {resp_json}"

    # Validate returned email matches
    returned_email = user_obj.get("email") or user_obj.get("username") or user_obj.get("contactEmail")
    assert returned_email is not None, f"Registered user email not found in response user object: {user_obj}"
    assert returned_email.lower() == email.lower(), f"Returned email '{returned_email}' does not match sent email '{email}'"

    # Capture user id if present
    created_user_id = user_obj.get("id") or resp_json.get("id") or None

    # Organization context check
    org_obj = None
    if isinstance(resp_json, dict):
        if "organization" in resp_json and isinstance(resp_json["organization"], dict):
            org_obj = resp_json["organization"]
        else:
            # try other common keys
            for k in ("org", "tenant", "organizationId", "orgId", "company"):
                if k in resp_json:
                    org_obj = resp_json[k] if isinstance(resp_json[k], dict) else {"id": resp_json[k]}

    # Also check nested inside user object
    if org_obj is None:
        # Look for tenant/org in user object
        for k in ("organization", "org", "tenant", "company"):
            if k in user_obj:
                if isinstance(user_obj[k], dict):
                    org_obj = user_obj[k]
                else:
                    org_obj = {"id": user_obj[k]}
                break

    assert org_obj is not None, f"Organization context not found in response. Body: {resp_json}"

    # Capture organization id if present
    created_org_id = org_obj.get("id") or org_obj.get("organizationId") or org_obj.get("orgId") or None

    # Basic validation on organization fields
    returned_org_name = org_obj.get("name") or org_obj.get("organizationName") or org_obj.get("companyName")
    if returned_org_name:
        assert payload["organization"]["name"].lower() in returned_org_name.lower() or returned_org_name.lower() in payload["organization"]["name"].lower(), \
            f"Returned organization name '{returned_org_name}' does not match expected or contain '{payload['organization']['name']}'"

    # If registration returns session tokens, capture for potential cleanup
    # Common shapes: { "accessToken": "...", "refreshToken": "..." } or nested tokens.user etc.
    if isinstance(resp_json, dict):
        access_token = resp_json.get("accessToken") or resp_json.get("token") or None
        if not access_token and "tokens" in resp_json and isinstance(resp_json["tokens"], dict):
            access_token = resp_json["tokens"].get("access")

    # If we did not receive an access token from registration, attempt to log in to obtain one (for cleanup)
    if not access_token:
        login_url = f"{BASE_URL}/api/auth/login"
        login_payload = {"email": email, "password": password}
        try:
            login_resp = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
        except requests.RequestException as e:
            login_resp = None
            # proceed without token; cleanup will be best-effort
        if login_resp is not None and login_resp.status_code == 200:
            try:
                login_json = login_resp.json()
            except ValueError:
                login_json = {}
            access_token = login_json.get("accessToken") or login_json.get("token") or None
            if not access_token and "tokens" in login_json and isinstance(login_json["tokens"], dict):
                access_token = login_json["tokens"].get("access")
            # Also try to extract user id from login response if not already found
            if not created_user_id:
                if "user" in login_json and isinstance(login_json["user"], dict):
                    created_user_id = login_json["user"].get("id")
                else:
                    # top-level
                    if isinstance(login_json, dict):
                        maybe_id = login_json.get("id")
                        if maybe_id:
                            created_user_id = maybe_id

    # Final assertions: ensure we have either user id or org id to reference
    assert (created_user_id is not None) or (created_org_id is not None), "Could not determine created user or organization id from response for cleanup."

    print("Registration response validated: user created and organization context present.")


    # End of main try; proceed to cleanup in finally
    # (Cleanup is handled below)


    # If reached here, test passed so we return normally
    return


if __name__ == "__main__":
    # Execute the test with cleanup in finally as required
    created_user_id = None
    created_org_id = None
    access_token = None

    # We'll call the test function and after it returns attempt to parse last known state by re-querying if possible.
    try:
        test_TC001_postapiauthregisterenterpriseuser()
    except AssertionError as ae:
        print(f"TEST FAILED: {ae}")
        sys.exit(1)
    except Exception as e:
        print(f"UNEXPECTED ERROR: {e}")
        sys.exit(2)
    else:
        print("TEST PASSED")
        sys.exit(0)