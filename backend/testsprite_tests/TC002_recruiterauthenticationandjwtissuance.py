import requests
import uuid
import sys
import traceback

BASE_URL = "http://localhost:5000"
TIMEOUT = 30


def test_recruiter_authentication_and_jwt_issuance():
    """
    TC002 - recruiterauthenticationandjwtissuance
    Steps:
    1. Register a new enterprise recruiter (POST /api/auth/register) with unique org and owner.
    2. Ensure registration returns 201.
    3. Extract access token from registration response or perform login (POST /api/auth/login).
    4. Call GET /api/auth/me with the access token or session cookies and assert 200 and expected profile data.
    5. Cleanup: attempt to delete created organization/user resources if IDs are returned (best-effort).
    """
    session = requests.Session()
    org_name = f"TestOrg-{uuid.uuid4().hex[:8]}"
    owner_email = f"test.recruiter+{uuid.uuid4().hex[:8]}@example.com"
    owner_password = "Str0ngP@ssw0rd!"

    register_url = f"{BASE_URL}/api/auth/register"
    login_url = f"{BASE_URL}/api/auth/login"
    me_url = f"{BASE_URL}/api/auth/me"

    created_org_id = None
    created_user_id = None
    access_token = None

    register_payload = {
        "organization": {
            "name": org_name
        },
        "owner": {
            "firstName": "Test",
            "lastName": "Recruiter",
            "email": owner_email,
            "password": owner_password
        }
    }

    headers = {"Content-Type": "application/json"}

    try:
        # 1) Register
        resp = session.post(register_url, json=register_payload, headers=headers, timeout=TIMEOUT)
        # Accept either 201 Created or 200 OK if implementation differs, but prefer 201
        assert resp is not None, "No response from register endpoint"
        if resp.status_code not in (200, 201):
            # If registration fails with 409 or other, surface useful debug info
            raise AssertionError(f"Expected 201/200 from {register_url}, got {resp.status_code}: {resp.text}")

        # parse JSON if any
        try:
            reg_json = resp.json()
        except ValueError:
            reg_json = {}

        # Attempt to discover ids and tokens in registration response
        def deep_get(dct, *keys):
            cur = dct
            for k in keys:
                if isinstance(cur, dict) and k in cur:
                    cur = cur[k]
                else:
                    return None
            return cur

        # Common locations
        created_org_id = deep_get(reg_json, "organization", "id") or deep_get(reg_json, "org", "id") or deep_get(reg_json, "tenant", "id")
        created_user_id = deep_get(reg_json, "owner", "id") or deep_get(reg_json, "user", "id") or deep_get(reg_json, "data", "user", "id")
        access_token = (
            reg_json.get("accessToken")
            or reg_json.get("access_token")
            or deep_get(reg_json, "session", "access_token")
            or deep_get(reg_json, "data", "accessToken")
            or deep_get(reg_json, "data", "access_token")
            or deep_get(reg_json, "token")
        )

        # 2) If registration did not return an access token, attempt to log in
        if not access_token:
            login_payload = {"email": owner_email, "password": owner_password}
            resp_login = session.post(login_url, json=login_payload, headers=headers, timeout=TIMEOUT)
            assert resp_login is not None, "No response from login endpoint"
            assert resp_login.status_code == 200, f"Expected 200 from login, got {resp_login.status_code}: {resp_login.text}"
            try:
                login_json = resp_login.json()
            except ValueError:
                login_json = {}

            access_token = (
                login_json.get("accessToken")
                or login_json.get("access_token")
                or deep_get(login_json, "session", "access_token")
                or deep_get(login_json, "data", "accessToken")
                or deep_get(login_json, "data", "access_token")
                or deep_get(login_json, "token")
            )

            # Also capture ids if login returned user info
            created_user_id = created_user_id or deep_get(login_json, "user", "id") or deep_get(login_json, "data", "user", "id")
            created_org_id = created_org_id or deep_get(login_json, "user", "organizationId") or deep_get(login_json, "user", "orgId")

        # 3) Call /api/auth/me with token if available, otherwise rely on session cookies
        me_headers = {}
        if access_token:
            me_headers["Authorization"] = f"Bearer {access_token}"

        resp_me = session.get(me_url, headers=me_headers, timeout=TIMEOUT)
        assert resp_me is not None, "No response from /api/auth/me"
        assert resp_me.status_code == 200, f"Expected 200 from {me_url}, got {resp_me.status_code}: {resp_me.text}"

        try:
            me_json = resp_me.json()
        except ValueError:
            me_json = {}

        # Validate profile contains email and organization/tenant scope
        profile_email = None
        profile_org = None
        # Common paths to user email
        profile_email = (
            me_json.get("email")
            or deep_get(me_json, "user", "email")
            or deep_get(me_json, "data", "user", "email")
            or deep_get(me_json, "owner", "email")
        )
        profile_org = (
            deep_get(me_json, "organization", "name")
            or deep_get(me_json, "org", "name")
            or deep_get(me_json, "tenant", "id")
            or deep_get(me_json, "user", "organizationId")
            or deep_get(me_json, "data", "organization")
        )

        assert profile_email is not None, f"Authenticated profile did not include email: {me_json}"
        assert profile_email.lower() == owner_email.lower(), f"Profile email mismatch: expected {owner_email}, got {profile_email}"
        # organization presence is asserted but content may vary between implementations
        assert profile_org is not None or created_org_id is not None, "Authenticated profile did not expose organization/tenant scope"

        print("TC002 passed: Recruiter registered/logged in, received token/session, and /api/auth/me returned authorized profile.")

    except Exception:
        traceback.print_exc()
        raise
    finally:
        # Best-effort cleanup: attempt to delete created organization/user using likely admin endpoints.
        # Many admin delete endpoints require super-admin privileges; these attempts may fail and that's acceptable.
        cleanup_headers = {}
        if access_token:
            cleanup_headers["Authorization"] = f"Bearer {access_token}"
        cleanup_headers["Content-Type"] = "application/json"

        # Attempt several plausible deletion endpoints
        deletion_attempts = []
        if created_org_id:
            deletion_attempts.extend([
                (f"{BASE_URL}/api/v1/admin/organizations/{created_org_id}", "DELETE"),
                (f"{BASE_URL}/api/v1/organizations/{created_org_id}", "DELETE"),
                (f"{BASE_URL}/api/v1/organization/{created_org_id}", "DELETE"),
                (f"{BASE_URL}/api/v1/accounts/{created_org_id}", "DELETE"),
            ])
        if created_user_id:
            deletion_attempts.extend([
                (f"{BASE_URL}/api/v1/admin/users/{created_user_id}", "DELETE"),
                (f"{BASE_URL}/api/v1/users/{created_user_id}", "DELETE"),
                (f"{BASE_URL}/api/v1/user/{created_user_id}", "DELETE"),
            ])

        # If no ids discovered, attempt to logout the session at least
        if not deletion_attempts:
            try:
                logout_url = f"{BASE_URL}/api/auth/logout"
                session.post(logout_url, headers=cleanup_headers, timeout=TIMEOUT)
            except Exception:
                pass

        for url, method in deletion_attempts:
            try:
                if method == "DELETE":
                    del_resp = session.delete(url, headers=cleanup_headers, timeout=TIMEOUT)
                else:
                    del_resp = session.request(method, url, headers=cleanup_headers, timeout=TIMEOUT)
                # Do not assert here; it's best-effort. Print if successful.
                if del_resp is not None and del_resp.status_code in (200, 204):
                    print(f"Cleanup: successful deletion at {url} (status {del_resp.status_code})")
                    # If we deleted org, don't try other org endpoints
                    if url.lower().find("organization") != -1 or url.lower().find("organizations") != -1:
                        # stop trying other org deletions
                        pass
            except Exception:
                # ignore cleanup errors
                pass


if __name__ == "__main__":
    try:
        test_recruiter_authentication_and_jwt_issuance()
    except AssertionError as e:
        print(f"AssertionError: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Error running test: {e}")
        sys.exit(2)