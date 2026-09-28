import requests
import uuid
import sys

BASE_URL = "http://localhost:5000"
TIMEOUT = 30


def test_post_api_auth_login():
    """
    TC003 - postapiauthlogin
    Validate universal authentication endpoint with valid and invalid credentials to confirm correct issuance
    of access and refresh tokens or 401 unauthorized response.
    """
    session = requests.Session()
    headers = {"Content-Type": "application/json"}
    unique_suffix = uuid.uuid4().hex[:8]
    test_email = f"test.user.{unique_suffix}@example.com"
    test_password = f"TestPass!{unique_suffix}"
    signup_url = f"{BASE_URL}/api/auth/candidate/signup"
    login_url = f"{BASE_URL}/api/auth/login"
    logout_url = f"{BASE_URL}/api/auth/logout"

    created_user_id = None
    access_token = None
    refresh_token = None

    # Helper to safely get JSON from response
    def safe_json(resp):
        try:
            return resp.json()
        except ValueError:
            return {}

    try:
        # 1) Create a new candidate account to test valid login
        signup_payload = {
            "email": test_email,
            "password": test_password,
            "firstName": "Test",
            "lastName": "User"
        }
        try:
            resp = session.post(signup_url, json=signup_payload, headers=headers, timeout=TIMEOUT)
        except requests.RequestException as e:
            raise AssertionError(f"Signup request failed: {e}")

        # Expect 201 Created (some implementations may return 200/201; prefer 201)
        if resp.status_code not in (200, 201):
            body = safe_json(resp)
            raise AssertionError(f"Signup failed: expected 201/200, got {resp.status_code}, body={body}")

        signup_json = safe_json(resp)
        # Try to extract created user id from common shapes
        created_user_id = (
            signup_json.get("id")
            or (signup_json.get("user") or {}).get("id")
            or (signup_json.get("data") or {}).get("id")
            or signup_json.get("user_id")
        )

        # 2) Attempt login with valid credentials
        login_payload = {"email": test_email, "password": test_password}
        try:
            resp = session.post(login_url, json=login_payload, headers=headers, timeout=TIMEOUT)
        except requests.RequestException as e:
            raise AssertionError(f"Login request (valid creds) failed: {e}")

        assert resp.status_code == 200, f"Expected 200 for valid login, got {resp.status_code}, body={safe_json(resp)}"
        login_json = safe_json(resp)

        # Extract access and refresh token from various possible key names
        access_token = (
            login_json.get("accessToken")
            or login_json.get("access_token")
            or login_json.get("token")
            or (login_json.get("data") or {}).get("accessToken")
            or (login_json.get("data") or {}).get("access_token")
        )
        refresh_token = (
            login_json.get("refreshToken")
            or login_json.get("refresh_token")
            or (login_json.get("data") or {}).get("refreshToken")
            or (login_json.get("data") or {}).get("refresh_token")
        )

        assert access_token and isinstance(access_token, str), f"Missing or invalid access token in response: {login_json}"
        assert refresh_token and isinstance(refresh_token, str), f"Missing or invalid refresh token in response: {login_json}"

        # Basic sanity: tokens should look like JWTs (contain two dots) or be non-empty strings
        if "." in access_token:
            parts = access_token.split(".")
            assert len(parts) == 3 and all(parts), "Access token does not appear to be a JWT"
        if "." in refresh_token:
            parts = refresh_token.split(".")
            assert len(parts) >= 3, "Refresh token does not appear to be a JWT-like string"

        # 3) Attempt login with invalid credentials (wrong password)
        invalid_payload = {"email": test_email, "password": "WrongPassword123!"}
        try:
            resp = session.post(login_url, json=invalid_payload, headers=headers, timeout=TIMEOUT)
        except requests.RequestException as e:
            raise AssertionError(f"Login request (invalid creds) failed: {e}")

        # Expect 401 Unauthorized for invalid credentials
        assert resp.status_code == 401, f"Expected 401 for invalid login, got {resp.status_code}, body={safe_json(resp)}"

        # Optionally, logout the created session if logout exists and tokens are provided
        if access_token:
            logout_headers = headers.copy()
            # Many APIs accept Authorization: Bearer <token>
            logout_headers["Authorization"] = f"Bearer {access_token}"
            try:
                session.post(logout_url, headers=logout_headers, timeout=TIMEOUT)
            except requests.RequestException:
                # Not critical for test outcome; ignore logout errors
                pass

        print("TC003 passed: valid login issues access & refresh tokens; invalid login returns 401")

    finally:
        # Cleanup: attempt to delete the created user if an id was returned.
        # Try common endpoints; ignore failures (best-effort cleanup).
        if created_user_id:
            delete_attempts = [
                f"{BASE_URL}/api/v1/candidates/{created_user_id}",
                f"{BASE_URL}/api/v1/users/{created_user_id}",
                f"{BASE_URL}/api/v1/admin/users/{created_user_id}"
            ]
            for url in delete_attempts:
                try:
                    # Try unauthenticated first; if fails with 401/403, skip - we don't have admin creds.
                    dresp = session.delete(url, headers=headers, timeout=TIMEOUT)
                    # Accept 200/204 as successful deletion; break on success
                    if dresp.status_code in (200, 204):
                        break
                except requests.RequestException:
                    # ignore and continue attempts
                    continue


if __name__ == "__main__":
    try:
        test_post_api_auth_login()
    except AssertionError as e:
        print(f"Test failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error during test execution: {e}")
        sys.exit(2)
    sys.exit(0)