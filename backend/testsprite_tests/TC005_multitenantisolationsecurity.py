import requests
import uuid
import sys
import time

BASE_URL = "http://localhost:5000"
TIMEOUT = 30


def _extract_access_token(resp_json):
    if not isinstance(resp_json, dict):
        return None
    # common token locations
    candidates = [
        ("accessToken",),
        ("access_token",),
        ("token",),
        ("data", "accessToken"),
        ("data", "access_token"),
        ("session", "access_token"),
        ("session", "accessToken"),
        ("session", "token"),
        ("session", "data", "access_token"),
    ]
    for path in candidates:
        node = resp_json
        found = True
        for p in path:
            if isinstance(node, dict) and p in node:
                node = node[p]
            else:
                found = False
                break
        if found and isinstance(node, str) and node:
            return node
    return None


def _extract_id(resp_json):
    if not isinstance(resp_json, dict):
        return None
    # candidate id common names
    for key in ("id", "candidateId", "candidate_id", "_id"):
        if key in resp_json:
            return resp_json[key]
    # nested in data
    if "data" in resp_json and isinstance(resp_json["data"], dict):
        for key in ("id", "candidateId", "candidate_id", "_id"):
            if key in resp_json["data"]:
                return resp_json["data"][key]
    return None


def test_multitenant_isolation_security_TC005():
    # Create unique org owner credentials
    owner_email = f"owner+{uuid.uuid4().hex[:8]}@example.com"
    owner_password = f"P@ssw0rd-{uuid.uuid4().hex[:6]}"
    org_name = f"TestOrg-{uuid.uuid4().hex[:6]}"

    access_token = None
    org_id = None
    candidate_id = None

    # Try several plausible register payload shapes until one succeeds
    register_url = f"{BASE_URL}/api/auth/register"
    register_payloads = [
        {"organization": {"name": org_name}, "owner": {"email": owner_email, "password": owner_password, "firstName": "Owner", "lastName": "Test"}},
        {"organization_name": org_name, "email": owner_email, "password": owner_password, "name": "Owner Test"},
        {"email": owner_email, "password": owner_password, "organization": org_name, "name": "Owner Test"},
        {"email": owner_email, "password": owner_password, "firstName": "Owner", "lastName": "Test", "organizationName": org_name},
    ]

    session = requests.Session()
    try:
        register_response = None
        for payload in register_payloads:
            try:
                register_response = session.post(register_url, json=payload, timeout=TIMEOUT)
            except requests.RequestException:
                register_response = None
            if register_response is None:
                continue
            if register_response.status_code in (200, 201):
                break
        if register_response is None:
            raise AssertionError(f"Failed to call {register_url}")

        # If registration failed, try to login in case the server auto-created or requires login flow
        if register_response.status_code not in (200, 201):
            # Attempt login
            login_url = f"{BASE_URL}/api/auth/login"
            try:
                login_resp = session.post(login_url, json={"email": owner_email, "password": owner_password}, timeout=TIMEOUT)
            except requests.RequestException as e:
                raise AssertionError(f"Register and login both failed: {e}")
            if login_resp.status_code not in (200, 201):
                raise AssertionError(f"Registration failed ({register_response.status_code}) and login failed ({login_resp.status_code}). Resp: {register_response.text} / {login_resp.text}")
            register_response = login_resp

        # Extract token and possibly org id
        try:
            reg_json = register_response.json()
        except ValueError:
            raise AssertionError("Register response was not JSON: " + register_response.text)

        access_token = _extract_access_token(reg_json)
        # possible org id locations
        if isinstance(reg_json, dict):
            for key in ("organization", "organizationId", "org_id", "orgId", "company", "companyId"):
                if key in reg_json:
                    val = reg_json[key]
                    if isinstance(val, dict) and "id" in val:
                        org_id = val["id"]
                    elif isinstance(val, str):
                        org_id = val
                    break
            if org_id is None and "data" in reg_json and isinstance(reg_json["data"], dict):
                for key in ("organization", "organizationId", "org_id", "orgId", "company", "companyId"):
                    if key in reg_json["data"]:
                        val = reg_json["data"][key]
                        if isinstance(val, dict) and "id" in val:
                            org_id = val["id"]
                        elif isinstance(val, str):
                            org_id = val
                        break

        # If we didn't get an access token from register, try explicit login
        if not access_token:
            login_url = f"{BASE_URL}/api/auth/login"
            try:
                login_resp = session.post(login_url, json={"email": owner_email, "password": owner_password}, timeout=TIMEOUT)
            except requests.RequestException as e:
                raise AssertionError(f"Login request failed: {e}")
            assert login_resp.status_code in (200, 201), f"Login failed with status {login_resp.status_code}: {login_resp.text}"
            try:
                login_json = login_resp.json()
            except ValueError:
                raise AssertionError("Login response not JSON: " + login_resp.text)
            access_token = _extract_access_token(login_json)
            # try to find org id in login response too
            if isinstance(login_json, dict):
                for key in ("organization", "organizationId", "org_id", "orgId", "company", "companyId"):
                    if key in login_json:
                        val = login_json[key]
                        if isinstance(val, dict) and "id" in val:
                            org_id = val["id"]
                        elif isinstance(val, str):
                            org_id = val
                        break
                if org_id is None and "data" in login_json and isinstance(login_json["data"], dict):
                    for key in ("organization", "organizationId", "org_id", "orgId", "company", "companyId"):
                        if key in login_json["data"]:
                            val = login_json["data"][key]
                            if isinstance(val, dict) and "id" in val:
                                org_id = val["id"]
                            elif isinstance(val, str):
                                org_id = val
                            break

        assert access_token, "Could not obtain access token from register/login responses"

        auth_headers = {"Authorization": f"Bearer {access_token}"}

        # Create a candidate under this tenant
        create_candidate_url = f"{BASE_URL}/api/v1/candidates"
        candidate_email = f"candidate+{uuid.uuid4().hex[:8]}@example.com"
        candidate_payload = {
            "firstName": "Test",
            "lastName": "Candidate",
            "email": candidate_email,
        }
        try:
            create_resp = session.post(create_candidate_url, json=candidate_payload, headers=auth_headers, timeout=TIMEOUT)
        except requests.RequestException as e:
            raise AssertionError(f"Candidate creation request failed: {e}")

        assert create_resp.status_code in (200, 201), f"Failed to create candidate: {create_resp.status_code} {create_resp.text}"
        try:
            create_json = create_resp.json()
        except ValueError:
            raise AssertionError("Candidate create response not JSON: " + create_resp.text)

        candidate_id = _extract_id(create_json)
        # If create endpoint returned nested data
        if not candidate_id and isinstance(create_json, dict) and "data" in create_json and isinstance(create_json["data"], dict):
            candidate_id = _extract_id(create_json["data"])

        assert candidate_id, f"Could not determine created candidate id from response: {create_resp.text}"

        # GET candidate normally (no X-Organization-Id) should succeed
        get_candidate_url = f"{BASE_URL}/api/v1/candidates/{candidate_id}"
        try:
            get_resp_ok = session.get(get_candidate_url, headers=auth_headers, timeout=TIMEOUT)
        except requests.RequestException as e:
            raise AssertionError(f"Candidate GET request failed: {e}")
        assert get_resp_ok.status_code == 200, f"Expected 200 when fetching candidate with valid tenant context, got {get_resp_ok.status_code}: {get_resp_ok.text}"

        # Now attempt cross-tenant access by providing an unauthorized X-Organization-Id header
        fake_org_id = str(uuid.uuid4())
        cross_headers = dict(auth_headers)
        cross_headers["X-Organization-Id"] = fake_org_id

        try:
            get_resp_cross = session.get(get_candidate_url, headers=cross_headers, timeout=TIMEOUT)
        except requests.RequestException as e:
            raise AssertionError(f"Cross-tenant GET request failed: {e}")

        # The requirement: verify rejected with HTTP 403 Forbidden.
        assert get_resp_cross.status_code == 403, (
            f"Expected 403 Forbidden for cross-tenant access with X-Organization-Id={fake_org_id}, "
            f"got {get_resp_cross.status_code}. Response body: {get_resp_cross.text}"
        )

        print("TC005 passed: cross-tenant access rejected with HTTP 403 as expected.")

    finally:
        # Cleanup: attempt to delete the candidate if created
        if candidate_id:
            try:
                delete_url = f"{BASE_URL}/api/v1/candidates/{candidate_id}"
                # attempt delete with auth
                resp = session.delete(delete_url, headers=( {"Authorization": f"Bearer {access_token}"} if access_token else {}), timeout=TIMEOUT)
                # If deletion not allowed, ignore; just print outcome
                if resp.status_code in (200, 204):
                    print(f"Cleaned up candidate {candidate_id}")
                else:
                    print(f"Candidate delete returned {resp.status_code}; may not be supported. Body: {resp.text}")
            except Exception as e:
                print(f"Candidate cleanup failed: {e}")


if __name__ == "__main__":
    try:
        test_multitenant_isolation_security_TC005()
    except AssertionError as e:
        print("TEST FAILED:", e)
        sys.exit(1)
    except Exception as e:
        print("UNEXPECTED ERROR:", e)
        sys.exit(2)
    sys.exit(0)