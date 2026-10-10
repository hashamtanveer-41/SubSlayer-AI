import os
import unittest
from starlette.testclient import TestClient
from app.main import app
from app.api.deps import get_auth_service


class AuthApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def setUp(self):
        get_auth_service().reset()

    def test_signup_success(self):
        payload = {
            "email": "sarah@example.com",
            "password": "securepassword123",
            "name": "Sarah Connor"
        }
        res = self.client.post("/api/auth/signup", json=payload)
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertTrue(data["authenticated"])
        self.assertEqual(data["user"]["email"], "sarah@example.com")
        self.assertEqual(data["user"]["name"], "Sarah Connor")
        self.assertIn("subslayer_session", res.headers.get("set-cookie", ""))

    def test_signup_duplicate_email(self):
        payload = {
            "email": "duplicate@example.com",
            "password": "password123",
            "name": "User One"
        }
        first = self.client.post("/api/auth/signup", json=payload)
        self.assertEqual(first.status_code, 201)

        second = self.client.post("/api/auth/signup", json=payload)
        self.assertEqual(second.status_code, 400)
        self.assertIn("already exists", second.json()["detail"])

    def test_login_demo_user(self):
        # Default seeded demo user
        payload = {
            "email": "demo@subslayer.ai",
            "password": "password123"
        }
        res = self.client.post("/api/auth/login", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["authenticated"])
        self.assertEqual(data["user"]["email"], "demo@subslayer.ai")
        self.assertIn("subslayer_session", res.headers.get("set-cookie", ""))

    def test_login_invalid_credentials(self):
        payload = {
            "email": "demo@subslayer.ai",
            "password": "wrongpassword"
        }
        res = self.client.post("/api/auth/login", json=payload)
        self.assertEqual(res.status_code, 401)
        self.assertIn("Invalid email or password", res.json()["detail"])

    def test_me_lifecycle_and_logout(self):
        # 1. Unauthenticated /me
        unauth_client = TestClient(app)
        res_unauth = unauth_client.get("/api/auth/me")
        self.assertEqual(res_unauth.status_code, 200)
        self.assertFalse(res_unauth.json()["authenticated"])
        self.assertIsNone(res_unauth.json()["user"])

        # 2. Login
        login_res = unauth_client.post("/api/auth/login", json={
            "email": "demo@subslayer.ai",
            "password": "password123"
        })
        self.assertEqual(login_res.status_code, 200)

        # 3. Authenticated /me (cookie preserved automatically by TestClient)
        me_res = unauth_client.get("/api/auth/me")
        self.assertEqual(me_res.status_code, 200)
        self.assertTrue(me_res.json()["authenticated"])
        self.assertEqual(me_res.json()["user"]["name"], "Demo User")

        # 4. Logout
        logout_res = unauth_client.post("/api/auth/logout")
        self.assertEqual(logout_res.status_code, 200)
        self.assertFalse(logout_res.json()["authenticated"])

        # 5. Subsequent /me is unauthenticated
        me_after_logout = unauth_client.get("/api/auth/me")
        self.assertFalse(me_after_logout.json()["authenticated"])

    def test_passwords_are_salt_hashed_and_encrypted_not_plaintext(self):
        auth_service = get_auth_service()
        raw_password = "mySecretPassword99!"
        profile = auth_service.create_user("security@example.com", raw_password, "Security Tester")

        with auth_service._connection() as conn:
            row = conn.execute("SELECT password_hash, salt FROM users WHERE id = ?", (profile.id,)).fetchone()
            self.assertIsNotNone(row)
            stored_hash = row["password_hash"]
            stored_salt = row["salt"]

            # 1. Plaintext password MUST NOT be stored
            self.assertNotIn(raw_password, stored_hash)
            self.assertNotEqual(raw_password, stored_hash)

            # 2. Modern encrypted SHA-256 PBKDF2 format
            self.assertTrue(stored_hash.startswith("sha256_enc$"))
            self.assertEqual(len(stored_hash.split("$")[1]), 64)

            # 3. Cryptographically strong 256-bit salt (64 hex characters)
            self.assertEqual(len(stored_salt), 64)

    def test_identical_passwords_produce_different_hashes(self):
        auth_service = get_auth_service()
        raw_password = "commonPassword456"
        u1 = auth_service.create_user("user1@example.com", raw_password, "User One")
        u2 = auth_service.create_user("user2@example.com", raw_password, "User Two")

        with auth_service._connection() as conn:
            r1 = conn.execute("SELECT password_hash, salt FROM users WHERE id = ?", (u1.id,)).fetchone()
            r2 = conn.execute("SELECT password_hash, salt FROM users WHERE id = ?", (u2.id,)).fetchone()

            # Salts must be unique per user
            self.assertNotEqual(r1["salt"], r2["salt"])
            # Hashes must be unique even with identical password input
            self.assertNotEqual(r1["password_hash"], r2["password_hash"])

    def test_legacy_pbkdf2_hash_verification_and_auto_upgrade(self):
        import hashlib
        auth_service = get_auth_service()
        salt = "a1b2c3d4e5f60718"
        raw_password = "legacyPassword1"
        legacy_hash = hashlib.pbkdf2_hmac("sha256", raw_password.encode("utf-8"), salt.encode("utf-8"), 100_000).hex()

        with auth_service._connection() as conn:
            conn.execute("""
                INSERT INTO users (id, email, name, password_hash, salt, created_at, updated_at)
                VALUES ('usr_legacy', 'legacy@example.com', 'Legacy User', ?, ?, '2026-01-01', '2026-01-01')
            """, (legacy_hash, salt))

        # Successfully authenticates with legacy hash
        user = auth_service.authenticate_user("legacy@example.com", raw_password)
        self.assertIsNotNone(user)
        self.assertEqual(user.email, "legacy@example.com")

    def test_update_profile_name(self):
        client = TestClient(app)
        client.post("/api/auth/login", json={
            "email": "demo@subslayer.ai",
            "password": "password123"
        })
        res = client.patch("/api/auth/profile", json={"name": "SubSlayer Master"})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["user"]["name"], "SubSlayer Master")

        # Verify /me reflects updated name
        me_res = client.get("/api/auth/me")
        self.assertEqual(me_res.json()["user"]["name"], "SubSlayer Master")

    def test_change_password_success_and_login(self):
        client = TestClient(app)
        login_res = client.post("/api/auth/login", json={
            "email": "demo@subslayer.ai",
            "password": "password123"
        })
        self.assertEqual(login_res.status_code, 200)

        # 1. Change password with valid current password
        change_res = client.post("/api/auth/change-password", json={
            "currentPassword": "password123",
            "newPassword": "newSecretPassword456"
        })
        self.assertEqual(change_res.status_code, 200)
        self.assertTrue(change_res.json()["success"])

        # 2. Old password fails
        fresh_client = TestClient(app)
        fail_login = fresh_client.post("/api/auth/login", json={
            "email": "demo@subslayer.ai",
            "password": "password123"
        })
        self.assertEqual(fail_login.status_code, 401)

        # 3. New password succeeds
        ok_login = fresh_client.post("/api/auth/login", json={
            "email": "demo@subslayer.ai",
            "password": "newSecretPassword456"
        })
        self.assertEqual(ok_login.status_code, 200)

    def test_header_fallback_session_auth(self):
        # Obtain session_id
        client = TestClient(app)
        login_res = client.post("/api/auth/login", json={
            "email": "demo@subslayer.ai",
            "password": "password123"
        })
        session_id = login_res.json().get("sessionId")
        self.assertIsNotNone(session_id)

        # Fresh client without cookies using Bearer header
        bearer_client = TestClient(app)
        res_bearer = bearer_client.get("/api/auth/me", headers={"Authorization": f"Bearer {session_id}"})
        self.assertEqual(res_bearer.status_code, 200)
        self.assertTrue(res_bearer.json()["authenticated"])
        self.assertEqual(res_bearer.json()["user"]["email"], "demo@subslayer.ai")

        # Fresh client without cookies using X-Session-ID header
        header_client = TestClient(app)
        res_header = header_client.get("/api/auth/me", headers={"X-Session-ID": session_id})
        self.assertEqual(res_header.status_code, 200)
        self.assertTrue(res_header.json()["authenticated"])
        self.assertEqual(res_header.json()["user"]["email"], "demo@subslayer.ai")


if __name__ == "__main__":
    unittest.main()
