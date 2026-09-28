import os
import sys
import requests

BASE_URL = os.environ.get("BASE_URL", "http://localhost:5000")
SUPERADMIN_EMAIL = os.environ.get("SUPERADMIN_EMAIL", "superadmin@example.com")
SUPERADMIN_PASSWORD = os.environ.get("SUPERADMIN_PASSWORD", "password")
TIMEOUT = 30


def _extract_access_token(login_json):
    # Try common token locations
    if not isinstance(login_json, dict):
        return None
    # Common keys
    for key in ("accessToken", "access_token", "token", "authToken", "accessTokenJwt"):
        if key in login_json and isinstance(login_json[key], str):
            return login_json[key]
    # Sometimes tokens are nested under "data", "tokens", or "session"
    for parent in ("data", "tokens", "session", "result"):
        if parent in login_json and isinstance(login_json[parent], dict):
            for key in ("accessToken", "access_token", "token", "authToken", "accessTokenJwt"):
                if key in login_json[parent] and isinstance(login_json[parent][key], str):
                    return login_json[parent][key]
    # Some implementations return { "user": {...}, "access": "..." }
    for key in ("access", "jwt"):
        if key in login_json and isinstance(login_json[key], str):
            return login_json[key]
    return None


def _assert_response_contains_list_like(json_obj):
    # Accept if top-level is list
    if isinstance(json_obj, list):
        assert True
        return
    # If dict, expect a list under typical keys
    if isinstance(json_obj, dict):
        for key in ("data", "organizations", "orgs", "items", "users", "auditLogs", "audit_logs", "records"):
            if key in json_obj and isinstance(json_obj[key], list):
                return
    # Fallback: fail
    assert False, "Response JSON is not list-like and does not contain an expected list key"


def test_platform_superadmin_and_audit_logs():
    session = requests.Session()
    login_url = f"{BASE_URL.rstrip('/')}/api/auth/login"
    payload = {"email": SUPERADMIN_EMAIL, "password": SUPERADMIN_PASSWORD}

    try:
        resp = session.post(login_url, json=payload, timeout=TIMEOUT)
    except requests.RequestException as e:
        raise AssertionError(f"Login request failed: {e}")

    assert resp.status_code == 200, f"Expected 200 from {login_url}, got {resp.status_code}, body={resp.text}"

    try:
        login_json = resp.json()
    except ValueError:
        raise AssertionError(f"Login response is not valid JSON: {resp.text}")

    access_token = _extract_access_token(login_json)
    assert access_token, f"Could not extract access token from login response: {login_json}"

    headers = {"Authorization": f"Bearer {access_token}"}

    # Define admin endpoints to query
    endpoints = {
        "organizations": "/api/v1/admin/organizations",
        "users": "/api/v1/admin/users",
        "audit_logs": "/api/v1/admin/audit-logs",
    }

    for name, path in endpoints.items():
        url = f"{BASE_URL.rstrip('/')}{path}"
        try:
            r = session.get(url, headers=headers, timeout=TIMEOUT)
        except requests.RequestException as e:
            raise AssertionError(f"Request to {url} failed: {e}")

        assert r.status_code == 200, f"Expected 200 from {url}, got {r.status_code}, body={r.text}"

        try:
            j = r.json()
        except ValueError:
            raise AssertionError(f"Response from {url} is not valid JSON: {r.text}")

        # Validate that the response contains list-like data
        try:
            _assert_response_contains_list_like(j)
        except AssertionError as e:
            # Provide context in failure
            raise AssertionError(f"Validation failed for {url}: {e}; response={j}")

    # If all assertions passed
    return True


if __name__ == "__main__":
    try:
        ok = test_platform_superadmin_and_audit_logs()
        if ok:
            print("TC009 passed: Super Admin authentication and admin endpoints returned expected responses.")
            sys.exit(0)
        else:
            print("TC009 failed: Unknown failure.")
            sys.exit(2)
    except AssertionError as ae:
        print(f"TC009 failed: {ae}")
        sys.exit(1)
    except Exception as ex:
        print(f"TC009 unexpected error: {ex}")
        sys.exit(1)