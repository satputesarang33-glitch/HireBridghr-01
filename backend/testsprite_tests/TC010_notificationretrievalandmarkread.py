import os
import uuid
import requests
from requests.exceptions import RequestException

BASE_URL = "http://localhost:5000"
TIMEOUT = 30


def test_notification_retrieval_and_mark_read():
    """
    TC010: Verify that user notifications can be fetched via GET /api/v1/notifications
    and marked as read via PATCH /api/v1/notifications/read-all.
    """

    session = requests.Session()
    created_user = False
    access_token = None
    user_id = None

    # Use provided env creds if available, otherwise create a temporary candidate user
    email = os.environ.get("TEST_USER_EMAIL")
    password = os.environ.get("TEST_USER_PASSWORD")

    try:
        if not email or not password:
            # Create a temp candidate account
            unique_suffix = uuid.uuid4().hex[:8]
            email = f"test.user.{unique_suffix}@example.com"
            password = "TestPassword123!"  # simple test password
            signup_payload = {
                "email": email,
                "password": password,
                "firstName": "Test",
                "lastName": "User"
            }
            try:
                r = session.post(
                    f"{BASE_URL}/api/auth/candidate/signup",
                    json=signup_payload,
                    timeout=TIMEOUT,
                )
            except RequestException as e:
                raise AssertionError(f"Signup request failed: {e}")

            # Accept 201 Created or 200 OK depending on implementation
            assert r.status_code in (200, 201), f"Unexpected signup status: {r.status_code}, body: {r.text}"
            created_user = True
            # Try to extract user id if returned
            try:
                jr = r.json()
                user_id = jr.get("id") or jr.get("user", {}).get("id") or jr.get("data", {}).get("id")
            except Exception:
                user_id = None

        # Login to obtain access token
        login_payload = {"email": email, "password": password}
        try:
            r = session.post(
                f"{BASE_URL}/api/auth/login",
                json=login_payload,
                timeout=TIMEOUT,
            )
        except RequestException as e:
            raise AssertionError(f"Login request failed: {e}")

        assert r.status_code == 200, f"Login failed: {r.status_code}, body: {r.text}"
        login_json = r.json()
        # Support multiple token field names
        access_token = (
            login_json.get("accessToken")
            or login_json.get("access_token")
            or login_json.get("token")
            or (login_json.get("data", {}) or {}).get("accessToken")
            or (login_json.get("data", {}) or {}).get("access_token")
        )
        assert access_token, f"Access token not found in login response: {login_json}"

        auth_headers = {"Authorization": f"Bearer {access_token}"}

        # GET /api/v1/notifications
        try:
            r = session.get(
                f"{BASE_URL}/api/v1/notifications",
                headers=auth_headers,
                timeout=TIMEOUT,
            )
        except RequestException as e:
            raise AssertionError(f"GET notifications request failed: {e}")

        assert r.status_code == 200, f"GET /api/v1/notifications returned {r.status_code}: {r.text}"
        notifications_json = r.json()

        # Normalize notifications list from possible shapes
        if isinstance(notifications_json, list):
            notifications = notifications_json
        elif isinstance(notifications_json, dict):
            # Common wrappers
            notifications = (
                notifications_json.get("notifications")
                or notifications_json.get("data")
                or notifications_json.get("items")
                or notifications_json.get("results")
                or []
            )
            if notifications is None:
                notifications = []
        else:
            notifications = []

        assert isinstance(notifications, list), f"Notifications not a list: {type(notifications)}"

        # Call PATCH /api/v1/notifications/read-all to mark all as read
        try:
            r = session.patch(
                f"{BASE_URL}/api/v1/notifications/read-all",
                headers={**auth_headers, "Content-Type": "application/json"},
                timeout=TIMEOUT,
            )
        except RequestException as e:
            raise AssertionError(f"PATCH read-all request failed: {e}")

        assert r.status_code == 200, f"PATCH /api/v1/notifications/read-all returned {r.status_code}: {r.text}"

        # GET again to validate read status
        try:
            r = session.get(
                f"{BASE_URL}/api/v1/notifications",
                headers=auth_headers,
                timeout=TIMEOUT,
            )
        except RequestException as e:
            raise AssertionError(f"Second GET notifications request failed: {e}")

        assert r.status_code == 200, f"Second GET /api/v1/notifications returned {r.status_code}: {r.text}"
        notifications_after = r.json()
        if isinstance(notifications_after, list):
            notifications_after_list = notifications_after
        elif isinstance(notifications_after, dict):
            notifications_after_list = (
                notifications_after.get("notifications")
                or notifications_after.get("data")
                or notifications_after.get("items")
                or notifications_after.get("results")
                or []
            )
            if notifications_after_list is None:
                notifications_after_list = []
        else:
            notifications_after_list = []

        assert isinstance(notifications_after_list, list), f"Notifications after not a list: {type(notifications_after_list)}"

        # If there were notifications before, assert they are now marked read (best-effort)
        if len(notifications) > 0:
            # For each notification returned after, check common read indicators
            for n in notifications_after_list:
                assert isinstance(n, dict), f"Notification item not an object: {n}"
                # read flag could be 'read', 'isRead', 'read_at', 'readAt'
                read_flag = (
                    n.get("read") if isinstance(n.get("read"), bool) else None
                ) or (
                    n.get("isRead") if isinstance(n.get("isRead"), bool) else None
                )
                read_timestamp = n.get("read_at") or n.get("readAt") or n.get("readAtDate")
                assert (read_flag is True) or (read_timestamp is not None), f"Notification not marked read: {n}"
        else:
            # No notifications present is acceptable; ensure it's an empty list
            assert len(notifications_after_list) == 0, "Expected no notifications but some were returned after marking read."

        print("TC010 passed: notifications fetched and read-all succeeded.")

    finally:
        # Cleanup: attempt to remove created resources where possible
        # 1) Try to delete candidate via possible DELETE endpoint (best-effort)
        if created_user and access_token:
            headers = {"Authorization": f"Bearer {access_token}"}
            # Try candidate delete endpoints that might exist
            tried_delete = False
            if user_id:
                try:
                    r = session.delete(f"{BASE_URL}/api/v1/candidates/{user_id}", headers=headers, timeout=TIMEOUT)
                    tried_delete = True
                    # Accept 200/204/202/404/403 depending on implementation; ignore others
                except RequestException:
                    pass
            if not tried_delete:
                # Try generic candidate delete with 'me' if available
                try:
                    r = session.delete(f"{BASE_URL}/api/v1/candidates/me", headers=headers, timeout=TIMEOUT)
                except RequestException:
                    pass
            # Finally, try to logout the session
            try:
                session.post(f"{BASE_URL}/api/auth/logout", headers=headers, timeout=TIMEOUT)
            except Exception:
                pass


if __name__ == "__main__":
    test_notification_retrieval_and_mark_read()