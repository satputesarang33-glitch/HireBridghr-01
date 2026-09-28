import os
import uuid
import requests
import sys
import time

BASE_URL = "http://localhost:5000"
TIMEOUT = 30


def test_post_api_auth_logout():
    session = requests.Session()
    unique_suffix = uuid.uuid4().hex[:8]
    email = f"testuser_{unique_suffix}@example.com"
    password = "TestPass!23"
    signup_url = f"{BASE_URL}/api/auth/candidate/signup"
    login_url = f"{BASE_URL}/api/auth/login"
    logout_url = f"{BASE_URL}/api/auth/logout"
    refresh_url = f"{BASE_URL}/api/auth/refresh"

    created_user_id = None

    # Prepare payloads (best-effort based on PRD typical fields)
    signup_payload = {
        "email": email,
        "password": password,
        "firstName": "Test",
        "lastName": "User"
    }
    login_payload = {"email": email, "password": password}

    try:
        # 1) Create candidate account
        resp = session.post(signup_url, json=signup_payload, timeout=TIMEOUT)
        assert resp is not None, "No response from signup endpoint"
        assert resp.status_code == 201, f"Expected 201 for signup, got {resp.status_code}, body: {resp.text}"
        try:
            body = resp.json()
            # try common locations for id
            created_user_id = body.get("id") or body.get("user", {}).get("id") or body.get("data", {}).get("id")
        except Exception:
            created_user_id = None

        # 2) Login to create session / receive tokens and cookies
        resp = session.post(login_url, json=login_payload, timeout=TIMEOUT)
        assert resp is not None, "No response from login endpoint"
        assert resp.status_code == 200, f"Expected 200 for login, got {resp.status_code}, body: {resp.text}"
        login_body = {}
        try:
            login_body = resp.json()
        except Exception:
            login_body = {}

        # Extract tokens if present
        access_token = (
            login_body.get("accessToken")
            or login_body.get("access_token")
            or login_body.get("token")
            or login_body.get("accessToken")
        )
        refresh_token = (
            login_body.get("refreshToken")
            or login_body.get("refresh_token")
            or login_body.get("refreshToken")
        )

        # 3) Call logout endpoint with cookies and Authorization header if available
        headers = {}
        if access_token:
            headers["Authorization"] = f"Bearer {access_token}"

        logout_resp = session.post(logout_url, headers=headers, timeout=TIMEOUT)
        assert logout_resp is not None, "No response from logout endpoint"
        assert logout_resp.status_code in (200, 204), f"Logout returned unexpected status {logout_resp.status_code}, body: {logout_resp.text}"

        # Optionally check that logout attempted to clear cookies via Set-Cookie header
        set_cookie = logout_resp.headers.get("Set-Cookie")
        # It's acceptable if Set-Cookie is absent in some implementations; no hard assert here.
        # 4) Verify refresh no longer works (session revoked)
        # Try using cookies stored in session and/or the refresh token value if present
        refresh_kwargs = {}
        # If refresh token exists in body, try sending it; otherwise rely on cookie
        if refresh_token:
            refresh_kwargs["json"] = {"refreshToken": refresh_token}

        refresh_resp = session.post(refresh_url, timeout=TIMEOUT, **refresh_kwargs)
        assert refresh_resp is not None, "No response from refresh endpoint after logout"
        # After logout, refresh should fail. Accept 401/400/403/404 as indicative of revoked/cleared session.
        assert refresh_resp.status_code in (400, 401, 403, 404), (
            f"Expected refresh to fail after logout, got {refresh_resp.status_code}. Body: {refresh_resp.text}"
        )

    finally:
        # Cleanup: attempt to delete created user if possible using ADMIN_TOKEN environment variable.
        # This is best-effort. If ADMIN_TOKEN is not provided or deletion fails, do not raise.
        admin_token = os.environ.get("ADMIN_TOKEN")
        if created_user_id and admin_token:
            try:
                admin_headers = {"Authorization": f"Bearer {admin_token}"}
                delete_url = f"{BASE_URL}/api/v1/admin/users/{created_user_id}"
                del_resp = requests.delete(delete_url, headers=admin_headers, timeout=TIMEOUT)
                # Accept 200 or 204 as successful deletion; ignore other results
                if del_resp.status_code not in (200, 204):
                    # Try alternate path if admin users endpoint differs
                    alt_delete_url = f"{BASE_URL}/api/v1/candidates/{created_user_id}"
                    try:
                        alt_resp = requests.delete(alt_delete_url, headers=admin_headers, timeout=TIMEOUT)
                        # ignore status
                    except Exception:
                        pass
            except Exception:
                pass


if __name__ == "__main__":
    try:
        test_post_api_auth_logout()
        print("TC005 passed")
    except AssertionError as e:
        print("TC005 failed:", str(e))
        sys.exit(1)
    except Exception as e:
        print("TC005 encountered an error:", str(e))
        sys.exit(2)