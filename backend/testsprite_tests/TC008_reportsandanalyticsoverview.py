import os
import sys
import requests

BASE_URL = "http://localhost:5000"
LOGIN_URL = f"{BASE_URL}/api/auth/login"
REPORTS_URL = f"{BASE_URL}/api/v1/reports/overview"
TIMEOUT = 30


def test_reports_and_analytics_overview():
    """
    TC008 - reportsandanalyticsoverview
    Verify that the recruitment funnel and recruiter metrics can be retrieved via GET /api/v1/reports/overview.
    Requires environment variables: TEST_USER_EMAIL and TEST_USER_PASSWORD for authentication.
    Optional: TEST_ORG_ID to send X-Organization-Id header if multi-tenant header required by the API.
    """
    email = os.getenv("TEST_USER_EMAIL")
    password = os.getenv("TEST_USER_PASSWORD")
    org_id = os.getenv("TEST_ORG_ID")

    if not email or not password:
        raise RuntimeError(
            "Environment variables TEST_USER_EMAIL and TEST_USER_PASSWORD must be set to run this authenticated test."
        )

    # Authenticate to obtain access token
    try:
        login_resp = requests.post(
            LOGIN_URL,
            json={"email": email, "password": password},
            headers={"Content-Type": "application/json"},
            timeout=TIMEOUT,
        )
    except requests.RequestException as e:
        raise RuntimeError(f"Failed to reach auth endpoint: {e}")

    assert login_resp is not None, "No response from auth endpoint"
    assert login_resp.status_code == 200, f"Login failed (expected 200). Status: {login_resp.status_code}, Body: {login_resp.text}"

    try:
        login_json = login_resp.json()
    except ValueError:
        raise AssertionError(f"Login response is not valid JSON: {login_resp.text}")

    # Flexible parsing for access token fields
    token = (
        login_json.get("accessToken")
        or login_json.get("access_token")
        or login_json.get("token")
        or login_json.get("accessTokenJwt")
        or login_json.get("jwt")
    )
    if not token and isinstance(login_json.get("data"), dict):
        data_block = login_json.get("data") or {}
        token = data_block.get("accessToken") or data_block.get("access_token") or data_block.get("token")

    assert token, f"Access token not found in login response: {login_json}"

    headers = {"Authorization": f"Bearer {token}"}
    if org_id:
        headers["X-Organization-Id"] = org_id

    # Authorized request to reports overview
    try:
        reports_resp = requests.get(REPORTS_URL, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        raise RuntimeError(f"Failed to reach reports overview endpoint: {e}")

    assert reports_resp is not None, "No response from reports overview endpoint"
    assert reports_resp.status_code == 200, f"Authorized request failed (expected 200). Status: {reports_resp.status_code}, Body: {reports_resp.text}"

    try:
        reports_json = reports_resp.json()
    except ValueError:
        raise AssertionError(f"Reports overview response is not valid JSON: {reports_resp.text}")

    assert isinstance(reports_json, dict), "Reports overview response JSON must be an object"

    # Validate that the response contains expected analytics keys (be flexible to accept common variants)
    expected_keys_variants = ["funnel", "recruiterMetrics", "recruiters", "metrics", "overview", "recruiter_metrics", "recruitmentFunnel"]
    if not any(k in reports_json for k in expected_keys_variants):
        raise AssertionError(f"Reports overview JSON does not contain expected analytics keys. Present keys: {list(reports_json.keys())}")

    # Verify unauthenticated access is rejected (security check)
    try:
        unauth_resp = requests.get(REPORTS_URL, timeout=TIMEOUT)
    except requests.RequestException as e:
        raise RuntimeError(f"Failed to reach reports overview endpoint for unauthenticated check: {e}")

    assert unauth_resp.status_code in (401, 403), f"Unauthenticated request should be 401 or 403. Got {unauth_resp.status_code} ({unauth_resp.text})"

    print("TC008 passed: reports overview retrieved successfully with valid token, and unauthenticated access is rejected.")


if __name__ == "__main__":
    try:
        test_reports_and_analytics_overview()
        sys.exit(0)
    except AssertionError as ae:
        print(f"AssertionError: {ae}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(2)