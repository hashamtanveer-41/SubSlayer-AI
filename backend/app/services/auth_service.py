import hashlib
import os
import secrets
import sqlite3
import threading
from contextlib import contextmanager
from datetime import datetime, timezone, timedelta
from typing import Optional, Tuple
from app.domain.auth_models import UserProfile
from app.services.repository import _resolve_db_path


class AuthService:
    """
    SQLite-backed authentication service with PBKDF2 password hashing
    and HTTP-only session token management.
    """

    def __init__(self, db_path: Optional[str] = None):
        self._lock = threading.Lock()
        self.db_path = _resolve_db_path(db_path)
        self._is_memory = (self.db_path == ":memory:")
        if self._is_memory:
            self._mem_conn = sqlite3.connect(":memory:", check_same_thread=False)
            self._mem_conn.row_factory = sqlite3.Row
        self._init_db()
        self._seed_default_user_if_empty()

    @contextmanager
    def _connection(self):
        with self._lock:
            if self._is_memory:
                yield self._mem_conn
                self._mem_conn.commit()
            else:
                conn = sqlite3.connect(self.db_path, timeout=15)
                conn.row_factory = sqlite3.Row
                try:
                    yield conn
                    conn.commit()
                finally:
                    conn.close()

    def _init_db(self):
        with self._connection() as conn:
            conn.execute("PRAGMA journal_mode=WAL;")
            conn.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    email TEXT UNIQUE NOT NULL,
                    name TEXT NOT NULL,
                    password_hash TEXT NOT NULL,
                    salt TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS sessions (
                    session_id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    expires_at TEXT NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                );
            """)
            conn.execute("CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);")

    AUTH_PEPPER = os.getenv("AUTH_PEPPER", "subslayer_sec_pepper_v1_auth_2026")
    PBKDF2_ROUNDS = 120_000

    @classmethod
    def _generate_salt(cls) -> str:
        """Generates a cryptographically secure 256-bit random salt (64 hex characters)."""
        return secrets.token_hex(32)

    @classmethod
    def _hash_password(cls, password: str, salt: str) -> str:
        """
        Hashes password using PBKDF2-HMAC-SHA256 with 120,000 iterations and per-user salt,
        combined with a server-side HMAC encryption pepper to defend against offline rainbow
        table and dictionary attacks even if the SQLite database is compromised.
        """
        import hmac
        derived = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt.encode("utf-8"),
            cls.PBKDF2_ROUNDS,
        )
        encrypted_digest = hmac.new(
            cls.AUTH_PEPPER.encode("utf-8"),
            derived,
            hashlib.sha256,
        ).hexdigest()
        return f"sha256_enc${encrypted_digest}"

    @classmethod
    def _verify_password(cls, password: str, stored_hash: str, salt: str) -> bool:
        """
        Verifies password against stored hash using constant-time comparison.
        Supports both modern encrypted SHA-256 hashes and legacy PBKDF2 hashes.
        """
        if stored_hash.startswith("sha256_enc$"):
            computed = cls._hash_password(password, salt)
            return secrets.compare_digest(stored_hash, computed)

        # Legacy raw PBKDF2-HMAC-SHA256 (100k rounds) compatibility
        legacy_hash = hashlib.pbkdf2_hmac(
            "sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000
        ).hex()
        return secrets.compare_digest(stored_hash, legacy_hash)

    def _seed_default_user_if_empty(self):
        with self._connection() as conn:
            count = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
            if count > 0:
                return
            now = datetime.now(timezone.utc).isoformat()
            salt = self._generate_salt()
            pwd_hash = self._hash_password("password123", salt)
            conn.execute("""
                INSERT OR IGNORE INTO users (id, email, name, password_hash, salt, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, ("usr_demo_001", "demo@subslayer.ai", "Demo User", pwd_hash, salt, now, now))

    def reset(self):
        """Clears all users and sessions and reseeds the default demo user."""
        with self._connection() as conn:
            conn.execute("DELETE FROM sessions")
            conn.execute("DELETE FROM users")
        self._seed_default_user_if_empty()

    def create_user(self, email: str, password: str, name: str) -> UserProfile:
        normalized_email = email.lower().strip()
        now = datetime.now(timezone.utc).isoformat()
        user_id = f"usr_{secrets.token_hex(8)}"
        salt = self._generate_salt()
        pwd_hash = self._hash_password(password, salt)

        with self._connection() as conn:
            existing = conn.execute("SELECT id FROM users WHERE email = ?", (normalized_email,)).fetchone()
            if existing:
                raise ValueError("An account with this email already exists.")
            conn.execute("""
                INSERT INTO users (id, email, name, password_hash, salt, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (user_id, normalized_email, name.strip(), pwd_hash, salt, now, now))

        return UserProfile(id=user_id, email=normalized_email, name=name.strip(), createdAt=now)

    def authenticate_user(self, email: str, password: str) -> Optional[UserProfile]:
        normalized_email = email.lower().strip()
        with self._connection() as conn:
            row = conn.execute("SELECT * FROM users WHERE email = ?", (normalized_email,)).fetchone()
            if not row:
                return None
            stored_hash = row["password_hash"]
            salt = row["salt"]
            if self._verify_password(password, stored_hash, salt):
                # Transparent upgrade: if legacy hash, upgrade to modern encrypted hash
                if not stored_hash.startswith("sha256_enc$"):
                    new_hash = self._hash_password(password, salt)
                    conn.execute(
                        "UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?",
                        (new_hash, datetime.now(timezone.utc).isoformat(), row["id"]),
                    )
                return UserProfile(
                    id=row["id"],
                    email=row["email"],
                    name=row["name"],
                    createdAt=row["created_at"],
                )
        return None

    def get_or_create_oauth_user(
        self,
        email: str,
        name: str,
        oauth_id: str,
        provider: str = "google",
    ) -> UserProfile:
        normalized_email = email.lower().strip()
        now = datetime.now(timezone.utc).isoformat()
        with self._connection() as conn:
            row = conn.execute("SELECT * FROM users WHERE email = ?", (normalized_email,)).fetchone()
            if row:
                return UserProfile(
                    id=row["id"],
                    email=row["email"],
                    name=row["name"],
                    createdAt=row["created_at"],
                    provider="google" if (row["password_hash"] or "").startswith("oauth_") else "password",
                )
            user_id = f"usr_{secrets.token_hex(8)}"
            salt = secrets.token_hex(16)
            pwd_hash = f"oauth_{provider}_{oauth_id}"
            user_name = name.strip() or normalized_email.split("@")[0]
            conn.execute("""
                INSERT INTO users (id, email, name, password_hash, salt, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (user_id, normalized_email, user_name, pwd_hash, salt, now, now))
            return UserProfile(
                id=user_id,
                email=normalized_email,
                name=user_name,
                createdAt=now,
                provider=provider,
            )

    def create_session(self, user_id: str, days: int = 7) -> str:
        session_id = secrets.token_urlsafe(32)
        now = datetime.now(timezone.utc)
        expires = now + timedelta(days=days)
        with self._connection() as conn:
            conn.execute("""
                INSERT INTO sessions (session_id, user_id, created_at, expires_at)
                VALUES (?, ?, ?, ?)
            """, (session_id, user_id, now.isoformat(), expires.isoformat()))
        return session_id

    def get_user_by_session(self, session_id: str) -> Optional[UserProfile]:
        if not session_id:
            return None
        now_str = datetime.now(timezone.utc).isoformat()
        with self._connection() as conn:
            row = conn.execute("""
                SELECT u.id, u.email, u.name, u.password_hash, u.created_at, s.expires_at
                FROM sessions s
                JOIN users u ON s.user_id = u.id
                WHERE s.session_id = ? AND s.expires_at > ?
            """, (session_id, now_str)).fetchone()
            if not row:
                return None
            return UserProfile(
                id=row["id"],
                email=row["email"],
                name=row["name"],
                createdAt=row["created_at"],
                provider="google" if (row["password_hash"] or "").startswith("oauth_") else "password",
            )

    def delete_session(self, session_id: str) -> None:
        if not session_id:
            return
        with self._connection() as conn:
            conn.execute("DELETE FROM sessions WHERE session_id = ?", (session_id,))

    def update_user_name(self, user_id: str, new_name: str) -> UserProfile:
        clean_name = new_name.strip()
        if not clean_name:
            raise ValueError("Name cannot be empty")
        now_str = datetime.now(timezone.utc).isoformat()
        with self._connection() as conn:
            conn.execute(
                "UPDATE users SET name = ?, updated_at = ? WHERE id = ?",
                (clean_name, now_str, user_id),
            )
            row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
            if not row:
                raise ValueError("User not found")
            return UserProfile(
                id=row["id"],
                email=row["email"],
                name=row["name"],
                createdAt=row["created_at"],
                provider="google" if (row["password_hash"] or "").startswith("oauth_") else "password",
            )

    def change_password(
        self,
        user_id: str,
        new_password: str,
        current_password: Optional[str] = None,
    ) -> bool:
        if len(new_password) < 6:
            raise ValueError("New password must be at least 6 characters")
        now_str = datetime.now(timezone.utc).isoformat()
        with self._connection() as conn:
            row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
            if not row:
                raise ValueError("User not found")
            stored_hash = row["password_hash"]
            is_oauth = stored_hash.startswith("oauth_")

            if not is_oauth:
                if not current_password:
                    raise ValueError("Current password is required")
                if not self._verify_password(current_password, stored_hash, row["salt"]):
                    raise ValueError("Current password is incorrect")

            new_salt = self._generate_salt()
            new_hash = self._hash_password(new_password, new_salt)
            conn.execute(
                "UPDATE users SET password_hash = ?, salt = ?, updated_at = ? WHERE id = ?",
                (new_hash, new_salt, now_str, user_id),
            )
            return True

    def delete_user(self, user_id: str) -> bool:
        """Deletes user and all their active sessions by user_id."""
        with self._connection() as conn:
            conn.execute("DELETE FROM sessions WHERE user_id = ?", (user_id,))
            cur = conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
            return cur.rowcount > 0

    def delete_user_by_email(self, email: str) -> bool:
        """Deletes user and all their active sessions by email."""
        normalized_email = email.lower().strip()
        with self._connection() as conn:
            row = conn.execute("SELECT id FROM users WHERE email = ?", (normalized_email,)).fetchone()
            if not row:
                return False
            user_id = row["id"]
            conn.execute("DELETE FROM sessions WHERE user_id = ?", (user_id,))
            conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
            return True
