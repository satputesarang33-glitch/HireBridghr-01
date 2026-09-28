import requests
import uuid
import sys

BASE_URL = "http://localhost:5000"
TIMEOUT = 30

def test_post_api_auth_refresh():
    session = requests.Session()
    headers = {"Content-Type": "application/json"}
    # Create a unique test user
    unique_email = f"testuser+{uuid.uuid4().hex[:8]}@example.com"
    password = "TestPass123!"
    register_payload = {
        "firstName": "Test",
        "lastName": "User",
        "email": unique_email,
        "password": password,
        "companyName": "TestCo"
    }

    user_id = None
    original_access_token = None
    refresh_token = None

    try:
        # 1) Register the user
        try:
            r = session.post(f"{BASE_URL}/api/auth/register", json=register_payload, headers=headers, timeout=TIMEOUT)
        except requests.RequestException as e:
            raise AssertionError(f"Request to register failed: {e}")

        assert r.status_code in (200, 201), f"Expected 200/201 on register, got {r.status_code}, body: {r.text}"
        try:
            reg_json = r.json()
        except ValueError:
            reg_json = {}

        # Try to extract user id if present
        user_id = reg_json.get("id") or reg_json.get("user", {}).get("id")

        # 2) Login to receive access and refresh tokens
        login_payload = {"email": unique_email, "password": password}
        try:
            r = session.post(f"{BASE_URL}/api/auth/login", json=login_payload, headers=headers, timeout=TIMEOUT)
        except requests.RequestException as e:
            raise AssertionError(f"Request to login failed: {e}")

        assert r.status_code == 200, f"Expected 200 on login, got {r.status_code}, body: {r.text}"
        try:
            login_json = r.json()
        except ValueError:
            login_json = {}

        # Get access and refresh tokens from response body or cookies
        def pick_token(data, candidates):
            for k in candidates:
                v = data.get(k)
                if v:
                    return v
            return None

        original_access_token = pick_token(login_json, ["accessToken", "access_token", "token", "access"])
        refresh_token = pick_token(login_json, ["refreshToken", "refresh_token", "refresh"])

        # If refresh token not in body, check cookies
        if not refresh_token:
            refresh_token = session.cookies.get("refreshToken") or session.cookies.get("refresh_token")

        assert original_access_token, f"Login did not return an access token. Body: {login_json}, Cookies: {session.cookies.get_dict()}"
        assert refresh_token, f"Login did not return a refresh token. Body: {login_json}, Cookies: {session.cookies.get_dict()}"

        # 3) Use valid refresh token to rotate and get a new access token
        refresh_payload = {"refreshToken": refresh_token}
        try:
            r = session.post(f"{BASE_URL}/api/auth/refresh", json=refresh_payload, headers=headers, timeout=TIMEOUT)
        except requests.RequestException as e:
            raise AssertionError(f"Request to refresh with valid token failed: {e}")

        assert r.status_code == 200, f"Expected 200 on valid refresh, got {r.status_code}, body: {r.text}"
        try:
            refresh_json = r.json()
        except ValueError:
            refresh_json = {}

        new_access_token = pick_token(refresh_json, ["accessToken", "access_token", "token", "access"])
        new_refresh_token = pick_token(refresh_json, ["refreshToken", "refresh_token", "refresh"])

        assert new_access_token and isinstance(new_access_token, str), f"Refresh response missing new access token. Body: {refresh_json}"
        # If rotation is implemented, refresh token may be rotated as well
        assert new_refresh_token is None or isinstance(new_refresh_token, str), "Refresh response refresh token invalid format"

        # If new access token equals old one, it's not necessarily wrong but warn (assert won't fail)
        # 4) Missing token should return 401
        try:
            r = session.post(f"{BASE_URL}/api/auth/refresh", json={}, headers=headers, timeout=TIMEOUT)
        except requests.RequestException as e:
            raise AssertionError(f"Request to refresh with missing token failed: {e}")

        assert r.status_code == 401, f"Expected 401 for missing refresh token, got {r.status_code}, body: {r.text}"

        # 5) Invalid token should return 401
        invalid_payload = {"refreshToken": "this.is.an.invalid.token"}
        try:
            r = session.post(f"{BASE_URL}/api/auth/refresh", json=invalid_payload, headers=headers, timeout=TIMEOUT)
        except requests.RequestException as e:
            raise AssertionError(f"Request to refresh with invalid token failed: {e}")

        assert r.status_code == 401, f"Expected 401 for invalid refresh token, got {r.status_code}, body: {r.text}"

    finally:
        # Cleanup: attempt to logout and delete created user if possible
        # Attempt logout first (will revoke server-side session)
        try:
            if original_access_token:
                logout_headers = {"Authorization": f"Bearer {original_access_token}", "Content-Type": "application/json"}
                try:
                    session.post(f"{BASE_URL}/api/auth/logout", headers=logout_headers, timeout=TIMEOUT)
                except requests.RequestException:
                    pass
        except Exception:
            pass

        # Attempt to delete the user resource if we have an id and an endpoint exists
        if user_id:
            # Try a best-effort delete using common admin/user endpoints
            delete_attempts = [
                (f"{BASE_URL}/api/v1/users/{user_id}", "DELETE"),
                (f"{BASE_URL}/api/v1/users/{user_id}", "POST"),  # some APIs use POST for soft-delete
                (f"{BASE_URL}/api/v1/admin/users/{user_id}", "DELETE"),
            ]
            for url, method in delete_attempts:
                try:
                    # Use original access token if available
                    del_headers = {"Content-Type": "application/json"}
                    if original_access_token:
                        del_headers["Authorization"] = f"Bearer {original_access_token}"
                    if method == "DELETE":
                        session.request("DELETE", url, headers=del_headers, timeout=TIMEOUT)
                    else:
                        session.request(method, url, headers=del_headers, timeout=TIMEOUT)
                except Exception:
                    continue

if __name__ == "__main__":
    try:
        test_post_api_auth_refresh()
        print("TC004 postapiauthrefresh: PASSED")
    except AssertionError as e:
        print(f"TC004 postapiauthrefresh: FAILED - {e}")
        sys.exit(1)
    except Exception as e:
        print(f"TC004 postapiauthrefresh: ERROR - {e}")
        sys.exit(2)