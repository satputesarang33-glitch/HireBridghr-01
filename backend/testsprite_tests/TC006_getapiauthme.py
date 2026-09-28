import requests
import uuid
import sys

BASE_URL = "http://localhost:5000"
TIMEOUT = 30

def extract_token(json_obj, token_type='access'):
    # token_type: 'access' or 'refresh'
    if not isinstance(json_obj, dict):
        return None
    # common token key candidates
    candidates = [
        f"{token_type}Token",
        f"{token_type}_token",
        f"{token_type}token",
        f"{token_type}Token".lower(),
        token_type + "Token",
        token_type + "_token",
        token_type
    ]
    for k in json_obj.keys():
        low = k.lower()
        if token_type in low and "token" in low:
            return json_obj[k]
        if low == f"{token_type}token" or low == f"{token_type}_token" or low == token_type:
            return json_obj[k]
    # also check nested structures like data: { accessToken: ... }
    for v in json_obj.values():
        if isinstance(v, dict):
            t = extract_token(v, token_type=token_type)
            if t:
                return t
    return None

def test_getapiauthme_tc006():
    # Create a candidate account, login, call /api/auth/me, validate returned profile, then logout in finally
    unique = uuid.uuid4().hex[:8]
    email = f"test.user.{unique}@example.com"
    password = "Password123!"
    first_name = "Test"
    last_name = "User"
    signup_payload = {
        "firstName": first_name,
        "lastName": last_name,
        "email": email,
        "password": password
    }

    signup_url = f"{BASE_URL}/api/auth/candidate/signup"
    login_url = f"{BASE_URL}/api/auth/login"
    me_url = f"{BASE_URL}/api/auth/me"
    logout_url = f"{BASE_URL}/api/auth/logout"

    access_token = None
    refresh_token = None

    try:
        # 1) Sign up candidate
        try:
            resp = requests.post(signup_url, json=signup_payload, timeout=TIMEOUT)
        except requests.RequestException as e:
            raise AssertionError(f"Signup request failed: {e}")

        assert resp is not None, "No response from signup endpoint"
        if resp.status_code not in (200, 201):
            # include body for debugging
            raise AssertionError(f"Expected signup status 201 or 200, got {resp.status_code}, body: {resp.text}")

        # 2) Login with created credentials
        login_payload = {"email": email, "password": password}
        try:
            resp = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
        except requests.RequestException as e:
            raise AssertionError(f"Login request failed: {e}")

        assert resp is not None, "No response from login endpoint"
        assert resp.status_code == 200, f"Expected login status 200, got {resp.status_code}, body: {resp.text}"

        try:
            login_json = resp.json()
        except ValueError:
            raise AssertionError(f"Login response is not JSON: {resp.text}")

        access_token = extract_token(login_json, token_type='access')
        refresh_token = extract_token(login_json, token_type='refresh')

        # Fallback: some APIs return tokens under keys 'accessToken' or nested under 'data'
        if not access_token:
            # Try some common keys explicitly
            for key in ("accessToken", "access_token", "token", "access"):
                if key in login_json:
                    access_token = login_json[key]
                    break
        assert access_token, f"Access token not found in login response JSON: {login_json}"

        # 3) Call /api/auth/me with Authorization header
        headers = {"Authorization": f"Bearer {access_token}"}
        try:
            resp = requests.get(me_url, headers=headers, timeout=TIMEOUT)
        except requests.RequestException as e:
            raise AssertionError(f"GET /api/auth/me request failed: {e}")

        assert resp is not None, "No response from /api/auth/me endpoint"
        assert resp.status_code == 200, f"Expected /api/auth/me status 200, got {resp.status_code}, body: {resp.text}"

        try:
            me_json = resp.json()
        except ValueError:
            raise AssertionError(f"/api/auth/me response is not JSON: {resp.text}")

        # Validate returned profile contains expected email and at least one of the names
        returned_email = None
        for k in ("email", "emailAddress", "user_email"):
            if k in me_json:
                returned_email = me_json[k]
                break
        # sometimes profile is nested under 'data' or 'user'
        if not returned_email:
            for v in me_json.values():
                if isinstance(v, dict):
                    for k in ("email", "emailAddress", "user_email"):
                        if k in v:
                            returned_email = v[k]
                            break
                if returned_email:
                    break

        assert returned_email, f"Email not present in /api/auth/me response: {me_json}"
        assert returned_email.lower() == email.lower(), f"Returned email '{returned_email}' does not match expected '{email}'"

        # Optionally validate name fields if present
        name_matches = False
        for name_key in ("firstName", "first_name", "givenName", "first"):
            if name_key in me_json and me_json[name_key] == first_name:
                name_matches = True
                break
            # check nested
            for v in me_json.values():
                if isinstance(v, dict) and name_key in v and v[name_key] == first_name:
                    name_matches = True
                    break
            if name_matches:
                break
        # Not mandatory to fail if missing, but warn via assertion-style check: prefer to assert name if available
        # We'll assert True if either name is present and matches, or the name field is simply absent.
        # So only fail if name field exists but does not match.
        for name_key in ("firstName", "first_name", "givenName", "first"):
            if name_key in me_json:
                assert me_json[name_key] == first_name, f"Returned {name_key} '{me_json[name_key]}' does not match expected '{first_name}'"

        print("TC006 passed: /api/auth/me returned 200 and correct user data for authenticated user.")
    finally:
        # Attempt cleanup: logout to revoke session if possible
        try:
            headers = {}
            if access_token:
                headers["Authorization"] = f"Bearer {access_token}"
            # include refresh token in body if available
            body = {}
            if refresh_token:
                body["refreshToken"] = refresh_token
            # Make best-effort logout; ignore response code but surface exceptions
            try:
                requests.post(logout_url, json=body if body else None, headers=headers if headers else None, timeout=TIMEOUT)
            except requests.RequestException:
                pass
        except Exception:
            pass

if __name__ == "__main__":
    try:
        test_getapiauthme_tc006()
    except AssertionError as e:
        print(f"Test failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error during test execution: {e}")
        sys.exit(2)
    sys.exit(0)